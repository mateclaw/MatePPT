import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { useMainStore } from '@/ppt/store'
import type { PPTShapeElement } from '@/ppt/core'
import type { OperateResizeHandlers } from '@/ppt/types/edit'
import { SHAPE_PATH_FORMULAS } from '@/ppt/configs/shapes'
import useCommonOperate from '../hooks/useCommonOperate'
import BorderLine from './BorderLine'
import ResizeHandler from './ResizeHandler'
import RotateHandler from './RotateHandler'
import styles from './ShapeElementOperate.module.scss'
import { useShallow } from 'zustand/react/shallow'


interface ShapeElementOperateProps {
  elementInfo: PPTShapeElement
  handlerVisible: boolean
  rotateElement: (e: MouseEvent, element: PPTShapeElement) => void
  scaleElement: (e: MouseEvent, element: PPTShapeElement, command: OperateResizeHandlers) => void
  moveShapeKeypoint: (e: MouseEvent, element: PPTShapeElement, index: number) => void
}

export default function ShapeElementOperate({
  elementInfo,
  handlerVisible,
  rotateElement,
  scaleElement,
  moveShapeKeypoint,
}: ShapeElementOperateProps) {
  const { canvasScale } = useMainStore(useShallow((state) => ({ canvasScale: state.canvasScale })))

  const scaleWidth = useMemo(
    () => (elementInfo.width ?? 0) * canvasScale,
    [elementInfo.width, canvasScale],
  )
  const scaleHeight = useMemo(
    () => (elementInfo.height ?? 0) * canvasScale,
    [elementInfo.height, canvasScale],
  )
  const { resizeHandlers, borderLines } = useCommonOperate(scaleWidth, scaleHeight)

  const keypoints = useMemo(() => {
    if (!elementInfo.pathFormula || elementInfo.keypoints === undefined) return []
    const pathFormula = SHAPE_PATH_FORMULAS[elementInfo.pathFormula]
    if (!pathFormula) return []

    return elementInfo.keypoints.map((keypoint, index) => {
      const getBaseSize = pathFormula.getBaseSize?.[index]
      const relative = pathFormula.relative?.[index]
      if (!getBaseSize || !relative) return { keypoint, styles: {} as CSSProperties }
      const keypointPos = getBaseSize(elementInfo.width, elementInfo.height) * keypoint

      let styles: CSSProperties = {}
      if (relative === 'left') styles = { left: `${keypointPos * canvasScale}px` }
      else if (relative === 'right') styles = { left: `${(elementInfo.width - keypointPos) * canvasScale}px` }
      else if (relative === 'center') styles = { left: `${((elementInfo.width - keypointPos) / 2) * canvasScale}px` }
      else if (relative === 'top') styles = { top: `${keypointPos * canvasScale}px` }
      else if (relative === 'bottom') styles = { top: `${(elementInfo.height - keypointPos) * canvasScale}px` }
      else if (relative === 'left_bottom') {
        styles = { left: `${keypointPos * canvasScale}px`, top: `${elementInfo.height * canvasScale}px` }
      } else if (relative === 'right_bottom') {
        styles = {
          left: `${(elementInfo.width - keypointPos) * canvasScale}px`,
          top: `${elementInfo.height * canvasScale}px`,
        }
      } else if (relative === 'top_right') {
        styles = { left: `${elementInfo.width * canvasScale}px`, top: `${keypointPos * canvasScale}px` }
      } else if (relative === 'bottom_right') {
        styles = {
          left: `${elementInfo.width * canvasScale}px`,
          top: `${(elementInfo.height - keypointPos) * canvasScale}px`,
        }
      }

      return {
        keypoint,
        styles,
      }
    })
  }, [elementInfo, canvasScale])

  return (
    <div className="shape-element-operate">
      {borderLines.map((line) => (
        <BorderLine
          key={line.type}
          type={line.type}
          style={line.style}
          className="operate-border-line"
        />
      ))}

      {handlerVisible && (
        <>
          {resizeHandlers.map((point) => (
            <ResizeHandler
              key={point.direction}
              type={point.direction}
              rotate={elementInfo.rotate || 0}
              style={point.style}
              className="operate-resize-handler"
              onMouseDown={(e) => {
                e.stopPropagation()
                scaleElement(e.nativeEvent, elementInfo, point.direction)
              }}
            />
          ))}
          <RotateHandler
            className="operate-rotate-handler"
            style={{ left: `${scaleWidth / 2}px` }}
            onMouseDown={(e) => {
              e.stopPropagation()
              rotateElement(e.nativeEvent, elementInfo)
            }}
          />
          {keypoints.map((keypoint, index) => (
            <div
              key={index}
              className={styles['operate-keypoint-handler']}
              style={keypoint.styles}
              onMouseDown={(e) => {
                e.stopPropagation()
                moveShapeKeypoint(e.nativeEvent, elementInfo, index)
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
