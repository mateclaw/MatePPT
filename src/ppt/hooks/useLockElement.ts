// useLockElement.ts

import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'
import type { PPTElement } from '../core'
import useHistorySnapshot from '../hooks/useHistorySnapshot'

export const useLockElement = () => {
  const { activeElementIdList, setActiveElementIdList } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
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

  /**
   * 锁定选中的元素,并清空选中元素状态
   */
  const lockElement = useMemoizedFn(() => {
    if (!currentSlide || !currentSlide.elements?.length) return
    if (!activeElementIdList.length) return

    // ⚠️ 保留原实现的深拷贝方式
    const newElementList: PPTElement[] = JSON.parse(
      JSON.stringify(currentSlide.elements),
    )

    for (const element of newElementList) {
      if (activeElementIdList.includes(element.id)) {
        element.lock = true
      }
    }

    updateSlide({ elements: newElementList })
    setActiveElementIdList([])
    addHistorySnapshot()
  })

  /**
   * 解除元素的锁定状态,并将其设置为当前选择元素
   * @param handleElement 需要解锁的元素
   */
  const unlockElement = useMemoizedFn((handleElement: PPTElement) => {
    if (!currentSlide || !currentSlide.elements?.length) return

    // ⚠️ 同样保持深拷贝
    const newElementList: PPTElement[] = JSON.parse(
      JSON.stringify(currentSlide.elements),
    )

    if (handleElement.groupId) {
      const groupElementIdList: string[] = []

      for (const element of newElementList) {
        if (element.groupId === handleElement.groupId) {
          element.lock = false
          groupElementIdList.push(element.id)
        }
      }

      updateSlide({ elements: newElementList })
      // 设置当前选择元素，而不是选中整组元素
      setActiveElementIdList([handleElement.id])
    } else {
      for (const element of newElementList) {
        if (element.id === handleElement.id) {
          element.lock = false
          break
        }
      }

      updateSlide({ elements: newElementList })
      setActiveElementIdList([handleElement.id])
    }

    addHistorySnapshot()
  })

  return {
    lockElement,
    unlockElement,
  }
}

export default useLockElement
