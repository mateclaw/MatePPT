import { useMemo } from 'react'
import type { Element, PPTElementOutline } from '@/ppt/core'

/**
 * 计算边框相关属性值，主要是对默认值的处理
 */
export const useElementOutline = (outline: PPTElementOutline | undefined) => {
  return useMemo(() => {
    const outlineWidth = outline?.width ?? 0
    const outlineStyle = outline?.style || 'solid'
    const outlineColor = outline?.color 

    let strokeDashArray = '0 0'
    if (outlineStyle === 'dashed') {
      strokeDashArray = outlineWidth <= 6 ? `${outlineWidth * 4.5} ${outlineWidth * 2}` : `${outlineWidth * 4} ${outlineWidth * 1.5}`
    } else if (outlineStyle === 'dotted') {
      strokeDashArray = outlineWidth <= 6 ? `${outlineWidth * 1.8} ${outlineWidth * 1.6}` : `${outlineWidth * 1.5} ${outlineWidth * 1.2}`
    }

    return {
      outlineWidth,
      outlineStyle,
      outlineColor,
      strokeDashArray,
    }
  }, [outline?.width, outline?.style, outline?.color])
}

export default useElementOutline
