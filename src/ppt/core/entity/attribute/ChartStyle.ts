import { ChartText } from './text/ChartText'

/**
 * 图表文本样式配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.ChartStyle
 */
export interface ChartStyle {
  /** 图表标题样式 */
  titleStyle?: ChartText
  /** X 轴标题样式 */
  xAxisTitleStyle?: ChartText
  /** Y 轴标题样式 */
  yAxisTitleStyle?: ChartText
  /** 图例样式 */
  legendStyle?: ChartText
  /** 坐标轴刻度标签样式 */
  axisLabelStyle?: ChartText
  /** 分类标签样式 */
  categoryLabelStyle?: ChartText
  /** 数据标签样式 */
  dataLabelStyle?: ChartText
  /** 柱子间距百分比（0-500）；建议前端不要处理，使用ECharts默认值（不读取，也不修改此字段） */
  gapWidth?: number
  /** 对应ECharts的barGap，重叠百分比（-100 ~ 100） */
  overlap?: number
}
