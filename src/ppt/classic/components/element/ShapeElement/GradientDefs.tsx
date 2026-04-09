import React from 'react'
import type { GradientColor, GradientType } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

/**
 * 渐变定义组件
 */
interface GradientDefsProps {
  id: string
  type: GradientType
  colors: GradientColor[]
  rotate?: number
}

export const GradientDefs: React.FC<GradientDefsProps> = ({
  id,
  type,
  colors,
  rotate = 0,
}) => {
  if (type === 'linear') {
    return (
      <linearGradient
        id={id}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
        gradientTransform={`rotate(${rotate},0.5,0.5)`}
      >
        {colors.map((item, index) => (
          <stop
            key={index}
            offset={`${item.pos}%`}
            stopColor={resolvePPTColorValue(item.color) || 'transparent'}
          />
        ))}
      </linearGradient>
    )
  }

  return (
    <radialGradient id={id}>
      {colors.map((item, index) => (
        <stop
          key={index}
          offset={`${item.pos}%`}
          stopColor={resolvePPTColorValue(item.color) || 'transparent'}
        />
      ))}
    </radialGradient>
  )
}

export default GradientDefs
