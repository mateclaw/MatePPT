import React, { useEffect, useMemo, useRef, useState } from 'react'
import { App, Button, Divider, Input, Modal, Select, Spin, Tabs } from 'antd'
import { PositionPanel } from './common/PositionPanel'
import ContentWrapper from './common/ContentWrapper'
import ElementOutline from './common/ElementOutline'
import ElementShadow from './common/ElementShadow'
import ElementOpacity from './common/ElementOpacity'
import ElementFlip from './common/ElementFlip'
import ElementFilter from './common/ElementFilter'
import ElementColorMask from './common/ElementColorMask'
import { useSlidesStore } from '@/ppt/store'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import type { PPTImageElement } from '@/ppt/core'
import { ClassicService } from '@/services/classic.service'
import { usePptProjectStore } from '@/stores/pptProjectStore'
import { S3Service } from '@/services/s3.service'
import { buildDirectUploadTarget } from '@/hooks/s3uploader-hooks'
import type { FileInfoVo } from '@/models/fileInfoVo'
import { lastValueFrom } from 'rxjs'
import S3Uploader from '@/components/base/file-uploader/s3-uploader'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import type { SearchImageVo } from '@/models/searchImageVo'
import { SHAPE_LIST } from '@/ppt/configs/shapes'

interface ImageElementPanelProps { }

const classicService = ClassicService.getInstance()
const s3service = S3Service.getInstance()

export const ImageElementPanel: React.FC<ImageElementPanelProps> = () => {
  const { message } = App.useApp()
  const slidesStore = useSlidesStore()
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()
  const projectId = usePptProjectStore((state) => state.projectId)
  const [modalVisible, setModalVisible] = useState(false)
  const [tabKey, setTabKey] = useState<'search' | 'upload' | 'ai'>('search')
  const [keyword, setKeyword] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchImageVo[]>([])
  const [selectedSearchUrl, setSelectedSearchUrl] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState<SearchImageVo[]>([])
  const [selectedAiUrl, setSelectedAiUrl] = useState('')
  const aiRequestRef = useRef<{ unsubscribe: () => void } | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(24)
  const [totalCount, setTotalCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const imageElement = handleElement as PPTImageElement | null
  const slide = slidesStore.slides[slidesStore.slideIndex] as any
  const slideId = slide?.slideId
  const slideNo = slide?.slideNo || slidesStore.slideIndex + 1
  const canUploadToProject = !!projectId && !!slideId
  const elementUploadPath = useMemo(() => {
    if (!canUploadToProject) return ''
    return `pptProject/${projectId}/slides/${slideNo}/elements`
  }, [canUploadToProject, projectId, slideNo])

  const resetAiState = () => {
    aiRequestRef.current?.unsubscribe()
    aiRequestRef.current = null
    setAiLoading(false)
    setAiResults([])
    setSelectedAiUrl('')
    setAiPrompt('')
  }

  useEffect(() => {
    if (!modalVisible) return
    setSearchResults([])
    setSelectedSearchUrl('')
    setUploadedImageUrl('')
    setTabKey('search')
    setKeyword('')
    resetAiState()
    setPageNum(1)
    setTotalCount(0)
    setLoadingMore(false)
  }, [modalVisible])

  useEffect(() => {
    if (modalVisible) return
    resetAiState()
  }, [modalVisible])

  const fetchImages = (nextPage: number, append: boolean) => {
    if (!projectId || !slideId || !imageElement?.id) return
    if (append) {
      setLoadingMore(true)
    } else {
      setSearchLoading(true)
    }
    classicService.searchImages({
      projectId,
      slideId,
      elementId: imageElement.id,
      userInput: keyword,
      pageNum: nextPage,
      pageSize,
    } as any).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        setTotalCount(typeof res?.total === 'number' ? res.total : list.length)
        setSearchResults((prev) => (append ? [...prev, ...list] : list))
        if (!append && list.length) {
          const first = list[0]
          setSelectedSearchUrl(first.fetchUrl || first.previewUrl || '')
        }
        if (!append && !list.length) {
          setSelectedSearchUrl('')
        }
      },
      error: (error) => {
        message.error('获取图片列表失败: ' + (error?.message || '未知错误'))
      },
      complete: () => {
        if (append) {
          setLoadingMore(false)
        } else {
          setSearchLoading(false)
        }
      },
    })
  }

  useEffect(() => {
    if (!modalVisible) return
    setSearchResults([])
    setSelectedSearchUrl('')
    setPageNum(1)
    setTotalCount(0)
    fetchImages(1, false)
  }, [modalVisible, projectId, slideId, imageElement?.id])

  const canSearch = !!projectId && !!slideId && !!imageElement?.id
  const canGenerateAi = canSearch && !!aiPrompt.trim()
  const clipShapeOptions = useMemo(
    () =>
      SHAPE_LIST.map((group) => ({
        label: group.type,
        options: group.children
          .filter((shape) => shape.pptxShapeType)
          .map((shape) => ({
            value: shape.pptxShapeType!,
            label: shape.pptxShapeType,
          })),
      })).filter((group) => group.options.length > 0),
    [],
  )

  const handleSearch = () => {
    if (!canSearch) {
      message.warning('缺少必要信息，无法搜索图片')
      return
    }
    setPageNum(1)
    setTotalCount(0)
    setSearchResults([])
    setSelectedSearchUrl('')
    fetchImages(1, false)
  }

  const normalizeAiResults = (list: any[]) => {
    return list
      .map((item) => {
        if (!item) return null
        if (typeof item === 'string') {
          return { previewUrl: item, fetchUrl: item } as SearchImageVo
        }
        const preview = item.previewUrl || item.fetchUrl || item.url || item.imageUrl
        const fetchUrl = item.fetchUrl || item.previewUrl || item.url || item.imageUrl
        if (!preview && !fetchUrl) return null
        return {
          ...item,
          previewUrl: preview,
          fetchUrl,
        } as SearchImageVo
      })
      .filter(Boolean) as SearchImageVo[]
  }

  const handleGenerateAiImages = () => {
    if (!canSearch) {
      message.warning('缺少必要信息，无法生成图片')
      return
    }
    if (!aiPrompt.trim()) {
      message.warning('请输入提示词')
      return
    }
    aiRequestRef.current?.unsubscribe()
    aiRequestRef.current = null
    setAiLoading(true)
    setAiResults([])
    setSelectedAiUrl('')
    const sub = classicService.generateAiImages({
      projectId,
      slideId,
      elementId: imageElement?.id,
      prompt: aiPrompt.trim(),
    } as any).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        const normalized = normalizeAiResults(list)
        setAiResults(normalized)
        if (normalized.length) {
          const first = normalized[0]
          setSelectedAiUrl(first.fetchUrl || first.previewUrl || '')
        }
      },
      error: (error) => {
        setAiLoading(false)
        setAiResults([])
        message.error('生成图片失败: ' + (error?.message || '未知错误'))
      },
      complete: () => {
        setAiLoading(false)
      },
    })
    aiRequestRef.current = sub
  }

  useEffect(() => {
    return () => {
      aiRequestRef.current?.unsubscribe()
      aiRequestRef.current = null
    }
  }, [])

  const getPptElementUploadTarget = async (file: File) => {
    if (!canUploadToProject) return null
    const request = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      projectId,
      slideId: slideId,
    } as FileInfoVo
    const response = await lastValueFrom(s3service.getPptSlideUploadUrl(request))
    const uploadUrl = response?.data
    if (!uploadUrl) {
      throw new Error('获取上传地址失败')
    }
    return buildDirectUploadTarget(uploadUrl)
  }

  const resolveUploadUrl = (data: any) => {
    return (
      data?.result?.httpUrl ||
      data?.result?.fileUrl ||
      data?.response?.result?.httpUrl ||
      data?.response?.result?.fileUrl ||
      ''
    )
  }

  const handleConfirm = () => {
    if (!imageElement) return
    const nextUrl =
      tabKey === 'search'
        ? selectedSearchUrl
        : tabKey === 'ai'
          ? selectedAiUrl
          : uploadedImageUrl
    if (!nextUrl) {
      message.warning('请先选择图片')
      return
    }
    if (tabKey === 'ai') {
      if (!projectId) {
        message.warning('项目ID缺失，无法保存图片')
        return
      }
      if (!slideId) {
        message.warning('当前页面缺少 slideId，无法保存图片')
        return
      }
      const request: FileInfoVo = {
        fileUrl: nextUrl,
        projectId,
        slideId: slideId,
      } as FileInfoVo
      s3service.savePptSlideAiImage(request).subscribe({
        next: (res) => {
          const savedUrl = res?.data || ''
          if (!savedUrl) {
            message.error('保存AI图片失败: 返回地址为空')
            return
          }
          slidesStore.updateElement({ id: imageElement.id, props: { src: savedUrl } })
          addHistorySnapshot()
          setModalVisible(false)
        },
        error: (error) => {
          message.error('保存AI图片失败: ' + (error?.message || '未知错误'))
        },
      })
      return
    }

    slidesStore.updateElement({ id: imageElement.id, props: { src: nextUrl } })
    addHistorySnapshot()
    setModalVisible(false)
  }

  const handleImageScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const target = event.currentTarget
    if (searchLoading || loadingMore) return
    const bottomOffset = target.scrollHeight - target.scrollTop - target.clientHeight
    if (bottomOffset > 120) return
    const hasMore = searchResults.length < totalCount
    if (!hasMore) return
    const nextPage = pageNum + 1
    setPageNum(nextPage)
    fetchImages(nextPage, true)
  }

  const handleClipShapeChange = (shape: string) => {
    if (!imageElement) return
    const nextClip = {
      shape,
      range: imageElement.clip?.range || [[0, 0], [100, 100]],
    }
    slidesStore.updateElement({
      id: imageElement.id,
      props: {
        clip: nextClip,
      },
    })
    addHistorySnapshot()
  }

  if (!imageElement) return null

  return (
    <div>
      <PositionPanel />
      <Divider size="small" />
      <ContentWrapper title="图片设置">
        <Button onClick={() => setModalVisible(true)}>切换图片</Button>
      </ContentWrapper>
      <Divider size="small" />
      <ContentWrapper title="裁剪形状">
        <Select
          value={imageElement.clip?.shape || 'rect'}
          options={clipShapeOptions}
          style={{ width: '100%' }}
          showSearch
          optionFilterProp="label"
          onChange={handleClipShapeChange}
        />
      </ContentWrapper>
      <Divider size="small" />
      <ContentWrapper>
        <ElementFilter />
      </ContentWrapper>
      <Divider size="small" />
      <ContentWrapper contentClassName='!pb-0'>

        <ElementColorMask />

      </ContentWrapper>
      <Divider size="small" />
      <ContentWrapper>

        <ElementOutline />

        <ElementShadow />


        <ElementOpacity />

      </ContentWrapper>
      <Modal
        title="切换图片"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleConfirm}
        okText="确定"
        cancelText="取消"
        width={880}
      >
        <Tabs
          activeKey={tabKey}
          onChange={(key) => setTabKey(key as 'search' | 'upload' | 'ai')}
          items={[
            {
              key: 'search',
              label: '图片库',
              children: (
                <div style={{ minHeight: 260 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'end' }}>
                    <div className='w-[200px]'>

                      <Input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="输入关键词搜索图片"
                        disabled={!canSearch}
                        onPressEnter={handleSearch}
                      />
                    </div>

                  </div>
                  <div
                    style={{ maxHeight: 500, overflow: 'auto' }}
                    onScroll={handleImageScroll}
                  >
                    {searchLoading ? (
                      <div style={{ padding: 24, textAlign: 'center' }}>
                        <Spin />
                      </div>
                    ) : (
                      <div style={{ columnCount: 5, columnGap: 12 }}>
                        {searchResults.length === 0 && (
                          <div style={{ color: '#999' }}>暂无图片结果</div>
                        )}
                        {searchResults.map((item) => {
                          const preview = item.previewUrl || item.fetchUrl
                          const value = item.fetchUrl || item.previewUrl
                          const selected = value && value === selectedSearchUrl
                          return (
                            <div
                              key={value}
                              onClick={() => setSelectedSearchUrl(value)}
                              style={{
                                display: 'inline-block',
                                width: '100%',
                                marginBottom: 12,
                                border: selected ? '2px solid #1677ff' : '1px solid #eee',
                                borderRadius: 6,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: '#fafafa',
                              }}
                            >
                              {preview ? (
                                <img
                                  src={preview}
                                  alt=""
                                  style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                              ) : null}
                            </div>
                          )
                        })}
                        {loadingMore && (
                          <div style={{ breakInside: 'avoid', padding: '12px 0', textAlign: 'center' }}>
                            <Spin size="small" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'ai',
              label: 'AI做图',
              children: (
                <div style={{ minHeight: 260 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'end' }}>
                    <div className='w-full'>
                      <Input
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="输入提示词生成图片"
                        disabled={!canSearch}
                        onPressEnter={handleGenerateAiImages}

                        suffix={<Button type="primary" className='p-0 w-8 h-8' onClick={handleGenerateAiImages} disabled={!canGenerateAi || aiLoading}>

                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                        </Button>}
                      />
                    </div>
                    {/* <Button
                      type="primary"
                      onClick={handleGenerateAiImages}
                      loading={aiLoading}
                      disabled={!canGenerateAi}
                    >
                      生成
                    </Button> */}
                  </div>
                  <div style={{ maxHeight: 500, overflow: 'auto' }}>
                    {aiLoading ? (
                      <div style={{ padding: 24, textAlign: 'center' }}>
                        <Spin />
                      </div>
                    ) :


                      aiResults.length === 0 ? (
                        <div style={{
                          color: '#999',
                          textAlign: 'center',
                          fontSize: '14px',
                          height: '300px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          columnCount: 5
                        }}>请输入提示词以生成图片</div>
                      )
                        : <div style={{ columnCount: 5, columnGap: 12 }}>

                          {aiResults.map((item) => {
                            const preview = item.previewUrl || item.fetchUrl
                            const value = item.fetchUrl || item.previewUrl
                            const selected = value && value === selectedAiUrl
                            return (
                              <div
                                key={value}
                                onClick={() => setSelectedAiUrl(value)}
                                style={{
                                  display: 'inline-block',
                                  width: '100%',
                                  marginBottom: 12,
                                  border: selected ? '2px solid #1677ff' : '1px solid #eee',
                                  borderRadius: 6,
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  background: '#fafafa',
                                }}
                              >
                                {preview ? (
                                  <img
                                    src={preview}
                                    alt=""
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                  />
                                ) : null}
                              </div>
                            )
                          })}
                        </div>


                    }
                  </div>
                </div>
              ),
            },
            {
              key: 'upload',
              label: '本地上传',
              children: (
                <div style={{ paddingTop: 12 }}>
                  <S3Uploader
                    uploadPath={elementUploadPath}
                    uploadTypes="preset:pic"
                    uploadMaxCount={1}
                    getUploadTarget={canUploadToProject ? getPptElementUploadTarget : undefined}
                    onSuccess={(data: any) => {
                      const url = resolveUploadUrl(data)
                      if (url) {
                        setUploadedImageUrl(url)
                      }
                    }}
                    onError={(error) => {
                      message.error('图片上传失败: ' + error.message)
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  )
}

export default ImageElementPanel
