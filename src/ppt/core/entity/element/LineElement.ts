import { Element } from './Element'
import { ElementTypes, PPTElementType } from '../../types'
import { Gradient } from '../attribute/Gradient'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

export type LinePoint = '' | 'arrow' | 'dot' 
export type NonEmptyLinePoint = Exclude<LinePoint, ''>
/**
 * 线条元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.LineElement
 */
export class LineElement extends Element {
  readonly type: PPTElementType.LINE = PPTElementType.LINE

  /** 起点坐标 [x, y] */
  start?: number[]
  /** 终点坐标 [x, y] */
  end?: number[]
  /** 端点样式 [起点, 终点] */
  points?: LinePoint[]
  /** 线条颜色 */
  color?: PPTColor
  /** 线条样式：solid/dashed/dotted */
  style?: string
  /** 渐变填充 */
  gradient?: Gradient
  /** 二次曲线控制点 [x, y] */
  curve?: number[]
  /** 折线控制点 */
  broken?: number[]
  /** 垂直折线控制点 */
  broken2?: number[]
  /** 三次曲线控制点 [[x1,y1],[x2,y2]] */
  cubic?: number[][]
  /** 线条粗细（px） */
  strokeWidth?: number
  /** TODO：这个字段前端没用吧？ */
  // shapeType?: number

  constructor(options: Partial<LineElement>) {
    super(options)
    this.start = options.start
    this.end = options.end
    this.points = options.points
    this.color = options.color
    this.style = options.style
    this.gradient = options.gradient
    this.curve = options.curve
    this.broken = options.broken
    this.broken2 = options.broken2
    this.cubic = options.cubic
    this.strokeWidth = options.strokeWidth
    // this.shapeType = options.shapeType
  }

  // toJSON(): Record<string, any> {
  //   return {
  //     ...super.toJSON(),
  //     start: this.start,
  //     end: this.end,
  //     points: this.points,
  //     color: this.color,
  //     style: this.style,
  //     gradient: this.gradient,
  //     curve: this.curve,
  //     broken: this.broken,
  //     broken2: this.broken2,
  //     cubic: this.cubic,
  //     strokeWidth: this.strokeWidth,
  //     // shapeType: this.shapeType,
  //   }
  // }
}
