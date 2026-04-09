/**
 * 删除元素 Hook (React + Zustand + ahooks)
 * - deleteElement: 删除全部选中元素（组合内优先删除当前可独立操作的成员）
 * - deleteAllElements: 删除当前页内全部元素
 */

import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { lastValueFrom } from 'rxjs'
import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'
import type { PPTElement } from '../core'
import useHistorySnapshot from '../hooks/useHistorySnapshot'
import { S3Service } from '@/services/s3.service'
import { usePptProjectStore } from '@/stores/pptProjectStore'

const useDeleteElement = () => {
  const {
    activeElementIdList,
    activeGroupElementId,
    setActiveElementIdList,
  } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
      activeGroupElementId: state.activeGroupElementId,
      setActiveElementIdList: state.setActiveElementIdList,
    })),
  )

  const { currentSlide, updateSlide } = useSlidesStore(
    useShallow((state) => ({
      currentSlide: state.getCurrentSlide(),
      updateSlide: state.updateSlide,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()
  const s3service = S3Service.getInstance()

  const maybeCleanupMediaResources = useMemoizedFn((removed: PPTElement[], nextSlides: any[], slideId?: number) => {
    const removedMedia = removed.filter((el) => ['image', 'video', 'audio'].includes(el.type))
    if (!removedMedia.length) return

    const remainingMediaSrc = new Set<string>()
    nextSlides.forEach((slide) => {
      const elements = slide?.elements || []
      elements
        .filter((el: any) => ['image', 'video', 'audio'].includes(el.type))
        .map((el: any) => el.src)
        .filter(Boolean)
        .forEach((src: string) => remainingMediaSrc.add(src))
    })

    const handled = new Set<string>()
    for (const el of removedMedia as any[]) {
      const src = el?.src
      if (!src || remainingMediaSrc.has(src) || handled.has(`${el.type}|${src}`)) continue
      handled.add(`${el.type}|${src}`)
      queueMicrotask(async () => {
        const {
          projectId,
          createMode,
          classicSlidesAllLoaded,
          creationSlidesAllLoaded,
        } = usePptProjectStore.getState()
        if (!projectId || !slideId) return
        if (createMode === 'classic' && !classicSlidesAllLoaded) return
        if (createMode === 'creative' && !creationSlidesAllLoaded) return
        try {
          await lastValueFrom(
            s3service.deletePptSlideElement({
              projectId,
              slideId,
              fileUrl: src,
            } as any),
          )
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[media-cleanup] delete failed', { type: el.type, src, error })
        }
      })
    }
  })

  /**
   * 删除全部选中元素
   * - 组合元素成员中，存在被选中可独立操作的元素时，优先删除该元素
   * - 否则默认删除所有被选中的元素
   */
  const deleteElement = useMemoizedFn(() => {
    if (!currentSlide) return
    if (!activeElementIdList || activeElementIdList.length === 0) return

    let newElementList: PPTElement[] = []

    if (activeGroupElementId) {
      // 优先删除 group 内当前可独立操作的元素
      newElementList = currentSlide.elements.filter(
        (el) => el.id !== activeGroupElementId,
      )
    } else {
      // 否则删除所有选中的元素
      newElementList = currentSlide.elements.filter(
        (el) => !activeElementIdList.includes(el.id),
      )
    }

    const removedElements = currentSlide.elements.filter(
      (el) => !newElementList.includes(el),
    )

    setActiveElementIdList([])
    updateSlide({ elements: newElementList })
    const nextSlides = useSlidesStore.getState().slides.map((slide) =>
      slide.id === currentSlide.id ? ({ ...slide, elements: newElementList } as any) : slide,
    )
    const currentSlideId = (currentSlide as any).slideId as number | undefined
    maybeCleanupMediaResources(removedElements, nextSlides, currentSlideId)
    addHistorySnapshot()
  })

  /**
   * 删除当前页内全部元素（无论是否选中）
   */
  const deleteAllElements = useMemoizedFn(() => {
    if (!currentSlide) return
    if (!currentSlide.elements.length) return

    const removedElements = currentSlide.elements
    setActiveElementIdList([])
    updateSlide({ elements: [] })
    const nextSlides = useSlidesStore.getState().slides.map((slide) =>
      slide.id === currentSlide.id ? ({ ...slide, elements: [] } as any) : slide,
    )
    const currentSlideId = (currentSlide as any).slideId as number | undefined
    maybeCleanupMediaResources(removedElements, nextSlides, currentSlideId)
    addHistorySnapshot()
  })

  return {
    deleteElement,
    deleteAllElements,
  }
}

export default useDeleteElement
