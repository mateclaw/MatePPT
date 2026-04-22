import { useMemo } from 'react'
import { useMainStore } from '@/ppt/store'
import type { PPTVideoElement, PPTMathElement, PPTAudioElement, PPTChartElement } from '@/ppt/core'
import type { OperateResizeHandlers } from '@/ppt/types/edit'
import useCommonOperate from '../hooks/useCommonOperate'
import BorderLine from './BorderLine'
import ResizeHandler from './ResizeHandler'
import RotateHandler from './RotateHandler'

type PPTElement = PPTVideoElement | PPTMathElement | PPTAudioElement | PPTChartElement

interface CommonElementOperateProps {
  elementInfo: PPTElement
  handlerVisible: boolean
  rotateElement: (e: MouseEvent, element: PPTElement) => void
  scaleElement: (e: MouseEvent, element: PPTElement, command: OperateResizeHandlers) => void
}

export default function CommonElementOperate({
  elementInfo,
  handlerVisible,
  rotateElement,
  scaleElement,
}: CommonElementOperateProps) {
  const canvasScale = useMainStore((state) => state.canvasScale)

  const scaleWidth = useMemo(
    () => (elementInfo.width ?? 0) * canvasScale,
    [elementInfo.width, canvasScale],
  )
  const scaleHeight = useMemo(
    () => (elementInfo.height ?? 0) * canvasScale,
    [elementInfo.height, canvasScale],
  )

  const { resizeHandlers, borderLines } = useCommonOperate(scaleWidth, scaleHeight)

  const cannotRotate = elementInfo.type === 'chart' || elementInfo.type === 'video' || elementInfo.type === 'audio'
  const getBorderResizeCommand = (type: string) => {
    if (type === 'top') return OperateResizeHandlers.TOP
    if (type === 'bottom') return OperateResizeHandlers.BOTTOM
    if (type === 'left') return OperateResizeHandlers.LEFT
    if (type === 'right') return OperateResizeHandlers.RIGHT
    return null
  }

  return (
    <div className="common-element-operate">
      {borderLines.map((line) => (
        <BorderLine
          key={line.type}
          type={line.type}
          isWide
          style={{
            ...line.style,
            cursor:
              line.type === 'top' || line.type === 'bottom'
                ? 'ns-resize'
                : 'ew-resize',
          }}
          className="operate-border-line"
          onMouseDown={(e) => {
            const command = getBorderResizeCommand(line.type)
            if (!command) return
            e.stopPropagation()
            scaleElement(e.nativeEvent, elementInfo, command)
          }}
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

          {!cannotRotate && (
            <RotateHandler
              className="operate-rotate-handler"
              style={{ left: `${scaleWidth / 2}px` }}
              onMouseDown={(e) => {
                e.stopPropagation()
                rotateElement(e.nativeEvent, elementInfo)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
