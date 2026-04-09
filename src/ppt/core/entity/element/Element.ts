/**
 * 元素抽象基类
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.Element
 *
 * 定义了所有元素的公共属性和行为
 */

import { Outline } from '../attribute/Outline'
import { Shadow } from '../attribute/Shadow'
import { HyperLinkInfo } from '../attribute/HyperLinkInfo'
import type { ElementTypes } from '../../types/element'


/**
 * 元素抽象基类
 */
export abstract class Element {
  /** 元素唯一标识符 */
  id: string = ''
  /** 元素类型 */
  abstract readonly type: ElementTypes
  /** 左边距（px） */
  left: number = 0
  /** 上边距（px） */
  top: number = 0
  /** 宽度（px） */
  width: number = 100
  /** 高度（px） */
  height: number = 100
  /** 旋转角度（度） */
  rotate?: number = 0
  /** 边框 */
  outline?: Outline
  /** 阴影 */
  shadow?: Shadow
  /** 超链接 */
  link?: HyperLinkInfo
  /** 不透明度（0-1） */
  opacity?: number = 1.0
  /** 水平翻转 */
  flipH?: boolean = false
  /** 垂直翻转 */
  flipV?: boolean = false
  /** 是否锁定 */
  lock?: boolean = false
  /** 元素自定义名称 */
  name?: string
  /** 元素所属组合 ID */
  groupId?: string
  /** 绘制顺序（zOrderPosition） */
  order?: number
  /** 是否为继承自母版/布局的元素 */
  inherited?: boolean = false


  constructor(options: Partial<Element> = {}) {
    const {
      id = '',
      left = 0,
      top = 0,
      width = 100,
      height = 100,
      rotate = 0,
      opacity = 1.0,
      flipH,
      flipV,
      lock,
      ...rest
    } = options

    this.id = id
    this.left = left
    this.top = top
    this.width = width
    this.height = height
    this.rotate = rotate
    this.opacity = opacity
    this.flipH = flipH
    this.flipV = flipV
    this.lock = lock

    // 将其他属性（如 outline、shadow、link 等）合并
    Object.assign(this, rest)
  }
  // /**
  //  * 获取元素边界框
  //  */
  // getBounds(): { x: number; y: number; width: number; height: number } {
  //   return {
  //     x: this.left,
  //     y: this.top,
  //     width: this.width,
  //     height: this.height,
  //   }
  // }

  // /**
  //  * 设置元素位置
  //  */
  // setPosition(left: number, top: number): void {
  //   this.left = left
  //   this.top = top
  // }

  // /**
  //  * 设置元素尺寸
  //  */
  // setSize(width: number, height: number): void {
  //   this.width = width
  //   this.height = height
  // }

  // /**
  //  * 克隆元素（深拷贝）
  //  */
  // clone<T extends this>(): T {
  //   const json = JSON.stringify(this)
  //   const data = json ? (JSON.parse(json) as T) : ({} as T)
  //   const cloned: T = Object.create(Object.getPrototypeOf(this))
  //   // return Object.assign(cloned, data) // Object.assign 需要 ES2015 lib
  //   for (const key in data) {
  //     if (Object.prototype.hasOwnProperty.call(data, key)) {
  //       ;(cloned as any)[key] = (data as any)[key]
  //     }
  //   }
  //   return cloned
  // }

  // /**
  //  * 序列化为 JSON
  //  */
  // toJSON(): Record<string, any> {
  //   return {
  //     id: this.id,
  //     type: this.type,
  //     left: this.left,
  //     top: this.top,
  //     width: this.width,
  //     height: this.height,
  //     rotate: this.rotate,
  //     outline: this.outline,
  //     shadow: this.shadow,
  //     link: this.link,
  //     opacity: this.opacity,
  //     flipH: this.flipH,
  //     flipV: this.flipV,
  //     lock: this.lock,
  //     name: this.name,
  //     groupId: this.groupId,
  //     order: this.order,
  //     inherited: this.inherited,
  //     isPlaceholder: this.isPlaceholder,
  //     placeholderType: this.placeholderType,
  //   }
  // }
}
