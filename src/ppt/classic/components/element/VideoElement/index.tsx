import React, { type FC, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import type { PPTVideoElement } from '@/ppt/core'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import { useMainStore } from '@/ppt/store/useMainStore'
import VideoPlayer from './VideoPlayer'
import styles from './VideoElement.module.scss'

interface VideoElementProps {
  elementInfo: PPTVideoElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTVideoElement, canMove?: boolean) => void
  contextmenus?: () => ContextmenuItem[] | null
}

const VideoElement: FC<VideoElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const canvasScale = useMainStore((state) => state.canvasScale)
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)

  const handleSelectElement = useMemoizedFn((e: MouseEvent | TouchEvent, canMove = true) => {
    if (elementInfo.lock) return
    e.stopPropagation()
    selectElement(e, elementInfo, canMove)
  })

  const handleContextMenu = useMemoizedFn((e: React.MouseEvent) => {
    if (!contextmenus) return
    e.preventDefault()
    e.stopPropagation()
    setContextmenuAxis({ x: e.clientX, y: e.clientY })
  })

  const removeContextmenu = useMemoizedFn(() => {
    setContextmenuAxis(null)
  })

  const menus = useMemo(() => {
    if (!contextmenus) return []
    return contextmenus() || []
  }, [contextmenus])

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

  const handlerClassMap: Record<string, string> = {
    t: styles.handlerBorderT,
    b: styles.handlerBorderB,
    l: styles.handlerBorderL,
    r: styles.handlerBorderR,
  }

  return (
    <>
      <div
        className={clsx(
          styles.editableElementVideo,
          elementInfo.lock && styles.lock,
        )}
        style={containerStyle}
        data-video-id={elementInfo.id}
      >
        <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
          <div
            className={styles.elementContent}
            onContextMenu={handleContextMenu}
            onMouseDown={(e) => handleSelectElement(e as any, false)}
            onTouchStart={(e) => handleSelectElement(e as any, false)}
          >
            <VideoPlayer
              width={elementInfo.width}
              height={elementInfo.height}
              src={elementInfo.src}
              poster={elementInfo.poster}
              scale={canvasScale}
            />
            {['t', 'b', 'l', 'r'].map((item) => (
              <div
                key={item}
                className={clsx(styles.handlerBorder, handlerClassMap[item])}
                onMouseDown={(e) => handleSelectElement(e as any)}
                onTouchStart={(e) => handleSelectElement(e as any)}
              />
            ))}
          </div>
        </div>
      </div>

      {contextmenuAxis && (
        <Contextmenu
          axis={contextmenuAxis}
          el={document.querySelector(`[data-video-id="${elementInfo.id}"]`) || document.body}
          menus={menus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </>
  )
}

export default VideoElement
