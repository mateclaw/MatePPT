import { useMemo } from 'react'
import type { ImageFilters, ImageElementFilterKeys } from '@/ppt/core'

const getFilterUnit = (key: ImageElementFilterKeys) => {
  if (key === 'blur') return 'px'
  if (key === 'hueRotate') return 'deg'
  return '%'
}

const toCssFilterKey = (key: ImageElementFilterKeys) => (key === 'hueRotate' ? 'hue-rotate' : key)

const toCssFilterValue = (key: ImageElementFilterKeys, value: unknown) => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number' && !Number.isNaN(value)) return `${value}${getFilterUnit(key)}`
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    if (/[a-z%]/i.test(trimmed)) return trimmed
    const num = parseFloat(trimmed)
    if (Number.isNaN(num)) return undefined
    if (key === 'opacity' && num > 0 && num <= 1) return trimmed
    return `${num}${getFilterUnit(key)}`
  }
  return undefined
}

export const useFilter = (filters: ImageFilters | undefined) => {
  const filter = useMemo(() => {
    if (!filters) return ''
    const keys = Object.keys(filters) as ImageElementFilterKeys[]
    const parts: string[] = []
    for (const key of keys) {
      const value = toCssFilterValue(key, filters[key])
      if (!value) continue
      parts.push(`${toCssFilterKey(key)}(${value})`)
    }
    return parts.join(' ')
  }, [filters])

  return {
    filter,
  }
}

export default useFilter
