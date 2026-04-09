import React, { useId, useMemo } from 'react'
import { resolvePPTColorValue, type PPTElementOutline } from '@/ppt/core'
import { useElementOutline } from '@/ppt/hooks/useElementOutline'
import GradientDefs from '../../ShapeElement/GradientDefs'

interface ImagePolygonOutlineProps {
  width: number
  height: number
  createPath: (width: number, height: number) => string
  outline?: PPTElementOutline
}

const ImagePolygonOutline: React.FC<ImagePolygonOutlineProps> = ({
  width,
  height,
  createPath,
  outline,
}) => {
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(outline)
  if (!outline) return null
  const outlineGradient = outline.gradient
  const hasOutlineGradient = !!outlineGradient?.colors?.length
  const rawId = useId()
  const gradientId = useMemo(() => `image-polygon-outline-gradient-${rawId.replace(/[:]/g, '')}`, [rawId])
  const outlineStroke = hasOutlineGradient ? `url(#${gradientId})` : resolvePPTColorValue(outlineColor)

  return (
    <svg
      className="image-polygon-outline"
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
      <path
        vectorEffect="non-scaling-stroke"
        strokeLinecap="butt"
        strokeMiterlimit={8}
        fill="transparent"
        d={createPath(width, height)}
        stroke={outlineStroke}
        strokeWidth={outlineWidth}
        strokeDasharray={strokeDashArray}
      />
    </svg>
  )
}

export default ImagePolygonOutline
