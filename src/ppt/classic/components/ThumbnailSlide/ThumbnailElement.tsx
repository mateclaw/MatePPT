import React from 'react'
import { PPTElementType, type PPTElement } from '@/ppt/core'
import BaseImageElement from '../element/ImageElement/BaseImageElement'
import BaseTextElement from '../element/TextElement/BaseTextElement'
import BaseShapeElement from '../element/ShapeElement/BaseShapeElement'
import BaseLineElement from '../element/LineElement/BaseLineElement'
import BaseChartElement from '../element/ChartElement/BaseChartElement'
import BaseTableElement from '../element/TableElement/BaseTableElement'
import BaseMathElement from '../element/MathElement/BaseMathElement'
import BaseVideoElement from '../element/VideoElement/BaseVideoElement'
import BaseAudioElement from '../element/AudioElement/BaseAudioElement'

interface ThumbnailElementProps {
  elementInfo: PPTElement
  elementIndex: number
}

const ThumbnailElement: React.FC<ThumbnailElementProps> = ({ elementInfo, elementIndex }) => {
  const elementTypeMap: Record<string, React.ComponentType<any> | null> = {
    [PPTElementType.IMAGE]: BaseImageElement,
    [PPTElementType.TEXT]: BaseTextElement,
    [PPTElementType.SHAPE]: BaseShapeElement,
    [PPTElementType.LINE]: BaseLineElement,
    [PPTElementType.CHART]: BaseChartElement,
    [PPTElementType.TABLE]: BaseTableElement,
    [PPTElementType.MATH]: BaseMathElement,
    [PPTElementType.VIDEO]: BaseVideoElement,
    [PPTElementType.AUDIO]: BaseAudioElement,
  }

  const CurrentElement = elementTypeMap[elementInfo.type]
  if (!CurrentElement) return null

  return (
    <div className={`base-element base-element-${elementInfo.id}`} style={{ zIndex: elementIndex }}>
      <CurrentElement elementInfo={elementInfo} target="thumbnail" />
    </div>
  )
}

export default ThumbnailElement
