import { Element } from './Element'
import { ChartType, ElementTypes, PPTElementType } from '../../types'
import { ChartData } from '../attribute/ChartData'
import { ChartOptions } from '../attribute/ChartOptions'
import { ChartStyle } from '../attribute/ChartStyle'
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 图表元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.ChartElement
 */
export class ChartElement extends Element {
  readonly type: PPTElementType.CHART = PPTElementType.CHART

  /** 图表类型 */
  chartType: ChartType
  /** 图表标题 */
  title?: string
  /** 主题颜色 */
  themeColors?: PPTColor[]
  /** 是否跟随幻灯片主题 */
  themeFollowSlide?: boolean
  /** 坐标轴文字颜色（已废弃） */
  // textColor?: string
  /** 数据配置 */
  data?: ChartData
  /** 图表选项 */
  options?: ChartOptions
  /** 背景填充色 */
  fill?: string
  /** 网格线颜色 */
  lineColor?: PPTColor
  /** 网格线宽度 */
  lineWidth?: number
  /** 图表文本样式 */
  style?: ChartStyle

  constructor(options: Partial<ChartElement>) {
    super(options)
    this.chartType = options.chartType 
    this.title = options.title
    this.themeColors = options.themeColors
    this.themeFollowSlide = options.themeFollowSlide
    this.data = options.data
    this.options = options.options
    this.fill = options.fill
    this.lineColor = options.lineColor
    this.lineWidth = options.lineWidth
    this.style = options.style
  }

  // toJSON(): Record<string, any> {
  //   return {
  //     ...super.toJSON(),
  //     chartType: this.chartType,
  //     title: this.title,
  //     themeColors: this.themeColors,
  //     // textColor: this.textColor,
  //     data: this.data,
  //     options: this.options,
  //     fill: this.fill,
  //     lineColor: this.lineColor,
  //     lineWidth: this.lineWidth,
  //     style: this.style,
  //   }
  // }
}
