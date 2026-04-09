// useSlideOperations.ts
import { useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import cloneDeep from 'lodash/cloneDeep'
import { nanoid } from 'nanoid'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'
import { PPTSlide } from '../core'
import { copyText, readClipboard } from '../utils/clipboard'
import { encrypt } from '../utils/crypto'
import { createElementIdMap } from '../utils/element'
import { KEYS } from '../configs/hotkey'

import usePasteTextClipboardData from '../hooks/usePasteTextClipboardData'
import useHistorySnapshot from '../hooks/useHistorySnapshot'
import useAddSlidesOrElements from '../hooks/useAddSlidesOrElements'
import { App } from 'antd'

import { lastValueFrom } from 'rxjs'
import { PptProjectSlideService } from '@/services/pptProjectSlide.service'
import { PptProjectSlidePo } from '@/models/pptProjectSlidePo'

const useSlideOperations = () => {
  /** --------- zustand store --------- */
  const {
    selectedSlidesIndex: rawSelectedSlidesIndex,
    activeElementIdList,
    setActiveElementIdList,
    setThumbnailsFocus,
    updateSelectedSlidesIndex,
  } = useMainStore(
    useShallow((state) => ({
      selectedSlidesIndex: state.selectedSlidesIndex,
      activeElementIdList: state.activeElementIdList,
      setActiveElementIdList: state.setActiveElementIdList,
      setThumbnailsFocus: state.setThumbnailsFocus,
      updateSelectedSlidesIndex: state.setSelectedSlidesIndex,
    })),
  )

  const { message } = App.useApp();

  const {
    currentSlide,
    slides,
    theme,
    slideIndex,
    updateSlideIndex: setSlideIndex,
    setSlides,
    addSlide,
    deleteSlide: removeSlides,
  } = useSlidesStore(
    useShallow((state) => ({
      currentSlide: state.getCurrentSlide(),
      slides: state.slides,
      theme: state.theme,
      slideIndex: state.slideIndex,
      updateSlideIndex: state.updateSlideIndex,
      setSlides: state.setSlides,
      addSlide: state.addSlide,
      deleteSlide: state.deleteSlide,
    })),
  )

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { addSlidesFromData } = useAddSlidesOrElements()
  const { addHistorySnapshot } = useHistorySnapshot()

  /** --------- 计算属性（computed → useMemo） --------- */

  // selectedSlidesIndex = [..._selectedSlidesIndex, slideIndex]
  const selectedSlidesIndex = useMemo(
    () => [...rawSelectedSlidesIndex, slideIndex],
    [rawSelectedSlidesIndex, slideIndex],
  )

  // 当前被选中的 slide 列表
  const selectedSlides = useMemo(
    () => slides.filter((_, index) => selectedSlidesIndex.includes(index)),
    [slides, selectedSlidesIndex],
  )

  // 当前被选中的 slide id 列表
  const selectedSlidesId = useMemo(
    () => selectedSlides.map((s) => s.id),
    [selectedSlides],
  )

  const isEmptySlide = useMemo(() => {
    if (slides.length > 1) return false
    if (!slides[0]) return false
    if (slides[0].elements && slides[0].elements.length > 0) return false
    return true
  }, [slides])

  /** --------- 方法区域（全部用 useMemoizedFn 包一层） --------- */

  // 重置幻灯片
  const resetSlides = useMemoizedFn(() => {
    const emptySlide: PPTSlide = new PPTSlide(
      {
        id: nanoid(10),
        elements: [],
        background: {
          type: 'solid',
          color: theme.themeColors.lt1,
        },
      }
    )

    setSlideIndex(0)
    setActiveElementIdList([])
    setSlides([emptySlide])
  })

  /**
   * 移动页面焦点
   * @param command KEYS.UP / KEYS.DOWN
   */
  const updateSlideIndexCmd = useMemoizedFn((command: string) => {
    if (command === KEYS.UP && slideIndex > 0) {
      if (activeElementIdList.length) setActiveElementIdList([])
      setSlideIndex(slideIndex - 1)
    } else if (command === KEYS.DOWN && slideIndex < slides.length - 1) {
      if (activeElementIdList.length) setActiveElementIdList([])
      setSlideIndex(slideIndex + 1)
    }
  })

  // 将当前页面数据加密后复制到剪贴板
  const copySlide = useMemoizedFn(async () => {
    const text = encrypt(
      JSON.stringify({
        type: 'slides',
        data: selectedSlides,
      }),
    )

    await copyText(text)
    setThumbnailsFocus(true)
  })

  // 尝试将剪贴板页面数据解密后添加到下一页（粘贴）
  const pasteSlide = useMemoizedFn(async () => {
    try {
      const text = await readClipboard()
      pasteTextClipboardData(text, { onlySlide: true })
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      message.warning(errorMessage)
    }
  })

  // 创建一页空白页并添加到下一页
  const createSlide = useMemoizedFn(() => {
    const emptySlide: PPTSlide = new PPTSlide({
      id: nanoid(10),
      elements: [],
      background: {
        type: 'solid',
        color: theme.themeColors.lt1,
      },
    })
    setActiveElementIdList([])
    addSlide(emptySlide)
    addHistorySnapshot()
  })

  // 根据模板创建新页面（会重建 element.id / groupId）
  // ⚠️ 这里原来会修改传入的 slide，本实现先深拷贝避免污染外部
  const createSlideByTemplate = useMemoizedFn((slide: PPTSlide) => {
    if (!slide) return

    // ✅ 深拷贝模板 slide，避免修改外部传入对象
    const clonedSlide = cloneDeep(slide)

    const { groupIdMap, elIdMap } = createElementIdMap(clonedSlide.elements)

    for (const element of clonedSlide.elements) {
      element.id = elIdMap[element.id]
      if (element.groupId) element.groupId = groupIdMap[element.groupId]
    }

    const newSlide: PPTSlide = new PPTSlide({
      ...clonedSlide,
      id: nanoid(10),
    })

    setActiveElementIdList([])
    addSlide(newSlide)
    addHistorySnapshot()
  })

  // 将当前页复制一份到下一页
  // 原逻辑：JSON.parse(JSON.stringify(currentSlide))
  const copyAndPasteSlide = useMemoizedFn(() => {
    if (!currentSlide) return

    // ✅ 深拷贝 currentSlide
    const slideCopy: PPTSlide = cloneDeep(currentSlide)
    addSlidesFromData([slideCopy])
  })

  // 删除当前页，若将删除全部页面，则执行重置幻灯片操作
  const deleteSlide = useMemoizedFn(async (targetSlidesId?: string[]) => {
    const ids = targetSlidesId ?? selectedSlidesId

    const slidesToDelete = slides.filter(s => ids.includes(s.id)) as (PPTSlide & { slideId?: number })[]

    // 先调用接口删除
    for (const slide of slidesToDelete) {
      if (slide.slideId) {
        try {
          await lastValueFrom(
            PptProjectSlideService.getInstance().delete({ slideId: slide.slideId } as PptProjectSlidePo)
          )
        } catch (error) {
          console.error('删除幻灯片失败:', error)
        }
      }
    }

    if (slides.length === ids.length) {
      resetSlides()
    } else {
      removeSlides(ids)
    }

    updateSelectedSlidesIndex([])
    addHistorySnapshot()
  })

  // 将当前页复制后删除（剪切）
  const cutSlide = useMemoizedFn(async () => {
    const targetSlidesId = [...selectedSlidesId]
    // 复制会清空多选，所以先缓存 id
    await copySlide()
    await deleteSlide(targetSlidesId)
  })

  // 选中全部幻灯片
  const selectAllSlide = useMemoizedFn(() => {
    const newSelectedSlidesIndex = Array.from(
      Array(slides.length),
      (_, index) => index,
    )

    setActiveElementIdList([])
    updateSelectedSlidesIndex(newSelectedSlidesIndex)
  })

  // 拖拽调整幻灯片顺序同步数据
  // 原逻辑：const _slides = JSON.parse(JSON.stringify(slides))
  const sortSlides = useMemoizedFn((newIndex: number, oldIndex: number) => {
    if (oldIndex === newIndex) return

    // ✅ 深拷贝 slides
    const _slides: PPTSlide[] = cloneDeep(slides)

    // const movingSlide = _slides[oldIndex]
    // const movingSlideSection = movingSlide.sectionTag

    // // 原始逻辑：处理 sectionTag 的边界情况
    // if (movingSlideSection) {
    //   const movingSlideSectionNext = _slides[oldIndex + 1]
    //   delete movingSlide.sectionTag
    //   if (movingSlideSectionNext && !movingSlideSectionNext.sectionTag) {
    //     movingSlideSectionNext.sectionTag = movingSlideSection
    //   }
    // }

    // if (newIndex === 0) {
    //   const firstSection = _slides[0].sectionTag
    //   if (firstSection) {
    //     delete _slides[0].sectionTag
    //     movingSlide.sectionTag = firstSection
    //   }
    // }

    const temp = _slides[oldIndex]
    _slides.splice(oldIndex, 1)
    _slides.splice(newIndex, 0, temp)

    setSlides(_slides)
    setSlideIndex(newIndex)
  })

  return {
    resetSlides,
    updateSlideIndex: updateSlideIndexCmd,
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
  }
}

export default useSlideOperations
