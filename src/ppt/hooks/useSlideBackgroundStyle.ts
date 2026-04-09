// useSlideBackgroundStyle.ts
import { useMemo } from 'react'
import type { Background } from '../core'
import { buildCssGradient } from '@/ppt/utils/gradient'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

/**
 * 将页面背景数据转换为 CSS 样式对象
 * 等价于原 Vue 版本：
 *    background: Ref<Background | undefined>
 */
export default function useSlideBackgroundStyle(
  background?: Background | null
) {
  const backgroundStyle = useMemo(() => {
    if (!background) return { background: '#ffffff' }

    const { type, color, image, gradient } = background

    

    // 纯色背景
    if (type === 'solid') {
      return { background: resolvePPTColorValue(color) || '#ffffff' }
    }

    // 背景图
    if (type === 'image' && image) {
      const { src, fillMode } = image
      if (!src) return { background: '#ffffff' }

      const repeat = fillMode === 'repeat' ? 'repeat' : 'no-repeat'
      const size = fillMode === 'repeat' ? 'contain' : (fillMode || 'cover')
      
      return {
        background: `url(${src}) ${repeat} center / ${size}`
      }
    }

    // 渐变色背景
    if (type === 'gradient' && gradient) {
      const backgroundImage = buildCssGradient(gradient)
      if (backgroundImage) {
        return { background: backgroundImage }
      }
    }

    return { background: '#ffffff' }
  }, [background])

  return {
    backgroundStyle,
  }
}
