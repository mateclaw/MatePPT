// useScaleCanvas.ts
import { useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '@/ppt/store/useMainStore'

/**
 * 画布缩放 & 重置 Hook（React + Zustand）
 */
export const useScaleCanvas = () => {
  const {
    canvasPercentage,
    canvasScale,
    canvasDragged,
    setCanvasPercentage,
    setCanvasDragged,
  } = useMainStore(
    useShallow((state) => ({
      canvasPercentage: state.canvasPercentage,
      canvasScale: state.canvasScale,
      canvasDragged: state.canvasDragged,
      setCanvasPercentage: state.setCanvasPercentage,
      setCanvasDragged: state.setCanvasDragged,
    })),
  )

  // 对应 Vue 的 computed: canvasScalePercentage
  const canvasScalePercentage = useMemo(
    () => `${Math.round(canvasScale * 100)}%`,
    [canvasScale],
  )

  /**
   * 缩放画布百分比
   * @param command 缩放命令：放大、缩小
   */
  const scaleCanvas = useMemoizedFn((command: '+' | '-') => {
    let percentage = canvasPercentage
    const step = 5
    const max = 200
    const min = 30

    if (command === '+' && percentage <= max) percentage += step
    if (command === '-' && percentage >= min) percentage -= step

    setCanvasPercentage(percentage)
  })

  const clampPercentage = useMemoizedFn((value: number) => {
    const max = 200
    const min = 30
    return Math.max(min, Math.min(max, value))
  })

  /**
   * 设置画布缩放比例
   * 但不是直接设置该值，而是通过设置画布可视区域百分比来动态计算
   * @param value 目标画布缩放比例
   */
  const setCanvasScalePercentage = useMemoizedFn((value: number) => {
    const percentage =
      Math.round((value / canvasScale) * canvasPercentage) / 100
    setCanvasPercentage(clampPercentage(percentage))
  })

  /**
   * 按目标缩放比设置画布比例（避免传入百分比）
   * @param targetScale 目标缩放倍数（例如 1.25）
   */
  const setCanvasScaleByRatio = useMemoizedFn((targetScale: number) => {
    if (!Number.isFinite(targetScale) || targetScale <= 0) return
    const percentage = (targetScale / canvasScale) * canvasPercentage
    setCanvasPercentage(clampPercentage(Math.round(percentage)))
  })

  /**
   * 重置画布尺寸和位置
   */
  const resetCanvas = useMemoizedFn(() => {
    setCanvasPercentage(90)
    if (canvasDragged) {
      setCanvasDragged(false)
    }
  })

  return {
    canvasScalePercentage,
    scaleCanvas,
    setCanvasScalePercentage,
    setCanvasScaleByRatio,
    resetCanvas,
  }
}

export default useScaleCanvas
