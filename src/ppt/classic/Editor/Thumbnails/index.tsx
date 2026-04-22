import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useClickAway } from 'ahooks'
import { Button, Dropdown, MenuProps, Popover, Space, Spin } from 'antd'
import { Icon } from 'umi'
import { ReactSortable } from 'react-sortablejs'

import { EditorMode, type PPTSlide } from '@/ppt/core'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import { fillDigit } from '@/ppt/utils/common'
import { isElementInViewport } from '@/ppt/utils/element'
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/ppt/store'
import useSlideHandler from '@/ppt/hooks/useSlideHandler'
import useSectionHandler from '@/ppt/hooks/useSectionHandler'
import useScreening from '@/ppt/hooks/useScreening'
import useLoadSlides from '@/ppt/hooks/useLoadSlides'
import useAddSlidesOrElements from '@/ppt/hooks/useAddSlidesOrElements'
import ThumbnailSlide, { type ThumbnailSlideOverlay } from '@/ppt/classic/components/ThumbnailSlide'
// import Templates from './Templates'
import styles from './index.module.scss'
import { DownOutlined, PlusOutlined } from '@ant-design/icons'
import { cn } from '@/lib/utils'

interface ThumbnailsProps {
  onAddBlankSlide?: () => void;
  onAddTemplateSlide?: () => void;
  onAddAIGeneratedSlide?: () => void;
  onLoadMoreSlides?: () => Promise<void>;
  hasMoreSlides?: boolean;
  loadingMoreSlides?: boolean;
  onDeleteSlide?: () => Promise<void>;
  getThumbnailOverlay?: (slide: PPTSlide, index: number) => ThumbnailSlideOverlay | undefined;
  thumbnailFixedHeight?: number;
  hideAddSlideButton?: boolean;

}

export default function Thumbnails({
  onAddBlankSlide,
  onAddTemplateSlide,
  onAddAIGeneratedSlide,
  onLoadMoreSlides,
  hasMoreSlides = false,
  loadingMoreSlides = false,
  getThumbnailOverlay,
  thumbnailFixedHeight,
  hideAddSlideButton = false,
}: ThumbnailsProps) {
  const mainStore = useMainStore()

  const { slides, slideIndex, currentSlide } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
      currentSlide: state.getCurrentSlide(),
    })),
  )
  const updateSlideIndex = useSlidesStore((state) => state.updateSlideIndex)
  const setSlides = useSlidesStore((state) => state.setSlides)

  const { selectedSlidesIndex: rawSelectedSlidesIndex, thumbnailsFocus, mode } = useMainStore(
    useShallow((state) => ({
      selectedSlidesIndex: state.selectedSlidesIndex,
      thumbnailsFocus: state.thumbnailsFocus,
      mode: state.mode,
    })),
  )

  const { ctrlKeyState, shiftKeyState } = useKeyboardStore(
    useShallow((state) => ({
      ctrlKeyState: state.ctrlKeyState,
      shiftKeyState: state.shiftKeyState,
    })),
  )

  const { slidesLoadLimit } = useLoadSlides()
  const { addSlidesFromData } = useAddSlidesOrElements()

  const {
    copySlide,
    pasteSlide,
    createSlide,
    createSlideByTemplate,
    copyAndPasteSlide,
    deleteSlide,
    cutSlide,
    selectAllSlide,
    sortSlides,
    isEmptySlide,
  } = useSlideHandler()

  const {
    createSection,
    removeSection,
    removeAllSection,
    removeSectionSlides,
    updateSectionTitle,
  } = useSectionHandler()

  const { enterScreening, enterScreeningFromStart } = useScreening()

  const [presetLayoutPopoverVisible, setPresetLayoutPopoverVisible] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState('')
  const [sortableSlides, setSortableSlides] = useState<PPTSlide[]>(slides)
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const [contextmenuMenus, setContextmenuMenus] = useState<ContextmenuItem[]>([])
  const [contextmenuEl, setContextmenuEl] = useState<HTMLElement | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    setSortableSlides(slides)
  }, [slides])

  const selectedSlidesIndex = useMemo(() => {
    return Array.from(new Set([...rawSelectedSlidesIndex, slideIndex]))
  }, [rawSelectedSlidesIndex, slideIndex])

  // const hasSection = useMemo(() => slides.some((item) => item.sectionTag), [slides])

  useEffect(() => {
    if (selectedSlidesIndex.length) {
      mainStore.setSelectedSlidesIndex([])
    }

    setTimeout(() => {
      const activeThumbnail = document.querySelector<HTMLElement>(`.${styles['thumbnail-item']}.${styles.active}`)
      const container = document.querySelector<HTMLElement>(`.${styles['thumbnail-list']}`)
      if (activeThumbnail && container && !isElementInViewport(activeThumbnail, container)) {
        activeThumbnail.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }, [slideIndex])

  const setThumbnailsFocus = (focus: boolean) => {
    if (thumbnailsFocus === focus) return
    mainStore.setThumbnailsFocus(focus)
    if (!focus) mainStore.setSelectedSlidesIndex([])
  }

  useClickAway(() => setThumbnailsFocus(false), containerRef)

  const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
    if (!onLoadMoreSlides || loadingRef.current) return
    const target = event.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = target
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
    if (scrollPercentage > 0.85 && hasMoreSlides && !loadingMoreSlides) {
      loadingRef.current = true
      try {
        await onLoadMoreSlides()
      } catch (error) {
        console.error('[Thumbnails] 加载更多幻灯片失败:', error)
      } finally {
        loadingRef.current = false
      }
    }
  }

  const changeSlideIndex = (index: number) => {
    mainStore.setActiveElementIdList([])
    if (slideIndex === index) return
    updateSlideIndex(index)
  }

  const handleClickSlideThumbnail = (e: React.MouseEvent, index: number) => {
    if (editingSectionId) return

    const isMultiSelected = selectedSlidesIndex.length > 1

    if (isMultiSelected && selectedSlidesIndex.includes(index) && e.button !== 0) return

    if (ctrlKeyState) {
      if (slideIndex === index) {
        if (!isMultiSelected) return

        const newSelectedSlidesIndex = selectedSlidesIndex.filter((item) => item !== index)
        mainStore.setSelectedSlidesIndex(newSelectedSlidesIndex)
        changeSlideIndex(selectedSlidesIndex[0])
      } else if (selectedSlidesIndex.includes(index)) {
        const newSelectedSlidesIndex = selectedSlidesIndex.filter((item) => item !== index)
        mainStore.setSelectedSlidesIndex(newSelectedSlidesIndex)
      } else {
        const newSelectedSlidesIndex = [...selectedSlidesIndex, index]
        mainStore.setSelectedSlidesIndex(newSelectedSlidesIndex)
      }
    } else if (shiftKeyState) {
      if (slideIndex === index && !isMultiSelected) return

      let minIndex = Math.min(...selectedSlidesIndex)
      let maxIndex = index

      if (index < minIndex) {
        maxIndex = Math.max(...selectedSlidesIndex)
        minIndex = index
      }

      const newSelectedSlidesIndex = []
      for (let i = minIndex; i <= maxIndex; i++) newSelectedSlidesIndex.push(i)
      mainStore.setSelectedSlidesIndex(newSelectedSlidesIndex)
    } else {
      mainStore.setSelectedSlidesIndex([])
      changeSlideIndex(index)
    }
  }

  const handleDragEnd = (eventData: { newIndex?: number; oldIndex?: number }) => {
    const { newIndex, oldIndex } = eventData
    if (newIndex === undefined || oldIndex === undefined || newIndex === oldIndex) return
    sortSlides(newIndex, oldIndex)
  }

  const openNotesPanel = () => {
    mainStore.setShowNotesPanel(true)
  }

  const editSection = (id: string) => {
    mainStore.setDisableHotkeys(true)
    setEditingSectionId(id || 'default')

    setTimeout(() => {
      const inputRef = document.querySelector<HTMLInputElement>(`#section-title-input-${id || 'default'}`)
      inputRef?.focus()
    }, 0)
  }

  const saveSection = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const title = (e.target as HTMLInputElement).value
    updateSectionTitle(editingSectionId, title)

    setEditingSectionId('')
    mainStore.setDisableHotkeys(false)
  }

  const insertAllTemplates = (templateSlides: PPTSlide[]) => {
    if (isEmptySlide) setSlides(templateSlides)
    else addSlidesFromData(templateSlides)
  }

  // const contextmenusSection = (sectionId: string): ContextmenuItem[] => ([
  //   {
  //     text: '删除节',
  //     handler: () => removeSection(sectionId),
  //   },
  //   {
  //     text: '删除节和幻灯片',
  //     handler: () => {
  //       mainStore.setActiveElementIdList([])
  //       removeSectionSlides(sectionId)
  //     },
  //   },
  //   {
  //     text: '删除所有节',
  //     handler: removeAllSection,
  //   },
  //   {
  //     text: '重命名节',
  //     handler: () => editSection(sectionId),
  //   },
  // ])

  const contextmenusThumbnails = (): ContextmenuItem[] => ([
    {
      text: '粘贴',
      subText: 'Ctrl + V',
      handler: pasteSlide,
    },
    {
      text: '全选',
      subText: 'Ctrl + A',
      handler: selectAllSlide,
    },
    {
      text: '新建页面',
      subText: 'Enter',
      handler: createSlide,
    },
    {
      text: '幻灯片放映',
      subText: 'F5',
      handler: enterScreeningFromStart,
    },
  ])

  const contextmenusThumbnailItem = (): ContextmenuItem[] => ([
    {
      text: '剪切',
      subText: 'Ctrl + X',
      handler: cutSlide,
    },
    {
      text: '复制',
      subText: 'Ctrl + C',
      handler: copySlide,
    },
    {
      text: '粘贴',
      subText: 'Ctrl + V',
      handler: pasteSlide,
    },
    {
      text: '全选',
      subText: 'Ctrl + A',
      handler: selectAllSlide,
    },
    { divider: true },
    {
      text: '新建页面',
      subText: 'Enter',
      handler: createSlide,
    },
    {
      text: '复制页面',
      subText: 'Ctrl + D',
      handler: copyAndPasteSlide,
    },
    {
      text: '删除页面',
      subText: 'Delete',
      handler: () => {

        deleteSlide()
      
      },
    },
    // {
    //   text: '增加节',
    //   handler: createSection,
    //   disable: !!currentSlide?.sectionTag,
    // },
    { divider: true },
    {
      text: '从当前放映',
      subText: 'Shift + F5',
      handler: enterScreening,
    },
  ])

  const openContextmenu = (e: React.MouseEvent, menus: ContextmenuItem[]) => {
    e.preventDefault()
    setContextmenuAxis({ x: e.clientX, y: e.clientY })
    setContextmenuMenus(menus)
    setContextmenuEl(e.currentTarget as HTMLElement)
  }

  const removeContextmenu = () => {
    setContextmenuAxis(null)
    setContextmenuMenus([])
    setContextmenuEl(null)
  }

  return (
    <div
      ref={containerRef}
      className={cn('p-4 ', styles.thumbnails)}
      onMouseDown={() => setThumbnailsFocus(true)}
      onContextMenu={(e) => {
        if (editingSectionId) return
        openContextmenu(e, contextmenusThumbnails())
      }}
    >
      {/* <div className={styles['add-slide']}>
        <div className={styles.btn} onClick={createSlide}><Icon className={styles.icon} icon="ri:add-line" />添加幻灯片</div>
        <Popover
          trigger="click"
          placement="bottomLeft"
          open={presetLayoutPopoverVisible}
          onOpenChange={setPresetLayoutPopoverVisible}
          content={
            <Templates
              onSelect={(slide) => { createSlideByTemplate(slide); setPresetLayoutPopoverVisible(false) }}
              onSelectAll={(items) => { insertAllTemplates(items); setPresetLayoutPopoverVisible(false) }}
            />
          }
        >
          <div className={styles['select-btn']}><Icon icon="ri:arrow-down-s-line" /></div>
        </Popover>
      </div> */}

      {!hideAddSlideButton && mode === EditorMode.EDIT && <Space.Compact className='justify-center pb-4'>
        <Button onClick={() => {
          if (onAddBlankSlide) onAddBlankSlide();
          else createSlide();
        }} >
          <PlusOutlined />
          添加幻灯片
        </Button>
      </Space.Compact>}

      <div className={styles['thumbnail-list']} onScroll={handleScroll}>
        <ReactSortable
          list={sortableSlides}
          setList={setSortableSlides}
          animation={200}
          disabled={mode !== EditorMode.EDIT}
          onEnd={handleDragEnd}
        >
          {sortableSlides.map((element, index) => (
            <div key={(element as any).slideId || element.id} className={styles['thumbnail-container']}>

              <div
                className={`${styles['thumbnail-item']} ${slideIndex === index ? styles.active : ''
                  } ${selectedSlidesIndex.includes(index) ? styles.selected : ''
                  }`}
                onMouseDown={(e) => handleClickSlideThumbnail(e, index)}
                // onDoubleClick={() => enterScreening(index)} // 双击进入放映
                onContextMenu={(e) => {
                  e.stopPropagation()
                  openContextmenu(e, contextmenusThumbnailItem())
                }}
              >
                <div className={`${styles.label} ${index >= 99 ? styles['offset-left'] : ''}`}>
                  {fillDigit(index + 1, 2)}
                </div>
                <div className={styles.thumbnail}>
                  <ThumbnailSlide
                    slide={element}
                    size={180}
                    visible={index < slidesLoadLimit}
                    overlay={getThumbnailOverlay?.(element, index)}
                    fixedHeight={thumbnailFixedHeight}
                  />
                </div>
                {/* {element.notes && element.notes.length > 0 && (
                  <div className={styles['note-flag']} onClick={openNotesPanel}>{element.notes.length}</div>
                )} */}
              </div>
            </div>
          ))}
        </ReactSortable>
      </div>

      {loadingMoreSlides && (
        <div style={{ padding: '12px', textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      )}

      {/* <div className={styles['page-number']}>幻灯片 {slideIndex + 1} / {slides.length}</div> */}

      {contextmenuAxis && (
        <Contextmenu
          axis={contextmenuAxis}
          el={contextmenuEl || document.body}
          menus={contextmenuMenus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </div>
  )
}
