import React, { useId, useMemo } from 'react'
import { resolvePPTColorValue, type PPTElementOutline } from '@/ppt/core'
import { useElementOutline } from '@/ppt/hooks/useElementOutline'
import GradientDefs from '../../ShapeElement/GradientDefs'

interface ImageEllipseOutlineProps {
  width: number
  height: number
  outline?: PPTElementOutline
}

const ImageEllipseOutline: React.FC<ImageEllipseOutlineProps> = ({
  width,
  height,
  outline,
}) => {
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(outline)
  if (!outline) return null
  const outlineGradient = outline.gradient
  const hasOutlineGradient = !!outlineGradient?.colors?.length
  const rawId = useId()
  const gradientId = useMemo(() => `image-ellipse-outline-gradient-${rawId.replace(/[:]/g, '')}`, [rawId])
  const outlineStroke = hasOutlineGradient ? `url(#${gradientId})` : resolvePPTColorValue(outlineColor)

  return (
    <svg
      className="image-ellipse-outline"
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
      <ellipse
        vectorEffect="non-scaling-stroke"
        strokeLinecap="butt"
        strokeMiterlimit={8}
        fill="transparent"
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        stroke={outlineStroke}
        strokeWidth={outlineWidth}
        strokeDasharray={strokeDashArray}
      />
    </svg>
  )
}

export default ImageEllipseOutline
