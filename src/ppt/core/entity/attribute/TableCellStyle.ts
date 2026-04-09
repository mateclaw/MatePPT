import { Gradient } from './Gradient'
import { Outline } from './Outline'
import { TextAlign, TextVerticalAlign, } from './TextAlign'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 表格单元格样式
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.TableCellStyle
 */
export interface TableCellStyle {
  /** 是否粗体 */
  bold?: boolean
  /** 是否斜体 */
  em?: boolean
  /** 是否下划线 */
  underline?: boolean
  /** 是否删除线 */
  strikethrough?: boolean
  /** 字体颜色 */
  color?: PPTColor
  /** 渐变填充 */
  gradient?: Gradient
  /** 背景颜色 */
  backColor?: PPTColor
  /** 字体大小 */
  fontSize?: number
  /** 字体名称 */
  fontName?: string
  /** 水平对齐方式 */
  alignH?: TextAlign
  /** 垂直对齐方式 */
  alignV?: TextVerticalAlign
  /** 文本方向：true=竖排, false=横排 */
  vertical?: boolean
  /** 竖排类型：vertical/eastAsian/mongolian */
  verticalType?: string
  /** 文字高亮背景色 */
  highlight?: string

  /** 单元格内边距 */
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number

  /** 边框 */
  borderLeft?: Outline
  borderRight?: Outline
  borderTop?: Outline
  borderBottom?: Outline
}
