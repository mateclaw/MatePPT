import { useCallback ,useImperativeHandle} from 'react'
import type { PPTSlide } from '@/ppt/core'
import { useMainStore, useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import PptSlidePreview from '@/ppt/classic/components/PptSlidePreview'
import styles from './SpeechPptFrame.module.scss'

export type SpeechPptFrameState = {
  left: number
  top: number
  width: number
  height: number
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

interface SpeechPptFrameProps {
  slide: PPTSlide | null
  pptViewportSize: number
  pptViewportRatio: number
  frame: SpeechPptFrameState
  onChange: (next: SpeechPptFrameState) => void
  showHandles?: boolean
 
}

export default function SpeechPptFrame({
  slide,
  pptViewportSize,
  pptViewportRatio,
  frame,
  onChange,
  showHandles = true,

  
}: SpeechPptFrameProps) {

  const canvasScale = useMainStore((state) => state.canvasScale)
  const { viewportSize } = useSlidesStore(
    useShallow((state) => ({
      viewportSize: state.viewportSize,
    })),
  )

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startY = e.clientY
      const origin = frame

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / canvasScale
        const dy = (ev.clientY - startY) / canvasScale
        onChange({
          ...origin,
          left: origin.left + dx,
          top: origin.top + dy,
        })
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [canvasScale, frame, onChange],
  )

  const startResize = useCallback(
    (handle: ResizeHandle) => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startY = e.clientY
      const origin = frame
      const ratio = frame.height / frame.width

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / canvasScale
        const dy = (ev.clientY - startY) / canvasScale

        const widthFromX = handle.includes('e')
          ? origin.width + dx
          : origin.width - dx
        const widthFromY = handle.includes('n')
          ? origin.width - dy / ratio
          : origin.width + dy / ratio
        let width =
          Math.abs(widthFromX - origin.width) >= Math.abs(widthFromY - origin.width)
            ? widthFromX
            : widthFromY

        const minWidth = Math.min(160, viewportSize)
        const maxWidth = viewportSize * 4
        width = clamp(width, minWidth, maxWidth)

        const height = width * ratio

        const left = handle.includes('w') ? origin.left + (origin.width - width) : origin.left
        const top = handle.includes('n') ? origin.top + (origin.height - height) : origin.top

        onChange({
          left,
          top,
          width,
          height,
        })
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [canvasScale, frame, onChange, viewportSize],
  )

  if (!slide) return null

  return (
    <div
      className={styles.frame}
      style={{
        left: `${frame.left}px`,
        top: `${frame.top}px`,
        width: `${frame.width}px`,
        height: `${frame.height}px`,
      }}
      onPointerDown={showHandles ? startDrag : undefined}
    >
      <div className={styles.content}>
        <PptSlidePreview
          slide={slide}
          viewportSize={pptViewportSize}
          viewportRatio={pptViewportRatio}
          width={frame.width}
          height={frame.height}
        />
      </div>

      {showHandles && (
        <>
          <div className={`${styles.resizeHandle} ${styles.nw}`} onPointerDown={startResize('nw')} />
          <div className={`${styles.resizeHandle} ${styles.ne}`} onPointerDown={startResize('ne')} />
          <div className={`${styles.resizeHandle} ${styles.sw}`} onPointerDown={startResize('sw')} />
          <div className={`${styles.resizeHandle} ${styles.se}`} onPointerDown={startResize('se')} />
        </>
      )}
    </div>
  )
}
