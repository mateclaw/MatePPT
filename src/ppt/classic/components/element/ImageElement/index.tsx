import React, { type FC, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import { EditorMode, type PPTImageElement, type ImageElementClip } from '@/ppt/core'
import type { ImageClipedEmitData } from '@/ppt/types/edit'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import { useMainStore } from '@/ppt/store/useMainStore'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore'
import { useElementShadow } from '@/ppt/hooks/useElementShadow'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { useElementFlip } from '@/ppt/hooks/useElementFlip'
import { useClipImage } from './useClipImage'
import { useFilter } from './useFilter'
import ImageOutline from './ImageOutline'
import ImageClipHandler from './ImageClipHandler'
import AnnotationHighlight, { getElementAnnotationMeta } from '@/ppt/classic/components/element/AnnotationHighlight'
import styles from './ImageElement.module.scss'

interface ImageElementProps {
  elementInfo: PPTImageElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTImageElement, canMove?: boolean) => void
  contextmenus?: () => ContextmenuItem[] | null
}

const ImageElement: FC<ImageElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const clipingImageElementId = useMainStore((state) => state.clipingImageElementId)
  const setClipingImageElementId = useMainStore((state) => state.setClipingImageElementId)
  const mode = useMainStore((state) => state.mode)
  const updateElement = useSlidesStore((state) => state.updateElement)
  const currentSlideElements = useSlidesStore((state) => state.getCurrentSlide()?.elements || [])
  const highlightAnnotatedElements = useSlidesStore((state) => state.highlightAnnotatedElements)
  // const addSnapshot = useSnapshotStore((state) => state.addSnapshot)

  const isCliping = clipingImageElementId === elementInfo.id

  const { shadowStyle } = useElementShadow(elementInfo.shadow)
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)
  const { clipShape, imgPosition } = useClipImage(elementInfo)
  const { filter } = useFilter(elementInfo.filters)

  const handleSelectElement = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (elementInfo.lock && mode !== EditorMode.ANNOTATE) return
    e.stopPropagation()
    selectElement(e, elementInfo)
  })

  const handleClip = useMemoizedFn((data: ImageClipedEmitData | null) => {
    setClipingImageElementId('')
    if (!data) return

    const { range, position } = data
    const originClip: ImageElementClip = elementInfo.clip || {
      shape: 'rect',
      range: [
        [0, 0],
        [100, 100],
      ],
    }

    const left = elementInfo.left + position.left
    const top = elementInfo.top + position.top
    const width = elementInfo.width + position.width
    const height = elementInfo.height + position.height

    let centerOffsetX = 0
    let centerOffsetY = 0

    if (elementInfo.rotate) {
      const centerX = left + width / 2 - (elementInfo.left + elementInfo.width / 2)
      const centerY = -((top + height / 2) - (elementInfo.top + elementInfo.height / 2))

      const radian = (-elementInfo.rotate * Math.PI) / 180

      const rotatedCenterX = centerX * Math.cos(radian) - centerY * Math.sin(radian)
      const rotatedCenterY = centerX * Math.sin(radian) + centerY * Math.cos(radian)

      centerOffsetX = rotatedCenterX - centerX
      centerOffsetY = -(rotatedCenterY - centerY)
    }

    updateElement({
      id: elementInfo.id,
      props: {
        clip: { ...originClip, range },
        left: left + centerOffsetX,
        top: top + centerOffsetY,
        width: width,
        height: height,
      },
    })

    // addSnapshot()
  })

  const handleContextMenu = useMemoizedFn((e: React.MouseEvent) => {
    
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

  const elementContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    filter: shadowStyle ? `drop-shadow(${shadowStyle})` : undefined,
    transform: flipStyle,
  }

  const annotationMeta = useMemo(
    () => getElementAnnotationMeta(elementInfo, currentSlideElements),
    [elementInfo, currentSlideElements]
  )
  const showAnnotationHighlight = highlightAnnotatedElements && !!annotationMeta.label

  return (
    <>
      <div
        className={clsx(
          styles.editableElementImage,
          elementInfo.lock && styles.lock,
          elementInfo.inherited && styles.inherited,
        )}
        style={containerStyle}
        data-image-id={elementInfo.id}
      >
        <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
          {isCliping ? (
            <ImageClipHandler
              src={elementInfo.src}
              clipData={elementInfo.clip}
              width={elementInfo.width}
              height={elementInfo.height}
              top={elementInfo.top}
              left={elementInfo.left}
              rotate={elementInfo.rotate}
              clipPath={clipShape.style}
              onClip={handleClip}
            />
          ) : (
            <div
              className={styles.elementContent}
              style={elementContentStyle}
              onMouseDown={(e) => handleSelectElement(e as any)}
              onTouchStart={(e) => handleSelectElement(e as any)}
              onContextMenu={handleContextMenu}
            >
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
                  onDragStart={(event) => event.preventDefault()}
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
              {showAnnotationHighlight && <AnnotationHighlight label={annotationMeta.label} color={annotationMeta.color} />}
            </div>
          )}
        </div>
      </div>

      {contextmenuAxis && menus.length > 0 && (
        <Contextmenu
          axis={contextmenuAxis}
          el={document.querySelector(`[data-image-id="${elementInfo.id}"]`) || document.body}
          menus={menus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </>
  )
}

export default ImageElement
