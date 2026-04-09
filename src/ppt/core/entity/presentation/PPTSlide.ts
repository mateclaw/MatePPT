/**
 * PPT 幻灯片
 * 对应 jsonppt 的 org.buxiu.pptx.model.presentation.PPTSlide.java
 *
 * 单张幻灯片，包含背景、元素列表、动画、切换效果等
 */

import { Background } from '../attribute/Background'
import { Element } from '../element/Element'
import { Animation } from '../attribute/Animation'
import { SlideTransition } from '../attribute/SlideTransition'
import { PPTElement } from '../../types'

export class PPTSlide {
  /** 幻灯片 ID */
  id: string = ''
  /** 关联的布局 ID（前端不需要这个字段） */
  // layoutId?: string
  /** 背景 */
  background?: Background
  /** 页面类型（标注字段）：cover/contents/transition/content/end */
  type?: string
  /** 页面切换模式 */
  turningMode?: string
  /** 元素列表 */
  elements: PPTElement[] = []
  /** 动画列表 */
  animations: Animation[] = []
  /** 切换效果 */
  transition?: SlideTransition
  /** 备注 */
  remark?: string
  /** 是否有未保存的改动（前端状态） */
  dirty?: boolean

  /**
   * 幻灯片 HTML
   */
  slideHtml?: string

  constructor(props: Partial<PPTSlide> = {}) {
    Object.assign(this, props)
  }

  /** 是否跟随布局背景（前端不需要这个字段） */
  // followMasterBackground?: boolean

  // /**
  //  * 序列化为 JSON
  //  */
  // toJSON(): Record<string, any> {
  //   return {
  //     id: this.id,
  //     background: this.background,
  //     type: this.type,
  //     turningMode: this.turningMode,
  //     elements: this.elements.map(e => e.toJSON()),
  //     animations: this.animations,
  //     transition: this.transition,
  //     remark: this.remark,
  //     slideHtml: this.slideHtml,
  //     // layoutId: this.layoutId,
  //     // followMasterBackground: this.followMasterBackground,
  //   }
  // }
}
