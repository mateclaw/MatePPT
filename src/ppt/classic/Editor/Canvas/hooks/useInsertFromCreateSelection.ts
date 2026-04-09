// useCreateSelection.ts (React)

import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '@/ppt/store'
import type { CreateElementSelectionData } from '@/ppt/types/edit'
import useCreateElement from '@/ppt/hooks/useCreateElement'

type RectPosition = { left: number; top: number; width: number; height: number }
type LinePosition = { left: number; top: number; start: [number, number]; end: [number, number] }

export default function useCreateSelection(viewportRef: React.RefObject<HTMLElement | null>) {
  const { canvasScale, creatingElement, setCreatingElement } = useMainStore(
    useShallow((s) => ({
      canvasScale: s.canvasScale,
      creatingElement: s.creatingElement,
      setCreatingElement: s.setCreatingElement, // 你 store 里如果叫 mainStore.setCreatingElement，就对应成 action
    })),
  )

  const { createTextElement, createShapeElement, createLineElement } = useCreateElement()

  // 通过鼠标框选起点和终点，计算选区 left/top/width/height（画布坐标系）
  const formatCreateSelection = useMemoizedFn(
    (selectionData: CreateElementSelectionData): RectPosition | undefined => {
      const { start, end } = selectionData
      const viewportEl = viewportRef.current
      if (!viewportEl) return

      const viewportRect = viewportEl.getBoundingClientRect()

      const [startX, startY] = start
      const [endX, endY] = end
      const minX = Math.min(startX, endX)
      const maxX = Math.max(startX, endX)
      const minY = Math.min(startY, endY)
      const maxY = Math.max(startY, endY)

      const left = (minX - viewportRect.x) / canvasScale
      const top = (minY - viewportRect.y) / canvasScale
      const width = (maxX - minX) / canvasScale
      const height = (maxY - minY) / canvasScale

      return { left, top, width, height }
    },
  )

  // 线条：计算 left/top + start/end（相对线条自身 left/top 的坐标）
  const formatCreateSelectionForLine = useMemoizedFn(
    (selectionData: CreateElementSelectionData): LinePosition | undefined => {
      const { start, end } = selectionData
      const viewportEl = viewportRef.current
      if (!viewportEl) return

      const viewportRect = viewportEl.getBoundingClientRect()

      const [startX, startY] = start
      const [endX, endY] = end
      const minX = Math.min(startX, endX)
      const maxX = Math.max(startX, endX)
      const minY = Math.min(startY, endY)
      const maxY = Math.max(startY, endY)

      const left = (minX - viewportRect.x) / canvasScale
      const top = (minY - viewportRect.y) / canvasScale
      const width = (maxX - minX) / canvasScale
      const height = (maxY - minY) / canvasScale

      const _start: [number, number] = [startX === minX ? 0 : width, startY === minY ? 0 : height]
      const _end: [number, number] = [endX === minX ? 0 : width, endY === minY ? 0 : height]

      return { left, top, start: _start, end: _end }
    },
  )

  // 根据选区插入元素
  const insertElementFromCreateSelection = useMemoizedFn((selectionData: CreateElementSelectionData) => {
    if (!creatingElement) return

    const type = creatingElement.type
    if (type === 'text') {
      const position = formatCreateSelection(selectionData)
      if (position) createTextElement(position, { vertical: creatingElement.vertical })
    } else if (type === 'shape') {
      const position = formatCreateSelection(selectionData)
      if (position) createShapeElement(position, creatingElement.data)
    } else if (type === 'line') {
      const position = formatCreateSelectionForLine(selectionData)
      if (position) createLineElement(position, creatingElement.data)
    }

    setCreatingElement(null)
  })

  return {
    formatCreateSelection,
    insertElementFromCreateSelection,
  }
}
