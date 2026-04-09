import { useMemo } from 'react'
import { resolveClipShapeDefinition } from '@/ppt/configs/clipShapeRegistry'
import type { PPTImageElement } from '@/ppt/core'

export const useClipImage = (element: PPTImageElement) => {
  const clipShape = useMemo(() => {
    let targetShape = resolveClipShapeDefinition()

    if (element.clip) {
      const shape = element.clip.shape || 'rect'
      targetShape = resolveClipShapeDefinition(shape)
    }

    if (targetShape.useSvgPathClip && targetShape.createPath) {
      const pathData = targetShape.createPath(element.width, element.height)
      targetShape = {
        ...targetShape,
        style: `path('${pathData.replace(/'/g, "\\'")}')`,
      }
    }

    if (targetShape.radius !== undefined && element.radius) {
      targetShape = {
        ...targetShape,
        radius: `${element.radius}px`,
        style: `inset(0 round ${element.radius}px)`,
      }
    }

    return targetShape
  }, [element.clip?.shape, element.radius, element.width, element.height])

  const imgPosition = useMemo(() => {
    if (!element.clip || !element.clip.range || element.clip.range.length < 2) {
      return {
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      }
    }

    const [start, end] = element.clip.range
    if (!Array.isArray(start) || !Array.isArray(end)) {
      return {
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      }
    }
    const widthScale = (end[0] - start[0]) / 100
    const heightScale = (end[1] - start[1]) / 100
    if (!widthScale || !heightScale) {
      return {
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      }
    }
    const left = start[0] / widthScale
    const top = start[1] / heightScale

    return {
      left: `${-left}%`,
      top: `${-top}%`,
      width: `${100 / widthScale}%`,
      height: `${100 / heightScale}%`,
    }
  }, [element.clip])

  return {
    clipShape,
    imgPosition,
  }
}

export default useClipImage
