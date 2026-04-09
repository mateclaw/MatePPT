import React, { useMemo } from 'react'
import type { PPTSlide } from '@/ppt/core'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import useSlideBackgroundStyle from '@/ppt/hooks/useSlideBackgroundStyle'
import ThumbnailElement from './ThumbnailElement'
import type { SpeechPptFrameState } from '@/ppt/classic/Editor/Canvas/SpeechPptFrame'
import PptSlidePreview from '@/ppt/classic/components/PptSlidePreview'
import styles from './ThumbnailSlide.module.scss'

export interface ThumbnailSlideOverlay {
  pptSlide: PPTSlide
  frame: SpeechPptFrameState
  pptViewportSize: number
  pptViewportRatio: number
}

interface ThumbnailSlideProps {
  slide: PPTSlide
  size: number
  visible?: boolean
  overlay?: ThumbnailSlideOverlay
  fixedHeight?: number
}

const ThumbnailSlide: React.FC<ThumbnailSlideProps> = ({
  slide,
  size,
  visible = true,
  overlay,
  fixedHeight,
}) => {
  const viewportRatio = useSlidesStore((state) => state.viewportRatio)
  const viewportSize = useSlidesStore((state) => state.viewportSize)
  const { backgroundStyle } = useSlideBackgroundStyle(slide.background)

  const containerHeight = fixedHeight ?? size * viewportRatio
  const innerWidth = viewportSize
  const innerHeight = viewportSize * viewportRatio
  const scale = useMemo(() => containerHeight / innerHeight, [containerHeight, innerHeight])
  const targetWidth = containerHeight / viewportRatio
  const viewportLeft = (size - targetWidth) / 2
  const showLetterbox = fixedHeight ? targetWidth < size : false
  const elements = useMemo(() => slide?.elements || [], [slide])
  const htmlContent = (slide as PPTSlide & { htmlContent?: string }).htmlContent

  return (
    <div
      className={styles.thumbnailSlide}
      style={{
        width: `${size}px`,
        height: `${containerHeight}px`,
        backgroundColor: showLetterbox ? '#000' : undefined,
      }}
    >
      {visible ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${viewportLeft}px`,
            width: `${targetWidth}px`,
            height: `${containerHeight}px`,
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          <div
            className={styles.elements}
            style={{
              width: `${innerWidth}px`,
              height: `${innerHeight}px`,
              transform: `scale(${scale})`,
            }}
          >
            <div className={styles.background} style={backgroundStyle} />
            {htmlContent && (
              <iframe
                title={`thumbnail-html-${slide.id}`}
                srcDoc={htmlContent}
                sandbox="allow-same-origin allow-scripts"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${innerWidth}px`,
                  height: `${innerHeight}px`,
                  border: 'none',
                  pointerEvents: 'none',
                  background: '#ffffff',
                }}
              />
            )}
            {overlay && (
              <div
                style={{
                  position: 'absolute',
                  left: `${overlay.frame.left}px`,
                  top: `${overlay.frame.top}px`,
                  width: `${overlay.frame.width}px`,
                  height: `${overlay.frame.height}px`,
                }}
              >
                <PptSlidePreview
                  slide={overlay.pptSlide}
                  viewportSize={overlay.pptViewportSize}
                  viewportRatio={overlay.pptViewportRatio}
                  width={overlay.frame.width}
                  height={overlay.frame.height}
                />
              </div>
            )}
            {elements.map((element, index) => (
              <ThumbnailElement key={element.id} elementInfo={element} elementIndex={index + 1} />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.placeholder}>加载中 ...</div>
      )}
    </div>
  )
}

export default ThumbnailSlide
