// useMoveShapeKeypoint.ts (React)

import { useEffect, useRef } from 'react'
import { useMemoizedFn } from 'ahooks'

import { useSlidesStore } from '@/ppt/store'
import type { PPTElement, PPTShapeElement } from '@/ppt/core'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { SHAPE_PATH_FORMULAS } from '@/ppt/configs/shapes'

interface ShapePathData {
  baseSize: number
  originPos: number
  min: number
  max: number
  relative: string
}

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
  return !('pageX' in e)
}

function getPageXY(e: MouseEvent | TouchEvent) {
  if (!isTouchEvent(e)) return { x: e.pageX, y: e.pageY }
  const t = e.changedTouches?.[0]
  return t ? { x: t.pageX, y: t.pageY } : null
}

export default function useMoveShapeKeypoint(params: {
  elementList: PPTElement[]
  setElementList: SetState<PPTElement[]>
  canvasScale: number
}) {
  const { elementList, setElementList, canvasScale } = params

  const slidesStore = useSlidesStore()
  const { addHistorySnapshot } = useHistorySnapshot()
  const latestElementsRef = useRef(elementList)

  useEffect(() => {
    latestElementsRef.current = elementList
  }, [elementList])

  const moveShapeKeypoint = useMemoizedFn(
    (e: MouseEvent | TouchEvent, element: PPTShapeElement, index = 0) => {
      const start = getPageXY(e)
      if (!start) return

      let isMouseDown = true

      const originKeypoints = element.keypoints!

      const pathFormula = SHAPE_PATH_FORMULAS[element.pathFormula!]
      let shapePathData: ShapePathData | null = null

      if ('editable' in pathFormula && pathFormula.editable) {
        const getBaseSize = pathFormula.getBaseSize![index]
        const range = pathFormula.range![index]
        const relative = pathFormula.relative![index]
        const keypoint = originKeypoints[index]

        const baseSize = getBaseSize(element.width, element.height)
        const originPos = baseSize * keypoint
        const [min, max] = range

        shapePathData = { baseSize, originPos, min, max, relative }
      }

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!isMouseDown) return

        const cur = getPageXY(ev)
        if (!cur) return

        const moveX = (cur.x - start.x) / canvasScale
        const moveY = (cur.y - start.y) / canvasScale

        const nextElements = latestElementsRef.current.map((el) => {
          if (el.id !== element.id || !shapePathData) return el

          const { baseSize, originPos, min, max, relative } = shapePathData
          const shapeElement = el as PPTShapeElement

          let keypoint = 0

          if (relative === 'center') keypoint = (originPos - moveX * 2) / baseSize
          else if (relative === 'left') keypoint = (originPos + moveX) / baseSize
          else if (relative === 'right') keypoint = (originPos - moveX) / baseSize
          else if (relative === 'top') keypoint = (originPos + moveY) / baseSize
          else if (relative === 'bottom') keypoint = (originPos - moveY) / baseSize
          else if (relative === 'left_bottom') keypoint = (originPos + moveX) / baseSize
          else if (relative === 'right_bottom') keypoint = (originPos - moveX) / baseSize
          else if (relative === 'top_right') keypoint = (originPos + moveY) / baseSize
          else if (relative === 'bottom_right') keypoint = (originPos - moveY) / baseSize

          if (keypoint < min) keypoint = min
          if (keypoint > max) keypoint = max

          let keypoints: number[]
          if (Array.isArray(originKeypoints)) {
            keypoints = [...originKeypoints]
            keypoints[index] = keypoint
          } else {
            keypoints = [keypoint]
          }

          return {
            ...el,
            keypoints,
            path: pathFormula.formula(shapeElement.width, shapeElement.height, keypoints),
          }
        })

        latestElementsRef.current = nextElements
        setElementList(nextElements)
      }

      const onUp = (ev: MouseEvent | TouchEvent) => {
        isMouseDown = false

        window.removeEventListener('mousemove', onMove as any)
        window.removeEventListener('mouseup', onUp as any)
        window.removeEventListener('touchmove', onMove as any)
        window.removeEventListener('touchend', onUp as any)

        const end = getPageXY(ev)
        if (!end) return

        if (start.x === end.x && start.y === end.y) return

        const latest = latestElementsRef.current
        slidesStore.updateSlide({ elements: latest })
        addHistorySnapshot()
      }

      if (isTouchEvent(e)) {
        window.addEventListener('touchmove', onMove as any, { passive: false })
        window.addEventListener('touchend', onUp as any)
      } else {
        window.addEventListener('mousemove', onMove as any)
        window.addEventListener('mouseup', onUp as any)
      }
    },
  )

  return { moveShapeKeypoint }
}
