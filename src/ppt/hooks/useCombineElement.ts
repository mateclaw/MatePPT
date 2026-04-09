/**
 * 元素组合 / 取消组合 Hook (React + Zustand + ahooks)
 */

import { useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'
import type { PPTElement } from '@/ppt/core/types/element'
import useHistorySnapshot from '../hooks/useHistorySnapshot'
import { ElementAlignCommands } from '@/ppt/types/edit' // 虽然没用到，但可以去掉这行
import { useActiveElementList } from './useActiveElementList'

const useElementCombine = () => {
  const {
    activeElementIdList,

    handleElementId,
    setActiveElementIdList,
  } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,

      handleElementId: state.handleElementId,
      setActiveElementIdList: state.setActiveElementIdList,
    })),
  )

  const { currentSlide, updateSlide } = useSlidesStore(
    useShallow((state) => ({
      currentSlide: state.getCurrentSlide(),
      updateSlide: state.updateSlide,
    })),
  )


  const { activeElementList } = useActiveElementList();

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * 判断当前选中的元素是否可以组合
   * - 至少 2 个元素
   * - 如果都在同一个 groupId 内，则不能再组合
   */
  const canCombine = useMemo(() => {
    if (!activeElementList || activeElementList.length < 2) return false

    const firstGroupId = activeElementList[0].groupId
    if (!firstGroupId) return true

    const inSameGroup = activeElementList.every(
      (el) => el.groupId && el.groupId === firstGroupId,
    )
    return !inSameGroup
  }, [activeElementList])

  /**
   * 组合当前选中的元素：给当前选中的元素赋予一个相同的分组ID
   */
  const combineElements = useMemoizedFn(() => {
    if (!currentSlide) return
    if (!activeElementList || activeElementList.length === 0) return

    // ⭐ 深拷贝（保持与原 Vue 版本一致）
    let newElementList: PPTElement[] = JSON.parse(
      JSON.stringify(currentSlide.elements),
    )

    // 生成分组ID
    const groupId = nanoid(10)

    // 收集需要组合的元素列表，并赋上唯一分组ID
    const combineElementList: PPTElement[] = []
    for (const element of newElementList) {
      if (activeElementIdList.includes(element.id)) {
        element.groupId = groupId
        combineElementList.push(element)
      }
    }

    if (!combineElementList.length) return

    // 确保该组合内所有元素成员的层级是连续的：
    // 1. 找到该组合内最上层（索引最大）的元素索引
    const combineElementMaxLevel = newElementList.findIndex(
      (_element) =>
        _element.id === combineElementList[combineElementList.length - 1].id,
    )

    const combineElementIdList = combineElementList.map(
      (_element) => _element.id,
    )

    // 2. 先从新元素列表中移除这些要组合的元素
    newElementList = newElementList.filter(
      (_element) => !combineElementIdList.includes(_element.id),
    )

    // 3. 按照最上层元素的层级，将收集好的组合元素列表插入回去
    const insertLevel = combineElementMaxLevel - combineElementList.length + 1
    newElementList.splice(insertLevel, 0, ...combineElementList)

    updateSlide({ elements: newElementList })
    addHistorySnapshot()
  })

  /**
   * 取消组合元素：移除选中元素的分组ID
   */
  const uncombineElements = useMemoizedFn(() => {
    if (!currentSlide) return
    if (!activeElementList || activeElementList.length === 0) return

    const hasElementInGroup = activeElementList.some((item) => item.groupId)
    if (!hasElementInGroup) return

    // ⭐ 深拷贝（保持与原 Vue 版本一致）
    const newElementList: PPTElement[] = JSON.parse(
      JSON.stringify(currentSlide.elements),
    )

    for (const element of newElementList) {
      if (activeElementIdList.includes(element.id) && element.groupId) {
        delete element.groupId
      }
    }

    updateSlide({ elements: newElementList })

    // 取消组合后，需要重置激活元素状态
    // 默认重置为当前正在操作的元素,如果不存在则重置为空
    const handleElementIdList = handleElementId ? [handleElementId] : []
    setActiveElementIdList(handleElementIdList)

    addHistorySnapshot()
  })

  return {
    canCombine,
    combineElements,
    uncombineElements,
  }
}

export default useElementCombine
