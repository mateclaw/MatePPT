/**
 * PPT 布局
 * 对应 jsonppt 的 org.buxiu.pptx.model.presentation.PPTLayout.java
 *
 * 布局定义了幻灯片的结构和占位符
 */

import { Background } from '../attribute/Background'
import { Element } from '../element/Element'

export class PPTLayout {
  /** 布局 ID */
  id: string = ''
  /** 布局名称 */
  name?: string
  /** 布局类型（对应 SlideLayoutType） */
  layoutType?: string
  /** 背景 */
  background?: Background
  /** 是否继承母版背景 */
  followMasterBackground?: boolean
  /** 是否隐藏母版图形 */
  hideMasterShapes?: boolean
  /** 元素列表（占位符） */
  elements: Element[] = []

  constructor(options: Partial<PPTLayout> = {}) {
    const {
      id = '',
      name = '',
      layoutType = '',
      background = undefined,
      followMasterBackground = false,
      hideMasterShapes = false,
      elements = [],
    } = options

    this.id = id
    this.name = name
    this.layoutType = layoutType
    this.background = background
    this.followMasterBackground = followMasterBackground
    this.hideMasterShapes = hideMasterShapes
    this.elements = elements
  }

  /**
   * 序列化为 JSON
   */
  // toJSON(): Record<string, any> {
  //   return {
  //     id: this.id,
  //     name: this.name,
  //     layoutType: this.layoutType,
  //     background: this.background,
  //     followMasterBackground: this.followMasterBackground,
  //     hideMasterShapes: this.hideMasterShapes,
  //     elements: this.elements.map(e => e.toJSON()),
  //   }
  // }
}
