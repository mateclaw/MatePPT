import { useMemo } from 'react'
import type { TableTheme } from '@/ppt/core'
import { getTableSubThemeColor } from '@/ppt/utils/element'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { THEME_COLOR_KEYS, type ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

export const useSubThemeColor = (theme: TableTheme | undefined) => {
  const themeColors = useSlidesStore((state) => state.theme?.themeColors)
  const resolveThemeMap = (raw: ThemeColors | Record<string, string> | string[] | null | undefined) => {
    if (!raw) return null
    if (Array.isArray(raw)) {
      const next: Record<string, string> = {}
      THEME_COLOR_KEYS.forEach((key, index) => {
        const value = raw[index]
        if (typeof value === 'string') next[key] = value
      })
      return Object.keys(next).length ? next : null
    }
    return raw as Record<string, string>
  }
  const resolvedThemeMap = resolveThemeMap(themeColors)
  const subThemeColor = useMemo(() => {
    if (!theme) return ['', '']
    const resolved = resolvePPTColorValue(theme.color, resolvedThemeMap || undefined)
    if (!resolved) return ['', '']
    return getTableSubThemeColor(resolved)
  }, [theme, resolvedThemeMap])

  return {
    subThemeColor,
  }
}

export default useSubThemeColor
