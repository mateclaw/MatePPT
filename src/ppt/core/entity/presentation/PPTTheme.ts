import { Shadow } from '../attribute/Shadow'
import { Outline } from '../attribute/Outline'
import {ThemeColors} from "@/ppt/core/entity/presentation/ThemeColors";

/**
 * PPT 主题
 * 对应 jsonppt 的 org.buxiu.pptx.model.presentation.PPTTheme
 */
export class PPTTheme {
  /** 主题色方案（12个标准主题色） */
  themeColors: ThemeColors
  /** 字体名称 */
  fontName: string | null
  // /** 背景色 */
  // backgroundColor?: string | null
  // /** 阴影配置 */
  // shadow?: Shadow | null
  // /** 边框配置 */
  // outline?: Outline | null

  // toJSON(): Record<string, any> {
  //   return {
  //     themeColors: this.themeColors,
  //     fontColor: this.fontColor,
  //     fontName: this.fontName,
  //     backgroundColor: this.backgroundColor,
  //     shadow: this.shadow,
  //     outline: this.outline,
  //   }
  // }
}
