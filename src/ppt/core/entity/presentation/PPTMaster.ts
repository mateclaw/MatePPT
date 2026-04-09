/**
 * PPT 母版
 * 对应 jsonppt 的 org.buxiu.pptx.model.presentation.PPTMaster.java
 *
 * 母版包含背景、元素列表和布局列表
 */

import { Background } from '../attribute/Background'
import { Element } from '../element/Element'
import { PPTLayout } from './PPTLayout'

export class PPTMaster {
  /** 母版 ID */
  id: string = ''
  /** 母版名称 */
  name?: string
  /** 背景 */
  background?: Background
  /** 元素列表 */
  elements: Element[] = []
  /** 布局列表 */
  layouts: PPTLayout[] = []

  /**
   * 序列化为 JSON
   */
  // toJSON(): Record<string, any> {
  //   return {
  //     id: this.id,
  //     name: this.name,
  //     background: this.background,
  //     elements: this.elements.map(e => e.toJSON()),
  //     layouts: this.layouts.map(l => l.toJSON()),
  //   }
  // }
}
