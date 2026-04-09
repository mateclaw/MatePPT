/**
 * PowerPoint 标准主题色方案（12个颜色）
 *
 * Office Open XML标准定义：
 * - dk1, lt1: 文字/背景 - 深色1，浅色1（主要对比）
 * - dk2, lt2: 文字/背景 - 深色2，浅色2（次要对比）
 * - accent1-6: 强调色1-6（用于图表、形状等）
 * - hlink: 超链接色
 * - folHlink: 已访问超链接色
 */
export interface ThemeColors {
    /** 强调色1 - 通常用于图表第一色、重点元素 */
    accent1: string
    /** 强调色2 - 通常用于图表第二色 */
    accent2: string
    /** 强调色3 - 通常用于图表第三色 */
    accent3: string
    /** 强调色4 - 通常用于图表第四色 */
    accent4: string
    /** 强调色5 - 通常用于图表第五色 */
    accent5: string
    /** 强调色6 - 通常用于图表第六色 */
    accent6: string

    /** 浅色1 - 通常用于背景 */
    lt1: string
    /** 深色1 - 通常用于文字 */
    dk1: string
    /** 浅色2 - 次要背景色 */
    lt2: string
    /** 深色2 - 次要文字色 */
    dk2: string

    /** 超链接色 */
    hlink: string
    /** 已访问超链接色 */
    folHlink: string
}

export const THEME_COLOR_KEYS: Array<keyof ThemeColors> = [
    'accent1',
    'accent2',
    'accent3',
    'accent4',
    'accent5',
    'accent6',
    'lt1',
    'dk1',
    'lt2',
    'dk2',
    'hlink',
    'folHlink',
]
