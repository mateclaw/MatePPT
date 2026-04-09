import { useMemoizedFn } from 'ahooks'
import { useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore, useSlidesStore, useKeyboardStore } from '@/ppt/store'
import type { PPTElement, PPTImageElement, PPTLineElement, PPTShapeElement } from '@/ppt/core'
import { OperateResizeHandlers, type AlignmentLineProps, type MultiSelectRange } from '@/ppt/types/edit'
import { MIN_SIZE } from '@/ppt/configs/element'
import { SHAPE_PATH_FORMULAS } from '@/ppt/configs/shapes'
import { type AlignLine, uniqAlignLines } from '@/ppt/utils/element'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'

interface RotateElementData {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 计算旋转后的元素八个缩放点的位置
 */
const getRotateElementPoints = (element: RotateElementData, angle: number) => {
  const { left, top, width, height } = element

  const radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2
  const auxiliaryAngle = (Math.atan(height / width) * 180) / Math.PI

  const tlbraRadian = ((180 - angle - auxiliaryAngle) * Math.PI) / 180
  const trblaRadian = ((auxiliaryAngle - angle) * Math.PI) / 180
  const taRadian = ((90 - angle) * Math.PI) / 180
  const raRadian = (angle * Math.PI) / 180

  const halfWidth = width / 2
  const halfHeight = height / 2

  const middleLeft = left + halfWidth
  const middleTop = top + halfHeight

  const leftTopPoint = {
    left: middleLeft + radius * Math.cos(tlbraRadian),
    top: middleTop - radius * Math.sin(tlbraRadian),
  }
  const topPoint = {
    left: middleLeft + halfHeight * Math.cos(taRadian),
    top: middleTop - halfHeight * Math.sin(taRadian),
  }
  const rightTopPoint = {
    left: middleLeft + radius * Math.cos(trblaRadian),
    top: middleTop - radius * Math.sin(trblaRadian),
  }
  const rightPoint = {
    left: middleLeft + halfWidth * Math.cos(raRadian),
    top: middleTop + halfWidth * Math.sin(raRadian),
  }
  const rightBottomPoint = {
    left: middleLeft - radius * Math.cos(tlbraRadian),
    top: middleTop + radius * Math.sin(tlbraRadian),
  }
  const bottomPoint = {
    left: middleLeft - halfHeight * Math.sin(raRadian),
    top: middleTop + halfHeight * Math.cos(raRadian),
  }
  const leftBottomPoint = {
    left: middleLeft - radius * Math.cos(trblaRadian),
    top: middleTop + radius * Math.sin(trblaRadian),
  }
  const leftPoint = {
    left: middleLeft - halfWidth * Math.cos(raRadian),
    top: middleTop - halfWidth * Math.sin(raRadian),
  }

  return { leftTopPoint, topPoint, rightTopPoint, rightPoint, rightBottomPoint, bottomPoint, leftBottomPoint, leftPoint }
}

/**
 * 获取元素某缩放点相对的另一个点的位置
 */
const getOppositePoint = (
  direction: OperateResizeHandlers,
  points: ReturnType<typeof getRotateElementPoints>,
): { left: number; top: number } => {
  const oppositeMap = {
    [OperateResizeHandlers.RIGHT_BOTTOM]: points.leftTopPoint,
    [OperateResizeHandlers.LEFT_BOTTOM]: points.rightTopPoint,
    [OperateResizeHandlers.LEFT_TOP]: points.rightBottomPoint,
    [OperateResizeHandlers.RIGHT_TOP]: points.leftBottomPoint,
    [OperateResizeHandlers.TOP]: points.bottomPoint,
    [OperateResizeHandlers.BOTTOM]: points.topPoint,
    [OperateResizeHandlers.LEFT]: points.rightPoint,
    [OperateResizeHandlers.RIGHT]: points.leftPoint,
  } as const

  return oppositeMap[direction]
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

const clampDigitbotToCanvas = (params: {
  left: number
  top: number
  width: number
  height: number
  rotate?: number
  edgeWidth: number
  edgeHeight: number
}) => {
  let { left, top } = params
  const { width, height, rotate, edgeWidth, edgeHeight } = params

  if (!rotate) {
    if (left < 0) left = 0
    if (top < 0) top = 0
    if (left + width > edgeWidth) left = Math.max(0, edgeWidth - width)
    if (top + height > edgeHeight) top = Math.max(0, edgeHeight - height)
    return { left, top }
  }

  const points = getRotateElementPoints({ left, top, width, height }, rotate)
  const xValues = [
    points.leftTopPoint.left,
    points.topPoint.left,
    points.rightTopPoint.left,
    points.rightPoint.left,
    points.rightBottomPoint.left,
    points.bottomPoint.left,
    points.leftBottomPoint.left,
    points.leftPoint.left,
  ]
  const yValues = [
    points.leftTopPoint.top,
    points.topPoint.top,
    points.rightTopPoint.top,
    points.rightPoint.top,
    points.rightBottomPoint.top,
    points.bottomPoint.top,
    points.leftBottomPoint.top,
    points.leftPoint.top,
  ]
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)

  if (minX < 0) left += -minX
  if (maxX > edgeWidth) left -= maxX - edgeWidth
  if (minY < 0) top += -minY
  if (maxY > edgeHeight) top -= maxY - edgeHeight

  return { left, top }
}

const clampDigitbotResize = (params: {
  left: number
  top: number
  width: number
  height: number
  edgeWidth: number
  edgeHeight: number
  command: OperateResizeHandlers
  fixedRatio: boolean
  aspectRatio: number
  originLeft: number
  originTop: number
  originWidth: number
  originHeight: number
}) => {
  let { left, top, width, height } = params
  const {
    edgeWidth,
    edgeHeight,
    command,
    fixedRatio,
    aspectRatio,
    originLeft,
    originTop,
    originWidth,
    originHeight,
  } = params

  const originRight = originLeft + originWidth
  const originBottom = originTop + originHeight

  const limitRight = originRight
  const limitBottom = originBottom

  let maxWidth = width
  let maxHeight = height

  if (command === OperateResizeHandlers.RIGHT || command === OperateResizeHandlers.RIGHT_TOP || command === OperateResizeHandlers.RIGHT_BOTTOM) {
    maxWidth = edgeWidth - left
  } else if (command === OperateResizeHandlers.LEFT || command === OperateResizeHandlers.LEFT_TOP || command === OperateResizeHandlers.LEFT_BOTTOM) {
    maxWidth = limitRight - Math.max(0, left)
  }

  if (command === OperateResizeHandlers.BOTTOM || command === OperateResizeHandlers.LEFT_BOTTOM || command === OperateResizeHandlers.RIGHT_BOTTOM) {
    maxHeight = edgeHeight - top
  } else if (command === OperateResizeHandlers.TOP || command === OperateResizeHandlers.LEFT_TOP || command === OperateResizeHandlers.RIGHT_TOP) {
    maxHeight = limitBottom - Math.max(0, top)
  }

  if (fixedRatio) {
    const maxWidthByHeight = maxHeight * aspectRatio
    const maxHeightByWidth = maxWidth / aspectRatio
    if (maxWidthByHeight < maxWidth) {
      maxWidth = maxWidthByHeight
    } else {
      maxHeight = maxHeightByWidth
    }
  }

  if (width > maxWidth) width = Math.max(0, maxWidth)
  if (height > maxHeight) height = Math.max(0, maxHeight)

  if (command === OperateResizeHandlers.LEFT || command === OperateResizeHandlers.LEFT_TOP || command === OperateResizeHandlers.LEFT_BOTTOM) {
    left = originRight - width
    if (left < 0) {
      left = 0
      width = originRight - left
      if (fixedRatio) height = width / aspectRatio
    }
  } else {
    if (left + width > edgeWidth) width = edgeWidth - left
  }

  if (command === OperateResizeHandlers.TOP || command === OperateResizeHandlers.LEFT_TOP || command === OperateResizeHandlers.RIGHT_TOP) {
    top = originBottom - height
    if (top < 0) {
      top = 0
      height = originBottom - top
      if (fixedRatio) width = height * aspectRatio
    }
  } else {
    if (top + height > edgeHeight) height = edgeHeight - top
  }

  return { left, top, width, height }
}

export default function useScaleElement(params: {
  elementList: PPTElement[]
  setElementList: SetState<PPTElement[]>
  alignmentLines: AlignmentLineProps[]
  setAlignmentLines: SetState<AlignmentLineProps[]>
  canvasScale: number
}) {
  const { elementList, setElementList, setAlignmentLines, canvasScale } = params

  const mainStoreApi = useMainStore // 仅用于调用 action（不订阅）
  const slidesStore = useSlidesStore()
  const { addHistorySnapshot } = useHistorySnapshot()

  const { activeElementIdList, activeGroupElementId, setScalingState } = useMainStore(
    useShallow((s) => ({
      activeElementIdList: s.activeElementIdList,
      activeGroupElementId: s.activeGroupElementId,
      setScalingState: s.setIsScaling,
    })),
  )

  const { viewportRatio, viewportSize } = useSlidesStore(
    useShallow((s) => ({ viewportRatio: s.viewportRatio, viewportSize: s.viewportSize })),
  )

  const { ctrlOrShiftKeyActive } = useKeyboardStore(
    useShallow((s) => ({ ctrlOrShiftKeyActive: s.ctrlKeyState || s.shiftKeyState })),
  )

  // ref：保证 mouseup 落盘拿到最新 elements
  const latestElementsRef = useRef<PPTElement[]>(elementList)
  latestElementsRef.current = elementList

  // ref：对齐线（可选，但这里 mouseup 会清空）
  const latestAlignmentRef = useRef<AlignmentLineProps[]>([])
  // 只要你 setAlignmentLines，这里也同步一下（用函数式更新时同步）
  const setAlignmentLinesBoth = (lines: AlignmentLineProps[]) => {
    latestAlignmentRef.current = lines
    setAlignmentLines(lines)
  }

  // 缩放单元素（不含 line）
  const scaleElement = useMemoizedFn(
    (
      e: MouseEvent | TouchEvent,
      element: Exclude<PPTElement, PPTLineElement>,
      command: OperateResizeHandlers,
    ) => {
      const start = getPageXY(e)
      if (!start) return

      let isMouseDown = true
      setScalingState(true)

      const elOriginLeft = element.left
      const elOriginTop = element.top
      const elOriginWidth = element.width
      const elOriginHeight = element.height

      const originTableCellMinHeight = element.type === 'table' ? (element as any).cellMinHeight : 0

      const elRotate = ('rotate' in element && (element as any).rotate) ? (element as any).rotate : 0
      const rotateRadian = (Math.PI * elRotate) / 180

      const fixedRatio = ctrlOrShiftKeyActive || (('fixedRatio' in element && (element as any).fixedRatio) as boolean)
      const aspectRatio = elOriginWidth / elOriginHeight

      // 最小尺寸约束
      const minSize = MIN_SIZE[element.type] || 20
      const getSizeWithinRange = (size: number, type: 'width' | 'height') => {
        if (!fixedRatio) return size < minSize ? minSize : size

        let minWidth = minSize
        let minHeight = minSize

        // 这里沿用你的逻辑：用 element 当前 ratio（不是 origin）
        const ratio = element.width / element.height
        if (ratio < 1) minHeight = minSize / ratio
        if (ratio > 1) minWidth = minSize * ratio

        if (type === 'width') return size < minWidth ? minWidth : size
        return size < minHeight ? minHeight : size
      }

      // 旋转缩放：基点
      let points: ReturnType<typeof getRotateElementPoints> | null = null
      let baseLeft = 0
      let baseTop = 0

      // 未旋转缩放：吸附线
      let horizontalLines: AlignLine[] = []
      let verticalLines: AlignLine[] = []

      if (elRotate) {
        points = getRotateElementPoints(
          { left: element.left, top: element.top, width: element.width, height: element.height },
          elRotate,
        )
        const oppositePoint = getOppositePoint(command, points)
        baseLeft = oppositePoint.left
        baseTop = oppositePoint.top
      } else {
        const edgeWidth = viewportSize
        const edgeHeight = viewportSize * viewportRatio
        const isActiveGroupElement = element.id === activeGroupElementId

        for (const el of elementList) {
          if ('rotate' in el && (el as any).rotate) continue
          if (el.type === 'line') continue
          if (isActiveGroupElement && el.id === element.id) continue
          if (!isActiveGroupElement && activeElementIdList.includes(el.id)) continue

          const left = el.left
          const top = el.top
          const width = el.width
          const height = (el as any).height
          const right = left + width
          const bottom = top + height

          horizontalLines.push({ value: top, range: [left, right] }, { value: bottom, range: [left, right] })
          verticalLines.push({ value: left, range: [top, bottom] }, { value: right, range: [top, bottom] })
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
      }

      // 对齐吸附：返回需要修正的 offsetX/offsetY，并设置 alignmentLines
      const alignedAdsorption = (currentX: number | null, currentY: number | null) => {
        const sorptionRange = 5
        const nextLines: AlignmentLineProps[] = []
        let isVerticalAdsorbed = false
        let isHorizontalAdsorbed = false
        const correctionVal = { offsetX: 0, offsetY: 0 }

        if (currentY || currentY === 0) {
          for (let i = 0; i < horizontalLines.length; i++) {
            const { value, range } = horizontalLines[i]
            const min = Math.min(...range, currentX || 0)
            const max = Math.max(...range, currentX || 0)
            if (Math.abs(currentY - value) < sorptionRange && !isHorizontalAdsorbed) {
              correctionVal.offsetY = currentY - value
              isHorizontalAdsorbed = true
              nextLines.push({ type: 'horizontal', axis: { x: min - 50, y: value }, length: max - min + 100 })
            }
          }
        }
        if (currentX || currentX === 0) {
          for (let i = 0; i < verticalLines.length; i++) {
            const { value, range } = verticalLines[i]
            const min = Math.min(...range, currentY || 0)
            const max = Math.max(...range, currentY || 0)
            if (Math.abs(currentX - value) < sorptionRange && !isVerticalAdsorbed) {
              correctionVal.offsetX = currentX - value
              isVerticalAdsorbed = true
              nextLines.push({ type: 'vertical', axis: { x: value, y: min - 50 }, length: max - min + 100 })
            }
          }
        }

        setAlignmentLinesBoth(nextLines)
        return correctionVal
      }

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!isMouseDown) return
        const cur = getPageXY(ev)
        if (!cur) return

        const x = cur.x - start.x
        const y = cur.y - start.y

      let width = elOriginWidth
      let height = elOriginHeight
      let left = elOriginLeft
      let top = elOriginTop

        if (elRotate) {
          const revisedX = (Math.cos(rotateRadian) * x + Math.sin(rotateRadian) * y) / canvasScale
          let revisedY = (Math.cos(rotateRadian) * y - Math.sin(rotateRadian) * x) / canvasScale

          if (fixedRatio) {
            if (command === OperateResizeHandlers.RIGHT_BOTTOM || command === OperateResizeHandlers.LEFT_TOP) revisedY = revisedX / aspectRatio
            if (command === OperateResizeHandlers.LEFT_BOTTOM || command === OperateResizeHandlers.RIGHT_TOP) revisedY = -revisedX / aspectRatio
          }

          if (command === OperateResizeHandlers.RIGHT_BOTTOM) {
            width = getSizeWithinRange(elOriginWidth + revisedX, 'width')
            height = getSizeWithinRange(elOriginHeight + revisedY, 'height')
          } else if (command === OperateResizeHandlers.LEFT_BOTTOM) {
            width = getSizeWithinRange(elOriginWidth - revisedX, 'width')
            height = getSizeWithinRange(elOriginHeight + revisedY, 'height')
            left = elOriginLeft - (width - elOriginWidth)
          } else if (command === OperateResizeHandlers.LEFT_TOP) {
            width = getSizeWithinRange(elOriginWidth - revisedX, 'width')
            height = getSizeWithinRange(elOriginHeight - revisedY, 'height')
            left = elOriginLeft - (width - elOriginWidth)
            top = elOriginTop - (height - elOriginHeight)
          } else if (command === OperateResizeHandlers.RIGHT_TOP) {
            width = getSizeWithinRange(elOriginWidth + revisedX, 'width')
            height = getSizeWithinRange(elOriginHeight - revisedY, 'height')
            top = elOriginTop - (height - elOriginHeight)
          } else if (command === OperateResizeHandlers.TOP) {
            height = getSizeWithinRange(elOriginHeight - revisedY, 'height')
            top = elOriginTop - (height - elOriginHeight)
          } else if (command === OperateResizeHandlers.BOTTOM) {
            height = getSizeWithinRange(elOriginHeight + revisedY, 'height')
          } else if (command === OperateResizeHandlers.LEFT) {
            width = getSizeWithinRange(elOriginWidth - revisedX, 'width')
            left = elOriginLeft - (width - elOriginWidth)
          } else if (command === OperateResizeHandlers.RIGHT) {
            width = getSizeWithinRange(elOriginWidth + revisedX, 'width')
          }

          if (fixedRatio && (command === OperateResizeHandlers.LEFT || command === OperateResizeHandlers.RIGHT)) {
            const nextHeight = getSizeWithinRange(width / aspectRatio, 'height')
            height = nextHeight
            top = elOriginTop - (height - elOriginHeight) / 2
          }
          if (fixedRatio && (command === OperateResizeHandlers.TOP || command === OperateResizeHandlers.BOTTOM)) {
            const nextWidth = getSizeWithinRange(height * aspectRatio, 'width')
            width = nextWidth
            left = elOriginLeft - (width - elOriginWidth) / 2
          }

          // 基点校正（保持 opposite point 不动）
          const currentPoints = getRotateElementPoints({ width, height, left, top }, elRotate)
          const currentOppositePoint = getOppositePoint(command, currentPoints)
          const offsetX = currentOppositePoint.left - baseLeft
          const offsetY = currentOppositePoint.top - baseTop
          left = left - offsetX
          top = top - offsetY
        } else {
          let moveX = x / canvasScale
          let moveY = y / canvasScale

          if (fixedRatio) {
            if (command === OperateResizeHandlers.RIGHT_BOTTOM || command === OperateResizeHandlers.LEFT_TOP) moveY = moveX / aspectRatio
            if (command === OperateResizeHandlers.LEFT_BOTTOM || command === OperateResizeHandlers.RIGHT_TOP) moveY = -moveX / aspectRatio
          }

          if (command === OperateResizeHandlers.RIGHT_BOTTOM) {
            const { offsetX, offsetY } = alignedAdsorption(elOriginLeft + elOriginWidth + moveX, elOriginTop + elOriginHeight + moveY)
            moveX -= offsetX
            moveY -= offsetY
            if (fixedRatio) {
              if (offsetY) moveX = moveY * aspectRatio
              else moveY = moveX / aspectRatio
            }
            width = getSizeWithinRange(elOriginWidth + moveX, 'width')
            height = getSizeWithinRange(elOriginHeight + moveY, 'height')
          } else if (command === OperateResizeHandlers.LEFT_BOTTOM) {
            const { offsetX, offsetY } = alignedAdsorption(elOriginLeft + moveX, elOriginTop + elOriginHeight + moveY)
            moveX -= offsetX
            moveY -= offsetY
            if (fixedRatio) {
              if (offsetY) moveX = -moveY * aspectRatio
              else moveY = -moveX / aspectRatio
            }
            width = getSizeWithinRange(elOriginWidth - moveX, 'width')
            height = getSizeWithinRange(elOriginHeight + moveY, 'height')
            left = elOriginLeft - (width - elOriginWidth)
          } else if (command === OperateResizeHandlers.LEFT_TOP) {
            const { offsetX, offsetY } = alignedAdsorption(elOriginLeft + moveX, elOriginTop + moveY)
            moveX -= offsetX
            moveY -= offsetY
            if (fixedRatio) {
              if (offsetY) moveX = moveY * aspectRatio
              else moveY = moveX / aspectRatio
            }
            width = getSizeWithinRange(elOriginWidth - moveX, 'width')
            height = getSizeWithinRange(elOriginHeight - moveY, 'height')
            left = elOriginLeft - (width - elOriginWidth)
            top = elOriginTop - (height - elOriginHeight)
          } else if (command === OperateResizeHandlers.RIGHT_TOP) {
            const { offsetX, offsetY } = alignedAdsorption(elOriginLeft + elOriginWidth + moveX, elOriginTop + moveY)
            moveX -= offsetX
            moveY -= offsetY
            if (fixedRatio) {
              if (offsetY) moveX = -moveY * aspectRatio
              else moveY = -moveX / aspectRatio
            }
            width = getSizeWithinRange(elOriginWidth + moveX, 'width')
            height = getSizeWithinRange(elOriginHeight - moveY, 'height')
            top = elOriginTop - (height - elOriginHeight)
          } else if (command === OperateResizeHandlers.LEFT) {
            const { offsetX } = alignedAdsorption(elOriginLeft + moveX, null)
            moveX -= offsetX
            width = getSizeWithinRange(elOriginWidth - moveX, 'width')
            left = elOriginLeft - (width - elOriginWidth)
          } else if (command === OperateResizeHandlers.RIGHT) {
            const { offsetX } = alignedAdsorption(elOriginLeft + elOriginWidth + moveX, null)
            moveX -= offsetX
            width = getSizeWithinRange(elOriginWidth + moveX, 'width')
          } else if (command === OperateResizeHandlers.TOP) {
            const { offsetY } = alignedAdsorption(null, elOriginTop + moveY)
            moveY -= offsetY
            height = getSizeWithinRange(elOriginHeight - moveY, 'height')
            top = elOriginTop - (height - elOriginHeight)
          } else if (command === OperateResizeHandlers.BOTTOM) {
            const { offsetY } = alignedAdsorption(null, elOriginTop + elOriginHeight + moveY)
            moveY -= offsetY
            height = getSizeWithinRange(elOriginHeight + moveY, 'height')
          }

          if (fixedRatio && (command === OperateResizeHandlers.LEFT || command === OperateResizeHandlers.RIGHT)) {
            const nextHeight = getSizeWithinRange(width / aspectRatio, 'height')
            height = nextHeight
            top = elOriginTop - (height - elOriginHeight) / 2
          }
          if (fixedRatio && (command === OperateResizeHandlers.TOP || command === OperateResizeHandlers.BOTTOM)) {
            const nextWidth = getSizeWithinRange(height * aspectRatio, 'width')
            width = nextWidth
            left = elOriginLeft - (width - elOriginWidth) / 2
          }
        }

        if ((element as any).digitbotRole) {
          const edgeWidth = viewportSize
          const edgeHeight = viewportSize * viewportRatio

          if (!elRotate) {
            const resized = clampDigitbotResize({
              left,
              top,
              width,
              height,
              edgeWidth,
              edgeHeight,
              command,
              fixedRatio,
              aspectRatio,
              originLeft: elOriginLeft,
              originTop: elOriginTop,
              originWidth: elOriginWidth,
              originHeight: elOriginHeight,
            })
            left = resized.left
            top = resized.top
            width = resized.width
            height = resized.height
          }

          const clamped = clampDigitbotToCanvas({
            left,
            top,
            width,
            height,
            rotate: elRotate,
            edgeWidth,
            edgeHeight,
          })
          left = clamped.left
          top = clamped.top
        }

        // 应用到 elementList
        setElementList((prev) => {
          const next = prev.map((el) => {
            if (el.id !== element.id) return el

            // shape：重算 path/viewBox
            if (el.type === 'shape' && 'pathFormula' in el && (el as any).pathFormula) {
              const pf = SHAPE_PATH_FORMULAS[(el as any).pathFormula]
              if (pf) {
                let path = ''
                if ('editable' in pf) path = pf.formula(width, height, (el as any).keypoints!)
                else path = pf.formula(width, height)

                return {
                  ...el,
                  left,
                  top,
                  width,
                  height,
                  viewBox: [width, height],
                  path,
                }
              }
            }

            // table：cellMinHeight
            if (el.type === 'table') {
              const rows = (el as any).data?.length || 1
              let cellMinHeight = originTableCellMinHeight + (height - elOriginHeight) / rows
              cellMinHeight = cellMinHeight < 36 ? 36 : cellMinHeight

              if (cellMinHeight === originTableCellMinHeight) return { ...el, left, width }
              return {
                ...el,
                left,
                top,
                width,
                height,
                cellMinHeight,
              }
            }

            if (el.type === 'text') {
              const sizeChanged = width !== elOriginWidth || height !== elOriginHeight
              const nextAutoFit = sizeChanged ? 'none' : (el as any).autoFit
              return { ...el, left, top, width, height, autoFit: nextAutoFit }
            }

            return { ...el, left, top, width, height }
          })

          latestElementsRef.current = next
          return next
        })
      }

      const onUp = (ev: MouseEvent | TouchEvent) => {
        isMouseDown = false

        window.removeEventListener('mousemove', onMove as any)
        window.removeEventListener('mouseup', onUp as any)
        window.removeEventListener('touchmove', onMove as any)
        window.removeEventListener('touchend', onUp as any)

        setAlignmentLinesBoth([])

        const end = getPageXY(ev)
        if (!end) return
        if (start.x === end.x && start.y === end.y) return

        // 落盘（确保最新）
        const latest = latestElementsRef.current
        slidesStore.updateSlide({ elements: latest })
        setScalingState(false)
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

  // 多选缩放（原逻辑：只处理 image/shape 且在 activeElementIdList 内）
  const scaleMultiElement = useMemoizedFn((e: MouseEvent, range: MultiSelectRange, command: OperateResizeHandlers) => {
    let isMouseDown = true

    const { minX, maxX, minY, maxY } = range
    const operateWidth = maxX - minX
    const operateHeight = maxY - minY
    const aspectRatio = operateWidth / operateHeight

    const startPageX = e.pageX
    const startPageY = e.pageY

    // 深拷贝 origin
    const originElementList: PPTElement[] = JSON.parse(JSON.stringify(elementList))

    const onMove = (ev: MouseEvent) => {
      if (!isMouseDown) return

      const currentPageX = ev.pageX
      const currentPageY = ev.pageY

      const x = (currentPageX - startPageX) / canvasScale
      let y = (currentPageY - startPageY) / canvasScale

      if (ctrlOrShiftKeyActive) {
        if (command === OperateResizeHandlers.RIGHT_BOTTOM || command === OperateResizeHandlers.LEFT_TOP) y = x / aspectRatio
        if (command === OperateResizeHandlers.LEFT_BOTTOM || command === OperateResizeHandlers.RIGHT_TOP) y = -x / aspectRatio
      }

      let currentMinX = minX
      let currentMaxX = maxX
      let currentMinY = minY
      let currentMaxY = maxY

      if (command === OperateResizeHandlers.RIGHT_BOTTOM) {
        currentMaxX = maxX + x
        currentMaxY = maxY + y
      } else if (command === OperateResizeHandlers.LEFT_BOTTOM) {
        currentMinX = minX + x
        currentMaxY = maxY + y
      } else if (command === OperateResizeHandlers.LEFT_TOP) {
        currentMinX = minX + x
        currentMinY = minY + y
      } else if (command === OperateResizeHandlers.RIGHT_TOP) {
        currentMaxX = maxX + x
        currentMinY = minY + y
      } else if (command === OperateResizeHandlers.TOP) {
        currentMinY = minY + y
      } else if (command === OperateResizeHandlers.BOTTOM) {
        currentMaxY = maxY + y
      } else if (command === OperateResizeHandlers.LEFT) {
        currentMinX = minX + x
      } else if (command === OperateResizeHandlers.RIGHT) {
        currentMaxX = maxX + x
      }

      const currentOppositeWidth = currentMaxX - currentMinX
      const currentOppositeHeight = currentMaxY - currentMinY

      let widthScale = currentOppositeWidth / operateWidth
      let heightScale = currentOppositeHeight / operateHeight

      if (widthScale <= 0) widthScale = 0
      if (heightScale <= 0) heightScale = 0

      setElementList((prev) => {
        const next = prev.map((el) => {
          if ((el.type === 'image' || el.type === 'shape') && activeElementIdList.includes(el.id)) {
            const originElement = originElementList.find((o) => o.id === el.id) as PPTImageElement | PPTShapeElement | undefined
            if (!originElement) return el

            let width = originElement.width * widthScale
            let height = (originElement as any).height * heightScale
            let left = currentMinX + (originElement.left - minX) * widthScale
            let top = currentMinY + ((originElement as any).top - minY) * heightScale

            if ((el as any).digitbotRole) {
              const edgeWidth = viewportSize
              const edgeHeight = viewportSize * viewportRatio
              const rotate = ('rotate' in el && (el as any).rotate) ? (el as any).rotate : 0

              if (!rotate) {
                const resized = clampDigitbotResize({
                  left,
                  top,
                  width,
                  height,
                  edgeWidth,
                  edgeHeight,
                  command,
                  fixedRatio: ctrlOrShiftKeyActive,
                  aspectRatio: operateWidth / operateHeight,
                  originLeft: originElement.left,
                  originTop: (originElement as any).top,
                  originWidth: originElement.width,
                  originHeight: (originElement as any).height,
                })
                left = resized.left
                top = resized.top
                width = resized.width
                height = resized.height
              }

              const clamped = clampDigitbotToCanvas({
                left,
                top,
                width,
                height,
                rotate,
                edgeWidth,
                edgeHeight,
              })
              left = clamped.left
              top = clamped.top
            }

            // shape：重算 path/viewBox
            if (el.type === 'shape' && 'pathFormula' in el && (el as any).pathFormula) {
              const pf = SHAPE_PATH_FORMULAS[(el as any).pathFormula]
              if (pf) {
                let path = ''
                if ('editable' in pf) path = pf.formula(width, height, (el as any).keypoints!)
                else path = pf.formula(width, height)

                return {
                  ...el,
                  width,
                  height,
                  left,
                  top,
                  viewBox: [width, height],
                  path,
                }
              }
            }

            return {
              ...el,
              width,
              height,
              left,
              top,
            }
          }
          return el
        })

        latestElementsRef.current = next
        return next
      })
    }

    const onUp = (ev: MouseEvent) => {
      isMouseDown = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)

      if (startPageX === ev.pageX && startPageY === ev.pageY) return

      const latest = latestElementsRef.current
      slidesStore.updateSlide({ elements: latest })
      addHistorySnapshot()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  })

  return {
    scaleElement,
    scaleMultiElement,
  }
}
