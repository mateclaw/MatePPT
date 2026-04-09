
/**
 * 图片裁剪数据范围
 */
export type ImageClipDataRange = [[number, number], [number, number]]
/**
 * 图片裁剪配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.ImageClip
 */
export interface ImageClip {
  /** 裁剪形状 */
  shape?: string
  /**
   * 可见区域范围（百分比）
   * [[left%, top%], [right%, bottom%]]
   */
  range?: ImageClipDataRange
}
