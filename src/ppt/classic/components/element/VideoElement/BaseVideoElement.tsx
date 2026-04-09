import React, { type FC } from 'react'
import type { PPTVideoElement } from '@/ppt/core'
import styles from './BaseVideoElement.module.scss'

interface BaseVideoElementProps {
  elementInfo: PPTVideoElement
}

const BaseVideoElement: FC<BaseVideoElementProps> = ({ elementInfo }) => {
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
    backgroundColor: '#000',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundImage: elementInfo.poster ? `url(${elementInfo.poster})` : undefined,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }

  return (
    <div className={styles.baseElementVideo} style={containerStyle}>
      <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
        <div className={styles.elementContent} style={elementContentStyle}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default BaseVideoElement
