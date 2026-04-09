import type { Gradient, GradientColor } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

const buildGradientStop = (stop: GradientColor): string | null => {
  if (!stop?.color) return null
  const resolved = resolvePPTColorValue(stop.color)
  if (!resolved) return null
  if (typeof stop.pos === 'number') return `${resolved} ${stop.pos}%`
  return resolved
}

export const buildCssGradient = (gradient?: Gradient): string | null => {
  if (!gradient?.colors?.length || gradient.colors.length < 2) return null
  
  const list = gradient.colors
    .map(buildGradientStop)
    .filter((item): item is string => Boolean(item))
    
  if (list.length < 2) return null

  if (gradient.type === 'radial') {
    return `radial-gradient(circle, ${list.join(', ')})`
  }

  const rotate = typeof gradient.rotate === 'number' ? gradient.rotate : 0
  return `linear-gradient(${rotate}deg, ${list.join(', ')})`
}
