/**
 * 行间距转换工具
 * 参考 jsonppt 的 LineSpacingUtil
 *
 * PPTX 格式规则：
 * - 正数：百分比行距（150 表示 150%）
 * - 负数：固定磅值行距（-30 表示 30 磅）
 *
 * JSON 格式规则：
 * - 正数：倍数行距（1.5 表示 1.5 倍）
 * - 负数：固定磅值行距（-30 表示 30 磅）
 */

/**
 * PPTX 行间距值转换为 JSON 格式
 *
 * @param pptxValue - PPTX 格式的行间距值
 * @returns JSON 格式的行间距值
 *
 * @example
 * pptxToJson(150)  // 返回 1.5 (150% → 1.5倍)
 * pptxToJson(-30)  // 返回 -30 (30磅 → -30磅)
 * pptxToJson(120)  // 返回 1.2 (120% → 1.2倍)
 */
export function pptxToJson(pptxValue: number): number {
  if (!Number.isFinite(pptxValue) || Number.isNaN(pptxValue)) {
    return 1.0 // 默认单倍行距
  }

  if (pptxValue > 0) {
    // 正数：百分比 → 倍数
    return pptxValue / 100
  } else {
    // 负数：固定磅值，直接返回
    return pptxValue
  }
}

/**
 * JSON 行间距值转换为 PPTX 格式
 *
 * @param jsonValue - JSON 格式的行间距值
 * @returns PPTX 格式的行间距值
 *
 * @example
 * jsonToPptx(1.5)  // 返回 150 (1.5倍 → 150%)
 * jsonToPptx(-30)  // 返回 -30 (-30磅 → 30磅)
 * jsonToPptx(1.2)  // 返回 120 (1.2倍 → 120%)
 */
export function jsonToPptx(jsonValue: number): number {
  if (!Number.isFinite(jsonValue) || Number.isNaN(jsonValue)) {
    return 100 // 默认 100% 行距
  }

  if (jsonValue > 0) {
    // 正数：倍数 → 百分比
    return Math.round(jsonValue * 100)
  } else {
    // 负数：固定磅值，直接返回
    return jsonValue
  }
}

/**
 * 判断是否为固定磅值行距
 * @param value - 行间距值（PPTX 或 JSON 格式均可）
 * @returns 是否为固定磅值
 */
export function isFixedLineSpacing(value: number): boolean {
  return value < 0
}

/**
 * 获取行距的显示文本
 * @param jsonValue - JSON 格式的行间距值
 * @returns 显示文本
 *
 * @example
 * getLineSpacingText(1.5)   // 返回 "1.5倍"
 * getLineSpacingText(-30)   // 返回 "30磅"
 * getLineSpacingText(1.0)   // 返回 "单倍"
 */
export function getLineSpacingText(jsonValue: number): string {
  if (!Number.isFinite(jsonValue) || Number.isNaN(jsonValue)) {
    return '单倍'
  }

  if (jsonValue < 0) {
    // 固定磅值
    return `${Math.abs(jsonValue)}磅`
  } else if (jsonValue === 1.0) {
    return '单倍'
  } else if (jsonValue === 1.5) {
    return '1.5倍'
  } else if (jsonValue === 2.0) {
    return '双倍'
  } else {
    return `${jsonValue.toFixed(1)}倍`
  }
}
