import { Gradient } from './Gradient'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 边框配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.Outline
 */
export interface Outline {
  /** 边框宽度 */
  width?: number
  /** 边框颜色 */
  color?: PPTColor
  /** 边框样式：solid/dashed/dotted */
  style?: string
  /** 自定义虚线数组（如 "5,2"） */
  strokeDasharray?: string
  /** 边框渐变色（优先于 color） */
  gradient?: Gradient
  /** 边框起点箭头样式：'null'(无), 'arrow'(箭头), 'dot'(圆点) */
  beginArrow?: string
  /** 边框终点箭头样式：'null'(无), 'arrow'(箭头), 'dot'(圆点) */
  endArrow?: string

}
