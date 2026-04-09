/**
 * 图片滤镜配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.ImageFilters
 */
export interface ImageFilters {
  /** 灰度 (0-100) */
  grayscale?: number
  /** 模糊 (px) */
  blur?: number
  /** 色相旋转 (0-360) */
  hueRotate?: number
  /** 褐色 (0-100) */
  sepia?: number
  /** 透明度 (0-100) */
  opacity?: number
  /** 反色 (0-100) */
  invert?: number
  /** 饱和度 (0-200+) */
  saturate?: number
  /** 对比度 (0-200+) */
  contrast?: number
  /** 亮度 (0-200+) */
  brightness?: number
}

export type ImageElementFilterKeys = keyof ImageFilters
