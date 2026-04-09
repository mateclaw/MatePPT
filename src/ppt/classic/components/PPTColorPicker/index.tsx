import { useEffect, useMemo, useState } from 'react'
import { Button, ColorPicker, InputNumber, Popover, Slider, Space } from 'antd'
import type { Color } from 'antd/es/color-picker'
import type { ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import { PPTColor, Transform } from '@/ppt/core/entity/presentation/PPTColor'
import { ThemeColorVariants } from '@/ppt/core/color/ThemeColorVariants'
import { isPPTColor, normalizeHexColor, normalizePPTColor, resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import styles from './index.module.scss'
import { Icon } from 'umi'
import { RightOutlined } from '@ant-design/icons'

const RECENT_STORAGE_KEY = 'ppt:recent-colors'
const MAX_RECENT = 12

const THEME_COLOR_ORDER: Array<{ key: keyof ThemeColors; label: string }> = [
  { key: 'dk1', label: '深色 1' },
  { key: 'lt1', label: '浅色 1' },
  { key: 'dk2', label: '深色 2' },
  { key: 'lt2', label: '浅色 2' },
  { key: 'accent1', label: '强调 1' },
  { key: 'accent2', label: '强调 2' },
  { key: 'accent3', label: '强调 3' },
  { key: 'accent4', label: '强调 4' },
  { key: 'accent5', label: '强调 5' },
  { key: 'accent6', label: '强调 6' },
  { key: 'hlink', label: '超链接' },
  { key: 'folHlink', label: '已访问超链接' },
]

const STANDARD_COLORS = [
  '#000000',
  '#FFFFFF',
  '#1F4E79',
  '#2E75B6',
  '#00B0F0',
  '#92D050',
  '#FFC000',
  '#FF0000',
  '#7030A0',
  '#7F7F7F',
  '#00B050',
  '#FFFF00',
]

const toHexWithAlpha = (color: Color): string => {
  const { r, g, b, a } = color.toRgb()
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))
  const toHex = (value: number) => clamp(value).toString(16).padStart(2, '0').toUpperCase()
  const alpha = clamp((a ?? 1) * 255)
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  return alpha < 255 ? `${hex}${toHex(alpha)}` : hex
}

const getAlphaFromHex = (value?: string): number => {
  if (!value) return 1
  const normalized = normalizeHexColor(value)
  const match = /^#([0-9A-F]{6})([0-9A-F]{2})?$/.exec(normalized)
  if (!match) return 1
  if (!match[2]) return 1
  return Math.max(0, Math.min(1, parseInt(match[2], 16) / 255))
}

const applyAlphaToHex = (value: string, alpha: number): string => {
  const normalized = normalizeHexColor(value)
  const match = /^#([0-9A-F]{6})([0-9A-F]{2})?$/.exec(normalized)
  if (!match) return normalized
  const hex = `#${match[1]}`
  if (alpha >= 0.999) return hex
  const alphaHex = Math.max(0, Math.min(255, Math.round(alpha * 255)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()
  return `${hex}${alphaHex}`
}

const loadRecentColors = (): PPTColor[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    return list
      .map((item) => {
        if (isPPTColor(item)) {
          const color = item as PPTColor
          const snapshot = Object.assign(new PPTColor(), {
            ...color,
            transforms: color.transforms
              ? color.transforms.map((t) => new Transform(t.type, t.value))
              : undefined,
          })
          if (snapshot.value) snapshot.value = normalizeHexColor(snapshot.value)
          return snapshot
        }
        if (typeof item === 'string') return PPTColor.ofFixed(normalizeHexColor(item))
        return undefined
      })
      .filter(Boolean) as PPTColor[]
  } catch (error) {
    return []
  }
}

const saveRecentColors = (colors: PPTColor[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(colors))
}

interface PPTColorPickerProps {
  value?: PPTColor | string | null
  onChange?: (color: PPTColor) => void
  themeColors?: ThemeColors | null
  disabled?: boolean
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
  children?: React.ReactNode
}

export default function PPTColorPicker({
  value,
  onChange,
  themeColors,
  disabled,
  placement = 'bottomLeft',
  children,
}: PPTColorPickerProps) {
  const slideThemeColors = useSlidesStore((state) => state.theme?.themeColors)
  const resolvedThemeColors = themeColors || slideThemeColors || null

  const resolvedValue = resolvePPTColorValue(value, resolvedThemeColors) || '#000000'
  const selectedColor = useMemo(() => {
    if (!value) return undefined
    if (typeof value === 'string') return PPTColor.ofFixed(normalizeHexColor(value))
    return value
  }, [value])
  const activeValue = normalizeHexColor(resolvedValue)

  const [open, setOpen] = useState(false)
  const [recentColors, setRecentColors] = useState<PPTColor[]>([])
  const [customColor, setCustomColor] = useState(activeValue)
  const [alphaPercent, setAlphaPercent] = useState(100)
  const [alphaTouched, setAlphaTouched] = useState(false)

  useEffect(() => {
    setRecentColors(loadRecentColors())
  }, [])

  useEffect(() => {
    if (!open) return
    setCustomColor(activeValue)
    setAlphaTouched(false)
    const nextAlpha = (() => {
      if (selectedColor?.transforms) {
        const alphaTransform = selectedColor.transforms.find((item) => item.type === 'alpha')
        if (alphaTransform) return Math.round(Math.max(0, Math.min(1, alphaTransform.value)) * 100)
      }
      if (selectedColor?.value) return Math.round(getAlphaFromHex(selectedColor.value) * 100)
      return Math.round(getAlphaFromHex(activeValue) * 100)
    })()
    setAlphaPercent(nextAlpha)
  }, [open, activeValue])

  const getColorKey = (color: PPTColor) => {
    if (color.scheme) {
      const transforms = color.transforms || []
      const transformKey = transforms.map((item) => `${item.type}:${item.value}`).join('|')
      return `scheme:${color.scheme}|${transformKey}`
    }
    return `fixed:${normalizeHexColor(color.value || '')}`
  }

  const addRecentColor = (color: PPTColor) => {
    const normalizedColor = normalizePPTColor(color) || color
    const snapshot = Object.assign(new PPTColor(), {
      ...normalizedColor,
      transforms: normalizedColor.transforms
        ? normalizedColor.transforms.map((item) => new Transform(item.type, item.value))
        : undefined,
    })
    if (snapshot.value) {
      snapshot.value = normalizeHexColor(snapshot.value)
    }
    const next = [
      snapshot,
      ...recentColors.filter((item) => getColorKey(item) !== getColorKey(snapshot)),
    ].slice(0, MAX_RECENT)
    setRecentColors(next)
    saveRecentColors(next)
  }

  const emitChange = (nextColor: PPTColor, close = true, addRecent = true) => {
    if (addRecent) addRecentColor(nextColor)
    onChange?.(nextColor)
    if (close) setOpen(false)
  }

  const themeKeys = useMemo(
    () => THEME_COLOR_ORDER.filter((item) => resolvedThemeColors?.[item.key]).map((item) => item.key),
    [resolvedThemeColors],
  )

  const themeItems = useMemo(
    () =>
      themeKeys.map((key) => ({
        key,
        color: normalizeHexColor(resolvedThemeColors?.[key] || ''),
      })),
    [themeKeys, resolvedThemeColors],
  )

  const normalizeTransforms = (items?: PPTColor['transforms'], ignoreAlpha?: boolean) => {
    const list = items || []
    return ignoreAlpha ? list.filter((item) => item.type !== 'alpha') : list
  }

  const isSameTransforms = (left?: PPTColor['transforms'], right?: PPTColor['transforms'], ignoreAlpha?: boolean) => {
    const a = normalizeTransforms(left, ignoreAlpha)
    const b = normalizeTransforms(right, ignoreAlpha)
    if (a.length !== b.length) return false
    return a.every((item, index) => item.type === b[index].type && item.value === b[index].value)
  }

  const isThemeSelected = (scheme: string, transforms?: PPTColor['transforms']) => {
    if (!selectedColor?.scheme) return false
    if (selectedColor.scheme !== scheme) return false
    const selectedTransforms = selectedColor.transforms || []
    const targetTransforms = transforms || []
    if (!selectedTransforms.length && !targetTransforms.length) return true
    return isSameTransforms(selectedTransforms, targetTransforms, true)
  }

  const isFixedSelected = (color: string) => {
    if (!selectedColor) return false
    if (selectedColor.scheme) return false
    if (selectedColor.transforms && selectedColor.transforms.length) return false
    return normalizeHexColor(selectedColor.value || '') === normalizeHexColor(color)
  }

  const isSameColor = (left?: PPTColor, right?: PPTColor) => {
    if (!left || !right) return false
    if (left.scheme || right.scheme) {
      if (left.scheme !== right.scheme) return false
      return isSameTransforms(left.transforms, right.transforms)
    }
    return normalizeHexColor(left.value || '') === normalizeHexColor(right.value || '')
  }

  const variantRows = useMemo(() => {
    if (!resolvedThemeColors) return []
    const byScheme = themeKeys.map((key) => ThemeColorVariants.getVariantColors(key, resolvedThemeColors as unknown as Record<string, string>))
    return Array.from({ length: 5 }).map((_, rowIndex) =>
      byScheme.map((column) => column[rowIndex] || null),
    )
  }, [resolvedThemeColors, themeKeys])

  const applyAlphaToColor = (color: PPTColor, percent: number) => {
    const alpha = Math.max(0, Math.min(1, percent / 100))
    const next = Object.assign(new PPTColor(), {
      ...color,
      transforms: color.transforms ? color.transforms.filter((item) => item.type !== 'alpha') : undefined,
    })
    if (next.scheme) {
      if (alpha < 0.999) {
        next.transforms = [...(next.transforms || []), new Transform('alpha', alpha)]
      }
      return next
    }
    if (next.value) {
      next.value = applyAlphaToHex(next.value, alpha)
    }
    return next
  }

  const getEffectiveAlpha = () => {
    if (alphaTouched) return alphaPercent
    return alphaPercent === 0 ? 100 : alphaPercent
  }

  const handleThemeSelect = (scheme: string) => {
    if (!resolvedThemeColors || !(scheme in resolvedThemeColors)) return
    const base = resolvedThemeColors[scheme as keyof ThemeColors]
    if (!base) return
    const nextAlpha = getEffectiveAlpha()
    const nextColor = PPTColor.ofScheme(scheme, normalizeHexColor(base))
    setAlphaPercent(nextAlpha)
    emitChange(applyAlphaToColor(nextColor, nextAlpha))
  }

  const handleVariantSelect = (color: PPTColor | null) => {
    if (!color) return
    const nextAlpha = getEffectiveAlpha()
    setAlphaPercent(nextAlpha)
    emitChange(applyAlphaToColor(color, nextAlpha))
  }

  const handleFixedSelect = (color: string) => {
    const nextAlpha = getEffectiveAlpha()
    const fixed = PPTColor.ofFixed(normalizeHexColor(color))
    setAlphaPercent(nextAlpha)
    emitChange(applyAlphaToColor(fixed, nextAlpha))
  }

  const handleCustomApply = () => {
    emitChange(PPTColor.ofFixed(normalizeHexColor(customColor)), true)
  }


  const panelContent = (
    <div className={styles.panel}>
      <div className={styles.section}>
        <div className={styles.title}>主题色</div>
        <div
          className={styles.grid}
          style={{ ['--color-grid-cols' as any]: themeItems.length || 1 }}
        >
          {themeItems.map((item) => {

            return (
              <button
                key={item.key}
                type="button"
                className={`${styles.swatch} ${item.key} ${isThemeSelected(item.key) ? styles.active : ''}`}
                title={THEME_COLOR_ORDER.find((info) => info.key === item.key)?.label || item.key}
                style={{ backgroundColor: item.color }}
                onClick={() => handleThemeSelect(item.key)}
              />
            )
          }
          )}
        </div>
        {variantRows.length > 0 && (
          <div className={styles.variants}>
            {variantRows.map((row, rowIndex) => {

              return (
                <div
                  key={`variant-row-${rowIndex}`}
                  className={styles.grid}
                  style={{ ['--color-grid-cols' as any]: themeItems.length || 1 }}
                >
                  {row.map((color, index) => {
                    const value = color?.value ? normalizeHexColor(color.value) : ''
                    return (
                      <button
                        key={`${rowIndex}-${index}`}
                        type="button"
                        className={`${styles.swatch} ${color ? (isThemeSelected(color.scheme || '', color.transforms) ? styles.active : '') : ''}`}
                        style={{ backgroundColor: value || 'transparent' }}
                        onClick={() => handleVariantSelect(color)}
                        disabled={!color}
                      />
                    )
                  })}
                </div>
              )
            }

            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.title}>标准颜色</div>
        <div className={styles.grid} style={{ ['--color-grid-cols' as any]: STANDARD_COLORS.length }}>
          {STANDARD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`${styles.swatch} ${isFixedSelected(color) ? styles.active : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleFixedSelect(color)}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.title}>最近使用</div>
        {recentColors.length ? (
          <div className={styles.grid} style={{ ['--color-grid-cols' as any]: MAX_RECENT }}>
            {recentColors.map((color) => {
              const resolved = resolvePPTColorValue(color, resolvedThemeColors) || color.value || ''
              return (
                <button
                  key={getColorKey(color)}
                  type="button"
                  className={`${styles.swatch} ${isSameColor(selectedColor, color) ? styles.active : ''}`}
                  style={{ backgroundColor: resolved || 'transparent' }}
                  onClick={() => emitChange(color)}
                />
              )
            })}
          </div>
        ) : (
          <div className={styles.empty}>暂无最近颜色</div>
        )}
      </div>

      <div className={styles.section}>
        <ColorPicker
          value={customColor}
          allowClear={false}
          disabled={disabled}
          disabledAlpha={false}
          presets={[]}
          format="hex"
          onChange={(next) => {
            const hex = toHexWithAlpha(next)
            setCustomColor(hex)
            setAlphaPercent(Math.round(getAlphaFromHex(hex) * 100))
          }}
          panelRender={(panel) => (
            <div className={styles.customPanel}>
              {panel}
              <div className={styles.customActions}>
                <div className={styles.preview} style={{ backgroundColor: customColor }} />
                <Button size="small" type="primary" onClick={handleCustomApply}>
                  应用
                </Button>
              </div>
            </div>
          )}
        >
          <Button
            type="text"
            block
            disabled={disabled}
            className={`${styles.title} p-0 flex items-center justify-between hover:bg-gray-500 cursor-pointer`}
          >
            <Space>
              <Icon icon="local:ppt/icon-custom-colorpicker" width="16" height="16" />
              <span>自定义颜色</span>
            </Space>
            <RightOutlined />
          </Button>
        </ColorPicker>
      </div>

      <div className={styles.section}>
        <div className={styles.title}>透明</div>
        <div className={styles.customActions}>
          <Slider
            style={{ flex: 1, marginRight: 8 }}
            min={0}
            max={100}
            value={alphaPercent}
            onChange={(value) => {
              const nextValue = Number(value || 0)
              setAlphaTouched(true)
              setAlphaPercent(nextValue)
              if (selectedColor) {
                emitChange(applyAlphaToColor(selectedColor, nextValue), false, false)
              } else {
                setCustomColor((prev) => applyAlphaToHex(prev, nextValue / 100))
              }
            }}
            disabled={disabled}
          />
          <InputNumber
            min={0}
            max={100}
            value={alphaPercent}
            onChange={(value) => {
              const nextValue = Number(value || 0)
              setAlphaTouched(true)
              setAlphaPercent(nextValue)
              if (selectedColor) {
                emitChange(applyAlphaToColor(selectedColor, nextValue), false, false)
              } else {
                setCustomColor((prev) => applyAlphaToHex(prev, nextValue / 100))
              }
            }}
            disabled={disabled}
          />
          
        </div>
      </div>

    </div >
  )

  const trigger = children ? (
    <>
      {children}
    </>
  ) : (
    <button
      type="button"
      className={styles.triggerButton}
      style={{ backgroundColor: resolvedValue }}
      aria-label="color"
    />
  )

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (!disabled) setOpen(next)
      }}
      trigger="click"
      placement={placement}
      content={panelContent}
      destroyOnHidden
    >
      {trigger}
    </Popover>
  )
}
