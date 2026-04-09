import type { ComposeOption } from 'echarts/core'

import type {
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
  RadarSeriesOption,
} from 'echarts/charts'
import type { ChartData, ChartType, ChartStyle, ChartText } from '@/ppt/core'

type EChartOption = ComposeOption<
  BarSeriesOption | LineSeriesOption | PieSeriesOption | ScatterSeriesOption | RadarSeriesOption
>

export interface ChartOptionPayload {
  type: ChartType
  data: ChartData
  themeColors: string[]
  textColor?: string
  lineColor?: string
  lineSmooth?: boolean
  stack?: boolean
  title?: string
  style?: ChartStyle
  showLegend?: boolean
  
}

const buildTextStyle = (style?: ChartText) => {
  if (!style) {
    return {}
  }
  const textStyle: Record<string, unknown> = {}
  if (style.fontColor) {
    textStyle.color = style.fontColor
  }
  if (style.fontName) {
    textStyle.fontFamily = style.fontName
  }
  if (style.fontSize) {
    textStyle.fontSize = style.fontSize
  }
  if (style.bold !== undefined) {
    textStyle.fontWeight = style.bold ? 'bold' : 'normal'
  }
  if (style.italic !== undefined) {
    textStyle.fontStyle = style.italic ? 'italic' : 'normal'
  }
  if (style.underline || style.strikethrough) {
    textStyle.textDecoration = [
      style.underline ? 'underline' : '',
      style.strikethrough ? 'line-through' : '',
    ].filter(Boolean).join(' ')
  }
  if (style.backgroundColor) {
    textStyle.backgroundColor = style.backgroundColor
  }
  if (style.textShadow) {
    if (style.textShadow.color) {
      textStyle.textShadowColor = style.textShadow.color
    }
    if (style.textShadow.blur !== undefined) {
      textStyle.textShadowBlur = style.textShadow.blur
    }
    if (style.textShadow.h !== undefined) {
      textStyle.textShadowOffsetX = style.textShadow.h
    }
    if (style.textShadow.v !== undefined) {
      textStyle.textShadowOffsetY = style.textShadow.v
    }
  }
  return textStyle
}

const isEmptyStyle = (style: Record<string, unknown>) => Object.keys(style).length === 0

export const getChartOption = ({
  type,
  data,
  themeColors,
  textColor,
  lineColor,
  lineSmooth,
  stack,
  title,
  style,
  showLegend,
}: ChartOptionPayload): EChartOption | null => {
  if (!data || !data.series || data.series.length === 0) {
    return null
  }
  const baseTextStyle = textColor
    ? {
      color: textColor,
    }
    : {}

  const titleTextStyle = { ...baseTextStyle, ...buildTextStyle(style?.titleStyle) }
  const legendTextStyle = { ...baseTextStyle, ...buildTextStyle(style?.legendStyle) }
  const axisLabelTextStyle = { ...baseTextStyle, ...buildTextStyle(style?.axisLabelStyle) }
  const categoryLabelTextStyle = { ...baseTextStyle, ...buildTextStyle(style?.categoryLabelStyle) }
  const dataLabelTextStyle = { ...baseTextStyle, ...buildTextStyle(style?.dataLabelStyle) }
  const xAxisNameTextStyle = { ...baseTextStyle, ...buildTextStyle(style?.xAxisTitleStyle) }
  const yAxisNameTextStyle = { ...baseTextStyle, ...buildTextStyle(style?.yAxisTitleStyle) }

  const axisLineColor = (axisLabelTextStyle as { color?: string }).color || baseTextStyle.color

  const axisLine = axisLineColor
    ? {
      lineStyle: {
        color: axisLineColor,
      },
    }
    : undefined

  const axisLabel = !isEmptyStyle(axisLabelTextStyle)
    ? axisLabelTextStyle
    : undefined

  const splitLine = lineColor
    ? {
      lineStyle: {
        color: lineColor,
      },
    }
    : {}

  const legendText = !isEmptyStyle(legendTextStyle) ? legendTextStyle : undefined

  const legend =
    showLegend && data.series.length > 1
      ? {
        top: 'bottom',
        textStyle: legendText,
      }
      : {
        show: false,
      }

  const barCategoryGap = style?.gapWidth !== undefined ? `${style.gapWidth}%` : undefined
  const barGap = style?.overlap !== undefined ? `${style.overlap}%` : undefined
  const seriesLabelStyle = !isEmptyStyle(dataLabelTextStyle) ? dataLabelTextStyle : undefined
  const pieLabelStyle = showLegend && !isEmptyStyle(dataLabelTextStyle) ? dataLabelTextStyle : (
    !isEmptyStyle(categoryLabelTextStyle) ? categoryLabelTextStyle : undefined
  )


  if (type === 'column') {
    return {
      color: themeColors,
      textStyle: baseTextStyle,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: !isEmptyStyle(titleTextStyle) ? titleTextStyle : undefined,
        }
        : undefined,
      legend,
      xAxis: {
        type: 'category',
        data: data.labels,
        name: data.xAxisName,
        nameTextStyle: !isEmptyStyle(xAxisNameTextStyle) ? xAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
      },
      yAxis: {
        type: 'value',
        name: data.yAxisName,
        nameTextStyle: !isEmptyStyle(yAxisNameTextStyle) ? yAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
        splitLine,
      },
      series: data.series.map((item, index) => {
        const seriesItem: BarSeriesOption = {
          data: item,
          name: data.legends[index],
          type: 'bar',
          label: {
            show: true,
            ...(seriesLabelStyle || {}),
          },
          itemStyle: {
            borderRadius: [2, 2, 0, 0],
          },
        }
        // if (barCategoryGap) seriesItem.barCategoryGap = barCategoryGap
        if (barGap) seriesItem.barGap = barGap
        if (stack) seriesItem.stack = 'A'
        return seriesItem
      }),
    }
  }
  if (type === 'bar') {
    return {
      color: themeColors,
      textStyle: baseTextStyle,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: !isEmptyStyle(titleTextStyle) ? titleTextStyle : undefined,
        }
        : undefined,
      legend,
      yAxis: {
        type: 'category',
        data: data.labels,
        name: data.yAxisName,
        nameTextStyle: !isEmptyStyle(yAxisNameTextStyle) ? yAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
      },
      xAxis: {
        type: 'value',
        name: data.xAxisName,
        nameTextStyle: !isEmptyStyle(xAxisNameTextStyle) ? xAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
        splitLine,
      },
      series: data.series.map((item, index) => {
        const seriesItem: BarSeriesOption = {
          data: item,
          name: data.legends[index],
          type: 'bar',
          label: {
            show: true,
            ...(seriesLabelStyle || {}),
          },
          itemStyle: {
            borderRadius: [0, 2, 2, 0],
          },
        }
        // if (barCategoryGap) seriesItem.barCategoryGap = barCategoryGap
        if (barGap) seriesItem.barGap = barGap
        if (stack) seriesItem.stack = 'A'
        return seriesItem
      }),
    }
  }
  if (type === 'line') {
    return {
      color: themeColors,
      textStyle: baseTextStyle,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: !isEmptyStyle(titleTextStyle) ? titleTextStyle : undefined,
        }
        : undefined,
      legend,
      xAxis: {
        type: 'category',
        data: data.labels,
        name: data.xAxisName,
        nameTextStyle: !isEmptyStyle(xAxisNameTextStyle) ? xAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
      },
      yAxis: {
        type: 'value',
        name: data.yAxisName,
        nameTextStyle: !isEmptyStyle(yAxisNameTextStyle) ? yAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
        splitLine,
      },
      series: data.series.map((item, index) => {
        const seriesItem: LineSeriesOption = {
          data: item,
          name: data.legends[index],
          type: 'line',
          smooth: lineSmooth,
          label: {
            show: true,
            ...(seriesLabelStyle || {}),
          },
        }
        if (stack) seriesItem.stack = 'A'
        return seriesItem
      }),
    }
  }
  if (type === 'pie') {
    return {
      color: themeColors,
      textStyle: baseTextStyle,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: !isEmptyStyle(titleTextStyle) ? titleTextStyle : undefined,
        }
        : undefined,
      legend,
      series: [
        {
          data: data.series[0].map((item, index) => ({
            value: item,
            name: data.labels[index],
          })),
          label: {
            ...(pieLabelStyle || {
              show: false,
            }),
          },
          type: 'pie',
          radius: '70%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
            label: {
            ...(pieLabelStyle || {
              show: false,
            }),
          },
          },
        },
      ],
    }
  }
  if (type === 'ring') {
    return {
      color: themeColors,
      textStyle: baseTextStyle,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: !isEmptyStyle(titleTextStyle) ? titleTextStyle : undefined,
        }
        : undefined,
      legend,
      series: [
        {
          data: data.series[0].map((item, index) => ({
            value: item,
            name: data.labels[index],
          })),
          label: {
            ...(pieLabelStyle || {
              show: false,
            }),
          },
          type: 'pie',
          radius: ['40%', '70%'],
          padAngle: 1,
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
          },
          emphasis: {
            label: {
            ...(pieLabelStyle || {
              show: false,
            }),
          },
          },
        },
      ],
    }
  }
  if (type === 'area') {
    return {
      color: themeColors,
      textStyle: baseTextStyle,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: !isEmptyStyle(titleTextStyle) ? titleTextStyle : undefined,
        }
        : undefined,
      legend,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.labels,
        name: data.xAxisName,
        nameTextStyle: !isEmptyStyle(xAxisNameTextStyle) ? xAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
      },
      yAxis: {
        type: 'value',
        name: data.yAxisName,
        nameTextStyle: !isEmptyStyle(yAxisNameTextStyle) ? yAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
        splitLine,
      },
      series: data.series.map((item, index) => {
        const seriesItem: LineSeriesOption = {
          data: item,
          name: data.legends[index],
          type: 'line',
          areaStyle: {},
          label: {
            show: true,
            ...(seriesLabelStyle || {}),
          },
        }
        if (stack) seriesItem.stack = 'A'
        return seriesItem
      }),
    }
  }
  if (type === 'radar') {
    return {
      color: themeColors,
      textStyle: baseTextStyle,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: !isEmptyStyle(titleTextStyle) ? titleTextStyle : undefined,
        }
        : undefined,
      legend,
      radar: {
        indicator: data.labels.map((item) => ({ name: item })),
        splitLine,
        axisLine: lineColor
          ? {
            lineStyle: {
              color: lineColor,
            },
          }
          : undefined,
      },
      series: [
        {
          data: data.series.map((item, index) => ({
            value: item,
            name: data.legends[index],
          })),
          type: 'radar',
        },
      ],
    }
  }
  if (type === 'scatter') {
    const formatedData = []
    for (let i = 0; i < data.series[0].length; i++) {
      const x = data.series[0][i]
      const y = data.series[1] ? data.series[1][i] : x
      formatedData.push([x, y])
    }

    return {
      color: themeColors,
      textStyle: baseTextStyle,
      title: title
        ? {
          text: title,
          left: 'center',
          textStyle: !isEmptyStyle(titleTextStyle) ? titleTextStyle : undefined,
        }
        : undefined,
      xAxis: {
        name: data.xAxisName,
        nameTextStyle: !isEmptyStyle(xAxisNameTextStyle) ? xAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
        splitLine,
      },
      yAxis: {
        name: data.yAxisName,
        nameTextStyle: !isEmptyStyle(yAxisNameTextStyle) ? yAxisNameTextStyle : undefined,
        axisLine,
        axisLabel,
        splitLine,
      },
      series: [
        {
          symbolSize: 12,
          data: formatedData,
          type: 'scatter',
        },
      ],
    }
  }

  return null
}
