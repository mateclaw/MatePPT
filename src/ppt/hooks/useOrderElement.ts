// useOrderElement.ts

import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useSlidesStore } from '../store/useSlidesStore'
import type { PPTElement } from '../core'
import { ElementOrderCommands } from '@/ppt/types/edit'
import useHistorySnapshot from '../hooks/useHistorySnapshot'

/**
 * 获取组合元素层级范围
 * @param elementList 本页所有元素列表
 * @param combineElementList 组合元素列表
 */
const getCombineElementLevelRange = (
  elementList: PPTElement[],
  combineElementList: PPTElement[],
) => {
  return {
    minLevel: elementList.findIndex(
      (_element) => _element.id === combineElementList[0].id,
    ),
    maxLevel: elementList.findIndex(
      (_element) =>
        _element.id === combineElementList[combineElementList.length - 1].id,
    ),
  }
}

/**
 * 上移一层
 */
const moveUpElement = (
  elementList: PPTElement[],
  element: PPTElement,
): PPTElement[] | undefined => {
  // ⚠️ 保留原实现的 JSON 深拷贝
  const copyOfElementList: PPTElement[] = JSON.parse(
    JSON.stringify(elementList),
  )

  // 如果被操作的元素是组合元素成员，需要将该组合全部成员一起进行移动
  if (element.groupId) {
    const combineElementList = copyOfElementList.filter(
      (_element) => _element.groupId === element.groupId,
    )
    const { minLevel, maxLevel } = getCombineElementLevelRange(
      elementList,
      combineElementList,
    )

    // 已经处在顶层，无法继续移动
    if (maxLevel === elementList.length - 1) return

    const nextElement = copyOfElementList[maxLevel + 1]
    const movedElementList = copyOfElementList.splice(
      minLevel,
      combineElementList.length,
    )

    if (nextElement.groupId) {
      const nextCombineElementList = copyOfElementList.filter(
        (_element) => _element.groupId === nextElement.groupId,
      )
      copyOfElementList.splice(
        minLevel + nextCombineElementList.length,
        0,
        ...movedElementList,
      )
    } else {
      copyOfElementList.splice(minLevel + 1, 0, ...movedElementList)
    }
  } else {
    // 非组合成员
    const level = elementList.findIndex((item) => item.id === element.id)
    if (level === elementList.length - 1) return

    const nextElement = copyOfElementList[level + 1]
    const movedElement = copyOfElementList.splice(level, 1)[0]

    if (nextElement.groupId) {
      const combineElementList = copyOfElementList.filter(
        (_element) => _element.groupId === nextElement.groupId,
      )
      copyOfElementList.splice(
        level + combineElementList.length,
        0,
        movedElement,
      )
    } else {
      copyOfElementList.splice(level + 1, 0, movedElement)
    }
  }

  return copyOfElementList
}

/**
 * 下移一层
 */
const moveDownElement = (
  elementList: PPTElement[],
  element: PPTElement,
): PPTElement[] | undefined => {
  const copyOfElementList: PPTElement[] = JSON.parse(
    JSON.stringify(elementList),
  )

  if (element.groupId) {
    const combineElementList = copyOfElementList.filter(
      (_element) => _element.groupId === element.groupId,
    )
    const { minLevel } = getCombineElementLevelRange(
      elementList,
      combineElementList,
    )
    if (minLevel === 0) return

    const prevElement = copyOfElementList[minLevel - 1]
    const movedElementList = copyOfElementList.splice(
      minLevel,
      combineElementList.length,
    )

    if (prevElement.groupId) {
      const prevCombineElementList = copyOfElementList.filter(
        (_element) => _element.groupId === prevElement.groupId,
      )
      copyOfElementList.splice(
        minLevel - prevCombineElementList.length,
        0,
        ...movedElementList,
      )
    } else {
      copyOfElementList.splice(minLevel - 1, 0, ...movedElementList)
    }
  } else {
    const level = elementList.findIndex((item) => item.id === element.id)
    if (level === 0) return

    const prevElement = copyOfElementList[level - 1]
    const movedElement = copyOfElementList.splice(level, 1)[0]

    if (prevElement.groupId) {
      const combineElementList = copyOfElementList.filter(
        (_element) => _element.groupId === prevElement.groupId,
      )
      copyOfElementList.splice(
        level - combineElementList.length,
        0,
        movedElement,
      )
    } else {
      copyOfElementList.splice(level - 1, 0, movedElement)
    }
  }

  return copyOfElementList
}

/**
 * 置顶层
 */
const moveTopElement = (
  elementList: PPTElement[],
  element: PPTElement,
): PPTElement[] | null => {
  const copyOfElementList: PPTElement[] = JSON.parse(
    JSON.stringify(elementList),
  )

  if (element.groupId) {
    const combineElementList = copyOfElementList.filter(
      (_element) => _element.groupId === element.groupId,
    )
    const { minLevel, maxLevel } = getCombineElementLevelRange(
      elementList,
      combineElementList,
    )

    if (maxLevel === elementList.length - 1) return null

    const movedElementList = copyOfElementList.splice(
      minLevel,
      combineElementList.length,
    )
    copyOfElementList.push(...movedElementList)
  } else {
    const level = elementList.findIndex((item) => item.id === element.id)
    if (level === elementList.length - 1) return null

    copyOfElementList.splice(level, 1)
    copyOfElementList.push(element)
  }

  return copyOfElementList
}

/**
 * 置底层
 */
const moveBottomElement = (
  elementList: PPTElement[],
  element: PPTElement,
): PPTElement[] | undefined => {
  const copyOfElementList: PPTElement[] = JSON.parse(
    JSON.stringify(elementList),
  )

  if (element.groupId) {
    const combineElementList = copyOfElementList.filter(
      (_element) => _element.groupId === element.groupId,
    )
    const { minLevel } = getCombineElementLevelRange(
      elementList,
      combineElementList,
    )
    if (minLevel === 0) return

    const movedElementList = copyOfElementList.splice(
      minLevel,
      combineElementList.length,
    )
    copyOfElementList.unshift(...movedElementList)
  } else {
    const level = elementList.findIndex((item) => item.id === element.id)
    if (level === 0) return

    copyOfElementList.splice(level, 1)
    copyOfElementList.unshift(element)
  }

  return copyOfElementList
}

export const useOrderElement = () => {
  const { currentSlide, updateSlide } = useSlidesStore(
    useShallow((state) => ({
      currentSlide: state.getCurrentSlide(),
      updateSlide: state.updateSlide,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * 调整元素层级
   * @param element 需要调整层级的元素
   * @param command 调整命令：上移、下移、置顶、置底
   */
  const orderElement = useMemoizedFn(
    (element: PPTElement, command: ElementOrderCommands) => {
      if (!currentSlide || !currentSlide.elements?.length) return

      const elementList = currentSlide.elements

      let newElementList: PPTElement[] | null | undefined

      if (command === ElementOrderCommands.UP) {
        newElementList = moveUpElement(elementList, element)
      } else if (command === ElementOrderCommands.DOWN) {
        newElementList = moveDownElement(elementList, element)
      } else if (command === ElementOrderCommands.TOP) {
        newElementList = moveTopElement(elementList, element)
      } else if (command === ElementOrderCommands.BOTTOM) {
        newElementList = moveBottomElement(elementList, element)
      }

      if (!newElementList) return

      updateSlide({ elements: newElementList })
      addHistorySnapshot()
    },
  )

  return {
    orderElement,
  }
}

export default useOrderElement
