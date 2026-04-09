// src/hooks/useElementVisibility.ts

import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useSlidesStore } from '../store/useSlidesStore'
import { useMainStore } from '../store/useMainStore'

const useElementVisibility = () => {
  // 只取需要的字段，避免无关状态变化引起重渲染
  const { currentSlide } = useSlidesStore(
    useShallow((state) => ({
      currentSlide: state.getCurrentSlide(),
    })),
  )

  const {
    activeElementIdList,
    hiddenElementIdList,
    setHiddenElementIdList,
    setActiveElementIdList,
  } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
      hiddenElementIdList: state.hiddenElementIdList,
      setHiddenElementIdList: state.setHiddenElementIdList,
      setActiveElementIdList: state.setActiveElementIdList,
    })),
  )

  /**
   * 切换单个元素显隐
   * - 如果原来是 hidden → 从 hidden 列表移除
   * - 如果原来是显示 → 加入 hidden 列表
   * - 同时如果该元素是选中状态，需要清空选中
   */
  const toggleHideElement = useMemoizedFn((id: string) => {
    if (!currentSlide) return

    if (hiddenElementIdList.includes(id)) {
      // 取消隐藏
      setHiddenElementIdList(
        hiddenElementIdList.filter((item) => item !== id),
      )
    } else {
      // 新增隐藏
      setHiddenElementIdList([...hiddenElementIdList, id])
    }

    if (activeElementIdList.includes(id)) {
      setActiveElementIdList([])
    }
  })

  /**
   * 只显示当前页面所有元素（其他页面隐藏的元素不动）
   * - 原逻辑：保留 hidden 列表里「不在当前页的元素」的 id
   */
  const showAllElements = useMemoizedFn(() => {
    if (!currentSlide) return
    const currentSlideElIdList = currentSlide.elements.map((item) => item.id)
    const needHiddenElementIdList = hiddenElementIdList.filter(
      (item) => !currentSlideElIdList.includes(item),
    )
    setHiddenElementIdList(needHiddenElementIdList)
  })

  /**
   * 隐藏当前页面所有元素
   * - 原逻辑：hidden 列表 + 当前页所有元素 id（不去重）
   * - 如果有选中元素，需要清空选中
   */
  const hideAllElements = useMemoizedFn(() => {
    if (!currentSlide) return
    const currentSlideElIdList = currentSlide.elements.map((item) => item.id)
    setHiddenElementIdList([...hiddenElementIdList, ...currentSlideElIdList])

    if (activeElementIdList.length) {
      setActiveElementIdList([])
    }
  })

  return {
    toggleHideElement,
    showAllElements,
    hideAllElements,
  }
}

export default useElementVisibility
