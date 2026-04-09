/**
 * 超链接配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.HyperLinkInfo
 */
export interface HyperLinkInfo {
  /** 链接类型：web/slide */
  type?: string
  /** 目标地址：URL 或幻灯片 ID */
  target?: string
}
