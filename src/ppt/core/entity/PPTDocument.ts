/**
 * PPT 文档
 * 对应 jsonppt 的 org.buxiu.pptx.model.PPTDocument.java
 *
 * 文档根对象，包含标题、尺寸、主题、母版、幻灯片等信息
 */

import { PPTSlide } from './presentation/PPTSlide'
import { PPTMaster } from './presentation/PPTMaster'
import { PPTTheme } from './presentation/PPTTheme'

export class PPTDocument {
  /** 文档标题 */
  title: string = ''
  /** 画布宽度（px） */
  width: number = 1280
  /** 画布高度（px） */
  height: number = 720
  /** 主题 */
  theme?: PPTTheme
  /** 母版列表 */
  masters?: PPTMaster[] = []
  /** 幻灯片列表 */
  slides: PPTSlide[] = []

  /**
   * 序列化为 JSON
   */
  // toJSON(): Record<string, any> {
  //   return {
  //     title: this.title,
  //     width: this.width,
  //     height: this.height,
  //     theme: this.theme?.toJSON(),
  //     masters: this.masters.map(m => m.toJSON()),
  //     slides: this.slides.map(s => s.toJSON()),
  //   }
  // }
}
