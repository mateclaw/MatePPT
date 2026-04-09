import { Element } from './Element'
import { ElementTypes, PPTElementType } from '../../types'
import { TableCell } from '../attribute/TableCell'
import { TableTheme } from '../attribute/TableTheme'

/**
 * 表格元素
 * 对应 jsonppt 的 org.buxiu.pptx.model.element.TableElement
 */
export class TableElement extends Element {
  readonly type: PPTElementType.TABLE = PPTElementType.TABLE

  /** 列宽比例 */
  colWidths?: number[]
  /** 行高 */
  rowHeights?: number[]
  /** 表格数据 */
  data: TableCell[][] = []
  /** 表格主题 */
  theme?: TableTheme
  /** 单元格最小高度 */
  cellMinHeight?: number

  constructor(options: Partial<TableElement>) {
    super(options)
    this.colWidths = options.colWidths
    this.rowHeights = options.rowHeights
    this.data = options.data
    this.theme = options.theme
    this.cellMinHeight = options.cellMinHeight
  }

  // toJSON(): Record<string, any> {
  //   return {
  //     ...super.toJSON(),
  //     colWidths: this.colWidths,
  //     rowHeights: this.rowHeights,
  //     data: this.data,
  //     theme: this.theme,
  //     cellMinHeight: this.cellMinHeight,
  //   }
  // }
}
