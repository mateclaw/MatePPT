// useShapeFormatPainter.ts
import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMainStore } from '../store/useMainStore'
import type { ShapeElement } from '../core'
import { useActiveElementList } from './useActiveElementList'

/**
 * 形状格式刷相关 Hook
 * 对应原 Pinia 版本：
 *   - toggleShapeFormatPainter
 */
const useShapeFormatPainter = () => {
  const {
    shapeFormatPainter,
    // handleElement,
    setShapeFormatPainter,
  } = useMainStore(
    useShallow((state) => ({
      shapeFormatPainter: state.shapeFormatPainter,
      // handleElement: state.handleElement,
      setShapeFormatPainter: state.setShapeFormatPainter,
    })),
  )

  const { handleElement } = useActiveElementList()

  /**
   * 切换形状格式刷：
   *  - 如果当前已经有格式刷，则关闭（设为 null）
   *  - 否则，从当前 handleElement（假定为 PPTShapeElement）读取样式，开启格式刷
   */
  const toggleShapeFormatPainter = useCallback(
    (keep = false) => {
      const _handleElement = handleElement as ShapeElement | null | undefined
      if (!shapeFormatPainter && !_handleElement) {
        // 没有选中元素，且当前也没有格式刷，直接返回
        return
      }

      if (shapeFormatPainter) {
        // 关闭格式刷
        setShapeFormatPainter(null)
      } else if (_handleElement) {
        // 开启格式刷，从当前 shape 元素读取样式
        setShapeFormatPainter({
          keep,
          fill: _handleElement.fill,
          gradient: _handleElement.gradient,
          outline: _handleElement.outline,
          opacity: _handleElement.opacity,
          shadow: _handleElement.shadow,
        })
      }
    },
    [shapeFormatPainter, handleElement, setShapeFormatPainter],
  )

  return {
    toggleShapeFormatPainter,
  }
}

export default useShapeFormatPainter
