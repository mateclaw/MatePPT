import { Element } from './Element'
import { ElementTypes, PPTElementType } from '../../types'

/**
 * 视频元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.VideoElement
 */
export class VideoElement extends Element {
  readonly type: PPTElementType.VIDEO = PPTElementType.VIDEO

  /** 视频资源地址 */
  src?: string
  /** 是否自动播放 */
  autoplay?: boolean
  /** 预览封面 */
  poster?: string
  /** 文件扩展名 */
  ext?: string

  constructor(options: Partial<VideoElement>) {
    super(options)
    this.src = options.src
    this.autoplay = options.autoplay
    this.poster = options.poster
    this.ext = options.ext
  }

  // toJSON(): Record<string, any> {
  //   return {
  //     ...super.toJSON(),
  //     src: this.src,
  //     autoplay: this.autoplay,
  //     poster: this.poster,
  //     ext: this.ext,
  //   }
  // }
}
