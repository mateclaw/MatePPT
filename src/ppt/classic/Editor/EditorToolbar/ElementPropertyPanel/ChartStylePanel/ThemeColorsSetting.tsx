import { useEffect, useState } from 'react'
import { Button } from 'antd'
import { Icon } from 'umi'

import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { normalizePPTColor, resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { THEME_COLOR_KEYS, type ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import ColorButton from '../common/ColorButton'
import styles from './ThemeColorsSetting.module.scss'

interface ThemeColorsSettingProps {
  colors: PPTColor[]
  onUpdate: (colors: PPTColor[]) => void
}

export default function ThemeColorsSetting({ colors, onUpdate }: ThemeColorsSettingProps) {
  const [themeColors, setThemeColors] = useState<PPTColor[]>([])
  const slideThemeColors = useSlidesStore((state) => state.theme?.themeColors)
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
  const resolvedThemeMap = resolveThemeMap(slideThemeColors)

  useEffect(() => {
    const normalized = colors
      .map((item) => normalizePPTColor(item) || PPTColor.ofFixed('#000000'))
    setThemeColors(normalized)
  }, [colors])

  const setThemeColorsAndUpdate = () => {
    onUpdate(themeColors)
  }

  const addThemeColor = () => {
    setThemeColors((prev) => [...prev, PPTColor.ofFixed('#00000000')])
  }

  const deleteThemeColor = (index: number) => {
    setThemeColors((prev) => prev.filter((_, i) => i !== index))
  }

  const updateColor = (index: number, value: PPTColor) => {
    setThemeColors((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  return (
    <div className={styles['theme-colors-setting']}>
      <div className={styles.title}>图表主题配色</div>
      <div className={styles.list}>
        {themeColors.map((item, index) => (
          <div key={`${item.scheme || 'fixed'}-${item.value || index}`} className={styles.row}>
            <div className={styles.label} style={{ width: '40%' }}>主题配色{index + 1}：</div>
            <div className={styles['color-btn-wrap']} style={{ width: '60%' }}>
              <PPTColorPicker value={item} onChange={(color) => updateColor(index, color)}>
                <div >
                  <ColorButton color={resolvePPTColorValue(item, resolvedThemeMap || undefined)} />
                  {index !== 0 && (
                    <div className={styles['delete-color-btn']} onClick={(e) => { e.stopPropagation(); deleteThemeColor(index) }}>
                      <Icon icon="ri:close-line" />
                    </div>
                  )}
                </div>
              </PPTColorPicker>

            </div>
          </div>
        ))}
        <Button style={{ width: '100%' }} disabled={themeColors.length >= 10} onClick={addThemeColor}>
          <Icon icon="ri:add-line" /> 添加主题色
        </Button>
      </div>
      <Button className={styles.btn} type="primary" onClick={setThemeColorsAndUpdate}>
        确认
      </Button>
    </div>
  )
}
