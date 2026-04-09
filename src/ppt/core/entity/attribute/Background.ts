import { Gradient } from './Gradient'
import { BackgroundImage } from './BackgroundImage'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";
export type SlideBackgroundType = 'solid' | 'image' | 'gradient'


/**
 * 背景配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.Background
 */
export interface Background {
  /** 背景类型：solid/image/gradient */
  type?: SlideBackgroundType
  /** 纯色背景颜色 */
  color?: PPTColor
  /** 渐变配置 */
  gradient?: Gradient
  /** 图片背景配置 */
  image?: BackgroundImage
}
