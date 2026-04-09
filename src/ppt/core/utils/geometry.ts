/**
 * 几何计算工具函数
 */

import type { Bounds, Point, Position, Size, Degree, Radian } from '../types'

/**
 * 角度转弧度
 * @param degrees - 角度
 * @returns 弧度
 */
export function degreesToRadians(degrees: Degree): Radian {
  return (degrees * Math.PI) / 180
}

/**
 * 弧度转角度
 * @param radians - 弧度
 * @returns 角度
 */
export function radiansToDegrees(radians: Radian): Degree {
  return (radians * 180) / Math.PI
}

/**
 * 计算两点之间的距离
 * @param p1 - 点1
 * @param p2 - 点2
 * @returns 距离
 */
export function distance(p1: Position, p2: Position): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

/**
 * 计算点绕中心旋转后的新位置
 * @param point - 原始点
 * @param center - 旋转中心
 * @param degrees - 旋转角度（度）
 * @returns 旋转后的点
 */
export function rotatePoint(point: Position, center: Position, degrees: Degree): Position {
  const radians = degreesToRadians(degrees)
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)

  const dx = point.x - center.x
  const dy = point.y - center.y

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}

/**
 * 获取边界框的中心点
 * @param bounds - 边界框
 * @returns 中心点
 */
export function getBoundsCenter(bounds: Bounds): Position {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }
}

/**
 * 计算缩放后的尺寸（保持宽高比）
 * @param size - 原始尺寸
 * @param maxSize - 最大尺寸限制
 * @returns 缩放后的尺寸
 */
export function scaleToFit(size: Size, maxSize: Size): Size {
  const widthRatio = maxSize.width / size.width
  const heightRatio = maxSize.height / size.height
  const ratio = Math.min(widthRatio, heightRatio)

  return {
    width: size.width * ratio,
    height: size.height * ratio,
  }
}

/**
 * 判断点是否在边界框内
 * @param point - 点
 * @param bounds - 边界框
 * @returns 是否在边界框内
 */
export function isPointInBounds(point: Position, bounds: Bounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

/**
 * 计算两个边界框的交集
 * @param bounds1 - 边界框1
 * @param bounds2 - 边界框2
 * @returns 交集边界框，如果没有交集返回 null
 */
export function intersectBounds(bounds1: Bounds, bounds2: Bounds): Bounds | null {
  const x = Math.max(bounds1.x, bounds2.x)
  const y = Math.max(bounds1.y, bounds2.y)
  const right = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width)
  const bottom = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height)

  if (x < right && y < bottom) {
    return {
      x,
      y,
      width: right - x,
      height: bottom - y,
    }
  }

  return null
}

/**
 * 计算包含所有边界框的最小边界框
 * @param boundsList - 边界框数组
 * @returns 包含所有边界框的最小边界框
 */
export function unionBounds(boundsList: Bounds[]): Bounds | null {
  if (boundsList.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const bounds of boundsList) {
    minX = Math.min(minX, bounds.x)
    minY = Math.min(minY, bounds.y)
    maxX = Math.max(maxX, bounds.x + bounds.width)
    maxY = Math.max(maxY, bounds.y + bounds.height)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
