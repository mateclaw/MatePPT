import { ChartPoint } from './ChartPoint'

/**
 * 图表系列数据
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.ChartSeries
 */
export interface ChartSeries {
  /** 系列名称 */
  key?: string
  /** 数据点列表 */
  values?: ChartPoint[]
  /** X 轴标签映射（索引 -> 标签） */
  xlabels?: Record<number, string>
}
