import React from 'react'
import type { PPTImageElement } from '@/ppt/core'
import { useClipImage } from '../useClipImage'
import ImageRectOutline from './ImageRectOutline'
import ImageEllipseOutline from './ImageEllipseOutline'
import ImagePolygonOutline from './ImagePolygonOutline'

interface ImageOutlineProps {
  elementInfo: PPTImageElement
}

const ImageOutline: React.FC<ImageOutlineProps> = ({ elementInfo }) => {
  const { clipShape } = useClipImage(elementInfo)

  return (
    <div className="image-outline">
      {clipShape.type === 'rect' && (
        <ImageRectOutline
          width={elementInfo.width}
          height={elementInfo.height}
          radius={clipShape.radius}
          outline={elementInfo.outline}
        />
      )}
      {clipShape.type === 'ellipse' && (
        <ImageEllipseOutline
          width={elementInfo.width}
          height={elementInfo.height}
          outline={elementInfo.outline}
        />
      )}
      {clipShape.type === 'polygon' && clipShape.createPath && (
        <ImagePolygonOutline
          width={elementInfo.width}
          height={elementInfo.height}
          outline={elementInfo.outline}
          createPath={clipShape.createPath}
        />
      )}
    </div>
  )
}

export default ImageOutline
