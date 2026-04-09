// useMoveElement.ts

import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'
import type { PPTElement } from '../core'
import { KEYS } from '../configs/hotkey'
import useHistorySnapshot from '../hooks/useHistorySnapshot'

export const useMoveElement = () => {
  const { activeElementIdList, activeGroupElementId } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
      activeGroupElementId: state.activeGroupElementId,
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
   * 将元素向指定方向移动指定的距离
   * 组合元素成员中，存在被选中可独立操作的元素时，优先移动该元素。
   * 否则默认移动所有被选中的元素
   * @param command 移动方向（KEYS.LEFT / RIGHT / UP / DOWN）
   * @param step 移动距离
   */
  const moveElement = useMemoizedFn((command: string, step = 1) => {
    if (!currentSlide || !currentSlide.elements?.length) return

    const move = (el: PPTElement): PPTElement => {
      let deltaLeft = 0
      let deltaTop = 0

      switch (command) {
        case KEYS.LEFT:
          deltaLeft = -step
          break
        case KEYS.RIGHT:
          deltaLeft = step
          break
        case KEYS.UP:
          deltaTop = -step
          break
        case KEYS.DOWN:
          deltaTop = step
          break
        default:
          break
      }

      // 更新元素位置
      el = { ...el, left: el.left + deltaLeft, top: el.top + deltaTop }
      return el
    }

    let newElementList: PPTElement[]

    if (activeGroupElementId) {
      // 有 activeGroupElementId 时，优先只移动这个“组成员”
      newElementList = currentSlide.elements.map((el) =>
        el.id === activeGroupElementId ? move(el) : el,
      )
    } else {
      // 否则移动所有选中的元素
      newElementList = currentSlide.elements.map((el) =>
        activeElementIdList.includes(el.id) ? move(el) : el,
      )
    }

    updateSlide({ elements: newElementList })
    addHistorySnapshot()
  })

  return {
    moveElement,
  }
}

export default useMoveElement
