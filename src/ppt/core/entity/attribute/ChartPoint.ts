/**
 * 图表数据点
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.ChartPoint
 */
export interface ChartPoint {
  /** X 轴数值或索引 */
  x?: number
  /** Y 轴数值 */
  y?: number
  /** 气泡图大小 */
  size?: number
}
