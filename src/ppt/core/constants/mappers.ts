/**
 *   默认值和显示名称
 *
 * 注意：
 * - 这里只定义默认值、显示名称映射、别名映射等运行时需要的常量
 */

/**
 * 图表类型显示名称映射
 */
export const CHART_TYPE_NAMES = {
  bar: '条形图',
  column: '柱状图',
  line: '折线图',
  area: '面积图',
  pie: '饼图',
  ring: '环形图',
  radar: '雷达图',
  scatter: '散点图',
  bubble: '气泡图',
} as const

/**
 * 元素类型显示名称映射
 */
export const ELEMENT_TYPE_NAMES = {
  text: '文本',
  shape: '形状',
  image: '图片',
  line: '线条',
  chart: '图表',
  table: '表格',
  math: '公式',
  video: '视频',
  audio: '音频',
} as const

/**
 * 文本对齐方式显示名称
 */
export const TEXT_ALIGNMENT_NAMES = {
  left: '左对齐',
  center: '居中',
  right: '右对齐',
  justify: '两端对齐',
  distributed: '分散对齐',
} as const

/**
 * 线条样式显示名称
 */
export const LINE_DASH_STYLE_NAMES = {
  solid: '实线',
  dashed: '虚线',
  dotted: '点线',
} as const

/**
 * 图片填充模式别名映射
 */
export const PICTURE_FILL_MODE_ALIASES: Record<string, string> = {
  tile: 'repeat',
  stretch: 'cover',
}

/**
 * 占位符类型显示名称（jsonppt 扩展）
 */
export const PLACEHOLDER_TYPE_NAMES = {
  Title: '标题',
  CenteredTitle: '居中标题',
  Body: '正文',
  Footer: '页脚',
  Header: '页眉',
  DateAndTime: '日期时间',
  SlideNumber: '页码',
  Subtitle: '副标题',
  Chart: '图表',
  Table: '表格',
  Picture: '图片',
  Object: '对象',
} as const

/**
 * 布局类型显示名称（jsonppt 扩展）
 */
export const LAYOUT_TYPE_NAMES = {
  Blank: '空白',
  Title: '标题幻灯片',
  TitleAndObject: '标题和对象',
  TitleOnly: '仅标题',
  SectionHeader: '节标题',
  TwoContent: '两栏内容',
  Comparison: '比较',
  TwoTextAndTwoContent: '双文本双内容',
} as const


/**
 * 幻灯片类型显示名称
 */
export const SLIDE_TYPE_NAMES = {
  normal: '普通',
  cover: '封面',
  catalog: '目录',
  chapter: '章节',
  content: '内容',
  ending: '结束',
} as const

/**
 * 翻页模式显示名称
 */
export const TURNING_MODE_NAMES = {
  slideX: '横向滑动',
  slideY: '纵向滑动',
  fade: '淡入淡出',
  cube: '立方体',
  page: '翻页',
} as const

