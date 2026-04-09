import React, { type FC } from 'react'
import type { PPTImageElement } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { useElementShadow } from '@/ppt/hooks/useElementShadow'
import { useElementFlip } from '@/ppt/hooks/useElementFlip'
import { useClipImage } from './useClipImage'
import { useFilter } from './useFilter'
import ImageOutline from './ImageOutline'
import styles from './BaseImageElement.module.scss'

interface BaseImageElementProps {
  elementInfo: PPTImageElement
}

const BaseImageElement: FC<BaseImageElementProps> = ({ elementInfo }) => {
  const { shadowStyle } = useElementShadow(elementInfo.shadow)
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)
  const { clipShape, imgPosition } = useClipImage(elementInfo)
  const { filter } = useFilter(elementInfo.filters)

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
    position: 'relative',
    filter: shadowStyle ? `drop-shadow(${shadowStyle})` : undefined,
    transform: flipStyle,
  }

  return (
    <div className={styles.baseElementImage} style={containerStyle}>
      <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
        <div className={styles.elementContent} style={elementContentStyle}>
          <ImageOutline elementInfo={elementInfo} />

          <div className={styles.imageContent} style={{ clipPath: clipShape.style }}>
            <img
              src={elementInfo.src}
              draggable={false}
              style={{
                top: imgPosition.top,
                left: imgPosition.left,
                width: imgPosition.width,
                height: imgPosition.height,
                filter,
              }}
              alt=""
            />
            {elementInfo.colorMask && (
              <div
                className={styles.colorMask}
                style={{
                  backgroundColor: resolvePPTColorValue(elementInfo.colorMask),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseImageElement
