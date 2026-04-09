import { Element } from './Element'
import { ElementTypes, PPTElementType } from '../../types'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 数学公式元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.MathElement
 */
export class MathElement extends Element {
  readonly type: PPTElementType.MATH = PPTElementType.MATH

  /** LaTeX 代码 */
  latex?: string
  /** MathML 代码 */
  mathML?: string
  /** 公式图片（base64） */
  picBase64?: string
  /** 文本内容 */
  text?: string
  /** 字体名称 */
  fontName?: string
  /** 字体大小 */
  fontSize?: number
  /** 渲染后的 SVG 路径 */
  path?: string
  /** 公式颜色 */
  color?: PPTColor
  /** 路径线宽 */
  strokeWidth?: number
  /** SVG viewBox */
  viewBox?: number[]
  /** 是否固定宽高比 */
  fixedRatio?: boolean

  constructor(options: Partial<MathElement>) {
    super(options)
    this.latex = options.latex
    this.mathML = options.mathML
    this.picBase64 = options.picBase64
    this.text = options.text
    this.fontName = options.fontName
    this.fontSize = options.fontSize
    this.path = options.path
    this.color = options.color
    this.strokeWidth = options.strokeWidth
    this.viewBox = options.viewBox
    this.fixedRatio = options.fixedRatio
  }

  // toJSON(): Record<string, any> {
  //   return {
  //     ...super.toJSON(),
  //     latex: this.latex,
  //     mathML: this.mathML,
  //     picBase64: this.picBase64,
  //     text: this.text,
  //     fontName: this.fontName,
  //     fontSize: this.fontSize,
  //     path: this.path,
  //     color: this.color,
  //     strokeWidth: this.strokeWidth,
  //     viewBox: this.viewBox,
  //     fixedRatio: this.fixedRatio,
  //   }
  // }
}
