import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * 表格主题配置
 * 对应 jsonppt 的 org.buxiu.pptx.model.attribute.TableTheme
 */
export interface TableTheme {
  /** 主题主色 */
  color?: PPTColor
  /** 是否启用行表头 */
  rowHeader?: boolean
  /** 是否启用行表尾 */
  rowFooter?: boolean
  /** 是否启用列表头 */
  colHeader?: boolean
  /** 是否启用列表尾 */
  colFooter?: boolean
}
