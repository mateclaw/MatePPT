import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

export type GradientType = 'linear' | 'radial' | string
/**
 * 渐变配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.Gradient
 */
export interface Gradient {
  /** 渐变类型：linear/radial */
  type?: GradientType
  /** 渐变旋转角度（度） */
  rotate?: number
  /** 渐变颜色节点 */
  colors?: GradientColor[]
}

/** 渐变颜色节点 */
export interface GradientColor {
  /** 渐变位置（0-100 的整数百分比） */
  pos?: number
  /** 渐变颜色（hex 或 rgba，包含透明度） */
  color?: PPTColor
}
