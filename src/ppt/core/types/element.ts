/**
 * 元素相关类型定义
 */

import { MathElement } from "../entity/element/MathElement"
import { ChartElement } from "../entity/element/ChartElement"
import { ImageElement } from "../entity/element/ImageElement"
import { LineElement } from "../entity/element/LineElement"
import { ShapeElement } from "../entity/element/ShapeElement"
import { TableElement } from "../entity/element/TableElement"
import { TextElement } from "../entity/element/TextElement"
import { VideoElement } from "../entity/element/VideoElement"
import { AudioElement } from "../entity/element/AudioElement"

export enum PPTElementType {
  TEXT = 'text',
  SHAPE = 'shape',
  IMAGE = 'image',
  LINE = 'line',
  CHART = 'chart',
  TABLE = 'table',
  MATH = 'math',
  VIDEO = 'video',
  AUDIO = 'audio',
}

// export type ShapeFillType = 'fill' | 'gradient' | 'pattern' | 'image' | 'none';

export const enum ShapeFillType {
  FILL = 'fill',
  GRADIENT = 'gradient',
  PATTERN = 'pattern',
  IMAGE = 'image',
  NONE = 'none',
};

export const SHAPE_FILL_TYPE_OPTIONS = [
  { label: '无填充', value: ShapeFillType.NONE },
  { label: '纯色填充', value: ShapeFillType.FILL },
  { label: '渐变填充', value: ShapeFillType.GRADIENT },
  { label: '图案填充', value: ShapeFillType.PATTERN },
  { label: '图片填充', value: ShapeFillType.IMAGE },
];



/**
 * 元素类型
 * PPTist 原有 9 种：text, image, shape, line, chart, table, latex, video, audio
 * jsonppt 扩展 2 种：group, smartart
 * 注：PPTist 叫 latex，我们叫 math（公式元素）
 */
export type ElementTypes =
  | PPTElementType.TEXT
  | PPTElementType.SHAPE
  | PPTElementType.IMAGE
  | PPTElementType.LINE
  | PPTElementType.CHART
  | PPTElementType.TABLE
  | PPTElementType.MATH    // PPTist 叫 latex
  | PPTElementType.VIDEO
  | PPTElementType.AUDIO
// | 'group'    // jsonppt 扩展
// | 'smartart' // jsonppt 扩展


/** 文本垂直类型/方向（与 jsonppt TextVerticalTypeMapper 一致） */
export type TextVerticalType =
  | 'horizontal'   // 水平
  | 'vertical'     // 竖排
  | 'vertical270'  // 竖排270度
  | 'eastAsian'    // 东亚竖排
  | 'mongolian'    // 蒙古文竖排
  | 'notdefined'   // 未定义

/** 文本自动调整类型（与 jsonppt TextAutofitTypeMapper 一致） */
export type TextAutoFitType =
  | 'none'                  // 不调整
  | 'shrinkText'           // 缩小文字
  | 'resizeShapeToFitText' // 调整形状大小

/** 水平对齐方式 */
export type HorizontalAlign = 'left' | 'center' | 'right' | 'justify' | 'distributed'

/** 垂直对齐方式 */
export type VerticalAlign = 'top' | 'middle' | 'bottom'

/** 线条样式 */
export type LineStyleType = 'solid' | 'dashed' | 'dotted'

/** 线条端点样式 */
export type LineEndType = 'none' | 'arrow' | 'stealth' | 'diamond' | 'oval' | 'triangle'

/**
 * 图表类型（与 PPTist 完全一致）
 *
 * PPTist: 'bar' | 'column' | 'line' | 'pie' | 'ring' | 'area' | 'radar' | 'scatter'
 * jsonppt: 支持 bubble，但 PPTist 不支持，暂不包含
 */
export type ChartType =
  | 'bar'          // 条形图
  | 'column'       // 柱状图
  | 'line'         // 折线图
  | 'area'         // 面积图
  | 'pie'          // 饼图
  | 'ring'         // 环形图（注意：叫 ring，不是 doughnut）
  | 'radar'        // 雷达图
  | 'scatter'      // 散点图
  | 'bubble'       // 气泡图


/**
 * PPT元素联合类型
 */
export type PPTElement =
  | TextElement
  | ShapeElement
  | ImageElement
  | LineElement
  | ChartElement
  | TableElement
  | MathElement
  | VideoElement
  | AudioElement
// | GroupElement;


/**
 * 图片翻转、形状翻转
 * 
 * flipH?: 水平翻转
 * 
 * flipV?: 垂直翻转
 */
export interface ImageOrShapeFlip {
  flipH?: boolean
  flipV?: boolean
}
