// useCommonOperate.ts (React)
// 等价于 Vue 版本：根据 width/height 计算缩放点和边框线

import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { OperateResizeHandlers, OperateBorderLines } from '@/ppt/types/edit'

type SizeLike = number | { current: number }

const readSize = (v: SizeLike) => (typeof v === 'number' ? v : v.current)

export interface OperatePoint {
  direction: OperateResizeHandlers
  style: CSSProperties
}

export interface OperateBorderLine {
  type: OperateBorderLines
  style: CSSProperties
}

export default function useCommonOperate(width: SizeLike, height: SizeLike) {
  const w = readSize(width)
  const h = readSize(height)

  // 元素缩放点
  const resizeHandlers: OperatePoint[] = useMemo(() => {
    return [
      { direction: OperateResizeHandlers.LEFT_TOP, style: {} },
      { direction: OperateResizeHandlers.TOP, style: { left: `${w / 2}px` } },
      { direction: OperateResizeHandlers.RIGHT_TOP, style: { left: `${w}px` } },
      { direction: OperateResizeHandlers.LEFT, style: { top: `${h / 2}px` } },
      { direction: OperateResizeHandlers.RIGHT, style: { left: `${w}px`, top: `${h / 2}px` } },
      { direction: OperateResizeHandlers.LEFT_BOTTOM, style: { top: `${h}px` } },
      { direction: OperateResizeHandlers.BOTTOM, style: { left: `${w / 2}px`, top: `${h}px` } },
      { direction: OperateResizeHandlers.RIGHT_BOTTOM, style: { left: `${w}px`, top: `${h}px` } },
    ]
  }, [w, h])

  // 文本元素缩放点（左右）
  const textElementResizeHandlers: OperatePoint[] = useMemo(() => {
    return [
      { direction: OperateResizeHandlers.TOP, style: { left: `${w / 2}px` } },
      { direction: OperateResizeHandlers.LEFT, style: { top: `${h / 2}px` } },
      { direction: OperateResizeHandlers.RIGHT, style: { left: `${w}px`, top: `${h / 2}px` } },
      { direction: OperateResizeHandlers.BOTTOM, style: { left: `${w / 2}px`, top: `${h}px` } },
    ]
  }, [w, h])

  // 竖排文本缩放点（上下）
  const verticalTextElementResizeHandlers: OperatePoint[] = useMemo(() => {
    return [
      { direction: OperateResizeHandlers.TOP, style: { left: `${w / 2}px` } },
      { direction: OperateResizeHandlers.BOTTOM, style: { left: `${w / 2}px`, top: `${h}px` } },
    ]
  }, [w, h])

  // 元素选中边框线
  const borderLines: OperateBorderLine[] = useMemo(() => {
    return [
      { type: OperateBorderLines.T, style: { width: `${w}px` } },
      { type: OperateBorderLines.B, style: { top: `${h}px`, width: `${w}px` } },
      { type: OperateBorderLines.L, style: { height: `${h}px` } },
      { type: OperateBorderLines.R, style: { left: `${w}px`, height: `${h}px` } },
    ]
  }, [w, h])

  return {
    resizeHandlers,
    textElementResizeHandlers,
    verticalTextElementResizeHandlers,
    borderLines,
  }
}
