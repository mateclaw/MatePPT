import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 数学公式文本
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.text.MathText
 */
export interface MathText {
  /** MathML 内容 */
  mathML: string
  /** LaTeX 内容 */
  latex?: string
  /** 字体名称 */
  fontName?: string
  /** 字体大小（pt） */
  fontSize?: number
  /** 字体颜色 */
  fontColor?: PPTColor
}
