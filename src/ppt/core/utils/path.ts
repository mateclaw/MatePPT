/**
 * SVG 路径处理工具函数
 */

import type { Point, Bounds } from '../types'

/**
 * 解析 SVG viewBox 字符串
 * @param viewBox - viewBox 字符串（如 "0 0 100 100"）
 * @returns [minX, minY, width, height]
 */
export function parseViewBox(viewBox: string): number[] | undefined {
  if (typeof viewBox !== 'string') return undefined
  const parts = viewBox.trim().split(/\s+/)
  if (parts.length !== 4) return undefined
  const values = parts.map(Number)
  if (values.some(v => !Number.isFinite(v))) return undefined
  return values
}

/**
 * 格式化 viewBox 数组为字符串
 * @param values - [minX, minY, width, height]
 * @returns viewBox 字符串
 */
export function formatViewBox(values: number[]): string {
  if (!Array.isArray(values) || values.length !== 4) return '0 0 100 100'
  return values.join(' ')
}

/**
 * 从 SVG 路径中提取边界框
 * @param path - SVG 路径字符串
 * @returns 边界框
 */
export function getPathBounds(path: string): Bounds | null {
  // 简化实现：提取所有数字，找出最小/最大值
  // 实际应用中可能需要更复杂的 SVG 路径解析
  const numbers = path.match(/-?\d+\.?\d*/g)
  if (!numbers || numbers.length < 2) return null

  const values = numbers.map(Number).filter(Number.isFinite)
  if (values.length < 2) return null

  const xs = values.filter((_, i) => i % 2 === 0)
  const ys = values.filter((_, i) => i % 2 === 1)

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * 缩放 SVG 路径
 * @param path - 原始路径
 * @param scaleX - X 轴缩放比例
 * @param scaleY - Y 轴缩放比例
 * @returns 缩放后的路径
 */
export function scalePath(path: string, scaleX: number, scaleY: number): string {
  // 简化实现：替换所有坐标
  // 实际应用中需要正确解析 SVG 路径命令
  return path.replace(/-?\d+\.?\d*/g, (match, offset) => {
    const num = Number(match)
    // 简单判断：偶数索引是 X，奇数索引是 Y
    const isX = (offset % 2) === 0
    const scaled = isX ? num * scaleX : num * scaleY
    return scaled.toString()
  })
}

/**
 * 平移 SVG 路径
 * @param path - 原始路径
 * @param dx - X 轴偏移
 * @param dy - Y 轴偏移
 * @returns 平移后的路径
 */
export function translatePath(path: string, dx: number, dy: number): string {
  // 简化实现
  return path.replace(/-?\d+\.?\d*/g, (match, offset) => {
    const num = Number(match)
    const isX = (offset % 2) === 0
    const translated = isX ? num + dx : num + dy
    return translated.toString()
  })
}

/**
 * 创建矩形路径
 * @param x - 左上角 X 坐标
 * @param y - 左上角 Y 坐标
 * @param width - 宽度
 * @param height - 高度
 * @param radius - 圆角半径（可选）
 * @returns SVG 路径字符串
 */
export function createRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius?: number
): string {
  if (!radius || radius <= 0) {
    return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`
  }

  const r = Math.min(radius, width / 2, height / 2)
  return `
    M ${x + r} ${y}
    L ${x + width - r} ${y}
    Q ${x + width} ${y} ${x + width} ${y + r}
    L ${x + width} ${y + height - r}
    Q ${x + width} ${y + height} ${x + width - r} ${y + height}
    L ${x + r} ${y + height}
    Q ${x} ${y + height} ${x} ${y + height - r}
    L ${x} ${y + r}
    Q ${x} ${y} ${x + r} ${y}
    Z
  `.replace(/\s+/g, ' ').trim()
}

/**
 * 创建圆形路径
 * @param cx - 圆心 X 坐标
 * @param cy - 圆心 Y 坐标
 * @param r - 半径
 * @returns SVG 路径字符串
 */
export function createCirclePath(cx: number, cy: number, r: number): string {
  // 使用四段三次贝塞尔曲线近似圆形
  const k = 0.5522847498 // 魔法数字：4/3 * (sqrt(2) - 1)
  const kr = k * r

  return `
    M ${cx - r} ${cy}
    C ${cx - r} ${cy - kr} ${cx - kr} ${cy - r} ${cx} ${cy - r}
    C ${cx + kr} ${cy - r} ${cx + r} ${cy - kr} ${cx + r} ${cy}
    C ${cx + r} ${cy + kr} ${cx + kr} ${cy + r} ${cx} ${cy + r}
    C ${cx - kr} ${cy + r} ${cx - r} ${cy + kr} ${cx - r} ${cy}
    Z
  `.replace(/\s+/g, ' ').trim()
}
