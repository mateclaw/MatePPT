/**
 * 通用类型定义
 * 对应 jsonppt 的基础数据类型
 */

/** 位置坐标 */
export interface Position {
  x: number
  y: number
}

/** 尺寸 */
export interface Size {
  width: number
  height: number
}

/** 边界框 */
export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

/** 点坐标（二维） */
export type Point = [number, number]

/** 矩形区域 */
export interface Rectangle {
  left: number
  top: number
  right: number
  bottom: number
}

/** RGB 颜色 */
export interface RGBColor {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

/** RGBA 颜色 */
export interface RGBAColor extends RGBColor {
  a: number // 0-1
}

/** 变换矩阵 */
export type TransformMatrix = [number, number, number, number, number, number]

/** 角度（度） */
export type Degree = number

/** 角度（弧度） */
export type Radian = number


export const enum ShapePathFormulasKeys {
  ROUND_RECT = 'roundRect',
  ROUND_RECT_DIAGONAL = 'roundRectDiagonal',
  ROUND_RECT_SINGLE = 'roundRectSingle',
  ROUND_RECT_SAMESIDE = 'roundRectSameSide',
  CUT_RECT_DIAGONAL = 'cutRectDiagonal',
  CUT_RECT_SINGLE = 'cutRectSingle',
  CUT_RECT_SAMESIDE = 'cutRectSameSide',
  CUT_ROUND_RECT = 'cutRoundRect',
  MESSAGE = 'message',
  ROUND_MESSAGE = 'roundMessage',
  L = 'L',
  RING_RECT = 'ringRect',
  PLUS = 'plus',
  TRIANGLE = 'triangle',
  PARALLELOGRAM_LEFT = 'parallelogramLeft',
  PARALLELOGRAM_RIGHT = 'parallelogramRight',
  TRAPEZOID = 'trapezoid',
  BULLET = 'bullet',
  INDICATOR = 'indicator',
}

export const enum EditorMode {
  EDIT = 'edit',
  PREVIEW = 'preview',
  ANNOTATE = 'annotate',
}

export type TextType = 'title' | 'subtitle' | 'content' | 'item' | 'itemTitle' | 'notes' | 'header' | 'footer' | 'partNumber' | 'itemNumber'