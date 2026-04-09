import { useEffect, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import type { LinePoint, LineStyleType } from '@/ppt/core'
import LinePointMarker from '@/ppt/classic/components/element/LineElement/LinePointMarker'

interface SVGLineProps {
  width?: number
  color?: string
  markers?: [LinePoint, LinePoint]
  type?: LineStyleType
  padding?: number
}

export default function SVGLine({
  width = 2,
  color = '#333',
  markers,
  type,
  padding = 0,
}: SVGLineProps) {
  const [id, setId] = useState('')

  useEffect(() => {
    setId(nanoid())
  }, [])

  const lineDashArray = useMemo(() => {
    const size = width
    if (type === 'dashed') {
      return size <= 8 ? `${size * 5} ${size * 2.5}` : `${size * 5} ${size * 1.5}`
    }
    if (type === 'dotted') {
      return size <= 8 ? `${size * 1.8} ${size * 1.6}` : `${size * 1.5} ${size * 1.2}`
    }
    return '0 0'
  }, [type, width])

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 10">
      <defs>
        {markers?.[0] && (
          <LinePointMarker
            id={id}
            position="start"
            type={markers[0]}
            color={color}
            baseSize={width}
          />
        )}
        {markers?.[1] && (
          <LinePointMarker
            id={id}
            position="end"
            type={markers[1]}
            color={color}
            baseSize={width}
          />
        )}
      </defs>
      <line
        x1={padding}
        y1={5}
        x2={100 - padding}
        y2={5}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={lineDashArray}
        markerStart={markers?.[0] ? `url(#${id}-${markers[0]}-start)` : undefined}
        markerEnd={markers?.[1] ? `url(#${id}-${markers[1]}-end)` : undefined}
      />
    </svg>
  )
}
