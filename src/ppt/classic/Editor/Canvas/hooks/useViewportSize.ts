import {  useEffect, useMemo, useRef, useState } from 'react'
import { useMemoizedFn, usePrevious } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore, useSlidesStore } from '@/ppt/store'
import { EditorMode } from '@/ppt/core'

type ViewportStyle = {
  width: number
  height: number
  left: number
  top: number
}

export default function useViewport(canvasRef: React.RefObject<HTMLElement | null>) {
  const [viewportLeft, setViewportLeft] = useState(0)
  const [viewportTop, setViewportTop] = useState(0)

  // refs：拖拽/缩放时用来读写最新值，避免闭包过期
  const leftRef = useRef(0)
  const topRef = useRef(0)
  leftRef.current = viewportLeft
  topRef.current = viewportTop

  const { canvasPercentage, canvasScale, canvasDragged, setCanvasScale, setCanvasDragged, mode } = useMainStore(
    useShallow((s) => ({
      canvasPercentage: s.canvasPercentage,
      canvasScale: s.canvasScale,
      canvasDragged: s.canvasDragged,
      setCanvasScale: s.setCanvasScale,
      setCanvasDragged: s.setCanvasDragged,
      mode: s.mode,
    })),
  )

  const { viewportRatio, viewportSize } = useSlidesStore(
    useShallow((s) => ({
      viewportRatio: s.viewportRatio,
      viewportSize: s.viewportSize,
    })),
  )

  const prevCanvasPercentage = usePrevious(canvasPercentage)
  const canvasScaleRef = useRef(canvasScale)
  canvasScaleRef.current = canvasScale
  const timeoutRef = useRef<number | null>(null)

  const scheduleUpdate = useMemoizedFn((fn: () => void) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null
      fn()
    }, 0)
  })

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // 初始化画布可视区域的位置
  const initViewportPosition = useMemoizedFn(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return


    const canvasWidth = canvasEl.clientWidth
    const canvasHeight = canvasEl.clientHeight

    if (canvasHeight / canvasWidth > viewportRatio) {
      const viewportActualWidth = canvasWidth * (canvasPercentage / 100)
      const nextScale = viewportActualWidth / viewportSize
      const nextLeft = (canvasWidth - viewportActualWidth) / 2
      const nextTop = (canvasHeight - viewportActualWidth * viewportRatio) / 2

      scheduleUpdate(() => {
        if (canvasScaleRef.current !== nextScale) {
          setCanvasScale(nextScale)
        }
        leftRef.current = nextLeft
        topRef.current = nextTop
        setViewportLeft(nextLeft)
        setViewportTop(nextTop)
      })
    } else {
      const viewportActualHeight = canvasHeight * (canvasPercentage / 100)
      const nextScale = viewportActualHeight / (viewportSize * viewportRatio)
      const nextLeft = (canvasWidth - viewportActualHeight / viewportRatio) / 2
      const nextTop = (canvasHeight - viewportActualHeight) / 2

      scheduleUpdate(() => {
        if (canvasScaleRef.current !== nextScale) {
          setCanvasScale(nextScale)
        }
        leftRef.current = nextLeft
        topRef.current = nextTop
        setViewportLeft(nextLeft)
        setViewportTop(nextTop)
      })
    }
  })

  // 更新画布可视区域的位置（canvasPercentage 变化时）
  const setViewportPosition = useMemoizedFn((newValue: number, oldValue: number) => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    // if (mode === EditorMode.ANNOTATE) return

    const canvasWidth = canvasEl.clientWidth
    const canvasHeight = canvasEl.clientHeight

    if (canvasHeight / canvasWidth > viewportRatio) {
      const newViewportActualWidth = canvasWidth * (newValue / 100)
      const oldViewportActualWidth = canvasWidth * (oldValue / 100)
      const newViewportActualHeight = newViewportActualWidth * viewportRatio
      const oldViewportActualHeight = oldViewportActualWidth * viewportRatio

      const nextScale = newViewportActualWidth / viewportSize
      const nextLeft = leftRef.current - (newViewportActualWidth - oldViewportActualWidth) / 2
      const nextTop = topRef.current - (newViewportActualHeight - oldViewportActualHeight) / 2

      scheduleUpdate(() => {
        if (canvasScaleRef.current !== nextScale) {
          setCanvasScale(nextScale)
        }
        leftRef.current = nextLeft
        topRef.current = nextTop
        setViewportLeft(nextLeft)
        setViewportTop(nextTop)
      })
    } else {
      const newViewportActualHeight = canvasHeight * (newValue / 100)
      const oldViewportActualHeight = canvasHeight * (oldValue / 100)
      const newViewportActualWidth = newViewportActualHeight / viewportRatio
      const oldViewportActualWidth = oldViewportActualHeight / viewportRatio

      const nextScale = newViewportActualHeight / (viewportSize * viewportRatio)
      const nextLeft = leftRef.current - (newViewportActualWidth - oldViewportActualWidth) / 2
      const nextTop = topRef.current - (newViewportActualHeight - oldViewportActualHeight) / 2

      scheduleUpdate(() => {
        if (canvasScaleRef.current !== nextScale) {
          setCanvasScale(nextScale)
        }
        leftRef.current = nextLeft
        topRef.current = nextTop
        setViewportLeft(nextLeft)
        setViewportTop(nextTop)
      })
    }
  })

  // ====== watch(canvasPercentage, setViewportPosition) ======
  useEffect(() => {
    // 第一次没有 oldValue，直接 init
    if (typeof prevCanvasPercentage !== 'number') {
      initViewportPosition()
      return
    }
    if (prevCanvasPercentage !== canvasPercentage) {
      setViewportPosition(canvasPercentage, prevCanvasPercentage)
    }
  }, [canvasPercentage, prevCanvasPercentage, setViewportPosition, initViewportPosition])

  // ====== watch(viewportRatio / viewportSize, initViewportPosition) ======
  useEffect(() => {
    initViewportPosition()
  }, [viewportRatio, viewportSize, initViewportPosition])

  // ====== watch(mode, initViewportPosition) ======
  useEffect(() => {
    initViewportPosition()
  }, [mode, initViewportPosition])

  // ====== watch(canvasDragged, ...) ======
  useEffect(() => {
    if (!canvasDragged) initViewportPosition()
  }, [canvasDragged, initViewportPosition])

  // ResizeObserver：画布尺寸变化重置视口
  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const ro = new ResizeObserver(() => initViewportPosition())
    ro.observe(canvasEl)

    return () => ro.disconnect()
  }, [canvasRef, initViewportPosition])

  // 视口样式（给渲染用）
  const viewportStyles: ViewportStyle = useMemo(
    () => ({
      width: viewportSize,
      height: viewportSize * viewportRatio,
      left: viewportLeft,
      top: viewportTop,
    }),
    [viewportSize, viewportRatio, viewportLeft, viewportTop],
  )

  // 拖拽画布视口（mousemove/up 用 addEventListener）
  const dragViewport = useMemoizedFn((e: MouseEvent) => {
    let isMouseDown = true

    const startPageX = e.pageX
    const startPageY = e.pageY

    const originLeft = leftRef.current
    const originTop = topRef.current

    const onMove = (ev: MouseEvent) => {
      if (!isMouseDown) return
      const nextLeft = originLeft + (ev.pageX - startPageX)
      const nextTop = originTop + (ev.pageY - startPageY)

      leftRef.current = nextLeft
      topRef.current = nextTop
      setViewportLeft(nextLeft)
      setViewportTop(nextTop)
    }

    const onUp = () => {
      isMouseDown = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)

      setCanvasDragged(true)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  })

  return {
    viewportStyles,
    dragViewport,
  }
}
