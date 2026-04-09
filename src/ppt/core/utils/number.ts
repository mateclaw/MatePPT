/**
 * 数字处理工具函数
 * 参考 jsonppt 的 NumberUtil
 */

/**
 * 限制数值到 [0, 1] 范围
 * @param value - 原始值
 * @returns 限制后的值
 */
export function clamp01(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(1, value))
}

/**
 * 限制数值到 [0, 255] 整数范围
 * @param value - 原始值
 * @returns 限制后的整数值
 */
export function clamp255(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(255, Math.round(value)))
}

/**
 * 限制并四舍五入到 [0, 1] 范围，保留指定小数位
 * @param value - 原始值
 * @param decimals - 保留小数位数
 * @returns 格式化后的值
 */
export function clamp01AndRound(value: number, decimals: number = 3): number {
  return round(clamp01(value), decimals)
}

/**
 * 四舍五入到指定小数位
 * @param value - 原始值
 * @param decimals - 保留小数位数
 * @returns 四舍五入后的值
 */
export function round(value: number, decimals: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 0
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * 格式化数字为字符串，删除尾部 0 和无意义的小数点
 * @param value - 原始值
 * @param decimals - 最多保留小数位数
 * @returns 格式化后的字符串
 */
export function format(value: number, decimals: number = 2): string {
  if (!Number.isFinite(value) || Number.isNaN(value)) return '0'

  // 处理极小值
  if (Math.abs(value) < Math.pow(10, -(decimals + 1))) {
    return '0'
  }

  // 四舍五入到指定小数位
  const rounded = round(value, decimals)

  // 转为字符串，删除尾部 0 和小数点
  return rounded
    .toFixed(decimals)
    .replace(/\.?0+$/, '')
}

/**
 * 格式化为无小数位
 */
export function format0(value: number): string {
  return format(value, 0)
}

/**
 * 格式化为最多 2 位小数
 */
export function format2(value: number): string {
  return format(value, 2)
}

/**
 * 格式化为最多 3 位小数
 */
export function format3(value: number): string {
  return format(value, 3)
}

/**
 * 格式化为最多 4 位小数
 */
export function format4(value: number): string {
  return format(value, 4)
}

/**
 * 格式化为百分比字符串
 * @param ratio - 比例值 (0-1)
 * @returns 百分比字符串，如 "50%"
 */
export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio) || Number.isNaN(ratio)) return '0%'
  return `${format(ratio * 100, 0)}%`
}
