import { useMemo } from 'react'
import type { Shadow } from '../core'

/**
 * 计算元素的阴影样式
 */
export const useElementShadow = (shadow: Shadow | undefined) => {
  return useMemo(() => {
    let shadowStyle = ''
    if (shadow) {
      const { h, v, blur, color } = shadow
      shadowStyle = `${h}px ${v}px ${blur}px ${color.value}`
    }

    return {
      shadowStyle,
    }
  }, [shadow?.h, shadow?.v, shadow?.blur, shadow?.color])
}

export default useElementShadow
