/**
 * 默认值常量
 * 对应 jsonppt 的默认配置
 */

/**
 * 默认值
 */
export const DEFAULT_VALUES = {
  textAlignment: 'left',
  textVerticalType: 'horizontal',
  textAnchorType: 'middle',
  textAutofitType: 'none',
  chartType: 'column',
  lineDashStyle: 'solid',
  gradientShape: 'linear',
  bulletType: 'symbol',
  pictureFillMode: 'cover',
  transitionType: 'fade',
} as const

/** 文档默认宽度（px）- 与 jsonppt DocumentParser 一致，默认 4:3 比例 */
export const DEFAULT_DOCUMENT_WIDTH = 960

/** 文档默认高度（px）- 与 jsonppt DocumentParser 一致 */
export const DEFAULT_DOCUMENT_HEIGHT = 720

/** 元素默认宽度（px） */
export const DEFAULT_ELEMENT_WIDTH = 100

/** 元素默认高度（px） */
export const DEFAULT_ELEMENT_HEIGHT = 100

/** 文本默认字体 */
export const DEFAULT_FONT_NAME = 'Microsoft YaHei'

/** 文本默认字号 */
export const DEFAULT_FONT_SIZE = 18

/** 文本默认颜色 */
export const DEFAULT_TEXT_COLOR = '#000000'

/** 形状默认填充色 */
export const DEFAULT_FILL_COLOR = '#4A90E2'

/** 线条默认颜色 */
export const DEFAULT_LINE_COLOR = '#000000'

/** 线条默认宽度 */
export const DEFAULT_LINE_WIDTH = 1

/** 默认不透明度 */
export const DEFAULT_OPACITY = 1.0

/** 默认旋转角度 */
export const DEFAULT_ROTATION = 0

/** 默认边距 */
export const DEFAULT_PADDING = {
  left: 10,
  right: 10,
  top: 10,
  bottom: 10,
}

/** 默认行高倍数（jsonppt 中标题 0.9，正文 1.0-1.2） */
export const DEFAULT_LINE_HEIGHT_TITLE = 0.9
export const DEFAULT_LINE_HEIGHT_BODY = 1.0
