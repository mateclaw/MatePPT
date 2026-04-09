/**
 * 整个pptx级别的类型定义
 */


/**
 * 标注类型（与 PPTist 不一样，PPTist未完全实现我们的标注功能）
 *
 * PPTist: 'cover' | 'contents' | 'transition' | 'content' | 'end'
 */
export type SlideLabelType =
  | 'normal'   // 普通幻灯片
  | 'cover'    // 封面页
  | 'catalog'  // 目录页
  | 'chapter'  // 过渡页
  | 'content'  // 内容页
  | 'ending'   // 结束页
  | string

/** 翻页模式 */
export type TurningMode =
  | 'slideX'   // 横向滑动
  | 'slideY'   // 纵向滑动
  | 'fade'     // 淡入淡出
  | 'cube'     // 立方体
  | 'page'     // 翻页

/** 切换效果类型 */
export type TransitionType =
  | 'none'     // 无
  | 'fade'     // 淡化
  | 'push'     // 推送
  | 'wipe'     // 擦除
  | 'split'    // 分割
  | 'reveal'   // 揭开
  | 'cover'    // 覆盖
  | 'zoom'     // 缩放

/** 动画效果类型 */
export type AnimationType =
  | 'entrance'  // 进入
  | 'emphasis'  // 强调
  | 'exit'      // 退出
  | 'path'      // 路径


export enum PptProjectStatus {
  Pending = 'pending',        // 等待处理
  Processing = 'processing',  // 处理中
  Completed = 'completed',    // 已完成
  Failed = 'failed',          // 失败
}
