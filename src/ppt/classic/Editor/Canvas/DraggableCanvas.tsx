import { useCallback, useEffect, useRef, useState } from 'react'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import Canvas from './index'
import styles from './DraggableCanvas.module.scss'

type Frame = {
  width: number
  height: number
  left: number
  top: number
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se'

const DEFAULT_MIN_WIDTH = 320
const DEFAULT_MARGIN = 16

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export interface DraggableCanvasProps {
  containerRef?: React.RefObject<HTMLElement | null>
  minWidth?: number
  margin?: number
}

export default function DraggableCanvas({
  containerRef,
  minWidth = DEFAULT_MIN_WIDTH,
  margin = DEFAULT_MARGIN,
}: DraggableCanvasProps) {
  const viewportRatio = useSlidesStore((state) => state.viewportRatio)
  const frameRef = useRef<Frame | null>(null)
  const containerElRef = useRef<HTMLElement | null>(null)
  const initRef = useRef(false)
  const prevRatioRef = useRef<number | null>(null)

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [frame, setFrame] = useState<Frame>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  })

  frameRef.current = frame

  const getSafeMinWidth = useCallback(
    (width: number) => Math.min(minWidth, width),
    [minWidth],
  )

  const getSafeMinHeight = useCallback(
    (height: number) => Math.min(minWidth * viewportRatio, height),
    [minWidth, viewportRatio],
  )

  const clampFrame = useCallback(
    (next: Frame) => {
      const safeMinWidth = getSafeMinWidth(containerSize.width)
      const maxWidthByHeight = containerSize.height / viewportRatio
      const maxWidth = Math.min(containerSize.width, maxWidthByHeight)
      const width = clamp(next.width, safeMinWidth, maxWidth)
      const height = width * viewportRatio
      const left = clamp(next.left, 0, containerSize.width - width)
      const top = clamp(next.top, 0, containerSize.height - height)

      return { width, height, left, top }
    },
    [containerSize.height, containerSize.width, getSafeMinWidth, viewportRatio],
  )

  const getDefaultFrame = useCallback(
    (size: { width: number; height: number }) => {
      const safeMinWidth = getSafeMinWidth(size.width)
      const safeMinHeight = getSafeMinHeight(size.height)
      const maxWidth = Math.max(size.width - margin * 2, safeMinWidth)
      const maxHeight = Math.max(size.height - margin * 2, safeMinHeight)
      const width = Math.max(safeMinWidth, Math.min(maxWidth, maxHeight / viewportRatio))
      const height = width * viewportRatio
      const left = clamp((size.width - width) / 2, 0, size.width - width)
      const top = clamp((size.height - height) / 2, 0, size.height - height)

      return { width, height, left, top }
    },
    [getSafeMinHeight, getSafeMinWidth, margin, viewportRatio],
  )

  useEffect(() => {
    const el = containerRef?.current || containerElRef.current
    if (!el) return
    containerElRef.current = el

    const update = () => {
      const width = el.clientWidth
      const height = el.clientHeight
      setContainerSize({ width, height })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => ro.disconnect()
  }, [containerRef])

  useEffect(() => {
    if (!containerSize.width || !containerSize.height) return

    const ratioChanged = prevRatioRef.current !== null && prevRatioRef.current !== viewportRatio
    prevRatioRef.current = viewportRatio

    if (!initRef.current || ratioChanged) {
      const next = getDefaultFrame(containerSize)
      initRef.current = true
      setFrame(next)
      return
    }

    setFrame((prev) => clampFrame(prev))
  }, [containerSize, clampFrame, getDefaultFrame, viewportRatio])

  const startDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const origin = frameRef.current
    const container = containerElRef.current
    if (!origin || !container) return

    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY

    const onMove = (ev: PointerEvent) => {
      const nextLeft = origin.left + (ev.clientX - startX)
      const nextTop = origin.top + (ev.clientY - startY)
      const width = origin.width
      const height = origin.height

      setFrame({
        width,
        height,
        left: clamp(nextLeft, 0, container.clientWidth - width),
        top: clamp(nextTop, 0, container.clientHeight - height),
      })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  const getMaxWidthForHandle = useCallback(
    (origin: Frame, handle: ResizeHandle) => {
      const container = containerElRef.current
      if (!container) return origin.width
      const rightLimit = handle.includes('w')
        ? origin.left + origin.width
        : container.clientWidth - origin.left
      const bottomLimit = handle.includes('n')
        ? origin.top + origin.height
        : container.clientHeight - origin.top

      return Math.min(rightLimit, bottomLimit / viewportRatio)
    },
    [viewportRatio],
  )

  const startResize = useCallback(
    (handle: ResizeHandle) => (e: React.PointerEvent<HTMLDivElement>) => {
      const origin = frameRef.current
      const container = containerElRef.current
      if (!origin || !container) return

      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startY = e.clientY
      const safeMinWidth = getSafeMinWidth(container.clientWidth)
      const maxWidth = getMaxWidthForHandle(origin, handle)

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        const widthFromX = handle.includes('e')
          ? origin.width + dx
          : origin.width - dx
        const widthFromY = handle.includes('n')
          ? origin.width - dy / viewportRatio
          : origin.width + dy / viewportRatio
        let width = Math.abs(widthFromX - origin.width) >= Math.abs(widthFromY - origin.width)
          ? widthFromX
          : widthFromY

        width = clamp(width, safeMinWidth, maxWidth)
        const height = width * viewportRatio

        const left = handle.includes('w')
          ? origin.left + (origin.width - width)
          : origin.left
        const top = handle.includes('n')
          ? origin.top + (origin.height - height)
          : origin.top

        setFrame({
          width,
          height,
          left: clamp(left, 0, container.clientWidth - width),
          top: clamp(top, 0, container.clientHeight - height),
        })
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [getMaxWidthForHandle, getSafeMinWidth, viewportRatio],
  )

  return (
    <div
      className={styles.frame}
      style={{
        width: `${frame.width}px`,
        height: `${frame.height}px`,
        left: `${frame.left}px`,
        top: `${frame.top}px`,
      }}
    >
      <div className={styles.canvasSurface}>
        <Canvas />
      </div>

      <div className={styles.dragHandle} onPointerDown={startDrag}>
        拖拽画布
      </div>

      <div
        className={`${styles.resizeHandle} ${styles.nw}`}
        onPointerDown={startResize('nw')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.ne}`}
        onPointerDown={startResize('ne')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.sw}`}
        onPointerDown={startResize('sw')}
      />
      <div
        className={`${styles.resizeHandle} ${styles.se}`}
        onPointerDown={startResize('se')}
      />
    </div>
  )
}
