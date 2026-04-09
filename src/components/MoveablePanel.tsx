import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import classNames from 'classnames'
import { Icon } from 'umi'

import styles from './MoveablePanel.module.scss'

interface MoveablePanelProps {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  left?: number
  top?: number
  title?: string
  moveable?: boolean
  resizeable?: boolean
  contentStyle?: CSSProperties
  className?: string
  onClose?: () => void
  children?: ReactNode
}

export default function MoveablePanel({
  width,
  height,
  minWidth = 20,
  minHeight = 20,
  maxWidth = 500,
  maxHeight = 500,
  left = 10,
  top = 10,
  title = '',
  moveable = true,
  resizeable = false,
  contentStyle,
  className,
  onClose,
  children,
}: MoveablePanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const xRef = useRef(0)
  const yRef = useRef(0)
  const wRef = useRef(0)
  const hRef = useRef(0)

  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [w, setW] = useState(0)
  const [h, setH] = useState(0)

  const updateX = (value: number) => {
    xRef.current = value
    setX(value)
  }

  const updateY = (value: number) => {
    yRef.current = value
    setY(value)
  }

  const updateW = (value: number) => {
    wRef.current = value
    setW(value)
  }

  const updateH = (value: number) => {
    hRef.current = value
    setH(value)
  }

  const getRealHeight = () => {
    if (hRef.current) return hRef.current
    return panelRef.current?.clientHeight || 0
  }

  useLayoutEffect(() => {
    const panelHeight = height || panelRef.current?.clientHeight || 0
    const windowWidth = document.body.clientWidth
    const windowHeight = document.body.clientHeight

    const resolvedLeft = left >= 0 ? left : windowWidth + left - width
    const resolvedTop = top >= 0 ? top : windowHeight + top - (height || panelHeight)

    updateX(resolvedLeft)
    updateY(resolvedTop)
    updateW(width)
    updateH(height)
  }, [height, left, top, width])

  const startMove = (e: React.MouseEvent) => {
    if (!moveable) return
    e.preventDefault()

    let isMouseDown = true
    const windowWidth = document.body.clientWidth
    const windowHeight = document.body.clientHeight
    const startPageX = e.pageX
    const startPageY = e.pageY
    const originLeft = xRef.current
    const originTop = yRef.current

    const handleMove = (moveEvent: MouseEvent) => {
      if (!isMouseDown) return

      const moveX = moveEvent.pageX - startPageX
      const moveY = moveEvent.pageY - startPageY

      let nextLeft = originLeft + moveX
      let nextTop = originTop + moveY

      if (nextLeft < 0) nextLeft = 0
      if (nextTop < 0) nextTop = 0
      if (nextLeft + wRef.current > windowWidth) nextLeft = windowWidth - wRef.current
      if (nextTop + getRealHeight() > windowHeight) nextTop = windowHeight - getRealHeight()

      updateX(nextLeft)
      updateY(nextTop)
    }

    const handleUp = () => {
      isMouseDown = false
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const startResize = (e: React.MouseEvent) => {
    if (!resizeable) return
    e.preventDefault()

    let isMouseDown = true
    const startPageX = e.pageX
    const startPageY = e.pageY
    const originWidth = wRef.current
    const originHeight = hRef.current

    const handleMove = (moveEvent: MouseEvent) => {
      if (!isMouseDown) return

      const moveX = moveEvent.pageX - startPageX
      const moveY = moveEvent.pageY - startPageY

      let nextWidth = originWidth + moveX
      let nextHeight = originHeight + moveY

      if (nextWidth < minWidth) nextWidth = minWidth
      if (nextHeight < minHeight) nextHeight = minHeight
      if (nextWidth > maxWidth) nextWidth = maxWidth
      if (nextHeight > maxHeight) nextHeight = maxHeight

      updateW(nextWidth)
      updateH(nextHeight)
    }

    const handleUp = () => {
      isMouseDown = false
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const panelStyle: CSSProperties = {
    width: `${w}px`,
    height: h ? `${h}px` : 'auto',
    left: `${x}px`,
    top: `${y}px`,
  }

  return (
    <div
      ref={panelRef}
      className={classNames(styles['moveable-panel'], className)}
      style={panelStyle}
    >
      {title ? (
        <>
          <div className={styles.header} onMouseDown={startMove}>
            <div className={styles.title}>{title}</div>
            {onClose && (
              <div className={styles['close-btn']} onMouseDown={(e) => e.stopPropagation()} onClick={onClose}>
                <Icon icon="ri:close-line" />
              </div>
            )}
          </div>
          <div className={styles.content} style={contentStyle}>
            {children}
          </div>
        </>
      ) : (
        <div className={styles.content} style={contentStyle} onMouseDown={startMove}>
          {children}
        </div>
      )}

      {resizeable && <div className={styles.resizer} onMouseDown={startResize} />}
    </div>
  )
}
