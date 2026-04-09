import { Gradient } from '../Gradient'
import { Shadow } from '../Shadow'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 图表文本样式
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.text.ChartText
 */
export interface ChartText {
  /** 字体名称 */
  fontName?: string
  /** 字体大小 */
  fontSize?: number
  /** 字体颜色 */
  fontColor?: PPTColor
  /** 渐变填充 */
  gradient?: Gradient
  /** 文字高亮色 */
  highlight?: PPTColor
  /** 文本框背景色 */
  backgroundColor?: PPTColor
  /** 文本框背景渐变 */
  backgroundGradient?: Gradient
  /** 是否粗体 */
  bold?: boolean
  /** 是否斜体 */
  italic?: boolean
  /** 是否下划线 */
  underline?: boolean
  /** 是否删除线 */
  strikethrough?: boolean
  /** 文本阴影 */
  textShadow?: Shadow
}
