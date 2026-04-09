// useDragLineElement.ts (React)
// 一个你后面很可能会遇到的坑（提前说）

// 你现在用的是 window.mousemove + setElementList，mousemove 会非常频繁。
// 如果拖拽时你发现掉帧，可以做两层优化（我可以在你需要时直接给版本）：

// requestAnimationFrame 合帧：mousemove 只记录最新坐标，真正 setState 在 rAF 内执行

// setElementList 里尽量只改目标元素，避免 map 大数组带来的 GC 压力（可以按 id 建索引结构）


import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useKeyboardStore, useMainStore, useSlidesStore } from '@/ppt/store'
import type { PPTElement, PPTLineElement } from '@/ppt/core'
import { OperateLineHandlers } from '@/ppt/types/edit'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'

interface AdsorptionPoint {
  x: number
  y: number
}

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export default function useDragLineElement(params: {
  elementList: PPTElement[]
  setElementList: SetState<PPTElement[]>
}) {
  const { elementList, setElementList } = params

  const slidesStore = useSlidesStore()

  const { canvasScale } = useMainStore(useShallow((s) => ({ canvasScale: s.canvasScale })))
  const { ctrlOrShiftKeyActive } = useKeyboardStore(
    useShallow((s) => ({ ctrlOrShiftKeyActive: s.ctrlKeyState || s.shiftKeyState })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()

  const dragLineElement = useMemoizedFn(
    (e: MouseEvent, element: PPTLineElement, command: OperateLineHandlers) => {
      let isMouseDown = true
      const sorptionRange = 8

      const startPageX = e.pageX
      const startPageY = e.pageY

      const adsorptionPoints: AdsorptionPoint[] = []

      // 获取所有线条以外的未旋转的元素的8个缩放点作为吸附位置
      for (let i = 0; i < elementList.length; i++) {
        const _element = elementList[i]
        if (_element.type === 'line' || (_element as any).rotate) continue

        const left = _element.left
        const top = _element.top
        const width = _element.width
        const height = (_element as any).height

        const right = left + width
        const bottom = top + height

        // 保持你原逻辑（centerX/centerY 命名反了也照做）
        const centerX = top + height / 2
        const centerY = left + width / 2

        const topPoint = { x: centerY, y: top }
        const bottomPoint = { x: centerY, y: bottom }
        const leftPoint = { x: left, y: centerX }
        const rightPoint = { x: right, y: centerX }

        const leftTopPoint = { x: left, y: top }
        const rightTopPoint = { x: right, y: top }
        const leftBottomPoint = { x: left, y: bottom }
        const rightBottomPoint = { x: right, y: bottom }

        adsorptionPoints.push(
          topPoint,
          bottomPoint,
          leftPoint,
          rightPoint,
          leftTopPoint,
          rightTopPoint,
          leftBottomPoint,
          rightBottomPoint,
        )
      }

      const onMove = (ev: MouseEvent) => {
        if (!isMouseDown) return

        const currentPageX = ev.pageX
        const currentPageY = ev.pageY

        const moveX = (currentPageX - startPageX) / canvasScale
        const moveY = (currentPageY - startPageY) / canvasScale

        // 线条起点和终点在编辑区域中的位置（绝对坐标）
        let startX = element.left + element.start[0]
        let startY = element.top + element.start[1]
        let endX = element.left + element.end[0]
        let endY = element.top + element.end[1]

        const mid = element.broken || element.broken2 || element.curve || [0, 0]
        let midX = element.left + mid[0]
        let midY = element.top + mid[1]

        const [c1, c2] = element.cubic || [
          [0, 0],
          [0, 0],
        ]
        let c1X = element.left + c1[0]
        let c1Y = element.top + c1[1]
        let c2X = element.left + c2[0]
        let c2Y = element.top + c2[1]

        // 拖拽起点/终点/控制点
        if (command === OperateLineHandlers.START) {
          startX += moveX
          startY += moveY

          if (Math.abs(startX - endX) < sorptionRange) startX = endX
          if (Math.abs(startY - endY) < sorptionRange) startY = endY

          for (const { x, y } of adsorptionPoints) {
            if (Math.abs(x - startX) < sorptionRange && Math.abs(y - startY) < sorptionRange) {
              startX = x
              startY = y
              break
            }
          }
        } else if (command === OperateLineHandlers.END) {
          endX += moveX
          endY += moveY

          if (Math.abs(startX - endX) < sorptionRange) endX = startX
          if (Math.abs(startY - endY) < sorptionRange) endY = startY

          for (const { x, y } of adsorptionPoints) {
            if (Math.abs(x - endX) < sorptionRange && Math.abs(y - endY) < sorptionRange) {
              endX = x
              endY = y
              break
            }
          }
        } else if (command === OperateLineHandlers.C) {
          midX += moveX
          midY += moveY

          if (Math.abs(midX - startX) < sorptionRange) midX = startX
          if (Math.abs(midY - startY) < sorptionRange) midY = startY
          if (Math.abs(midX - endX) < sorptionRange) midX = endX
          if (Math.abs(midY - endY) < sorptionRange) midY = endY

          if (
            Math.abs(midX - (startX + endX) / 2) < sorptionRange &&
            Math.abs(midY - (startY + endY) / 2) < sorptionRange
          ) {
            midX = (startX + endX) / 2
            midY = (startY + endY) / 2
          }
        } else if (command === OperateLineHandlers.C1) {
          c1X += moveX
          c1Y += moveY

          if (Math.abs(c1X - startX) < sorptionRange) c1X = startX
          if (Math.abs(c1Y - startY) < sorptionRange) c1Y = startY
          if (Math.abs(c1X - endX) < sorptionRange) c1X = endX
          if (Math.abs(c1Y - endY) < sorptionRange) c1Y = endY
        } else if (command === OperateLineHandlers.C2) {
          c2X += moveX
          c2Y += moveY

          if (Math.abs(c2X - startX) < sorptionRange) c2X = startX
          if (Math.abs(c2Y - startY) < sorptionRange) c2Y = startY
          if (Math.abs(c2X - endX) < sorptionRange) c2X = endX
          if (Math.abs(c2Y - endY) < sorptionRange) c2Y = endY
        }

        // 将绝对坐标转回 line 元素自身坐标系（left/top + start/end）
        const minX = Math.min(startX, endX)
        const minY = Math.min(startY, endY)
        const maxX = Math.max(startX, endX)
        const maxY = Math.max(startY, endY)

        const start: [number, number] = [0, 0]
        const end: [number, number] = [maxX - minX, maxY - minY]

        if (startX > endX) {
          start[0] = maxX - minX
          end[0] = 0
        }
        if (startY > endY) {
          start[1] = maxY - minY
          end[1] = 0
        }

        setElementList((prev) =>
          prev.map((el) => {
            if (el.id !== element.id) return el

            const base: PPTLineElement = {
              ...(el as PPTLineElement),
              left: minX,
              top: minY,
              start,
              end,
            }

            // START / END 拖拽时，可能要同步 mid / cubic
            if (command === OperateLineHandlers.START || command === OperateLineHandlers.END) {
              if (ctrlOrShiftKeyActive) {
                if (element.broken) base.broken = [midX - minX, midY - minY]
                if (element.curve) base.curve = [midX - minX, midY - minY]
                if (element.cubic) base.cubic = [[c1X - minX, c1Y - minY], [c2X - minX, c2Y - minY]]
              } else {
                const cx = (start[0] + end[0]) / 2
                const cy = (start[1] + end[1]) / 2
                if (element.broken) base.broken = [cx, cy]
                if (element.curve) base.curve = [cx, cy]
                if (element.cubic) base.cubic = [[cx, cy], [cx, cy]]
              }
              if (element.broken2) base.broken2 = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
            } else if (command === OperateLineHandlers.C) {
              if (element.broken) base.broken = [midX - minX, midY - minY]
              if (element.curve) base.curve = [midX - minX, midY - minY]
              if (element.broken2) {
                // broken2 只改一个维度，保持原逻辑
                if (maxX - minX >= maxY - minY) base.broken2 = [midX - minX, base.broken2![1]]
                else base.broken2 = [base.broken2![0], midY - minY]
              }
            } else {
              if (element.cubic) base.cubic = [[c1X - minX, c1Y - minY], [c2X - minX, c2Y - minY]]
            }

            return base
          }),
        )
      }

      const onUp = (ev: MouseEvent) => {
        isMouseDown = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)

        const currentPageX = ev.pageX
        const currentPageY = ev.pageY
        if (startPageX === currentPageX && startPageY === currentPageY) return

        // 用函数式 setState 拿到最新 elements 再落盘
        setElementList((latest) => {
          slidesStore.updateSlide({ elements: latest })
          addHistorySnapshot()
          return latest
        })
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
  )

  return { dragLineElement }
}
