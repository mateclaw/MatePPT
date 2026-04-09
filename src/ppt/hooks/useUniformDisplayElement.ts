// useUniformDistributeElements.ts
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMemoizedFn } from 'ahooks'
import cloneDeep from 'lodash/cloneDeep'

import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'
import type { PPTElement } from '../core'
import {
  getElementRange,
  getElementListRange,
  getRectRotatedOffset,
} from '../utils/element'
import useHistorySnapshot from './useHistorySnapshot'
import { useActiveElementList } from './useActiveElementList'

interface ElementItem {
  min: number
  max: number
  el: PPTElement
}

interface GroupItem {
  groupId: string
  els: PPTElement[]
}

interface GroupElementsItem {
  min: number
  max: number
  els: PPTElement[]
}

type Item = ElementItem | GroupElementsItem

interface ElementWithPos {
  pos: number
  el: PPTElement
}

interface LastPos {
  min: number
  max: number
}

const useUniformDistributeElements = () => {

  const { activeElementList } = useActiveElementList()

  const {
    activeElementIdList,
    // activeElementList,
  } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
      // activeElementList: state.activeElementList,
    })),
  )

  const { currentSlide, updateSlide } = useSlidesStore(
    useShallow((state) => ({
      currentSlide: state.getCurrentSlide(),
      updateSlide: state.updateSlide,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * 展示项数量（一个 group 只算 1 个）
   * 对应 Vue 的 computed: displayItemCount
   */
  const displayItemCount = useMemo(() => {
    if (!activeElementList || activeElementList.length === 0) return 0

    let count = 0
    const groupIdList: string[] = []

    for (const el of activeElementList) {
      if (!el.groupId) {
        count += 1
      } else if (!groupIdList.includes(el.groupId)) {
        groupIdList.push(el.groupId)
        count += 1
      }
    }

    return count
  }, [activeElementList])

  /**
   * 水平均匀排列
   * 对应 uniformHorizontalDisplay（Vue）
   */
  const uniformHorizontalDisplay = useMemoizedFn(() => {
    if (!currentSlide || !activeElementList || activeElementList.length < 2) {
      return
    }

    const { minX, maxX } = getElementListRange(activeElementList)

    // ✅ 深拷贝：避免直接修改 store 内对象
    const copyOfActiveElementList: PPTElement[] = cloneDeep(activeElementList)
    const newElementList: PPTElement[] = cloneDeep(currentSlide.elements || [])

    // 分别获取普通元素和组合元素集合，并记录下每一项的范围
    const singleElementList: ElementItem[] = []
    let groupList: GroupItem[] = []

    for (const el of copyOfActiveElementList) {
      if (!el.groupId) {
        const { minX: elMinX, maxX: elMaxX } = getElementRange(el)
        singleElementList.push({ min: elMinX, max: elMaxX, el })
      } else {
        const groupEl = groupList.find((item) => item.groupId === el.groupId)
        if (!groupEl) {
          groupList.push({ groupId: el.groupId, els: [el] })
        } else {
          groupList = groupList.map((item) =>
            item.groupId === el.groupId
              ? { ...item, els: [...item.els, el] }
              : item,
          )
        }
      }
    }

    const formatedGroupList: GroupElementsItem[] = []
    for (const groupItem of groupList) {
      const { minX: gMinX, maxX: gMaxX } = getElementListRange(groupItem.els)
      formatedGroupList.push({
        min: gMinX,
        max: gMaxX,
        els: groupItem.els,
      })
    }

    // 将普通元素和组合元素集合组合在一起，并按位置（从左到右）排序
    const list: Item[] = [...singleElementList, ...formatedGroupList]
    list.sort((itemA, itemB) => itemA.min - itemB.min)

    // 计算元素均匀分布所需要的间隔：
    // (所选元素整体范围 - 所有所选元素宽度和) / (所选元素数 - 1)
    let totalWidth = 0
    for (const item of list) {
      const width = item.max - item.min
      totalWidth += width
    }
    const span = ((maxX - minX) - totalWidth) / (list.length - 1)

    // 按顺序计算目标位置（pos）
    const sortedElementData: ElementWithPos[] = []

    const firstItem = list[0]
    let lastPos: LastPos = { min: firstItem.min, max: firstItem.max }

    if ('el' in firstItem) {
      sortedElementData.push({ pos: firstItem.min, el: firstItem.el })
    } else {
      for (const el of firstItem.els) {
        const { minX: pos } = getElementRange(el)
        sortedElementData.push({ pos, el })
      }
    }

    for (let i = 1; i < list.length; i++) {
      const item = list[i]
      const lastWidth = lastPos.max - lastPos.min
      const currentPos = lastPos.min + lastWidth + span
      const currentWidth = item.max - item.min
      lastPos = { min: currentPos, max: currentPos + currentWidth }

      if ('el' in item) {
        sortedElementData.push({ pos: currentPos, el: item.el })
      } else {
        for (const el of item.els) {
          const { minX: elMinX } = getElementRange(el)
          const offset = elMinX - item.min
          sortedElementData.push({ pos: currentPos + offset, el })
        }
      }
    }

    // 根据目标位置计算元素最终 left
    for (const element of newElementList) {
      if (!activeElementIdList.includes(element.id)) continue

      for (const sortedItem of sortedElementData) {
        if (sortedItem.el.id === element.id) {
          if ('rotate' in element && element.rotate) {
            const { offsetX } = getRectRotatedOffset({
              left: element.left,
              top: element.top,
              width: element.width,
              height: element.height,
              rotate: element.rotate,
            })
            element.left = sortedItem.pos - offsetX
          } else {
            element.left = sortedItem.pos
          }
        }
      }
    }

    updateSlide({ elements: newElementList })
    addHistorySnapshot()
  })

  /**
   * 垂直均匀排列
   * 对应 uniformVerticalDisplay（Vue）
   */
  const uniformVerticalDisplay = useMemoizedFn(() => {
    if (!currentSlide || !activeElementList || activeElementList.length < 2) {
      return
    }

    const { minY, maxY } = getElementListRange(activeElementList)

    // ✅ 深拷贝
    const copyOfActiveElementList: PPTElement[] = cloneDeep(activeElementList)
    const newElementList: PPTElement[] = cloneDeep(currentSlide.elements || [])

    const singleElementList: ElementItem[] = []
    let groupList: GroupItem[] = []

    for (const el of copyOfActiveElementList) {
      if (!el.groupId) {
        const { minY: elMinY, maxY: elMaxY } = getElementRange(el)
        singleElementList.push({ min: elMinY, max: elMaxY, el })
      } else {
        const groupEl = groupList.find((item) => item.groupId === el.groupId)
        if (!groupEl) {
          groupList.push({ groupId: el.groupId, els: [el] })
        } else {
          groupList = groupList.map((item) =>
            item.groupId === el.groupId
              ? { ...item, els: [...item.els, el] }
              : item,
          )
        }
      }
    }

    const formatedGroupList: GroupElementsItem[] = []
    for (const groupItem of groupList) {
      const { minY: gMinY, maxY: gMaxY } = getElementListRange(groupItem.els)
      formatedGroupList.push({
        min: gMinY,
        max: gMaxY,
        els: groupItem.els,
      })
    }

    const list: Item[] = [...singleElementList, ...formatedGroupList]
    list.sort((itemA, itemB) => itemA.min - itemB.min)

    let totalHeight = 0
    for (const item of list) {
      const height = item.max - item.min
      totalHeight += height
    }
    const span = ((maxY - minY) - totalHeight) / (list.length - 1)

    const sortedElementData: ElementWithPos[] = []

    const firstItem = list[0]
    let lastPos: LastPos = { min: firstItem.min, max: firstItem.max }

    if ('el' in firstItem) {
      sortedElementData.push({ pos: firstItem.min, el: firstItem.el })
    } else {
      for (const el of firstItem.els) {
        const { minY: pos } = getElementRange(el)
        sortedElementData.push({ pos, el })
      }
    }

    for (let i = 1; i < list.length; i++) {
      const item = list[i]
      const lastHeight = lastPos.max - lastPos.min
      const currentPos = lastPos.min + lastHeight + span
      const currentHeight = item.max - item.min
      lastPos = { min: currentPos, max: currentPos + currentHeight }

      if ('el' in item) {
        sortedElementData.push({ pos: currentPos, el: item.el })
      } else {
        for (const el of item.els) {
          const { minY: elMinY } = getElementRange(el)
          const offset = elMinY - item.min
          sortedElementData.push({ pos: currentPos + offset, el })
        }
      }
    }

    for (const element of newElementList) {
      if (!activeElementIdList.includes(element.id)) continue

      for (const sortedItem of sortedElementData) {
        if (sortedItem.el.id === element.id) {
          if ('rotate' in element && element.rotate) {
            const { offsetY } = getRectRotatedOffset({
              left: element.left,
              top: element.top,
              width: element.width,
              height: element.height,
              rotate: element.rotate,
            })
            element.top = sortedItem.pos - offsetY
          } else {
            element.top = sortedItem.pos
          }
        }
      }
    }

    updateSlide({ elements: newElementList })
    addHistorySnapshot()
  })

  return {
    displayItemCount,
    uniformHorizontalDisplay,
    uniformVerticalDisplay,
  }
}

export default useUniformDistributeElements
