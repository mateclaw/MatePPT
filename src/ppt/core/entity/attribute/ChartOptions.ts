/**
 * 图表选项
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.ChartOptions
 */
export interface ChartOptions {
  /** 是否堆叠 */
  stack?: boolean
  /** 线条是否平滑 */
  lineSmooth?: boolean
  /** 柱/条方向：horizontal/vertical */
  barDirection?: string
  /** 系列分组：standard/stacked/percentStacked */
  grouping?: string
  /** 圆环空心大小 */
  holeSize?: number
  /** 散点样式 */
  scatterStyle?: string
  /** 雷达图样式：standard/markers/filled */
  radarStyle?: string
  /** 是否显示数据标签 */
  showDataLabel?: boolean
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 是否显示系列名称 */
  showSeriesName?: boolean
  /** 是否显示类别名称 */
  showCategoryName?: boolean
  /** 是否显示图例 */
  showLegend?: boolean
}
