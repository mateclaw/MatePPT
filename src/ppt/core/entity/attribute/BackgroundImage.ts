export type SlideBackgroundImageSize = 'cover' | 'contain' | 'repeat'

/**
 * 背景图片配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.BackgroundImage
 */
export interface BackgroundImage {
  /** 图片地址或 base64 */
  src?: string
  /** 填充方式：contain/repeat/cover */
  fillMode?: SlideBackgroundImageSize
  /** 图片透明度（0-1） */
  opacity?: number
}
