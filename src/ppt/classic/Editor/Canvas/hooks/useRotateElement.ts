import { useMemoizedFn } from 'ahooks'
import { useEffect, useRef } from 'react'

import { useSlidesStore } from '@/ppt/store'
import type {
  PPTElement,
  PPTLineElement,
  PPTVideoElement,
  PPTAudioElement,
  PPTChartElement,
} from '@/ppt/core'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useShallow } from 'zustand/react/shallow'

/**
 * 计算给定坐标到原点连线的角度（deg）
 */
const getAngleFromCoordinate = (x: number, y: number) => {
  const radian = Math.atan2(x, y)
  return (180 / Math.PI) * radian
}

type RotatableElement = Exclude<
  PPTElement,
  PPTChartElement | PPTLineElement | PPTVideoElement | PPTAudioElement
>

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
  return !('pageX' in e)
}

function getPageXY(e: MouseEvent | TouchEvent) {
  if (!isTouchEvent(e)) return { x: e.pageX, y: e.pageY }
  const t = e.changedTouches?.[0]
  return t ? { x: t.pageX, y: t.pageY } : null
}

export default function useRotateElement(params: {
  elementList: PPTElement[]
  setElementList: SetState<PPTElement[]>
  viewportRef: React.RefObject<HTMLElement | null>
  canvasScale: number
}) {
  const { elementList, setElementList, viewportRef, canvasScale } = params

  const updateSlide = useSlidesStore(useShallow((state) => state.updateSlide))
  const { addHistorySnapshot } = useHistorySnapshot()

  // ===== refs：保证 mouseup 读到的是最新角度 =====
  const isMouseDownRef = useRef(false)
  const angleRef = useRef(0)
  const latestListRef = useRef<PPTElement[]>(elementList)

  useEffect(() => {
    latestListRef.current = elementList
  }, [elementList])

  const rotateElement = useMemoizedFn(
    (e: MouseEvent | TouchEvent, element: RotatableElement) => {
      const start = getPageXY(e)
      if (!start) return

      const viewportEl = viewportRef.current
      if (!viewportEl) return

      isMouseDownRef.current = true

      const elOriginRotate = element.rotate || 0
      angleRef.current = elOriginRotate

      const elLeft = element.left
      const elTop = element.top
      const elWidth = element.width
      const elHeight = element.height

      // 元素中心点（旋转中心）
      const centerX = elLeft + elWidth / 2
      const centerY = elTop + elHeight / 2

      const viewportRect = viewportEl.getBoundingClientRect()
      const sorptionRange = 5

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!isMouseDownRef.current) return

        const cur = getPageXY(ev)
        if (!cur) return

        // 转成画布坐标
        const mouseX = (cur.x - viewportRect.left) / canvasScale
        const mouseY = (cur.y - viewportRect.top) / canvasScale

        const x = mouseX - centerX
        const y = centerY - mouseY

        let angle = getAngleFromCoordinate(x, y)

        // 吸附到 45° 的倍数
        if (Math.abs(angle) <= sorptionRange) angle = 0
        else if (angle > 0 && Math.abs(angle - 45) <= sorptionRange) angle = 45
        else if (angle < 0 && Math.abs(angle + 45) <= sorptionRange) angle = -45
        else if (angle > 0 && Math.abs(angle - 90) <= sorptionRange) angle = 90
        else if (angle < 0 && Math.abs(angle + 90) <= sorptionRange) angle = -90
        else if (angle > 0 && Math.abs(angle - 135) <= sorptionRange) angle = 135
        else if (angle < 0 && Math.abs(angle + 135) <= sorptionRange) angle = -135
        else if (angle > 0 && Math.abs(angle - 180) <= sorptionRange) angle = 180
        else if (angle < 0 && Math.abs(angle + 180) <= sorptionRange) angle = -180

        angleRef.current = angle

        // 实时更新（仅改目标元素）
        setElementList((prev) => {
          const next = prev.map((el) =>
            el.id === element.id ? { ...el, rotate: angle } : el,
          )
          latestListRef.current = next
          return next
        })
      }

      const onUp = () => {
        isMouseDownRef.current = false

        window.removeEventListener('mousemove', onMove as any)
        window.removeEventListener('mouseup', onUp as any)
        window.removeEventListener('touchmove', onMove as any)
        window.removeEventListener('touchend', onUp as any)

        // 角度没变，不落盘
        if (elOriginRotate === angleRef.current) return

        const latest = latestListRef.current
        updateSlide({ elements: latest })
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

  return { rotateElement }
}
