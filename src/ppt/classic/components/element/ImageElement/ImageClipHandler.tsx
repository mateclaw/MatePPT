import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import { KEYS } from '@/ppt/configs/hotkey'
import { ImageClipedEmitData, OperateResizeHandlers } from '@/ppt/types/edit'
import type { ImageClipDataRange, ImageElementClip } from '@/ppt/core'
import { useMainStore } from '@/ppt/store/useMainStore'
import { useCtrlOrShiftActive } from '@/ppt/store/useKeyboardStore'
import styles from './ImageClipHandler.module.scss'

interface ImageClipHandlerProps {
  src: string
  clipPath: string
  width: number
  height: number
  top: number
  left: number
  rotate: number
  clipData?: ImageElementClip
  onClip: (payload: ImageClipedEmitData | null) => void
}

const ImageClipHandler: React.FC<ImageClipHandlerProps> = ({
  src,
  clipPath,
  width,
  height,
  rotate,
  clipData,
  onClip,
}) => {
  const canvasScale = useMainStore((state) => state.canvasScale)
  const ctrlOrShiftKeyActive = useCtrlOrShiftActive()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isSettingClipRangeRef = useRef(false)
  const currentRangeRef = useRef<ImageClipDataRange | null>(null)

  const [clipWrapperPositionStyle, setClipWrapperPositionStyle] = useState({
    top: '0',
    left: '0',
  })
  const [topImgWrapperPosition, setTopImgWrapperPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })

  const topImgWrapperPositionRef = useRef(topImgWrapperPosition)
  useEffect(() => {
    topImgWrapperPositionRef.current = topImgWrapperPosition
  }, [topImgWrapperPosition])

  const clipTransform = useMemo(() => {
    const [start, end] = clipData ? clipData.range : [[0, 0], [100, 100]]
    const widthScale = (end[0] - start[0]) / 100
    const heightScale = (end[1] - start[1]) / 100
    const left = start[0] / widthScale
    const top = start[1] / heightScale

    return { widthScale, heightScale, left, top }
  }, [clipData])

  const imgPosition = useMemo(() => {
    const { widthScale, heightScale, left, top } = clipTransform
    return {
      left: -left,
      top: -top,
      width: 100 / widthScale,
      height: 100 / heightScale,
    }
  }, [clipTransform])

  const bottomImgPositionStyle = useMemo(() => {
    return {
      top: `${imgPosition.top}%`,
      left: `${imgPosition.left}%`,
      width: `${imgPosition.width}%`,
      height: `${imgPosition.height}%`,
    }
  }, [imgPosition])

  const topImgWrapperPositionStyle = useMemo(() => {
    return {
      top: `${topImgWrapperPosition.top}%`,
      left: `${topImgWrapperPosition.left}%`,
      width: `${topImgWrapperPosition.width}%`,
      height: `${topImgWrapperPosition.height}%`,
    }
  }, [topImgWrapperPosition])

  const topImgPositionStyle = useMemo(() => {
    const bottomWidth = imgPosition.width
    const bottomHeight = imgPosition.height
    const { top, left, width, height } = topImgWrapperPosition

    if (!width || !height) {
      return {
        left: '0%',
        top: '0%',
        width: '100%',
        height: '100%',
      }
    }

    return {
      left: `${-left * (100 / width)}%`,
      top: `${-top * (100 / height)}%`,
      width: `${(bottomWidth / width) * 100}%`,
      height: `${(bottomHeight / height) * 100}%`,
    }
  }, [imgPosition, topImgWrapperPosition])

  const initClipPosition = useMemoizedFn(() => {
    const { left, top } = clipTransform
    setTopImgWrapperPosition({
      left,
      top,
      width: 100,
      height: 100,
    })
    setClipWrapperPositionStyle({
      top: `${-top}%`,
      left: `${-left}%`,
    })
  })

  const updateRange = useMemoizedFn(() => {
    const current = topImgWrapperPositionRef.current
    const bottomWidth = imgPosition.width
    const bottomHeight = imgPosition.height

    const retPosition = {
      left: -current.left * (100 / current.width),
      top: -current.top * (100 / current.height),
      width: (bottomWidth / current.width) * 100,
      height: (bottomHeight / current.height) * 100,
    }

    const widthScale = 100 / retPosition.width
    const heightScale = 100 / retPosition.height

    const start: [number, number] = [
      -retPosition.left * widthScale,
      -retPosition.top * heightScale,
    ]
    const end: [number, number] = [
      widthScale * 100 + start[0],
      heightScale * 100 + start[1],
    ]

    currentRangeRef.current = [start, end]
  })

  const handleClip = useMemoizedFn(() => {
    if (isSettingClipRangeRef.current) return

    if (!currentRangeRef.current) {
      onClip(null)
      return
    }

    const { left, top } = clipTransform
    const position = {
      left: ((topImgWrapperPositionRef.current.left - left) / 100) * width,
      top: ((topImgWrapperPositionRef.current.top - top) / 100) * height,
      width: ((topImgWrapperPositionRef.current.width - 100) / 100) * width,
      height: ((topImgWrapperPositionRef.current.height - 100) / 100) * height,
    }

    onClip({
      range: currentRangeRef.current,
      position,
    })
  })

  const moveClipRange = useMemoizedFn((e: React.MouseEvent) => {
    isSettingClipRangeRef.current = true
    let isMouseDown = true

    const startPageX = e.pageX
    const startPageY = e.pageY
    const bottomPosition = imgPosition
    const originPosition = { ...topImgWrapperPositionRef.current }

    document.onmousemove = (event: MouseEvent) => {
      if (!isMouseDown) return

      const currentPageX = event.pageX
      const currentPageY = event.pageY

      const moveXRaw = (currentPageX - startPageX) / canvasScale
      const moveYRaw = (currentPageY - startPageY) / canvasScale

      const moveLength = Math.sqrt(moveXRaw * moveXRaw + moveYRaw * moveYRaw)
      const moveAngle = Math.atan2(moveYRaw, moveXRaw)
      const rotateRadian = moveAngle - (rotate / 180) * Math.PI

      const moveX = ((moveLength * Math.cos(rotateRadian)) / width) * 100
      const moveY = ((moveLength * Math.sin(rotateRadian)) / height) * 100

      let targetLeft = originPosition.left + moveX
      let targetTop = originPosition.top + moveY

      if (targetLeft < 0) targetLeft = 0
      else if (targetLeft + originPosition.width > bottomPosition.width) {
        targetLeft = bottomPosition.width - originPosition.width
      }
      if (targetTop < 0) targetTop = 0
      else if (targetTop + originPosition.height > bottomPosition.height) {
        targetTop = bottomPosition.height - originPosition.height
      }

      setTopImgWrapperPosition((prev) => ({
        ...prev,
        left: targetLeft,
        top: targetTop,
      }))
    }

    document.onmouseup = () => {
      isMouseDown = false
      document.onmousemove = null
      document.onmouseup = null

      updateRange()

      setTimeout(() => {
        isSettingClipRangeRef.current = false
      }, 0)
    }
  })

  const scaleClipRange = useMemoizedFn(
    (e: React.MouseEvent, type: OperateResizeHandlers) => {
      isSettingClipRangeRef.current = true
      let isMouseDown = true

      const minWidth = (50 / width) * 100
      const minHeight = (50 / height) * 100

      const startPageX = e.pageX
      const startPageY = e.pageY
      const bottomPosition = imgPosition
      const originPosition = { ...topImgWrapperPositionRef.current }
      const aspectRatio = originPosition.width / originPosition.height

      document.onmousemove = (event: MouseEvent) => {
        if (!isMouseDown) return

        const currentPageX = event.pageX
        const currentPageY = event.pageY

        const moveXRaw = (currentPageX - startPageX) / canvasScale
        const moveYRaw = (currentPageY - startPageY) / canvasScale

        const moveLength = Math.sqrt(moveXRaw * moveXRaw + moveYRaw * moveYRaw)
        const moveAngle = Math.atan2(moveYRaw, moveXRaw)
        const rotateRadian = moveAngle - (rotate / 180) * Math.PI

        let moveX = ((moveLength * Math.cos(rotateRadian)) / width) * 100
        let moveY = ((moveLength * Math.sin(rotateRadian)) / height) * 100

        if (ctrlOrShiftKeyActive) {
          if (type === 'right-bottom' || type === 'left-top') moveY = moveX / aspectRatio
          if (type === 'left-bottom' || type === 'right-top') moveY = -moveX / aspectRatio
        }

        let targetLeft
        let targetTop
        let targetWidth
        let targetHeight

        if (type === 'left-top') {
          if (originPosition.left + moveX < 0) moveX = -originPosition.left
          if (originPosition.top + moveY < 0) moveY = -originPosition.top
          if (originPosition.width - moveX < minWidth) moveX = originPosition.width - minWidth
          if (originPosition.height - moveY < minHeight) moveY = originPosition.height - minHeight
          targetWidth = originPosition.width - moveX
          targetHeight = originPosition.height - moveY
          targetLeft = originPosition.left + moveX
          targetTop = originPosition.top + moveY
        }
        else if (type === 'right-top') {
          if (originPosition.left + originPosition.width + moveX > bottomPosition.width) {
            moveX = bottomPosition.width - (originPosition.left + originPosition.width)
          }
          if (originPosition.top + moveY < 0) moveY = -originPosition.top
          if (originPosition.width + moveX < minWidth) moveX = minWidth - originPosition.width
          if (originPosition.height - moveY < minHeight) moveY = originPosition.height - minHeight
          targetWidth = originPosition.width + moveX
          targetHeight = originPosition.height - moveY
          targetLeft = originPosition.left
          targetTop = originPosition.top + moveY
        }
        else if (type === 'left-bottom') {
          if (originPosition.left + moveX < 0) moveX = -originPosition.left
          if (originPosition.top + originPosition.height + moveY > bottomPosition.height) {
            moveY = bottomPosition.height - (originPosition.top + originPosition.height)
          }
          if (originPosition.width - moveX < minWidth) moveX = originPosition.width - minWidth
          if (originPosition.height + moveY < minHeight) moveY = minHeight - originPosition.height
          targetWidth = originPosition.width - moveX
          targetHeight = originPosition.height + moveY
          targetLeft = originPosition.left + moveX
          targetTop = originPosition.top
        }
        else if (type === 'right-bottom') {
          if (originPosition.left + originPosition.width + moveX > bottomPosition.width) {
            moveX = bottomPosition.width - (originPosition.left + originPosition.width)
          }
          if (originPosition.top + originPosition.height + moveY > bottomPosition.height) {
            moveY = bottomPosition.height - (originPosition.top + originPosition.height)
          }
          if (originPosition.width + moveX < minWidth) moveX = minWidth - originPosition.width
          if (originPosition.height + moveY < minHeight) moveY = minHeight - originPosition.height
          targetWidth = originPosition.width + moveX
          targetHeight = originPosition.height + moveY
          targetLeft = originPosition.left
          targetTop = originPosition.top
        }
        else if (type === 'top') {
          if (originPosition.top + moveY < 0) moveY = -originPosition.top
          if (originPosition.height - moveY < minHeight) moveY = originPosition.height - minHeight
          targetWidth = originPosition.width
          targetHeight = originPosition.height - moveY
          targetLeft = originPosition.left
          targetTop = originPosition.top + moveY
        }
        else if (type === 'bottom') {
          if (originPosition.top + originPosition.height + moveY > bottomPosition.height) {
            moveY = bottomPosition.height - (originPosition.top + originPosition.height)
          }
          if (originPosition.height + moveY < minHeight) moveY = minHeight - originPosition.height
          targetWidth = originPosition.width
          targetHeight = originPosition.height + moveY
          targetLeft = originPosition.left
          targetTop = originPosition.top
        }
        else if (type === 'left') {
          if (originPosition.left + moveX < 0) moveX = -originPosition.left
          if (originPosition.width - moveX < minWidth) moveX = originPosition.width - minWidth
          targetWidth = originPosition.width - moveX
          targetHeight = originPosition.height
          targetLeft = originPosition.left + moveX
          targetTop = originPosition.top
        }
        else {
          if (originPosition.left + originPosition.width + moveX > bottomPosition.width) {
            moveX = bottomPosition.width - (originPosition.left + originPosition.width)
          }
          if (originPosition.width + moveX < minWidth) moveX = minWidth - originPosition.width
          targetHeight = originPosition.height
          targetWidth = originPosition.width + moveX
          targetLeft = originPosition.left
          targetTop = originPosition.top
        }

        setTopImgWrapperPosition({
          left: targetLeft,
          top: targetTop,
          width: targetWidth,
          height: targetHeight,
        })
      }

      document.onmouseup = () => {
        isMouseDown = false
        document.onmousemove = null
        document.onmouseup = null

        updateRange()

        setTimeout(() => {
          isSettingClipRangeRef.current = false
        }, 0)
      }
    }
  )

  const rotateClassName = useMemo(() => {
    if (rotate > -22.5 && rotate <= 22.5) return styles.rotate0
    if (rotate > 22.5 && rotate <= 67.5) return styles.rotate45
    if (rotate > 67.5 && rotate <= 112.5) return styles.rotate90
    if (rotate > 112.5 && rotate <= 157.5) return styles.rotate135
    if (rotate > 157.5 || rotate <= -157.5) return styles.rotate0
    if (rotate > -157.5 && rotate <= -112.5) return styles.rotate45
    if (rotate > -112.5 && rotate <= -67.5) return styles.rotate90
    if (rotate > -67.5 && rotate <= -22.5) return styles.rotate135
    return styles.rotate0
  }, [rotate])

  const pointClassMap: Record<string, string> = {
    [OperateResizeHandlers.LEFT_TOP]: styles.leftTop,
    [OperateResizeHandlers.RIGHT_TOP]: styles.rightTop,
    [OperateResizeHandlers.LEFT_BOTTOM]: styles.leftBottom,
    [OperateResizeHandlers.RIGHT_BOTTOM]: styles.rightBottom,
    [OperateResizeHandlers.TOP]: styles.top,
    [OperateResizeHandlers.BOTTOM]: styles.bottom,
    [OperateResizeHandlers.LEFT]: styles.left,
    [OperateResizeHandlers.RIGHT]: styles.right,
  }

  useEffect(() => {
    initClipPosition()
  }, [initClipPosition])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      if (key === KEYS.ENTER) {
        handleClip()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [handleClip])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current) return
      const target = event.target as Node
      if (wrapperRef.current.contains(target)) return
      handleClip()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [handleClip])

  return (
    <div
      ref={wrapperRef}
      className={styles.imageClipHandler}
      style={clipWrapperPositionStyle}
    >
      <img
        className={styles.bottomImg}
        src={src}
        draggable={false}
        alt=""
        style={bottomImgPositionStyle}
      />

      <div
        className={styles.topImageContent}
        style={{
          ...topImgWrapperPositionStyle,
          clipPath,
        }}
      >
        <img
          className={styles.topImg}
          src={src}
          draggable={false}
          alt=""
          style={topImgPositionStyle}
        />
      </div>

      <div
        className={styles.operate}
        style={topImgWrapperPositionStyle}
        onMouseDown={(event) => {
          event.stopPropagation()
          moveClipRange(event)
        }}
      >
        {cornerPoint.map((point) => (
          <div
            key={point}
            className={clsx(styles.clipPoint, pointClassMap[point], rotateClassName)}
            onMouseDown={(event) => {
              event.stopPropagation()
              scaleClipRange(event, point)
            }}
          >
            <svg width="16" height="16" fill="#fff" stroke="#333">
              <path
                strokeWidth="0.3"
                shapeRendering="crispEdges"
                d="M 16 0 L 0 0 L 0 16 L 4 16 L 4 4 L 16 4 L 16 0 Z"
              />
            </svg>
          </div>
        ))}
        {edgePoints.map((point) => (
          <div
            key={point}
            className={clsx(styles.clipPoint, pointClassMap[point], rotateClassName)}
            onMouseDown={(event) => {
              event.stopPropagation()
              scaleClipRange(event, point)
            }}
          >
            <svg width="16" height="16" fill="#fff" stroke="#333">
              <path
                strokeWidth="0.3"
                shapeRendering="crispEdges"
                d="M 16 0 L 0 0 L 0 4 L 16 4 Z"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

const cornerPoint: OperateResizeHandlers[] = [
  OperateResizeHandlers.LEFT_TOP,
  OperateResizeHandlers.RIGHT_TOP,
  OperateResizeHandlers.LEFT_BOTTOM,
  OperateResizeHandlers.RIGHT_BOTTOM,
]
const edgePoints: OperateResizeHandlers[] = [
  OperateResizeHandlers.TOP,
  OperateResizeHandlers.BOTTOM,
  OperateResizeHandlers.LEFT,
  OperateResizeHandlers.RIGHT,
]

export default ImageClipHandler
