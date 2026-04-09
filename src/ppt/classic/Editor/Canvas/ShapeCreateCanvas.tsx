import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { App } from 'antd'
import { useKeyboardStore, useMainStore, useSlidesStore } from '@/ppt/store'
import type { CreateCustomShapeData } from '@/ppt/types/edit'
import { KEYS } from '@/ppt/configs/hotkey'
import styles from './ShapeCreateCanvas.module.scss'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'

interface ShapeCreateCanvasProps {
  onCreated: (data: CreateCustomShapeData) => void
}

export default function ShapeCreateCanvas({ onCreated }: ShapeCreateCanvasProps) {
  const { message } = App.useApp()

  const setCreatingCustomShape = useMainStore((state) => state.setCreatingCustomShape)
  const ctrlOrShiftKeyActive = useKeyboardStore(
    (state) => state.ctrlKeyState || state.shiftKeyState,
  )
  const theme = useSlidesStore((state) => state.theme)

  const shapeCanvasRef = useRef<HTMLDivElement | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const isMouseDownRef = useRef(false)

  const [mousePosition, setMousePosition] = useState<[number, number] | null>(null)
  const [points, setPoints] = useState<[number, number][]>([])
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (!shapeCanvasRef.current) return
    const { x, y } = shapeCanvasRef.current.getBoundingClientRect()
    offsetRef.current = { x, y }
  }, [])

  const getPoint = useCallback(
    (e: MouseEvent, custom = false) => {
      let pageX = e.pageX - offsetRef.current.x
      let pageY = e.pageY - offsetRef.current.y

      if (custom) return { pageX, pageY }

      if (ctrlOrShiftKeyActive && points.length) {
        const [lastPointX, lastPointY] = points[points.length - 1]
        if (Math.abs(lastPointX - pageX) - Math.abs(lastPointY - pageY) > 0) {
          pageY = lastPointY
        } else {
          pageX = lastPointX
        }
      }
      return { pageX, pageY }
    },
    [ctrlOrShiftKeyActive, points],
  )

  const updateMousePosition = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMouseDownRef.current) {
        const { pageX, pageY } = getPoint(e.nativeEvent, true)
        setPoints((prev) => [...prev, [pageX, pageY]])
        setMousePosition(null)
        return
      }

      const { pageX, pageY } = getPoint(e.nativeEvent)
      setMousePosition([pageX, pageY])

      if (points.length >= 2) {
        const [firstPointX, firstPointY] = points[0]
        if (Math.abs(firstPointX - pageX) < 5 && Math.abs(firstPointY - pageY) < 5) {
          setClosed(true)
        } else {
          setClosed(false)
        }
      } else {
        setClosed(false)
      }
    },
    [getPoint, points],
  )

  const path = useMemo(() => {
    let d = ''
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i]
      if (i === 0) d += `M ${point[0]} ${point[1]} `
      else d += `L ${point[0]} ${point[1]} `
    }
    if (points.length && mousePosition) {
      d += `L ${mousePosition[0]} ${mousePosition[1]}`
    }
    return d
  }, [points, mousePosition])

  const getCreateData = useCallback(
    (close = true) => {
      const xList = points.map((item) => item[0])
      const yList = points.map((item) => item[1])
      const minX = Math.min(...xList)
      const minY = Math.min(...yList)
      const maxX = Math.max(...xList)
      const maxY = Math.max(...yList)

      const formatedPoints = points.map((point) => [point[0] - minX, point[1] - minY])

      let pathStr = ''
      for (let i = 0; i < formatedPoints.length; i += 1) {
        const point = formatedPoints[i]
        if (i === 0) pathStr += `M ${point[0]} ${point[1]} `
        else pathStr += `L ${point[0]} ${point[1]} `
      }
      if (close) pathStr += 'Z'

      const start: [number, number] = [minX + offsetRef.current.x, minY + offsetRef.current.y]
      const end: [number, number] = [maxX + offsetRef.current.x, maxY + offsetRef.current.y]
      const viewBox: [number, number] = [maxX - minX, maxY - minY]

      return { start, end, path: pathStr, viewBox }
    },
    [points],
  )

  const close = useCallback(() => {
    setCreatingCustomShape(false)
  }, [setCreatingCustomShape])

  const create = useCallback(() => {
    const color = PPTColor.ofScheme('lt1', theme.themeColors.lt1)
    onCreated({
      ...getCreateData(false),
      fill: color,
      outline: {
        width: 2,
        color: PPTColor.ofScheme('dk1', theme.themeColors.dk1),
        style: 'solid',
      },
    })
    close()
  }, [close, getCreateData, onCreated, theme.themeColors])

  const addPoint = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { pageX, pageY } = getPoint(e.nativeEvent)
      isMouseDownRef.current = true

      if (closed) {
        onCreated(getCreateData())
      } else {
        setPoints((prev) => [...prev, [pageX, pageY]])
      }

      const onUp = () => {
        isMouseDownRef.current = false
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mouseup', onUp)
    },
    [closed, getCreateData, getPoint, onCreated],
  )

  useEffect(() => {
    message.success(
      '点击绘制任意形状，首尾闭合完成绘制，按 ESC 键或鼠标右键取消，按 ENTER 键提前完成',
      0,
    )

    const keydownListener = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (key === KEYS.ESC) close()
      if (key === KEYS.ENTER) create()
    }

    document.addEventListener('keydown', keydownListener)
    return () => {
      document.removeEventListener('keydown', keydownListener)
      message.destroy()
    }
  }, [close, create, message])

  return (
    <div
      className={styles['shape-create-canvas']}
      ref={shapeCanvasRef}
      onMouseDown={(e) => {
        e.stopPropagation()
        addPoint(e)
      }}
      onMouseMove={updateMousePosition}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        close()
      }}
    >
      <svg overflow="visible">
        <path
          d={path}
          stroke="#d14424"
          fill={closed ? 'rgba(226, 83, 77, 0.15)' : 'none'}
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}
