import { useMemo } from 'react'
import type { PPTSlide } from '@/ppt/core'
import useSlideBackgroundStyle from '@/ppt/hooks/useSlideBackgroundStyle'
import ThumbnailElement from '@/ppt/classic/components/ThumbnailSlide/ThumbnailElement'
import styles from './PptSlidePreview.module.scss'

export interface PptSlidePreviewProps {
  slide: PPTSlide
  viewportSize: number
  viewportRatio: number
  width: number
  height: number
}

export default function PptSlidePreview({
  slide,
  viewportSize,
  viewportRatio,
  width,
  height,
}: PptSlidePreviewProps) {
  const { backgroundStyle } = useSlideBackgroundStyle(slide.background)
  const elements = useMemo(() => slide?.elements || [], [slide])

  const innerWidth = viewportSize
  const innerHeight = viewportSize * viewportRatio
  const scale = Math.min(width / innerWidth, height / innerHeight)

  

  return (
    <div className={styles.preview}  style={{ width: `${width}px`, height: `${height}px` }}>
      <div
        className={styles.stage}
        style={{
          width: `${innerWidth}px`,
          height: `${innerHeight}px`,
          transform: `scale(${scale})`,
        }}

        
      >
        <div className={styles.background} style={backgroundStyle} />


        {
          slide.slideHtml ? <>

            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <iframe

                srcDoc={slide.slideHtml || ''}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="PPT View"
              />

              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>

              </div>

            </div>
          </> :
            elements.map((element, index) => (
              <ThumbnailElement key={element.id} elementInfo={element} elementIndex={index + 1} />
            ))

        }
      </div>
    </div>
  )
}
