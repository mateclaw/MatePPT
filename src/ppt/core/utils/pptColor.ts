import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import type { ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import { PPTColorCalculator } from '@/ppt/core/color/PPTColorCalculator'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'

export const isPPTColor = (value: unknown): value is PPTColor => {
  if (!value || typeof value !== 'object') return false
  return 'value' in value || 'scheme' in value || 'transforms' in value
}

export const normalizeHexColor = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  if (trimmed.startsWith('#')) return trimmed.toUpperCase()
  if (/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`
  }
  return trimmed
}

export const normalizePPTColor = (value?: PPTColor | string | null): PPTColor | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') {
    return PPTColor.ofFixed(normalizeHexColor(value))
  }
  return value
}

export const resolvePPTColorValue = (
  value?: PPTColor | string | null,
  schemeMap?: ThemeColors | Record<string, string> | null,
): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return normalizeHexColor(value)
  const defaultSchemeMap = schemeMap || useSlidesStore.getState().theme?.themeColors || null
  if (value.scheme && defaultSchemeMap && (defaultSchemeMap as Record<string, string>)[value.scheme]) {
    const recalculated = PPTColorCalculator.recalculate(value, defaultSchemeMap as Record<string, string>)
    return recalculated ? normalizeHexColor(recalculated) : normalizeHexColor(value.value || '')
  }
  if (!value.value) return undefined
  const normalized = normalizeHexColor(value.value)
  const alphaTransform = value.transforms?.find((item) => item.type === 'alpha')
  if (!alphaTransform) return normalized
  const alpha = Math.max(0, Math.min(1, alphaTransform.value))
  const match = /^#([0-9A-F]{6})([0-9A-F]{2})?$/.exec(normalized)
  if (!match) return normalized
  if (alpha >= 0.999) return `#${match[1]}`
  const alphaHex = Math.max(0, Math.min(255, Math.round(alpha * 255)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()
  return `#${match[1]}${alphaHex}`
}
