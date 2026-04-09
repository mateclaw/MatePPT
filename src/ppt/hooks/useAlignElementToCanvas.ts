/**
 * 将选中元素对齐到画布 (React + Zustand + ahooks)
 */

import { useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'
import cloneDeep from 'lodash/cloneDeep'

import { useSlidesStore } from '../store/useSlidesStore'
import { useMainStore } from '../store/useMainStore'

import type { PPTElement } from '../core' // 或 '../core'，按你的项目结构调整
import { ElementAlignCommands } from '@/ppt/types/edit'
import { getElementListRange } from '../utils/element'
import useHistorySnapshot from './useHistorySnapshot'
import { useActiveElementList } from './useActiveElementList'

const EMPTY_ELEMENTS: PPTElement[] = []

const useAlignElementToCanvas = () => {
  // slides store：当前页元素 + 视口信息 + 更新方法
  const { slides, slideIndex, viewportRatio, viewportSize, updateSlide } =
    useSlidesStore(
      useShallow((state) => ({
        slides: state.slides,
        slideIndex: state.slideIndex,
        viewportRatio: state.viewportRatio,
        viewportSize: state.viewportSize,
        updateSlide: state.updateSlide,
      })),
    )

  // main store：只取选中元素 ID
  const { activeElementIdList } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()

  const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])
  const currentElements = useMemo(() => currentSlide?.elements || EMPTY_ELEMENTS, [currentSlide])

  /**
   * 由 currentElements + activeElementIdList 计算出当前选中的元素列表
   * 替代从 store 里拿 activeElementList getter
   */
  const { activeElementList } = useActiveElementList()

  /**
   * 将所有选中的元素对齐到画布
   * @param command 对齐方向
   */
  const alignElementToCanvas = useMemoizedFn(
    (command: ElementAlignCommands) => {
      if (!currentElements || currentElements.length === 0) return
      if (!activeElementList || activeElementList.length === 0) return

      const viewportWidth = viewportSize
      const viewportHeight = viewportSize * viewportRatio

      const { minX, maxX, minY, maxY } = getElementListRange(
        activeElementList,
      )

      // ✅ 深拷贝元素列表，避免直接修改 store 中的引用
      const newElementList: PPTElement[] = cloneDeep(currentElements)

      for (const element of newElementList) {
        if (!activeElementIdList.includes(element.id)) continue

        // 水平垂直居中（同时对齐到画布水平 + 垂直中心）
        if (command === ElementAlignCommands.CENTER) {
          const offsetY = minY + (maxY - minY) / 2 - viewportHeight / 2
          const offsetX = minX + (maxX - minX) / 2 - viewportWidth / 2
          element.top = element.top - offsetY
          element.left = element.left - offsetX
        }

        // 顶部对齐
        if (command === ElementAlignCommands.TOP) {
          const offsetY = minY // = minY - 0
          element.top = element.top - offsetY
        }

        // 垂直居中（对齐到画布垂直中心）
        else if (command === ElementAlignCommands.VERTICAL) {
          const offsetY = minY + (maxY - minY) / 2 - viewportHeight / 2
          element.top = element.top - offsetY
        }

        // 底部对齐
        else if (command === ElementAlignCommands.BOTTOM) {
          const offsetY = maxY - viewportHeight
          element.top = element.top - offsetY
        }

        // 左侧对齐
        else if (command === ElementAlignCommands.LEFT) {
          const offsetX = minX // = minX - 0
          element.left = element.left - offsetX
        }

        // 水平居中（对齐到画布水平中心）
        else if (command === ElementAlignCommands.HORIZONTAL) {
          const offsetX = minX + (maxX - minX) / 2 - viewportWidth / 2
          element.left = element.left - offsetX
        }

        // 右侧对齐
        else if (command === ElementAlignCommands.RIGHT) {
          const offsetX = maxX - viewportWidth
          element.left = element.left - offsetX
        }
      }

      updateSlide({ elements: newElementList })
      addHistorySnapshot()
    },
  )

  return {
    alignElementToCanvas,
  }
}

export default useAlignElementToCanvas
