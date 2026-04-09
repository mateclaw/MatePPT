import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import tinycolor from 'tinycolor2'
import { useMainStore, useSlidesStore } from '@/ppt/store'
import type { Background } from '@/ppt/core'
import styles from './GridLines.module.scss'

export default function GridLines() {
  const { canvasScale, gridLineSize } = useMainStore(
    useShallow((state) => ({
      canvasScale: state.canvasScale,
      gridLineSize: state.gridLineSize,
    })),
  )
  const { slides, slideIndex, viewportRatio, viewportSize } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
      viewportRatio: state.viewportRatio,
      viewportSize: state.viewportSize,
    })),
  )
  const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])

  const background = useMemo<Background | undefined>(
    () => currentSlide?.background,
    [currentSlide],
  )

  const gridColor = useMemo(() => {
    const bgColor = background?.color 
    const colorList = ['#000', '#fff']
    return tinycolor
      .mostReadable(bgColor.value || '#fff', colorList, { includeFallbackColors: true })
      .setAlpha(0.5)
      .toRgbString()
  }, [background])

  const path = useMemo(() => {
    if (!gridLineSize) return ''
    const maxX = viewportSize
    const maxY = viewportSize * viewportRatio

    let p = ''
    for (let i = 0; i <= Math.floor(maxY / gridLineSize); i += 1) {
      p += `M0 ${i * gridLineSize} L${maxX} ${i * gridLineSize} `
    }
    for (let i = 0; i <= Math.floor(maxX / gridLineSize); i += 1) {
      p += `M${i * gridLineSize} 0 L${i * gridLineSize} ${maxY} `
    }
    return p
  }, [gridLineSize, viewportSize, viewportRatio])

  if (!gridLineSize) return null

  return (
    <svg className={styles['grid-lines']}>
      <path
        style={{ transform: `scale(${canvasScale})` }}
        d={path}
        fill="none"
        stroke={gridColor}
        strokeWidth="0.3"
        strokeDasharray="5"
      />
    </svg>
  )
}
