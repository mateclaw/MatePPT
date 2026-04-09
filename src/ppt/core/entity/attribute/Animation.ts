/**
 * 动画配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.Animation
 */
export interface Animation {
  /** 动画 ID */
  id?: string
  /** 绑定的元素 ID */
  elId?: string
  /** 动画类型：in/out */
  type?: string
  /** 动画效果 */
  effect?: string
  /** 持续时间（毫秒） */
  duration?: number
  /** 触发方式：click/auto */
  trigger?: string
}
