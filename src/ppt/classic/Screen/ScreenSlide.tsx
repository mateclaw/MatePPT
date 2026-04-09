import { useMemo } from 'react'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import type { PPTSlide } from '@/ppt/core'
import useSlideBackgroundStyle from '@/ppt/hooks/useSlideBackgroundStyle'
import ScreenElement from './ScreenElement'
import styles from './ScreenSlide.module.scss'

interface ScreenSlideProps {
  slide: PPTSlide
  scale: number
  animationIndex: number
  turnSlideToId: (id: string) => void
  manualExitFullscreen: () => void
}

export default function ScreenSlide({
  slide,
  scale,
  animationIndex,
  turnSlideToId,
  manualExitFullscreen,
}: ScreenSlideProps) {
  const { viewportRatio, viewportSize } = useSlidesStore(
    useShallow((state) => ({
      viewportRatio: state.viewportRatio,
      viewportSize: state.viewportSize,
    })),
  )

  const { backgroundStyle } = useSlideBackgroundStyle(slide.background)
  const elements = useMemo(() => slide.elements || [], [slide.elements])

  return (
    <div
      className={styles['screen-slide']}
      style={{
        width: `${viewportSize}px`,
        height: `${viewportSize * viewportRatio}px`,
        transform: `scale(${scale})`,
      }}
    >
      <div className={styles.background} style={{ ...backgroundStyle }} />
      {elements.map((element, index) => (
        <ScreenElement
          key={element.id}
          elementInfo={element}
          elementIndex={index + 1}
          animationIndex={animationIndex}
          turnSlideToId={turnSlideToId}
          manualExitFullscreen={manualExitFullscreen}
        />
      ))}
    </div>
  )
}
