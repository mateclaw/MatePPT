import { TableCellStyle } from './TableCellStyle'

/**
 * 表格单元格
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.TableCell
 */
export interface TableCell {
  /** 单元格 ID */
  id?: string
  /** 合并列数 */
  colspan?: number
  /** 合并行数 */
  rowspan?: number
  /** 单元格文本 */
  text?: string
  /** 单元格样式 */
  style?: TableCellStyle

}
