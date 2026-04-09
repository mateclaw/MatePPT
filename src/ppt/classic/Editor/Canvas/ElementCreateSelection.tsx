import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useMainStore, useKeyboardStore } from '@/ppt/store'
import type { CreateElementSelectionData } from '@/ppt/types/edit'
import styles from './ElementCreateSelection.module.scss'

interface ElementCreateSelectionProps {
  onCreated: (data: CreateElementSelectionData) => void
}

const MIN_SIZE = 30
const DEFAULT_SIZE = 200

export default function ElementCreateSelection({ onCreated }: ElementCreateSelectionProps) {
  const creatingElement = useMainStore((state) => state.creatingElement)
  const setCreatingElement = useMainStore((state) => state.setCreatingElement)
  const ctrlOrShiftKeyActive = useKeyboardStore(
    (state) => state.ctrlKeyState || state.shiftKeyState,
  )

  const selectionRef = useRef<HTMLDivElement | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })

  const [start, setStart] = useState<[number, number] | null>(null)
  const [end, setEnd] = useState<[number, number] | null>(null)

  const startRef = useRef<[number, number] | null>(null)
  const endRef = useRef<[number, number] | null>(null)

  useLayoutEffect(() => {
    if (!selectionRef.current) return
    const { x, y } = selectionRef.current.getBoundingClientRect()
    offsetRef.current = { x, y }
  }, [])

  const updateStart = useCallback((value: [number, number] | null) => {
    startRef.current = value
    setStart(value)
  }, [])

  const updateEnd = useCallback((value: [number, number] | null) => {
    endRef.current = value
    setEnd(value)
  }, [])

  const createSelection = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!creatingElement) return

      let isMouseDown = true
      const startPageX = e.pageX
      const startPageY = e.pageY
      updateStart([startPageX, startPageY])

      const onMove = (ev: MouseEvent) => {
        if (!creatingElement || !isMouseDown) return

        let currentPageX = ev.pageX
        let currentPageY = ev.pageY

        if (ctrlOrShiftKeyActive) {
          const moveX = currentPageX - startPageX
          const moveY = currentPageY - startPageY
          const absX = Math.abs(moveX)
          const absY = Math.abs(moveY)

          if (creatingElement.type === 'shape') {
            const isOpposite =
              (moveY > 0 && moveX < 0) || (moveY < 0 && moveX > 0)

            if (absX > absY) {
              currentPageY = isOpposite ? startPageY - moveX : startPageY + moveX
            } else {
              currentPageX = isOpposite ? startPageX - moveY : startPageX + moveY
            }
          } else if (creatingElement.type === 'line') {
            if (absX > absY) currentPageY = startPageY
            else currentPageX = startPageX
          }
        }

        updateEnd([currentPageX, currentPageY])
      }

      const onUp = (ev: MouseEvent) => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)

        if (ev.button === 2) {
          setTimeout(() => setCreatingElement(null), 0)
          return
        }

        isMouseDown = false

        const endPageX = ev.pageX
        const endPageY = ev.pageY

        if (
          creatingElement.type === 'line' &&
          (Math.abs(endPageX - startPageX) >= MIN_SIZE ||
            Math.abs(endPageY - startPageY) >= MIN_SIZE)
        ) {
          onCreated({ start: startRef.current!, end: endRef.current! })
        } else if (
          creatingElement.type !== 'line' &&
          Math.abs(endPageX - startPageX) >= MIN_SIZE &&
          Math.abs(endPageY - startPageY) >= MIN_SIZE
        ) {
          onCreated({ start: startRef.current!, end: endRef.current! })
        } else {
          const minX = Math.min(endPageX, startPageX)
          const minY = Math.min(endPageY, startPageY)
          const maxX = Math.max(endPageX, startPageX)
          const maxY = Math.max(endPageY, startPageY)
          const offsetX = maxX - minX >= MIN_SIZE ? maxX - minX : DEFAULT_SIZE
          const offsetY = maxY - minY >= MIN_SIZE ? maxY - minY : DEFAULT_SIZE
          onCreated({
            start: [minX, minY],
            end: [minX + offsetX, minY + offsetY],
          })
        }
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [creatingElement, ctrlOrShiftKeyActive, onCreated, setCreatingElement, updateEnd, updateStart],
  )

  const lineData = useMemo(() => {
    if (!start || !end) return null
    if (!creatingElement || creatingElement.type !== 'line') return null

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const svgWidth = maxX - minX >= 24 ? maxX - minX : 24
    const svgHeight = maxY - minY >= 24 ? maxY - minY : 24

    const startSX = startX === minX ? 0 : maxX - minX
    const startSY = startY === minY ? 0 : maxY - minY
    const endSX = endX === minX ? 0 : maxX - minX
    const endSY = endY === minY ? 0 : maxY - minY

    const path = `M${startSX}, ${startSY} L${endSX}, ${endSY}`

    return {
      svgWidth,
      svgHeight,
      path,
    }
  }, [start, end, creatingElement])

  const position = useMemo(() => {
    if (!start || !end) return {}

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const width = maxX - minX
    const height = maxY - minY

    return {
      left: `${minX - offsetRef.current.x}px`,
      top: `${minY - offsetRef.current.y}px`,
      width: `${width}px`,
      height: `${height}px`,
    }
  }, [start, end])

  return (
    <div
      className={styles['element-create-selection']}
      ref={selectionRef}
      onMouseDown={(e) => {
        e.stopPropagation()
        createSelection(e)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {start && end && (
        <div
          className={`${styles.selection} ${
            creatingElement?.type && styles[creatingElement.type] ? styles[creatingElement.type] : ''
          }`}
          style={position}
        >
          {creatingElement?.type === 'line' && lineData && (
            <svg overflow="visible" width={lineData.svgWidth} height={lineData.svgHeight}>
              <path d={lineData.path} stroke="#d14424" fill="none" strokeWidth="2" />
            </svg>
          )}
        </div>
      )}
    </div>
  )
}
