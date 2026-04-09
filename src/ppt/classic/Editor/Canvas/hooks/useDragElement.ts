// useDragElement.ts (React)
// 等价迁移自你提供的 Vue composable：拖拽元素 + 吸附对齐线 + 更新 slide + 历史快照
// 你这段 Vue 代码里有个“潜在 bug”，我保留行为但建议你确认

// 你原代码里：

// const centerX = top + height / 2
// const centerY = left + width / 2


// 直觉上应该是：

// centerX = left + width / 2

// centerY = top + height / 2

// 但为了迁移“完全一致”，我在 React 版本里 保持原写法。
// 如果你确认这是笔误，我可以帮你把 Vue 和 React 两边一起修正，并验证吸附线是否符合预期。
import { useMemoizedFn } from 'ahooks'
import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cloneDeep } from 'lodash'

import { useMainStore, useSlidesStore, useKeyboardStore } from '@/ppt/store'
import type { PPTElement } from '@/ppt/core'
import type { AlignmentLineProps } from '@/ppt/types/edit'
import { getRectRotatedRange, uniqAlignLines, type AlignLine } from '@/ppt/utils/element'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
  return !('pageX' in e)
}

function getPageXY(e: MouseEvent | TouchEvent) {
  if (!isTouchEvent(e)) return { x: e.pageX, y: e.pageY }
  const t = e.changedTouches?.[0]
  return t ? { x: t.pageX, y: t.pageY } : null
}

function getElementBox(el: PPTElement) {
  // line 不参与“被吸附对象”的收集（原逻辑就是 continue），但这里仍然给个通用 box 计算函数，
  // 方便多选时统一算范围
  const left = el.left
  const top = el.top
  const width = el.width
  const height = ('height' in el && el.height) ? el.height : 0
  const rotate = ('rotate' in el && el.rotate) ? el.rotate : 0

  if (rotate) {
    const { xRange, yRange } = getRectRotatedRange({ left, top, width, height, rotate })
    return {
      minX: xRange[0],
      maxX: xRange[1],
      minY: yRange[0],
      maxY: yRange[1],
    }
  }

  if (el.type === 'line') {
    return {
      minX: left,
      maxX: left + Math.max(el.start[0], el.end[0]),
      minY: top,
      maxY: top + Math.max(el.start[1], el.end[1]),
    }
  }

  return {
    minX: left,
    maxX: left + width,
    minY: top,
    maxY: top + height,
  }
}

function buildAlignLines(params: {
  elementList: PPTElement[]
  activeElementIdList: string[]
  isActiveGroupElement: boolean
  operatingElementId: string
  edgeWidth: number
  edgeHeight: number
}) {
  const { elementList, activeElementIdList, isActiveGroupElement, operatingElementId, edgeWidth, edgeHeight } = params

  let horizontalLines: AlignLine[] = []
  let verticalLines: AlignLine[] = []

  for (const el of elementList) {
    if (el.type === 'line') continue
    if (isActiveGroupElement && el.id === operatingElementId) continue
    if (!isActiveGroupElement && activeElementIdList.includes(el.id)) continue

    // 注意：这里原 Vue 代码对 rotate 的元素先算旋转包围盒，再构造线
    // 这段我保持一致
    let left: number, top: number, width: number, height: number
    if ('rotate' in el && el.rotate) {
      const { xRange, yRange } = getRectRotatedRange({
        left: el.left,
        top: el.top,
        width: el.width,
        height: el.height,
        rotate: el.rotate,
      })
      left = xRange[0]
      top = yRange[0]
      width = xRange[1] - xRange[0]
      height = yRange[1] - yRange[0]
    } else {
      left = el.left
      top = el.top
      width = el.width
      height = el.height
    }

    const right = left + width
    const bottom = top + height

    // 注意：你原代码这里命名有点反（centerX 用 top + height/2，centerY 用 left + width/2）
    // 为了“行为完全一致”，我保持原写法不改
    const centerX = top + height / 2
    const centerY = left + width / 2

    horizontalLines.push(
      { value: top, range: [left, right] },
      { value: bottom, range: [left, right] },
      { value: centerX, range: [left, right] },
    )
    verticalLines.push(
      { value: left, range: [top, bottom] },
      { value: right, range: [top, bottom] },
      { value: centerY, range: [top, bottom] },
    )
  }

  // 画布边界 + 中心线
  horizontalLines.push(
    { value: 0, range: [0, edgeWidth] },
    { value: edgeHeight, range: [0, edgeWidth] },
    { value: edgeHeight / 2, range: [0, edgeWidth] },
  )
  verticalLines.push(
    { value: 0, range: [0, edgeHeight] },
    { value: edgeWidth, range: [0, edgeHeight] },
    { value: edgeWidth / 2, range: [0, edgeHeight] },
  )

  horizontalLines = uniqAlignLines(horizontalLines)
  verticalLines = uniqAlignLines(verticalLines)

  return { horizontalLines, verticalLines }
}

export default function useDragElement(params: {
  elementList: PPTElement[]
  setElementList: SetState<PPTElement[]>
  alignmentLines: AlignmentLineProps[]
  setAlignmentLines: SetState<AlignmentLineProps[]>
  canvasScale: number
}) {
  const { elementList, setElementList, setAlignmentLines, canvasScale } = params
  const latestListRef = useRef<PPTElement[]>(elementList)

  useEffect(() => {
    latestListRef.current = elementList
  }, [elementList])

  const slidesStore = useSlidesStore()
  const { viewportRatio, viewportSize } = useSlidesStore(
    useShallow((s) => ({
      viewportRatio: s.viewportRatio,
      viewportSize: s.viewportSize,
    })),
  )
  const { activeElementIdList, activeGroupElementId } = useMainStore(
    useShallow((s) => ({
      activeElementIdList: s.activeElementIdList,
      activeGroupElementId: s.activeGroupElementId,
    })),
  )
  const { shiftKeyState } = useKeyboardStore(useShallow((s) => ({ shiftKeyState: s.shiftKeyState })))

  const { addHistorySnapshot } = useHistorySnapshot()

  const dragElement = useMemoizedFn((e: MouseEvent | TouchEvent, element: PPTElement) => {
    const start = getPageXY(e)
    if (!start) return

    // 只允许拖拽“被选中”的元素
    if (!activeElementIdList.includes(element.id)) return

    const edgeWidth = viewportSize
    const edgeHeight = viewportSize * viewportRatio
    const sorptionRange = 5

    let isMouseDown = true
    let isMisoperation: boolean | null = null

    const isActiveGroupElement = element.id === activeGroupElementId

    // 深拷贝一份“起始状态”，供多选整体范围计算用
    const originElementList: PPTElement[] = cloneDeep(elementList)
    const originActiveElementList = originElementList.filter((el) => activeElementIdList.includes(el.id))

    const elOriginLeft = element.left
    const elOriginTop = element.top
    const elOriginWidth = element.width
    const elOriginHeight = ('height' in element && element.height) ? element.height : 0
    const elOriginRotate = ('rotate' in element && element.rotate) ? element.rotate : 0

    const { horizontalLines, verticalLines } = buildAlignLines({
      elementList,
      activeElementIdList,
      isActiveGroupElement,
      operatingElementId: element.id,
      edgeWidth,
      edgeHeight,
    })

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const cur = getPageXY(ev)
      if (!cur) return

      if (isMisoperation !== false) {
        isMisoperation =
          Math.abs(start.x - cur.x) < sorptionRange && Math.abs(start.y - cur.y) < sorptionRange
      }
      if (!isMouseDown || isMisoperation) return

      let moveX = (cur.x - start.x) / canvasScale
      let moveY = (cur.y - start.y) / canvasScale

      if (shiftKeyState) {
        if (Math.abs(moveX) > Math.abs(moveY)) moveY = 0
        if (Math.abs(moveX) < Math.abs(moveY)) moveX = 0
      }

      // 基础目标位置
      let targetLeft = elOriginLeft + moveX
      let targetTop = elOriginTop + moveY

      // 目标范围（用于吸附）
      let targetMinX: number, targetMaxX: number, targetMinY: number, targetMaxY: number

      if (activeElementIdList.length === 1 || isActiveGroupElement) {
        if (elOriginRotate) {
          const { xRange, yRange } = getRectRotatedRange({
            left: targetLeft,
            top: targetTop,
            width: elOriginWidth,
            height: elOriginHeight,
            rotate: elOriginRotate,
          })
          targetMinX = xRange[0]
          targetMaxX = xRange[1]
          targetMinY = yRange[0]
          targetMaxY = yRange[1]
        } else if (element.type === 'line') {
          targetMinX = targetLeft
          targetMaxX = targetLeft + Math.max(element.start[0], element.end[0])
          targetMinY = targetTop
          targetMaxY = targetTop + Math.max(element.start[1], element.end[1])
        } else {
          targetMinX = targetLeft
          targetMaxX = targetLeft + elOriginWidth
          targetMinY = targetTop
          targetMaxY = targetTop + elOriginHeight
        }
      } else {
        const leftValues: number[] = []
        const topValues: number[] = []
        const rightValues: number[] = []
        const bottomValues: number[] = []

        for (let i = 0; i < originActiveElementList.length; i++) {
          const it = originActiveElementList[i]
          const left = it.left + moveX
          const top = it.top + moveY

          const width = it.width
          const height = ('height' in it && it.height) ? it.height : 0
          const rotate = ('rotate' in it && it.rotate) ? it.rotate : 0

          if (rotate) {
            const { xRange, yRange } = getRectRotatedRange({ left, top, width, height, rotate })
            leftValues.push(xRange[0])
            topValues.push(yRange[0])
            rightValues.push(xRange[1])
            bottomValues.push(yRange[1])
          } else if (it.type === 'line') {
            leftValues.push(left)
            topValues.push(top)
            rightValues.push(left + Math.max(it.start[0], it.end[0]))
            bottomValues.push(top + Math.max(it.start[1], it.end[1]))
          } else {
            leftValues.push(left)
            topValues.push(top)
            rightValues.push(left + width)
            bottomValues.push(top + height)
          }
        }

        targetMinX = Math.min(...leftValues)
        targetMaxX = Math.max(...rightValues)
        targetMinY = Math.min(...topValues)
        targetMaxY = Math.max(...bottomValues)
      }

      const targetCenterX = targetMinX + (targetMaxX - targetMinX) / 2
      const targetCenterY = targetMinY + (targetMaxY - targetMinY) / 2

      // 吸附计算
      const nextAlignmentLines: AlignmentLineProps[] = []
      let isVerticalAdsorbed = false
      let isHorizontalAdsorbed = false

      for (let i = 0; i < horizontalLines.length; i++) {
        const { value, range } = horizontalLines[i]
        const min = Math.min(...range, targetMinX, targetMaxX)
        const max = Math.max(...range, targetMinX, targetMaxX)

        if (Math.abs(targetMinY - value) < sorptionRange && !isHorizontalAdsorbed) {
          targetTop = targetTop - (targetMinY - value)
          isHorizontalAdsorbed = true
          nextAlignmentLines.push({
            type: 'horizontal',
            axis: { x: min - 50, y: value },
            length: max - min + 100,
          })
        }
        if (Math.abs(targetMaxY - value) < sorptionRange && !isHorizontalAdsorbed) {
          targetTop = targetTop - (targetMaxY - value)
          isHorizontalAdsorbed = true
          nextAlignmentLines.push({
            type: 'horizontal',
            axis: { x: min - 50, y: value },
            length: max - min + 100,
          })
        }
        if (Math.abs(targetCenterY - value) < sorptionRange && !isHorizontalAdsorbed) {
          targetTop = targetTop - (targetCenterY - value)
          isHorizontalAdsorbed = true
          nextAlignmentLines.push({
            type: 'horizontal',
            axis: { x: min - 50, y: value },
            length: max - min + 100,
          })
        }
      }

      for (let i = 0; i < verticalLines.length; i++) {
        const { value, range } = verticalLines[i]
        const min = Math.min(...range, targetMinY, targetMaxY)
        const max = Math.max(...range, targetMinY, targetMaxY)

        if (Math.abs(targetMinX - value) < sorptionRange && !isVerticalAdsorbed) {
          targetLeft = targetLeft - (targetMinX - value)
          isVerticalAdsorbed = true
          nextAlignmentLines.push({
            type: 'vertical',
            axis: { x: value, y: min - 50 },
            length: max - min + 100,
          })
        }
        if (Math.abs(targetMaxX - value) < sorptionRange && !isVerticalAdsorbed) {
          targetLeft = targetLeft - (targetMaxX - value)
          isVerticalAdsorbed = true
          nextAlignmentLines.push({
            type: 'vertical',
            axis: { x: value, y: min - 50 },
            length: max - min + 100,
          })
        }
        if (Math.abs(targetCenterX - value) < sorptionRange && !isVerticalAdsorbed) {
          targetLeft = targetLeft - (targetCenterX - value)
          isVerticalAdsorbed = true
          nextAlignmentLines.push({
            type: 'vertical',
            axis: { x: value, y: min - 50 },
            length: max - min + 100,
          })
        }
      }

      setAlignmentLines(nextAlignmentLines)

      if ((element as any).digitbotRole) {
        let deltaX = 0
        let deltaY = 0

        if (targetMinX < 0) deltaX = -targetMinX
        if (targetMaxX > edgeWidth) deltaX = edgeWidth - targetMaxX
        if (targetMinY < 0) deltaY = -targetMinY
        if (targetMaxY > edgeHeight) deltaY = edgeHeight - targetMaxY

        targetLeft += deltaX
        targetTop += deltaY
      }

      // 更新 elementList（注意：React 必须走 setState）
      if (activeElementIdList.length === 1 || isActiveGroupElement) {
        setElementList((prev) => {
          const next = prev.map((el) =>
            el.id === element.id ? { ...el, left: targetLeft, top: targetTop } : el,
          )
          latestListRef.current = next
          return next
        })
      } else {
        setElementList((prev) => {
          const handleElement = prev.find((el) => el.id === element.id)
          if (!handleElement) return prev

          const deltaX = targetLeft - handleElement.left
          const deltaY = targetTop - handleElement.top

          const next = prev.map((el) => {
            if (!activeElementIdList.includes(el.id)) return el
            if (el.id === element.id) return { ...el, left: targetLeft, top: targetTop }
            return { ...el, left: el.left + deltaX, top: el.top + deltaY }
          })
          latestListRef.current = next
          return next
        })
      }
    }

    const onUp = (ev: MouseEvent | TouchEvent) => {
      isMouseDown = false

      window.removeEventListener('mousemove', onMove as any)
      window.removeEventListener('mouseup', onUp as any)
      window.removeEventListener('touchmove', onMove as any)
      window.removeEventListener('touchend', onUp as any)

      setAlignmentLines([])

      const end = getPageXY(ev)
      if (!end) return

      // 原逻辑：完全没移动不落盘
      if (start.x === end.x && start.y === end.y) return

      const latest = latestListRef.current
      slidesStore.updateSlide({ elements: latest })
      addHistorySnapshot()
    }

    // 绑定事件
    if (isTouchEvent(e)) {
      window.addEventListener('touchmove', onMove as any, { passive: false })
      window.addEventListener('touchend', onUp as any)
    } else {
      window.addEventListener('mousemove', onMove as any)
      window.addEventListener('mouseup', onUp as any)
    }
  })

  return { dragElement }
}
