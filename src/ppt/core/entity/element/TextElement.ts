import { Element } from './Element'
import { ElementTypes, PPTElementType } from '../../types'
import { Gradient } from '../attribute/Gradient'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";
import { normalizePPTColor } from '@/ppt/core/utils/pptColor'

/**
 * 文本元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.TextElement
 */
export class TextElement extends Element {
  readonly type: PPTElementType.TEXT = PPTElementType.TEXT

  /** 富文本内容（带 HTML 样式） */
  content: string = ''
  /** 默认字体名称 */
  fontName: string
  /** 默认字体颜色 */
  fontColor: PPTColor
  /** 默认字体大小 */
  fontSize: number
  /** 字体渐变填充（文字本身） */
  fontGradient?: Gradient;

  /** 排列方向：false-横排，true-竖排 */
  vertical?: boolean = false
  /** 竖排类型：vertical/eastAsian/mongolian/null/undefined/horizontal */
  verticalType?: string

  /** 纯色填充（文本框颜色） */
  fill?: PPTColor
  /** 渐变填充（文本框颜色） */
  gradient?: Gradient
  /** 字间距（像素） */
  wordSpace?: number
  /**
   * 行间距：
   * - 正数表示倍数
   * - 负数表示固定磅值
   */
  lineHeight?: number
  /** 段落间距（像素） */
  paragraphSpace?: number
  /** 水平对齐：left/center/right/justify */
  alignH?: string
  /** 垂直对齐：top/middle/bottom */
  alignV?: string
  /** 文本框自动调整模式：none/shrinkText/resizeShapeToFitText */
  autoFit?: string
  /** 是否自动换行 */
  wrapText?: boolean
  /** 标注类型 */
  labelType?: string

  /** 文本框边距 */
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number

  /** 文本自身的旋转角度 */
  textRotation?: number

  constructor(options: Partial<TextElement>) {
    super(options)
    this.content = options.content || ''
    this.fontName = options.fontName || ''
    this.fontColor = normalizePPTColor(options.fontColor) || PPTColor.ofFixed('#000000')
    this.fontSize = options.fontSize || 0
    this.fontGradient = options.fontGradient
    this.vertical = options.vertical
    this.verticalType = options.verticalType
    this.fill = options.fill
    this.gradient = options.gradient
    this.wordSpace = options.wordSpace
    this.lineHeight = options.lineHeight
    this.paragraphSpace = options.paragraphSpace
    this.alignH = options.alignH
    this.alignV = options.alignV
    this.autoFit = options.autoFit
    this.wrapText = options.wrapText
    this.labelType = options.labelType
    this.marginLeft = options.marginLeft
    this.marginRight = options.marginRight
    this.marginTop = options.marginTop
    this.marginBottom = options.marginBottom
    this.textRotation = options.textRotation
  }
}
