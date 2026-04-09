import { useMemo } from 'react'
import { useMainStore, useSlidesStore } from '@/ppt/store'
import type { Background } from '@/ppt/core'
import useSlideBackgroundStyle from '@/ppt/hooks/useSlideBackgroundStyle'
import GridLines from './GridLines'
import { useShallow } from "zustand/react/shallow";
import styles from './ViewportBackground.module.scss'

export default function ViewportBackground() {
  const gridLineSize = useMainStore(useShallow((state) => state.gridLineSize))
  const { slides, slideIndex } = useSlidesStore(useShallow((state) => ({
    slides: state.slides,
    slideIndex: state.slideIndex,
  })))
  const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])

  const background = useMemo<Background | undefined>(
    () => currentSlide?.background,
    [currentSlide],
  )

  const { backgroundStyle } = useSlideBackgroundStyle(background)

  return (
    <div className={styles['viewport-background']} style={backgroundStyle}>
      {!!gridLineSize && <GridLines />}
    </div>
  )
}
