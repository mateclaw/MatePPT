import { useMemo } from 'react'
import { resolvePPTColorValue, type ShapeElement } from '@/ppt/core'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'

/**
 * 计算元素的填充样式
 */
export const useElementFill = (element: ShapeElement, source: string) => {
  const themeColors = useSlidesStore((state) => state.theme?.themeColors)
  return useMemo(() => {
    let fill = 'none'

    if (element.picture) {
      fill = `url(#${source}-picture-${element.id})`
    } else if (element.pattern) {
      fill = `url(#${source}-pattern-${element.id})`
    } else if (element.gradient) {
      fill = `url(#${source}-gradient-${element.id})`
    } else {
      fill = resolvePPTColorValue(element.fill, themeColors) || 'none'
    }

    return {
      fill,
    }
  }, [element.picture, element.pattern, element.gradient, element.fill, element.id, source, themeColors])
}

export default useElementFill
