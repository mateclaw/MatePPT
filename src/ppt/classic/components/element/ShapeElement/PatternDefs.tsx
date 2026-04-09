import { PatternFill } from '@/ppt/core'
import React from 'react'

/**
 * 图案定义组件
 */
interface PatternDefsProps {
  id: string
  pattern: PatternFill
}

export const PatternDefs: React.FC<PatternDefsProps> = ({ id, pattern }) => {
  return (
    <pattern
      id={id}
      patternContentUnits="objectBoundingBox"
      patternUnits="objectBoundingBox"
      width="1"
      height="1"
    >
      {/* <image
        href={pattern}
        width="1"
        height="1"
        preserveAspectRatio="xMidYMid slice"
      /> */}
    </pattern>
  )
}

export default PatternDefs
