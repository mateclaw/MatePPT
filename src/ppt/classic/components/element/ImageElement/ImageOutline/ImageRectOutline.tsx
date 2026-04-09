import React, { useId, useMemo } from 'react'
import { resolvePPTColorValue, type PPTElementOutline } from '@/ppt/core'
import { useElementOutline } from '@/ppt/hooks/useElementOutline'
import GradientDefs from '../../ShapeElement/GradientDefs'

interface ImageRectOutlineProps {
  width: number
  height: number
  outline?: PPTElementOutline
  radius?: string
}

const ImageRectOutline: React.FC<ImageRectOutlineProps> = ({
  width,
  height,
  outline,
  radius = '0',
}) => {
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(outline)
  if (!outline) return null
  const outlineGradient = outline.gradient
  const hasOutlineGradient = !!outlineGradient?.colors?.length
  const rawId = useId()
  const gradientId = useMemo(() => `image-rect-outline-gradient-${rawId.replace(/[:]/g, '')}`, [rawId])
  const outlineStroke = hasOutlineGradient ? `url(#${gradientId})` : resolvePPTColorValue(outlineColor)

  return (
    <svg
      className="image-rect-outline"
      overflow="visible"
      width={width}
      height={height}
      style={{
        overflow: 'visible',
        position: 'absolute',
        zIndex: 2,
        top: 0,
        left: 0,
      }}
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
      <rect
        vectorEffect="non-scaling-stroke"
        strokeLinecap="butt"
        strokeMiterlimit={8}
        fill="transparent"
        rx={radius}
        ry={radius}
        width={width}
        height={height}
        stroke={outlineStroke}
        strokeWidth={outlineWidth}
        strokeDasharray={strokeDashArray}
      />
    </svg>
  )
}

export default ImageRectOutline
