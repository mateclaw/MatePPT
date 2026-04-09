import { useMemo } from 'react'

/**
 * 计算元素的翻转样式
 */
export const useElementFlip = (flipH: boolean | undefined, flipV: boolean | undefined) => {
  return useMemo(() => {
    let flipStyle = ''

    if (flipH && flipV) flipStyle = 'rotateX(180deg) rotateY(180deg)'
    else if (flipV) flipStyle = 'rotateX(180deg)'
    else if (flipH) flipStyle = 'rotateY(180deg)'

    return {
      flipStyle,
    }
  }, [flipH, flipV])
}

export default useElementFlip
