import React, { type FC, useMemo } from 'react'
import type { LinePoint, NonEmptyLinePoint, PPTLineElement } from '@/ppt/core'
import { getLineElementPath } from '@/ppt/utils/element'
import { useElementShadow } from '@/ppt/hooks/useElementShadow'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import LinePointMarker from './LinePointMarker'
import styles from './BaseLineElement.module.scss'

interface BaseLineElementProps {
  elementInfo: PPTLineElement
}

const BaseLineElement: FC<BaseLineElementProps> = ({ elementInfo }) => {
  const { shadowStyle } = useElementShadow(elementInfo.shadow)

  const safeStart = useMemo(() => {
    if (Array.isArray(elementInfo.start) && elementInfo.start.length >= 2) {
      return elementInfo.start
    }
    return [0, 0]
  }, [elementInfo.start])
  const safeEnd = useMemo(() => {
    if (Array.isArray(elementInfo.end) && elementInfo.end.length >= 2) {
      return elementInfo.end
    }
    return [0, 0]
  }, [elementInfo.end])
  const safePoints = useMemo(() => {
    if (Array.isArray(elementInfo.points) && elementInfo.points.length >= 2) {
      return elementInfo.points
    }
    return ['', '']
  }, [elementInfo.points])

  const svgWidth = useMemo(() => {
    const width = Math.abs(safeStart[0] - safeEnd[0])
    return width < 24 ? 24 : width
  }, [safeStart, safeEnd])

  const svgHeight = useMemo(() => {
    const height = Math.abs(safeStart[1] - safeEnd[1])
    return height < 24 ? 24 : height
  }, [safeStart, safeEnd])

  // 通过坐标变换实现 flip，而不是 CSS transform
  // 注意：使用实际线条范围（而非 svgWidth/svgHeight）作为翻转基准，避免最小值 24 导致的偏移
  const flippedCoords = useMemo(() => {
    const { flipH, flipV } = elementInfo
    const startPoint = safeStart as [number, number]
    const endPoint = safeEnd as [number, number]

    if (!flipH && !flipV) {
      return {
        start: startPoint,
        end: endPoint,
        curve: elementInfo.curve,
        broken: elementInfo.broken,
        broken2: elementInfo.broken2,
        cubic: elementInfo.cubic,
      }
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
      curve: elementInfo.curve ? transformPoint(elementInfo.curve as [number, number]) : undefined,
      broken: elementInfo.broken ? transformPoint(elementInfo.broken as [number, number]) : undefined,
      broken2: elementInfo.broken2 ? transformPoint(elementInfo.broken2 as [number, number]) : undefined,
      cubic: elementInfo.cubic ? elementInfo.cubic.map(p => transformPoint(p as [number, number])) as [[number, number], [number, number]] : undefined,
    }
  }, [elementInfo, safeStart, safeEnd])

  const lineDashArray = useMemo(() => {
    const size = elementInfo.strokeWidth ?? elementInfo.width ?? 1
    if (elementInfo.style === 'dashed') {
      return size <= 8 ? `${size * 5} ${size * 2.5}` : `${size * 5} ${size * 1.5}`
    }
    if (elementInfo.style === 'dotted') {
      return size <= 8 ? `${size * 1.8} ${size * 1.6}` : `${size * 1.5} ${size * 1.2}`
    }
    return '0 0'
  }, [elementInfo.style, elementInfo.width, elementInfo.strokeWidth])

  const lineColor = useMemo(
    () => resolvePPTColorValue(elementInfo.color),
    [elementInfo.color],
  )

  // 使用翻转后的坐标计算路径
  const path = useMemo(() => {
    return getLineElementPath({
      ...elementInfo,
      start: flippedCoords.start as [number, number],
      end: flippedCoords.end as [number, number],
      curve: flippedCoords.curve,
      broken: flippedCoords.broken,
      broken2: flippedCoords.broken2,
      cubic: flippedCoords.cubic,
      points: safePoints as LinePoint[],
    })
  }, [elementInfo, flippedCoords, safePoints])

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: elementInfo.top,
    left: elementInfo.left,
    width: svgWidth,
    height: svgHeight,
  }

  const rotateWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `rotate(${elementInfo.rotate || 0}deg)`,
  }

  const elementContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    filter: shadowStyle ? `drop-shadow(${shadowStyle})` : undefined,
  }

  return (
    <div className={styles.baseElementLine} style={containerStyle}>
      <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
        <div className={styles.elementContent} style={elementContentStyle}>
          <svg overflow="visible" width={svgWidth} height={svgHeight}>
            <defs>
              {safePoints[0] && (
                <LinePointMarker
                  id={elementInfo.id}
                  position="start"
                  type={safePoints[0] as NonEmptyLinePoint}
                  color={lineColor}
                  baseSize={elementInfo.strokeWidth ?? elementInfo.width ?? 1}
                />
              )}
              {safePoints[1] && (
                <LinePointMarker
                  id={elementInfo.id}
                  position="end"
                  type={safePoints[1] as NonEmptyLinePoint}
                  color={lineColor}
                  baseSize={elementInfo.strokeWidth ?? elementInfo.width ?? 1}
                />
              )}
            </defs>
            <path
              d={path}
              stroke={lineColor}
              strokeWidth={elementInfo.strokeWidth ?? elementInfo.width ?? 1}
              strokeDasharray={lineDashArray}
              fill="none"
              markerStart={
                safePoints[0] ? `url(#${elementInfo.id}-${safePoints[0]}-start)` : undefined
              }
              markerEnd={
                safePoints[1] ? `url(#${elementInfo.id}-${safePoints[1]}-end)` : undefined
              }
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default BaseLineElement
