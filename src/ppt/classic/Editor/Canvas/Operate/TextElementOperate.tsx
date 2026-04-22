import { useMemo } from 'react'
import { useMainStore } from '@/ppt/store'
import type { PPTTextElement } from '@/ppt/core'
import type { OperateResizeHandlers } from '@/ppt/types/edit'
import useCommonOperate from '../hooks/useCommonOperate'
import BorderLine from './BorderLine'
import ResizeHandler from './ResizeHandler'
import RotateHandler from './RotateHandler'
import { useShallow } from 'zustand/react/shallow'


interface TextElementOperateProps {
  elementInfo: PPTTextElement
  handlerVisible: boolean
  rotateElement: (e: MouseEvent, element: PPTTextElement) => void
  scaleElement: (e: MouseEvent, element: PPTTextElement, command: OperateResizeHandlers) => void
}

export default function TextElementOperate({
  elementInfo,
  handlerVisible,
  rotateElement,
  scaleElement,
}: TextElementOperateProps) {
  const { canvasScale } = useMainStore(useShallow((state) => ({ canvasScale: state.canvasScale })))

  const scaleWidth = useMemo(
    () => (elementInfo.width ?? 0) * canvasScale,
    [elementInfo.width, canvasScale],
  )
  const scaleHeight = useMemo(
    () => (elementInfo.height ?? 0) * canvasScale,
    [elementInfo.height, canvasScale],
  )

  const { textElementResizeHandlers, verticalTextElementResizeHandlers, borderLines } = useCommonOperate(
    scaleWidth,
    scaleHeight,
  )
  const resizeHandlers = elementInfo.vertical
    ? verticalTextElementResizeHandlers
    : textElementResizeHandlers

  const getBorderResizeCommand = (type: string) => {
    if (type === 'top') return OperateResizeHandlers.TOP
    if (type === 'bottom') return OperateResizeHandlers.BOTTOM
    if (type === 'left') return OperateResizeHandlers.LEFT
    if (type === 'right') return OperateResizeHandlers.RIGHT
    return null
  }

  return (
    <div className="text-element-operate">
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
          <RotateHandler
            className="operate-rotate-handler"
            style={{ left: `${scaleWidth / 2}px` }}
            onMouseDown={(e) => {
              e.stopPropagation()
              rotateElement(e.nativeEvent, elementInfo)
            }}
          />
        </>
      )}
    </div>
  )
}
