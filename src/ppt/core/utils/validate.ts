/**
 * 数据验证工具函数
 */

/**
 * 验证是否为有效的数字
 * @param value - 待验证的值
 * @returns 是否为有效数字
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * 验证是否为有效的正数
 * @param value - 待验证的值
 * @returns 是否为有效正数
 */
export function isPositiveNumber(value: any): value is number {
  return isValidNumber(value) && value > 0
}

/**
 * 验证是否为有效的非负数
 * @param value - 待验证的值
 * @returns 是否为有效非负数
 */
export function isNonNegativeNumber(value: any): value is number {
  return isValidNumber(value) && value >= 0
}

/**
 * 验证数值是否在指定范围内
 * @param value - 待验证的值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 是否在范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * 验证是否为有效的十六进制颜色
 * @param color - 颜色字符串
 * @returns 是否为有效颜色
 */
export function isValidHexColor(color: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

/**
 * 验证是否为有效的 URL
 * @param url - URL 字符串
 * @returns 是否为有效 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为空字符串或仅包含空白字符
 * @param str - 字符串
 * @returns 是否为空
 */
export function isEmptyString(str: any): boolean {
  return typeof str !== 'string' || str.trim().length === 0
}

/**
 * 限制数值在指定范围内
 * @param value - 原始值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 安全地获取数字值，如果无效则返回默认值
 * @param value - 待获取的值
 * @param defaultValue - 默认值
 * @returns 数字值
 */
export function safeNumber(value: any, defaultValue: number): number {
  return isValidNumber(value) ? value : defaultValue
}

/**
 * 安全地获取字符串值，如果无效则返回默认值
 * @param value - 待获取的值
 * @param defaultValue - 默认值
 * @returns 字符串值
 */
export function safeString(value: any, defaultValue: string): string {
  return typeof value === 'string' ? value : defaultValue
}
