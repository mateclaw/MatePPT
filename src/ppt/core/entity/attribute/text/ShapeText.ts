import { Gradient } from '../Gradient'
import { TextAlign, TextVerticalAlign } from '../TextAlign'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";


/**
 * 形状内文本配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.text.ShapeText
 */
export interface ShapeText {
  /** 富文本 HTML 内容 */
  content?: string
  /** 默认字体 */
  fontName?: string
  /** 默认字号 */
  fontSize?: number
  /** 默认颜色 */
  fontColor?: PPTColor
  /** 水平对齐：left/center/right/justify */
  alignH?: TextAlign
  /** 垂直对齐：top/middle/bottom */
  alignV?: TextVerticalAlign
  /** 文本方向：true=竖排, false=横排 */
  vertical?: boolean
  /** 竖排类型：vertical/eastAsian/mongolian */
  verticalType?: string
  /** 文本渐变填充 */
  gradient?: Gradient
  /** 字间距（像素） */
  wordSpace?: number

  /**
   * 行间距：
   * - 正数：表示倍数
   * - 负数：表示固定磅值
   */
  lineHeight?: number
  /** 段前间距（像素） */
  paragraphSpace?: number
  /** 文本框自动适配模式 */
  autoFit?: string
  /** 是否自动换行 */
  wrapText?: boolean
  /** 文本自身旋转角度 */
  textRotation?: number

  /** 文本边距 */
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
}
