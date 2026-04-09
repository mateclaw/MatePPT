/**
 * 图表数据
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.ChartData
 */
export interface ChartData {
  /** X 轴标签 */
  labels?: string[]
  /** 图例名称 */
  legends?: string[]
  /** 系列数据（series -> category -> value） */
  series?: number[][]
  /** X 轴名称 */
  xAxisName?: string
  /** Y 轴名称 */
  yAxisName?: string
  /** 数据数字格式（如 0%, 0.00） */
  numberFormat?: string
  /** 分类轴数字类型：text/number/date */
  categoryType?: string
  /** 分类轴数字/日期格式 */
  categoryNumberFormat?: string
}
