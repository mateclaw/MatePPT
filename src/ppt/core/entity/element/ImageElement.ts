import { Element } from './Element'
import { ElementTypes, PPTElementType } from '../../types'
import { ImageClip } from '../attribute/ImageClip'
import { ImageFilters } from '../attribute/ImageFilters'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 图片元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.ImageElement
 */
export class ImageElement extends Element {
  readonly type: PPTElementType.IMAGE = PPTElementType.IMAGE

  /** 图片地址或 base64 */
  src?: string
  /** 裁剪配置 */
  clip?: ImageClip
  /** 圆角半径 */
  radius?: number
  /** 蒙版颜色（暗部） */
  colorMask?: PPTColor
  /** 蒙版颜色（亮部） */
  colorMask2?: PPTColor
  /** 滤镜效果 */
  filters?: ImageFilters
  /** 原始图片宽度 */
  imageWidth?: number
  /** 原始图片高度 */
  imageHeight?: number
  /** 标注类型 */
  labelType?: string
  /** 是否保持宽高比 */
  fixedRatio?: boolean

  constructor(options: Partial<ImageElement>) {
    super(options)
    this.src = options.src
    this.clip = options.clip
    this.radius = options.radius
    this.colorMask = options.colorMask
    this.colorMask2 = options.colorMask2
    this.filters = options.filters
    this.imageWidth = options.imageWidth
    this.imageHeight = options.imageHeight
    this.labelType = options.labelType
    this.fixedRatio = options.fixedRatio
  }

  // toJSON(): Record<string, any> {
  //   return {
  //     ...super.toJSON(),
  //     src: this.src,
  //     fixedRatio: this.fixedRatio,
  //     clip: this.clip,
  //     radius: this.radius,
  //     colorMask: this.colorMask,
  //     colorMask2: this.colorMask2,
  //     filters: this.filters,
  //     labelType: this.labelType,
  //   }
  // }
}
