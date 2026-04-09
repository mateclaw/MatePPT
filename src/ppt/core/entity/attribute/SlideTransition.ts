/**
 * 幻灯片切换效果
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.SlideTransition
 */
export interface SlideTransition {
  /** 切换类型（如 fade、wipe） */
  type?: string
  /** 切换持续时间（毫秒） */
  duration?: number
  /** 切换方向（left/right/up/down） */
  direction?: string
  /** 自动切换时间（毫秒） */
  autoNextAfter?: number
}
