import { useMemo } from 'react'
import { useMainStore } from '@/ppt/store'
import type { PPTLineElement } from '@/ppt/core'
import { OperateLineHandlers } from '@/ppt/types/edit'
import ResizeHandler from './ResizeHandler'
import styles from './LineElementOperate.module.scss'

interface LineElementOperateProps {
  elementInfo: PPTLineElement
  handlerVisible: boolean
  dragLineElement: (e: MouseEvent, element: PPTLineElement, command: OperateLineHandlers) => void
}

export default function LineElementOperate({
  elementInfo,
  handlerVisible,
  dragLineElement,
}: LineElementOperateProps) {
  const canvasScale = useMainStore((state) => state.canvasScale)

  const svgWidth = useMemo(() => {
    const width = Math.abs(elementInfo.start[0] - elementInfo.end[0])
    return width < 24 ? 24 : width
  }, [elementInfo.start, elementInfo.end])
  const svgHeight = useMemo(() => {
    const height = Math.abs(elementInfo.start[1] - elementInfo.end[1])
    return height < 24 ? 24 : height
  }, [elementInfo.start, elementInfo.end])

  // 通过坐标变换实现 flip，与 LineElement 保持一致
  // 注意：使用实际线条范围（而非 svgWidth/svgHeight）作为翻转基准，避免最小值 24 导致的偏移
  const flippedCoords = useMemo(() => {
    const { flipH, flipV, start, end, curve, broken, broken2, cubic } = elementInfo
    const startPoint = start as [number, number]
    const endPoint = end as [number, number]

    if (!flipH && !flipV) {
      return { start: startPoint, end: endPoint, curve, broken, broken2, cubic }
    }

    // 使用实际线条范围作为翻转基准
    const actualWidth = Math.abs(startPoint[0] - endPoint[0])
    const actualHeight = Math.abs(startPoint[1] - endPoint[1])

    const transformPoint = (point: [number, number]): [number, number] => {
      let [x, y] = point
      if (flipH) x = actualWidth - x
      if (flipV) y = actualHeight - y
      return [x, y]
    }

    return {
      start: transformPoint(startPoint),
      end: transformPoint(endPoint),
      curve: curve ? transformPoint(curve as [number, number]) : undefined,
      broken: broken ? transformPoint(broken as [number, number]) : undefined,
      broken2: broken2 ? transformPoint(broken2 as [number, number]) : undefined,
      cubic: cubic ? cubic.map(p => transformPoint(p as [number, number])) as [[number, number], [number, number]] : undefined,
    }
  }, [elementInfo])

  const resizeHandlers = useMemo(() => {
    const handlers = [
      {
        handler: OperateLineHandlers.START,
        style: {
          left: `${flippedCoords.start[0] * canvasScale}px`,
          top: `${flippedCoords.start[1] * canvasScale}px`,
        },
      },
      {
        handler: OperateLineHandlers.END,
        style: {
          left: `${flippedCoords.end[0] * canvasScale}px`,
          top: `${flippedCoords.end[1] * canvasScale}px`,
        },
      },
    ]

    if (flippedCoords.curve || flippedCoords.broken || flippedCoords.broken2) {
      const ctrlHandler = (flippedCoords.curve || flippedCoords.broken || flippedCoords.broken2) as [number, number]
      handlers.push({
        handler: OperateLineHandlers.C,
        style: {
          left: `${ctrlHandler[0] * canvasScale}px`,
          top: `${ctrlHandler[1] * canvasScale}px`,
        },
      })
    } else if (flippedCoords.cubic) {
      const [ctrlHandler1, ctrlHandler2] = flippedCoords.cubic
      handlers.push({
        handler: OperateLineHandlers.C1,
        style: {
          left: `${ctrlHandler1[0] * canvasScale}px`,
          top: `${ctrlHandler1[1] * canvasScale}px`,
        },
      })
      handlers.push({
        handler: OperateLineHandlers.C2,
        style: {
          left: `${ctrlHandler2[0] * canvasScale}px`,
          top: `${ctrlHandler2[1] * canvasScale}px`,
        },
      })
    }

    return handlers
  }, [flippedCoords, canvasScale])

  const contentStyle: React.CSSProperties = {
    width: `${svgWidth * canvasScale}px`,
    height: `${svgHeight * canvasScale}px`,
  }

  return (
    <div className={styles['line-element-operate']} style={contentStyle}>
      {handlerVisible && (
        <>
          {resizeHandlers.map((point) => (
            <ResizeHandler
              key={point.handler}
              style={point.style}
              className="operate-resize-handler"
              onMouseDown={(e) => {
                e.stopPropagation()
                dragLineElement(e.nativeEvent, elementInfo, point.handler)
              }}
            />
          ))}

          <svg
            className={styles.svg}
            width={svgWidth || 1}
            height={svgHeight || 1}
            stroke={elementInfo.color?.value}
            overflow="visible"
            style={{ transform: `scale(${canvasScale})` }}
          >
            {flippedCoords.curve && (
              <g>
                <line
                  className={styles['anchor-line']}
                  x1={flippedCoords.start[0]}
                  y1={flippedCoords.start[1]}
                  x2={flippedCoords.curve[0]}
                  y2={flippedCoords.curve[1]}
                />
                <line
                  className={styles['anchor-line']}
                  x1={flippedCoords.end[0]}
                  y1={flippedCoords.end[1]}
                  x2={flippedCoords.curve[0]}
                  y2={flippedCoords.curve[1]}
                />
              </g>
            )}

            {flippedCoords.cubic && (
              <g>
                {flippedCoords.cubic.map((item, index) => (
                  <line
                    key={index}
                    className={styles['anchor-line']}
                    x1={index === 0 ? flippedCoords.start[0] : flippedCoords.end[0]}
                    y1={index === 0 ? flippedCoords.start[1] : flippedCoords.end[1]}
                    x2={item[0]}
                    y2={item[1]}
                  />
                ))}
              </g>
            )}
          </svg>
        </>
      )}
    </div>
  )
}
