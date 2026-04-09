/**
 * 幻灯片尺寸相关常量
 */

/** 标准幻灯片尺寸（16:9） */
export const SLIDE_SIZE_16_9 = {
  width: 1280,
  height: 720,
}

/** 标准幻灯片尺寸（4:3） */
export const SLIDE_SIZE_4_3 = {
  width: 1280,
  height: 960,
}

/** 标准幻灯片尺寸（16:10） */
export const SLIDE_SIZE_16_10 = {
  width: 1280,
  height: 800,
}

/** 预设幻灯片尺寸 */
export const PRESET_SLIDE_SIZES = {
  '16:9': SLIDE_SIZE_16_9,
  '4:3': SLIDE_SIZE_4_3,
  '16:10': SLIDE_SIZE_16_10,
} as const
