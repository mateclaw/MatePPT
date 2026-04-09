/**
 * 颜色处理工具函数
 */

import type { RGBColor, RGBAColor } from '../types'

/**
 * 十六进制颜色转 RGB
 * @param hex - 十六进制颜色字符串（如 "#FF0000" 或 "FF0000"）
 * @returns RGB 颜色对象
 */
export function hexToRgb(hex: string): RGBColor | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * RGB 转十六进制颜色
 * @param r - 红色分量（0-255）
 * @param g - 绿色分量（0-255）
 * @param b - 蓝色分量（0-255）
 * @returns 十六进制颜色字符串
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

/**
 * RGB 对象转十六进制颜色
 * @param rgb - RGB 颜色对象
 * @returns 十六进制颜色字符串
 */
export function rgbObjectToHex(rgb: RGBColor): string {
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * 十六进制颜色转 RGBA
 * @param hex - 十六进制颜色字符串
 * @param alpha - 透明度（0-1）
 * @returns RGBA 颜色对象
 */
export function hexToRgba(hex: string, alpha: number = 1): RGBAColor | null {
  const rgb = hexToRgb(hex)
  return rgb ? { ...rgb, a: alpha } : null
}

/**
 * RGBA 转 CSS rgba 字符串
 * @param rgba - RGBA 颜色对象
 * @returns CSS rgba 字符串
 */
export function rgbaToString(rgba: RGBAColor): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}

/**
 * 判断颜色是否为深色
 * @param hex - 十六进制颜色字符串
 * @returns 是否为深色
 */
export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  // 使用 YIQ 公式判断亮度
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return yiq < 128
}

/**
 * 调整颜色亮度
 * @param hex - 十六进制颜色字符串
 * @param percent - 调整百分比（-100 到 100）
 * @returns 调整后的十六进制颜色字符串
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const adjust = (value: number) => {
    const adjusted = Math.round(value + (value * percent) / 100)
    return Math.max(0, Math.min(255, adjusted))
  }

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b))
}
