/**
 * 添加幻灯片或元素 Hook (React + Zustand + ahooks)
 */

import { nanoid } from 'nanoid'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useSlidesStore } from '../store/useSlidesStore'
import { useMainStore } from '../store/useMainStore'
import { useSnapshotStore } from '../store/useSnapshotStore'

import type { PPTElement, PPTSlide, Animation } from '../core'
import { createSlideIdMap, createElementIdMap, getElementRange } from '../utils/element'

/**
 * 添加幻灯片或元素的 Hook
 * @returns addElementsFromData / addSlidesFromData
 */
export const useAddSlidesOrElements = () => {
  /**
   * 从 slidesStore 中只取用到的方法 / 状态，避免因为其它字段变化导致重渲染
   */
  const { getCurrentSlide, addElement, addSlide } = useSlidesStore(
    useShallow((state) => ({ getCurrentSlide: state.getCurrentSlide, addElement: state.addElement, addSlide: state.addSlide }))
  )

  const { setActiveElementIdList } = useMainStore(

    useShallow((state) => ({ setActiveElementIdList: state.setActiveElementIdList }))
  )

  const { addSnapshot } = useSnapshotStore(
    useShallow((state) => ({ addSnapshot: state.addSnapshot }))
  )

  /**
   * 添加指定的元素数据（一组）
   * @param elements 元素列表数据
   */
  const addElementsFromData = useMemoizedFn((elements: PPTElement[]) => {
    if (!elements || elements.length === 0) return

    // 避免直接修改调用方传进来的 elements
    const clonedElements: PPTElement[] = elements.map((el) => ({ ...el } as PPTElement))

    const { groupIdMap, elIdMap } = createElementIdMap(clonedElements)

    const firstElement = clonedElements[0]
    let offset = 0
    let lastSameElement: PPTElement | undefined

    const currentSlide = getCurrentSlide()
    if (!currentSlide) return

    // 查找当前页面中是否已存在位置/范围完全相同的同类型元素，有则向右下偏移
    do {
      lastSameElement = currentSlide.elements.find((el) => {
        if (el.type !== firstElement.type) return false

        const {
          minX: oMinX,
          maxX: oMaxX,
          minY: oMinY,
          maxY: oMaxY,
        } = getElementRange(el)

        const {
          minX: nMinX,
          maxX: nMaxX,
          minY: nMinY,
          maxY: nMaxY,
        } = getElementRange({
          ...firstElement,
          left: firstElement.left + offset,
          top: firstElement.top + offset,
        } as PPTElement)

        return (
          oMinX === nMinX &&
          oMaxX === nMaxX &&
          oMinY === nMinY &&
          oMaxY === nMaxY
        )
      })

      if (lastSameElement) {
        offset += 10
      }
    } while (lastSameElement)

    // 替换 id / groupId，并整体偏移位置
    for (const element of clonedElements) {
      element.id = elIdMap[element.id]
      element.left = element.left + offset
      element.top = element.top + offset

      if (element.groupId) {
        element.groupId = groupIdMap[element.groupId]
      }
    }

    // 更新 store
    addElement(clonedElements)
    setActiveElementIdList(Object.values(elIdMap))
    addSnapshot()
  })

  /**
   * 添加指定的页面数据
   * @param slides 页面数据列表
   */
  const addSlidesFromData = useMemoizedFn((slides: PPTSlide[]) => {
    if (!slides || slides.length === 0) return

    // 为了避免修改调用方数据，这里也拷贝一份
    const clonedSlides: PPTSlide[] = slides.map((slide) => ({
      ...slide,
      elements: slide.elements?.map((el) => ({ ...el })) ?? [],
      animations: slide.animations?.map((ani) => ({ ...ani })) ?? [],
    } as PPTSlide))

    const slideIdMap = createSlideIdMap(clonedSlides)

    const newSlides: PPTSlide[] = clonedSlides.map((slide) => {
      const { groupIdMap, elIdMap } = createElementIdMap(slide.elements)

      for (const element of slide.elements) {
        element.id = elIdMap[element.id]
        if (element.groupId) {
          element.groupId = groupIdMap[element.groupId]
        }

        // 若元素绑定了页面跳转链接
        if (element.link && element.link.type === 'slide') {
          // 待添加页面中包含该页面，则替换相关绑定关系
          if (slideIdMap[element.link.target]) {
            element.link.target = slideIdMap[element.link.target]
          }
          // 待添加页面中不包含该页面，则删除该元素绑定的页面跳转
          else {
            delete element.link
          }
        }
      }

      // 动画 id 替换
      if (slide.animations) {
        for (const animation of slide.animations) {
          animation.id = nanoid(10)
          animation.elId = elIdMap[animation.elId]
        }
      }

      return {
        ...slide,
        id: slideIdMap[slide.id],
      } as PPTSlide
    })
    addSlide(newSlides)
    addSnapshot()
  })

  return {
    addElementsFromData,
    addSlidesFromData,
  }
}

export default useAddSlidesOrElements
