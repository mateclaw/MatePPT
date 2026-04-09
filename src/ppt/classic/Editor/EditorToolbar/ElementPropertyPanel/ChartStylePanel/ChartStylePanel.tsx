import { useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, Divider, Modal, Popover } from 'antd'
import { Icon } from 'umi'

import { useSlidesStore } from '@/ppt/store'
import type { ChartData, ChartOptions, ChartType, PPTChartElement } from '@/ppt/core'
import { emitter, EmitterEvents } from '@/ppt/utils/emitter'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { CHART_PRESET_THEMES } from '@/ppt/configs/chart'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { normalizePPTColor, resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { THEME_COLOR_KEYS, type ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import ElementOutline from '../common/ElementOutline'
import ColorButton from '../common/ColorButton'
import ChartDataEditor from './ChartDataEditor'
import ThemeColorsSetting from './ThemeColorsSetting'
import styles from './ChartStylePanel.module.scss'

export default function ChartStylePanel() {
  const slidesStore = useSlidesStore()
  const theme = slidesStore.theme
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const handleChartElement = handleElement as PPTChartElement | null
  const [chartDataEditorVisible, setChartDataEditorVisible] = useState(false)
  const [themesVisible, setThemesVisible] = useState(false)
  const [themeColorsSettingVisible, setThemeColorsSettingVisible] = useState(false)

  const [fill, setFill] = useState('#fff')
  const [themeColors, setThemeColors] = useState<PPTColor[]>([])
  const [lineColor, setLineColor] = useState<PPTColor | undefined>()
  const [lineSmooth, setLineSmooth] = useState(false)
  const [stack, setStack] = useState(false)

  useEffect(() => {
    if (!handleChartElement || handleChartElement.type !== 'chart') return
    setFill(handleChartElement.fill || '#fff')
    setLineSmooth(handleChartElement.options?.lineSmooth || false)
    setStack(handleChartElement.options?.stack || false)
    setThemeColors((handleChartElement.themeColors || []).map((item) => normalizePPTColor(item) || PPTColor.ofFixed('#000000')))
    setLineColor(normalizePPTColor(handleChartElement.lineColor) || PPTColor.ofFixed('#E8ECF4'))
  }, [handleChartElement])

  useEffect(() => {
    const openDataEditor = () => setChartDataEditorVisible(true)
    emitter.on(EmitterEvents.OPEN_CHART_DATA_EDITOR, openDataEditor)
    return () => {
      emitter.off(EmitterEvents.OPEN_CHART_DATA_EDITOR, openDataEditor)
    }
  }, [])

  if (!handleChartElement) return null

  const updateElement = (props: Partial<PPTChartElement>) => {
    slidesStore.updateElement({ id: handleChartElement.id, props })
    addHistorySnapshot()
  }

  const updateData = (payload: { data: ChartData; type: ChartType }) => {
    setChartDataEditorVisible(false)
    updateElement({ data: payload.data, chartType: payload.type })
  }

  const updateOptions = (optionProps: ChartOptions) => {
    const newOptions = { ...handleChartElement.options, ...optionProps }
    updateElement({ options: newOptions })
  }

  const applyThemeColors = (colors: Array<PPTColor | string>, followSlideTheme = false) => {
    const normalized = colors.map((item) => normalizePPTColor(item) || PPTColor.ofFixed('#000000'))
    setThemeColors(normalized)
    updateElement({ themeColors: normalized, themeFollowSlide: followSlideTheme })
    setThemesVisible(false)
    setThemeColorsSettingVisible(false)
  }

  const chartSupportsStack = ['bar', 'column', 'area', 'line'].includes(handleChartElement.chartType)

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

  const resolvedThemeMap = useMemo(() => resolveThemeMap(theme.themeColors), [theme.themeColors])

  const slideThemeColors = useMemo(() => {
    if (!resolvedThemeMap) return []
    const chartKeys = THEME_COLOR_KEYS.filter((key) => key.startsWith('accent'))
    return chartKeys.map((key) => PPTColor.ofScheme(key, resolvedThemeMap[key] || '#000000'))
  }, [resolvedThemeMap])

  return (
    <div className={styles['chart-style-panel']}>
      <Button className={styles['full-width-btn']} onClick={() => setChartDataEditorVisible(true)}>
        <Icon icon="ri:edit-line" /> 编辑图表
      </Button>

      <Divider />

      {chartSupportsStack && (
        <>
          <div className={styles.row}>
            <Checkbox
              checked={stack}
              onChange={(e) => {
                const next = e.target.checked
                setStack(next)
                updateOptions({ stack: next })
              }}
              style={{ flex: 2 }}
            >
              堆叠样式
            </Checkbox>
            {handleChartElement.chartType === 'line' && (
              <Checkbox
                checked={lineSmooth}
                onChange={(e) => {
                  const next = e.target.checked
                  setLineSmooth(next)
                  updateOptions({ lineSmooth: next })
                }}
                style={{ flex: 3 }}
              >
                使用平滑曲线
              </Checkbox>
            )}
          </div>
          <Divider />
        </>
      )}

      <div className={styles.row}>
        <div style={{ width: '40%' }}>背景填充：</div>

        <div style={{ width: '60%' }}>
          <PPTColorPicker
            value={fill}
            onChange={(color) => {
              const resolved = resolvePPTColorValue(color)
              setFill(resolved)
              updateElement({ fill: resolved })
            }}
          >
            <div>
              <ColorButton color={fill} />
            </div>
          </PPTColorPicker>
        </div>

      </div>
      <div className={styles.row}>
        <div style={{ width: '40%' }}>网格颜色：</div>
        <div style={{ width: '60%' }}>
          <PPTColorPicker
            value={lineColor}
            onChange={(color) => {
              setLineColor(color)
              updateElement({ lineColor: color })
            }}
          >
            <div>
              <ColorButton color={resolvePPTColorValue(lineColor)} />
            </div>
          </PPTColorPicker>
        </div>
      </div>

      <div className={styles.row}>
        <div style={{ width: '40%' }}>主题配色：</div>
        <Popover
          trigger="click"
          open={themesVisible}
          onOpenChange={setThemesVisible}
          content={
            <div className={styles.themes}>
              <div className={styles.label}>预置图表主题：</div>
              <div className={styles['preset-themes']}>
                {CHART_PRESET_THEMES.map((item, index) => (
                  <div
                    key={`${item[0]}-${index}`}
                    className={styles['preset-theme']}
                    onClick={() => applyThemeColors(item, false)}
                  >
                    {item.map((color) => (
                      <div key={color} className={styles['preset-theme-color']} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                ))}
              </div>
              <div className={styles.label}>幻灯片主题：</div>
              <div className={styles['preset-themes']} style={{ marginBottom: -10 }}>
                <div className={styles['preset-theme']} onClick={() => applyThemeColors(slideThemeColors, true)}>
                  {slideThemeColors.map((color, index) => (
                    <div
                      key={`${color.scheme || 'fixed'}-${index}`}
                      className={styles['preset-theme-color']}
                      style={{ backgroundColor: resolvePPTColorValue(color, resolvedThemeMap || undefined) }}
                    />
                  ))}
                </div>
              </div>
              <Divider style={{ margin: '10px 0' }} />
              <Button className={styles['full-width-btn']} onClick={() => { setThemesVisible(false); setThemeColorsSettingVisible(true) }}>
                自定义配色
              </Button>
            </div>
          }
        >
          <div className={styles['color-list-btn']}>
            {themeColors.map((color, index) => (
              <div
                key={`${color.scheme || 'fixed'}-${index}`}
                className={styles['color-list-item']}
                style={{ backgroundColor: resolvePPTColorValue(color, resolvedThemeMap || undefined) }}
              />
            ))}
          </div>
        </Popover>
      </div>

      <Divider />
      <ElementOutline />

      <Modal
        open={chartDataEditorVisible}
        width={640}
        onCancel={() => setChartDataEditorVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <ChartDataEditor
          type={handleChartElement.chartType}
          data={handleChartElement.data}
          onClose={() => setChartDataEditorVisible(false)}
          onSave={updateData}
        />
      </Modal>

      <Modal
        open={themeColorsSettingVisible}
        width={310}
        onCancel={() => setThemeColorsSettingVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <ThemeColorsSetting colors={themeColors} onUpdate={applyThemeColors} />
      </Modal>
    </div>
  )
}
