import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 列表符号配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.BulletData
 */
export interface BulletData {
  /** bulletType: numbered / symbol / picture */
  listType?: 'numbered' | 'symbol' | 'picture' | string
  /** 编号样式 */
  numberedStyle?: number
  /** 编号起始值 */
  numberedStart?: number
  /** 符号字符代码 */
  bulletChar?: number
  /** 符号字体 */
  bulletFont?: string
  /** 符号颜色 */
  bulletColor?: PPTColor
  /** 符号大小 */
  bulletSize?: number
}

export const BulletDataFactory = {
  numbered(style?: number, start?: number): BulletData {
    return { listType: 'numbered', numberedStyle: style, numberedStart: start }
  },
  symbol(bulletChar?: number, font?: string): BulletData {
    return { listType: 'symbol', bulletChar, bulletFont: font }
  },
}

export function isNumbered(bullet?: BulletData | null): boolean {
  return bullet?.listType === 'numbered'
}

export function isSymbol(bullet?: BulletData | null): boolean {
  return bullet?.listType === 'symbol'
}

export function isPicture(bullet?: BulletData | null): boolean {
  return bullet?.listType === 'picture'
}
