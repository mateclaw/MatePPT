/**
 * 类型守卫和验证函数
 *
 * 用于运行时验证值是否符合类型定义
 */

import type {
  ChartType,
  ElementTypes,
  HorizontalAlign,
  // PlaceholderType,
  TextVerticalType,
  TextAutoFitType,
} from '../types/element'

// import type { LayoutType, SlideLabelType } from '../types/presentation'

/**
 * 验证是否为有效的图表类型
 */
export function isValidChartType(value: string): value is ChartType {
  return ['bar', 'column', 'line', 'area', 'pie', 'ring', 'radar', 'scatter', 'bubble'].includes(
    value
  )
}

/**
 * 验证是否为有效的元素类型
 */
export function isValidElementType(value: string): value is ElementTypes {
  return ['text', 'shape', 'image', 'line', 'chart', 'table', 'math', 'video', 'audio'].includes(
    value
  )
}

/**
 * 验证是否为有效的文本对齐方式
 */
export function isValidTextAlignment(value: string): value is HorizontalAlign {
  return ['left', 'center', 'right', 'justify', 'distributed'].includes(value)
}

/**
 * 验证是否为有效的文本垂直类型
 */
export function isValidTextVerticalType(value: string): value is TextVerticalType {
  return ['horizontal', 'vertical', 'vertical270', 'eastAsian', 'mongolian', 'notdefined'].includes(
    value
  )
}

/**
 * 验证是否为有效的文本自动调整类型
 */
export function isValidTextAutoFitType(value: string): value is TextAutoFitType {
  return ['none', 'shrinkText', 'resizeShapeToFitText'].includes(value)
}

/**
 * 验证是否为有效的占位符类型
 */
// export function isValidPlaceholderType(value: string): value is PlaceholderType {
//   return [
//     'Title',
//     'CenteredTitle',
//     'Body',
//     'Footer',
//     'Header',
//     'DateAndTime',
//     'SlideNumber',
//     'Subtitle',
//     'Chart',
//     'Table',
//     'Picture',
//     'Object',
//   ].includes(value)
// }

// /**
//  * 验证是否为有效的布局类型
//  */
// export function isValidLayoutType(value: string): value is LayoutType {
//   return [
//     'Blank',
//     'Title',
//     'TitleAndObject',
//     'TitleOnly',
//     'SectionHeader',
//     'TwoContent',
//     'Comparison',
//     'TwoTextAndTwoContent',
//   ].includes(value)
// }

/**
 * 验证是否为有效的幻灯片类型
 */
// export function isValidSlideType(value: string): value is SlideLabelType {
//   return ['normal', 'cover', 'catalog', 'chapter', 'content', 'ending'].includes(value)
// }

/**
 * 验证是否为有效的线条样式
 */
export function isValidLineStyle(value: string): boolean {
  return ['solid', 'dashed', 'dotted'].includes(value)
}

/**
 * 验证是否为有效的渐变类型
 */
export function isValidGradientType(value: string): boolean {
  return ['linear', 'radial'].includes(value)
}
