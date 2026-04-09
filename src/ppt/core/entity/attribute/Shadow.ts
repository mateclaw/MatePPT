import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 阴影配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.Shadow
 */
export interface Shadow {
  /** 水平偏移 */
  h?: number
  /** 垂直偏移 */
  v?: number
  /** 模糊半径 */
  blur?: number
  /** 阴影颜色 */
  color?: PPTColor
}
