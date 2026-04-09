/**
 * Core 模块统一导出
 *
 * 使用示例:
 * import { PPTDocument, ElementType, DEFAULT_DOCUMENT_WIDTH, hexToRgb } from '@/core'
 */

// Entity - 实体模型
export * from './entity/PPTDocument'
export * from './entity/presentation/PPTSlide'
export * from './entity/presentation/PPTMaster'
export * from './entity/presentation/PPTLayout'
export * from './entity/presentation/PPTTheme'

export * from './entity/element/Element'
export * from './entity/element/TextElement'
export * from './entity/element/ShapeElement'
export * from './entity/element/ImageElement'
export * from './entity/element/LineElement'
export * from './entity/element/ChartElement'
export * from './entity/element/TableElement'
export * from './entity/element/MathElement'
export * from './entity/element/VideoElement'
export * from './entity/element/AudioElement'

// Attributes - 属性类
export * from './entity/attribute/Animation'
export * from './entity/attribute/Background'
export * from './entity/attribute/BackgroundImage'
export * from './entity/attribute/BulletData'
export * from './entity/attribute/ChartData'
export * from './entity/attribute/ChartOptions'
export * from './entity/attribute/ChartPoint'
export * from './entity/attribute/ChartSeries'
export * from './entity/attribute/ChartStyle'
export * from './entity/attribute/Gradient'
export * from './entity/attribute/HyperLinkInfo'
export * from './entity/attribute/ImageClip'
export * from './entity/attribute/ImageFilters'
export * from './entity/attribute/PatternFill'
export * from './entity/attribute/Shadow'
export * from './entity/attribute/ShapeCategory'
export * from './entity/attribute/SlideTransition'
export * from './entity/attribute/TableCell'
export * from './entity/attribute/TableCellStyle'
export * from './entity/attribute/TableTheme'
export * from './entity/attribute/ViewBox'
export * from './entity/attribute/text/ChartText'
export * from './entity/attribute/text/ShapeText'
export * from './entity/attribute/text/MathText'
export * from './entity/attribute/TextAlign'


// Named imports for re-exports with aliases
import type { Outline } from './entity/attribute/Outline'
import type { HyperLinkInfo } from './entity/attribute/HyperLinkInfo'
import type { ImageClip } from './entity/attribute/ImageClip'
import type { Shadow } from './entity/attribute/Shadow'
import type { BackgroundImage } from './entity/attribute/BackgroundImage'

import type { Background } from './entity/attribute/Background'

export type { HyperLinkInfo as PPTElementLink }
export type { Outline as PPTElementOutline }
export type { ImageClip as ImageElementClip }
export type { Shadow as PPTElementShadow }
export type {
    Background as SlideBackground
}
export type { BackgroundImage as SlideBackgroundImage }




import { TextElement } from "./entity/element/TextElement";
export { TextElement as PPTTextElement }

import { ShapeElement } from "./entity/element/ShapeElement";
export { ShapeElement as PPTShapeElement }

import { ImageElement } from "./entity/element/ImageElement";
export { ImageElement as PPTImageElement }

import { LineElement } from "./entity/element/LineElement";
export { LineElement as PPTLineElement }

import { ChartElement } from "./entity/element/ChartElement";
export { ChartElement as PPTChartElement }

import { TableElement } from "./entity/element/TableElement";
export { TableElement as PPTTableElement }

import { MathElement } from "./entity/element/MathElement";
export { MathElement as PPTMathElement }

import { VideoElement } from "./entity/element/VideoElement";
export { VideoElement as PPTVideoElement }

import { AudioElement } from "./entity/element/AudioElement";
export { AudioElement as PPTAudioElement }

import { PPTTheme } from "./entity/presentation/PPTTheme";
export { PPTTheme as SlideTheme }


// Types - 类型定义
export * from './types'

// Constants - 常量
export * from './constants'

// Utils - 工具函数
export * from './utils'

