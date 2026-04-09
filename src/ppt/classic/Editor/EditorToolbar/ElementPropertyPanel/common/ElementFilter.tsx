import { useEffect, useMemo, useState } from 'react'
import { Slider, Switch } from 'antd'

import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import type { ImageElementFilterKeys, ImageFilters, PPTImageElement } from '@/ppt/core'
import styles from './ElementFilter.module.scss'

// 需要注意类型定义，hue-rotate 和hueRotate
type FilterValues = Partial<ImageFilters>

const getFilterUnit = (key: ImageElementFilterKeys) => {
  if (key === 'blur') return 'px'
  if (key === 'hueRotate') return 'deg'
  return '%'
}

const toCssFilterKey = (key: ImageElementFilterKeys) => (key === 'hueRotate' ? 'hue-rotate' : key)

const normalizeFilterNumber = (value: unknown) => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return Number.isNaN(num) ? undefined : num
  }
  return undefined
}

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

interface FilterOption {
  label: string
  key: ImageElementFilterKeys
  default: number
  value: number
  unit: string
  max: number
  step: number
}

const defaultFilters: FilterOption[] = [
  { label: '模糊', key: 'blur', default: 0, value: 0, unit: 'px', max: 10, step: 1 },
  { label: '亮度', key: 'brightness', default: 100, value: 100, unit: '%', max: 200, step: 5 },
  { label: '对比度', key: 'contrast', default: 100, value: 100, unit: '%', max: 200, step: 5 },
  { label: '灰度', key: 'grayscale', default: 0, value: 0, unit: '%', max: 100, step: 5 },
  { label: '饱和度', key: 'saturate', default: 100, value: 100, unit: '%', max: 200, step: 5 },
  { label: '色相', key: 'hueRotate', default: 0, value: 0, unit: 'deg', max: 360, step: 10 },
  { label: '褐色', key: 'sepia', default: 0, value: 0, unit: '%', max: 100, step: 5 },
  { label: '反转', key: 'invert', default: 0, value: 0, unit: '%', max: 100, step: 5 },
  { label: '不透明度', key: 'opacity', default: 100, value: 100, unit: '%', max: 100, step: 5 },
]

const presetFilters: { label: string; values: FilterValues }[] = [
  { label: '黑白', values: { grayscale: 100 } },
  { label: '复古', values: { sepia: 50, contrast: 110, brightness: 90 } },
  { label: '锐化', values: { contrast: 150 } },
  { label: '柔和', values: { brightness: 110, contrast: 90 } },
  { label: '暖色', values: { sepia: 30, saturate: 135 } },
  { label: '明亮', values: { brightness: 110, contrast: 110 } },
  { label: '鲜艳', values: { saturate: 200 } },
  { label: '模糊', values: { blur: 2 } },
  // { label: '反转', values: { invert: 100 } },
]

export default function ElementFilter() {
  const slidesStore = useSlidesStore()
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const [filterOptions, setFilterOptions] = useState<FilterOption[]>(
    JSON.parse(JSON.stringify(defaultFilters)),
  )
  const [hasFilters, setHasFilters] = useState(false)

  useEffect(() => {
    if (!handleElement || handleElement.type !== 'image') {
      setHasFilters(false)
      return
    }
    const filters = (handleElement as PPTImageElement).filters as unknown as FilterValues | undefined
    if (filters) {
      setFilterOptions(
        defaultFilters.map((item) => {
          const filterValue = filters[item.key]
          const normalizedValue = normalizeFilterNumber(filterValue)
          if (normalizedValue !== undefined) return { ...item, value: normalizedValue }
          return item
        }),
      )
      setHasFilters(true)
    } else {
      setFilterOptions(JSON.parse(JSON.stringify(defaultFilters)))
      setHasFilters(false)
    }
  }, [handleElement])

  const filters2Style = (filters: FilterValues) => {
    const keys = Object.keys(filters) as ImageElementFilterKeys[]
    return keys
      .map((key) => {
        const value = toCssFilterValue(key, filters[key])
        if (!value) return null
        return `${toCssFilterKey(key)}(${value})`
      })
      .filter((value): value is string => Boolean(value))
      .join(' ')
  }

  const updateFilter = (filter: FilterOption, value: number) => {
    if (!handleElement) return
    const element = handleElement as PPTImageElement
    const originFilters = (element.filters || {}) as unknown as FilterValues
    const filters = { ...originFilters, [filter.key]: value }
    slidesStore.updateElement({ id: element.id, props: { filters } as any })
    addHistorySnapshot()
  }

  const toggleFilters = (checked: boolean) => {
    if (!handleElement) return
    if (checked) {
      slidesStore.updateElement({ id: handleElement.id, props: { filters: {} } })
    } else {
      slidesStore.removeElementProps({ id: handleElement.id, propName: 'filters' })
    }
    addHistorySnapshot()
  }

  const applyPresetFilters = (filters: FilterValues) => {
    if (!handleElement) return
    slidesStore.updateElement({ id: handleElement.id, props: { filters } as any })
    addHistorySnapshot()
  }

  const handleImageElement = useMemo(() => {
    if (!handleElement || handleElement.type !== 'image') return null
    return handleElement as PPTImageElement
  }, [handleElement])

  if (!handleImageElement) return null

  return (
    <div>
      <div className={styles.row}>
        <div style={{ flex: 2 }}>启用滤镜：</div>
        <div className={styles['switch-wrapper']} style={{ flex: 3 }}>
          <Switch checked={hasFilters} onChange={toggleFilters} />
        </div>
      </div>
      {hasFilters && (
        <>
          <div className={styles.presets}>
            {presetFilters.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={styles['preset-item']}
                onClick={() => applyPresetFilters(item.values)}
              >
                <img
                  src={handleImageElement.src}
                  alt=""
                  style={{ filter: filters2Style(item.values) }}
                />
                <span className={styles['preset-label']}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.filter}>
            {filterOptions.map((filter) => (
              <div className={styles['filter-item']} key={filter.key}>
                <div className={styles.name}>{filter.label}</div>
                <Slider
                  className={styles['filter-slider']}
                  max={filter.max}
                  min={0}
                  step={filter.step}
                  value={filter.value}
                  onChange={(value) => updateFilter(filter, value as number)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
