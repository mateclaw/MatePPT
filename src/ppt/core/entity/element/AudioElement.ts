import { Element } from './Element'
import { ElementTypes, PPTElementType } from '../../types'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";


/**
 * 音频元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.AudioElement
 */
export class AudioElement extends Element {
  readonly type: PPTElementType.AUDIO = PPTElementType.AUDIO

  /** 音频图标颜色 */
  color?: PPTColor
  /** 是否循环播放 */
  loop?: boolean
  /** 是否自动播放 */
  autoplay?: boolean
  /** 音频资源地址 */
  src?: string
  /** 文件扩展名 */
  ext?: string
  /** 是否固定图标宽高比 */
  fixedRatio?: boolean

  constructor(options: Partial<AudioElement>) {
    super(options)
    this.color = options.color
    this.loop = options.loop
    this.autoplay = options.autoplay
    this.src = options.src
    this.ext = options.ext
    this.fixedRatio = options.fixedRatio
  }

  // toJSON(): Record<string, any> {
  //   return {
  //     ...super.toJSON(),
  //     fixedRatio: this.fixedRatio,
  //     color: this.color,
  //     loop: this.loop,
  //     autoplay: this.autoplay,
  //     src: this.src,
  //     ext: this.ext,
  //   }
  // }
}
