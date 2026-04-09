/**
 * 对齐选中元素 Hook (React + Zustand + ahooks)
 */

import { useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'
import cloneDeep from 'lodash/cloneDeep'

import { useSlidesStore } from '../store/useSlidesStore'
import { useMainStore } from '../store/useMainStore'

import type { PPTElement } from '../core' // 或 '../core'，按你的项目结构调整
import { ElementAlignCommands } from '@/ppt/types/edit'
import { getElementListRange, getRectRotatedOffset } from '../utils/element'
import useHistorySnapshot from './useHistorySnapshot'
import { useActiveElementList, useHandleElement } from "./useActiveElementList";

interface RangeMap {
  [id: string]: ReturnType<typeof getElementListRange>
}

const useElementAlign = () => {
  // slides store：只取当前页元素和更新方法
  const { currentElements, updateSlide } = useSlidesStore(
    useShallow((state) => ({
      currentElements: state.getCurrentSlide()?.elements || [],
      updateSlide: state.updateSlide,
    })),
  )

  // main store：只取选中元素 ID 列表
  const { activeElementIdList } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * 由 currentElements + activeElementIdList 计算出当前选中的元素列表
   * （替代之前从 store 里面拿 getter 的做法）
   */
  const { activeElementList } = useActiveElementList()

  /**
   * 对齐选中的元素
   * @param command 对齐方向
   */
  const alignActiveElement = useMemoizedFn((command: ElementAlignCommands) => {
    if (!currentElements || currentElements.length === 0) return
    if (!activeElementList || activeElementList.length === 0) return

    const { minX, maxX, minY, maxY } = getElementListRange(activeElementList)

    // ✅ 深拷贝当前页的元素列表，避免直接修改 store 中的数据
    const elementList: PPTElement[] = cloneDeep(currentElements)

    // 如果所选择的元素为组合元素的成员，需要计算该组合的整体范围
    const groupElementRangeMap: RangeMap = {}
    for (const activeElement of activeElementList) {
      if (activeElement.groupId && !groupElementRangeMap[activeElement.groupId]) {
        const groupElements = activeElementList.filter(
          (item) => item.groupId === activeElement.groupId,
        )
        groupElementRangeMap[activeElement.groupId] =
          getElementListRange(groupElements)
      }
    }

    // 根据不同的命令，计算对齐的位置
    if (command === ElementAlignCommands.LEFT) {
      elementList.forEach((element) => {
        if (!activeElementIdList.includes(element.id)) return

        if (!element.groupId) {
          // 单个元素
          if ('rotate' in element && element.rotate) {
            const { offsetX } = getRectRotatedOffset({
              left: element.left,
              top: element.top,
              width: element.width,
              height: element.height,
              rotate: element.rotate,
            })
            element.left = minX - offsetX
          } else {
            element.left = minX
          }
        } else {
          // 组合成员元素，以组合整体范围为基准
          const range = groupElementRangeMap[element.groupId]
          const offset = range.minX - minX
          element.left = element.left - offset
        }
      })
    } else if (command === ElementAlignCommands.RIGHT) {
      elementList.forEach((element) => {
        if (!activeElementIdList.includes(element.id)) return

        if (!element.groupId) {
          const elWidth =
            element.type === 'line'
              ? Math.max(element.start[0], element.end[0]) // 保持和原逻辑一致
              : element.width

          if ('rotate' in element && element.rotate) {
            const { offsetX } = getRectRotatedOffset({
              left: element.left,
              top: element.top,
              width: element.width,
              height: element.height,
              rotate: element.rotate,
            })
            element.left = maxX - elWidth + offsetX
          } else {
            element.left = maxX - elWidth
          }
        } else {
          const range = groupElementRangeMap[element.groupId]
          const offset = range.maxX - maxX
          element.left = element.left - offset
        }
      })
    } else if (command === ElementAlignCommands.TOP) {
      elementList.forEach((element) => {
        if (!activeElementIdList.includes(element.id)) return

        if (!element.groupId) {
          if ('rotate' in element && element.rotate) {
            const { offsetY } = getRectRotatedOffset({
              left: element.left,
              top: element.top,
              width: element.width,
              height: element.height,
              rotate: element.rotate,
            })
            element.top = minY - offsetY
          } else {
            element.top = minY
          }
        } else {
          const range = groupElementRangeMap[element.groupId]
          const offset = range.minY - minY
          element.top = element.top - offset
        }
      })
    } else if (command === ElementAlignCommands.BOTTOM) {
      elementList.forEach((element) => {
        if (!activeElementIdList.includes(element.id)) return

        if (!element.groupId) {
          const elHeight =
            element.type === 'line'
              ? Math.max(element.start[1], element.end[1]) // 保持原逻辑
              : element.height

          if ('rotate' in element && element.rotate) {
            const { offsetY } = getRectRotatedOffset({
              left: element.left,
              top: element.top,
              width: element.width,
              height: element.height,
              rotate: element.rotate,
            })
            element.top = maxY - elHeight + offsetY
          } else {
            element.top = maxY - elHeight
          }
        } else {
          const range = groupElementRangeMap[element.groupId]
          const offset = range.maxY - maxY
          element.top = element.top - offset
        }
      })
    } else if (command === ElementAlignCommands.HORIZONTAL) {
      const horizontalCenter = (minX + maxX) / 2
      elementList.forEach((element) => {
        if (!activeElementIdList.includes(element.id)) return

        if (!element.groupId) {
          const elWidth =
            element.type === 'line'
              ? Math.max(element.start[0], element.end[0])
              : element.width
          element.left = horizontalCenter - elWidth / 2
        } else {
          const range = groupElementRangeMap[element.groupId]
          const center = (range.maxX + range.minX) / 2
          const offset = center - horizontalCenter
          element.left = element.left - offset
        }
      })
    } else if (command === ElementAlignCommands.VERTICAL) {
      const verticalCenter = (minY + maxY) / 2
      elementList.forEach((element) => {
        if (!activeElementIdList.includes(element.id)) return

        if (!element.groupId) {
          const elHeight =
            element.type === 'line'
              ? Math.max(element.start[1], element.end[1])
              : element.height
          element.top = verticalCenter - elHeight / 2
        } else {
          const range = groupElementRangeMap[element.groupId]
          const center = (range.maxY + range.minY) / 2
          const offset = center - verticalCenter
          element.top = element.top - offset
        }
      })
    }

    // 更新当前页元素
    updateSlide({ elements: elementList })
    addHistorySnapshot()
  })

  return {
    alignActiveElement,
  }
}

export default useElementAlign
