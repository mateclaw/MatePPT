import React, { type FC, useId, useMemo } from 'react'
import type { PPTElementOutline } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import GradientDefs from './element/ShapeElement/GradientDefs'

interface ElementOutlineProps {
  width: number
  height: number
  outline?: PPTElementOutline
}

const ElementOutline: FC<ElementOutlineProps> = ({
  width,
  height,
  outline,
}) => {
  if (!outline) return null
  const outlineGradient = outline.gradient
  const hasOutlineGradient = !!outlineGradient?.colors?.length
  const rawId = useId()
  const gradientId = useMemo(() => `element-outline-gradient-${rawId.replace(/[:]/g, '')}`, [rawId])

  const outlineWidth = outline.width || 2
  const outlineColor = resolvePPTColorValue(outline.color)
  const outlineStyle = outline.style || 'solid'
  const outlineStroke = hasOutlineGradient ? `url(#${gradientId})` : outlineColor

  let strokeDashArray = ''
  if (outlineStyle === 'dashed') {
    strokeDashArray = '10,5'
  }
  else if (outlineStyle === 'dotted') {
    strokeDashArray = '2,2'
  }

  const svgStyle: React.CSSProperties = {
    overflow: 'visible',
    position: 'absolute',
    top: 0,
    left: 0,
  }

  return (
    <svg
      className="element-outline"
      style={svgStyle}
      width={width}
      height={height}
      overflow="visible"
    >
      {hasOutlineGradient && (
        <defs>
          <GradientDefs
            id={gradientId}
            type={outlineGradient.type}
            colors={outlineGradient.colors}
            rotate={outlineGradient.rotate}
          />
        </defs>
      )}
      <path
        vectorEffect="non-scaling-stroke"
        strokeLinecap="butt"
        strokeMiterlimit={8}
        fill="transparent"
        d={`M0,0 L${width},0 L${width},${height} L0,${height} Z`}
        stroke={outlineStroke}
        strokeWidth={outlineWidth}
        strokeDasharray={strokeDashArray}
      />
    </svg>
  )
}

export default ElementOutline
