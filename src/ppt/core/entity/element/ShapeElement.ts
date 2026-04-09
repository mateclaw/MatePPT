import { Element } from './Element'
import { ElementTypes, PPTElementType } from '../../types'
import { ShapeText } from '../attribute/text/ShapeText'
import { Gradient } from '../attribute/Gradient'
import { BackgroundImage } from '../attribute/BackgroundImage'
import { PatternFill } from '../attribute/PatternFill'
import { ShapeCategory } from '../attribute/ShapeCategory'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 形状元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.ShapeElement
 */
export class ShapeElement extends Element {
  readonly type: PPTElementType.SHAPE = PPTElementType.SHAPE

  /** 虚拟画布大小 */
  viewBox?: number[]
  /** SVG 路径 */
  path?: string
  /** 纯色填充 */
  fill?: PPTColor
  /** 渐变填充 */
  gradient?: Gradient
  /** 图片填充 */
  picture?: BackgroundImage
  /** 图案填充 */
  pattern?: PatternFill
  /** 是否固定宽高比 */
  fixedRatio?: boolean
  /** Shape类型分类（预定义/自定义/矩形），约定值：PRESET/CUSTOM/RECTANGLE */
  category?: ShapeCategory | string
  /** 预设形状名称 */
  pathFormula?: string
  /** 控制拐点参数 */
  keypoints?: number[]
  /** 内部文字 */
  text?: ShapeText
  /** 标注类型 */
  labelType?: string

  constructor(options: Partial<ShapeElement>) {
    super(options)
    this.viewBox = options.viewBox
    this.path = options.path
    this.fill = options.fill
    this.gradient = options.gradient
    this.picture = options.picture
    this.pattern = options.pattern
    this.fixedRatio = options.fixedRatio
    this.category = options.category
    this.pathFormula = options.pathFormula
    this.keypoints = options.keypoints
    this.text = options.text
    this.labelType = options.labelType
  }

  // toJSON(): Record<string, any> {
  //   return {
  //     ...super.toJSON(),
  //     viewBox: this.viewBox,
  //     path: this.path,
  //     fill: this.fill,
  //     gradient: this.gradient,
  //     picture: this.picture,
  //     pattern: this.pattern,
  //     fixedRatio: this.fixedRatio,
  //     category: this.category,
  //     pathFormula: this.pathFormula,
  //     keypoints: this.keypoints,
  //     text: this.text,
  //     labelType: this.labelType,
  //   }
  // }
}
