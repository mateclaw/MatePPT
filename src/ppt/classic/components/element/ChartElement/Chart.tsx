import React, { type FC, useMemo, useEffect, useRef } from 'react'
import tinycolor from 'tinycolor2'
import type { ChartData, ChartOptions, ChartType, ChartStyle } from '@/ppt/core'
import { getChartOption } from './chartOption'
import styles from './Chart.module.scss'

import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart } from 'echarts/charts'
import { LegendComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { TitleComponent } from 'echarts/components';

echarts.use([BarChart, LineChart, PieChart, ScatterChart, RadarChart, LegendComponent, SVGRenderer,TitleComponent])

interface ChartProps {
  width: number
  height: number
  type: ChartType
  data: ChartData
  themeColors: string[]
  textColor?: string
  lineColor?: string
  options?: ChartOptions
  title?: string
  style?: ChartStyle
}

const Chart: FC<ChartProps> = ({
  width,
  height,
  type,
  data,
  themeColors: rawThemeColors,
  textColor,
  lineColor,
  options,
  title,
  style,
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const themeColors = useMemo(() => {
    if (!rawThemeColors || !rawThemeColors.length) {
      return []
    }
    if (rawThemeColors.length >= 10) {
      return rawThemeColors
    }
    if (rawThemeColors.length === 1) {
      return tinycolor(rawThemeColors[0])
        .analogous(10)
        .map((color) => color.toRgbString())
    }

    const len = rawThemeColors.length
    const supplement = tinycolor(rawThemeColors[len - 1])
      .analogous(10 + 1 - len)
      .map((color) => color.toRgbString())
    return [...rawThemeColors.slice(0, len - 1), ...supplement]
  }, [rawThemeColors])

  const safeData = useMemo<ChartData>(() => {
    return {
      labels: data?.labels || [],
      legends: data?.legends || [],
      series: data?.series || [],
      xAxisName: data?.xAxisName,
      yAxisName: data?.yAxisName,
    }
  }, [data])

  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    chartInstanceRef.current = echarts.init(chartRef.current, null, {
      renderer: 'svg',
    })

    resizeObserverRef.current = new ResizeObserver(() => {
      chartInstanceRef.current?.resize()
    })
    resizeObserverRef.current.observe(chartRef.current)

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
      chartInstanceRef.current?.dispose()
      chartInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartInstanceRef.current) {
      return
    }

    const option = getChartOption({
      type,
      data: safeData,
      themeColors,
      textColor,
      lineColor,
      lineSmooth: options?.lineSmooth || false,
      stack: options?.stack || false,
      title,
      style,
      showLegend: options?.showLegend || false,
    })
    if (option) {
      chartInstanceRef.current.setOption(option, true)
    }
  }, [type, safeData, themeColors, textColor, lineColor, options?.lineSmooth, options?.stack, width, height, title, style])

  return (
    <div className={styles.chart} ref={chartRef} />
  )
}

export default Chart
