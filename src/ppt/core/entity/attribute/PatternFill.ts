import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 图案填充配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.PatternFill
 */
export interface PatternFill {
  /** 图案样式编码 */
  patternStyle?: number
  /** 前景色 */
  foreColor?: PPTColor
  /** 背景色 */
  backColor?: PPTColor
}
