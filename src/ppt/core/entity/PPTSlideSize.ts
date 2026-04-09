/**
 * PPT 幻灯片尺寸
 * 对应 jsonppt 的 org.buxiu.pptx.model.PPTSlideSize.java
 *
 * 幻灯片的宽度和高度（单位：px）
 */

export interface PPTSlideSize {
  /** 宽度（px） */
  width: number

  /** 高度（px） */
  height: number
}

/** 标准尺寸预设 */
export const SLIDE_SIZE_PRESETS = {
  /** 16:9 宽屏（1280x720） */
  WIDESCREEN_16_9: { width: 1280, height: 720 },

  /** 4:3 标准（960x720） */
  STANDARD_4_3: { width: 960, height: 720 },

  /** 16:10 宽屏（1280x800） */
  WIDESCREEN_16_10: { width: 1280, height: 800 },
} as const
