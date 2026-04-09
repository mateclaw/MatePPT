
import { BackgroundImage } from '@/ppt/core'
import React from 'react'

/**
 * 图案定义组件
 */
interface ImageDefsProps {
  id: string
  picture: BackgroundImage
  width?: number
  height?: number
}

export const ImageDefs: React.FC<ImageDefsProps> = ({ id, picture, width, height }) => {
  const fillMode = picture.fillMode || 'cover'
  const preserveAspectRatio = fillMode === 'contain' ? 'xMidYMid meet' : fillMode === 'cover' ? 'xMidYMid slice' : 'none'
  const patternUnits = fillMode === 'repeat' ? 'userSpaceOnUse' : 'objectBoundingBox'
  const patternContentUnits = fillMode === 'repeat' ? 'userSpaceOnUse' : 'objectBoundingBox'
  const patternWidth = fillMode === 'repeat' ? width : undefined
  const patternHeight = fillMode === 'repeat' ? height : undefined

  return (
    <pattern
      id={id}
      patternContentUnits={patternContentUnits}
      patternUnits={patternUnits}
      width={patternWidth ?? '1'}
      height={patternHeight ?? '1'}
    >
      <image
        href={picture.src}
        width={fillMode === 'repeat' ? (patternWidth ?? '1') : '1'}
        height={fillMode === 'repeat' ? (patternHeight ?? '1') : '1'}
        preserveAspectRatio={preserveAspectRatio}
      />
    </pattern>
  )
}

export default ImageDefs
