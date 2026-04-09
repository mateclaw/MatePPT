import React, { type FC, useMemo } from 'react'
import clsx from 'clsx'
import type { PPTAudioElement } from '@/ppt/core'
import { useMainStore } from '@/ppt/store/useMainStore'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import AudioPlayer from './AudioPlayer'
import styles from './AudioElement.module.scss'

interface AudioElementProps {
  elementInfo: PPTAudioElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTAudioElement, canMove?: boolean) => void
}

const AudioElement: FC<AudioElementProps> = ({
  elementInfo,
  selectElement,
}) => {
  const handleElementId = useMainStore((state) => state.handleElementId)
  const canvasScale = useMainStore((state) => state.canvasScale)
  const viewportSize = useSlidesStore((state) => state.viewportSize)
  const viewportRatio = useSlidesStore((state) => state.viewportRatio)
  

  const audioIconSize = useMemo(() => {
    return Math.min(elementInfo.width, elementInfo.height) + 'px'
  }, [elementInfo.width, elementInfo.height])

  const audioPlayerPosition = useMemo(() => {
    const canvasWidth = viewportSize
    const canvasHeight = viewportSize * viewportRatio

    const audioWidth = 280 / canvasScale
    const audioHeight = 50 / canvasScale

    const elWidth = elementInfo.width
    const elHeight = elementInfo.height
    const elLeft = elementInfo.left
    const elTop = elementInfo.top

    let left = 0
    let top = elHeight

    if (elLeft + audioWidth >= canvasWidth) {
      left = elWidth - audioWidth
    }
    if (elTop + elHeight + audioHeight >= canvasHeight) {
      top = -audioHeight
    }

    return {
      left: left + 'px',
      top: top + 'px',
    }
  }, [elementInfo, viewportSize, viewportRatio, canvasScale])

  const handleSelectElement = (e: MouseEvent | TouchEvent) => {
    if (elementInfo.lock) {
      return
    }
    e.stopPropagation()
    selectElement(e, elementInfo)
  }

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: elementInfo.top,
    left: elementInfo.left,
    width: elementInfo.width,
    height: elementInfo.height,
  }

  const rotateWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `rotate(${elementInfo.rotate}deg)`,
  }

  const elementContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }

  const audioIconStyle: React.CSSProperties = {
    fontSize: audioIconSize,
    color: resolvePPTColorValue(elementInfo.color),
  }

  return (
    <div
      className={clsx(
        styles.editableElementAudio,
        elementInfo.lock && styles.lock,
      )}
      style={containerStyle}
    >
      <div style={rotateWrapperStyle}>
        <div
          className={styles.elementContent}
          style={elementContentStyle}
          onMouseDown={(e) => handleSelectElement(e as any)}
          onTouchStart={(e) => handleSelectElement(e as any)}
        >
          {/* Audio icon - using a simple volume icon SVG */}
          <svg
            className={styles.audioIcon}
            style={audioIconStyle}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>

          {handleElementId === elementInfo.id && (
            <AudioPlayer
              className={styles.audioPlayer}
              style={{
                position: 'absolute',
                ...audioPlayerPosition,
              }}
              src={elementInfo.src}
              loop={elementInfo.loop}
              scale={canvasScale}
              onMouseDown={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AudioElement
