/**
 * 微信扫码登录 SDK 类型声明
 * 这是一个全局 UMD 模块，会在 window 上挂载 WxLogin 函数
 */

export interface WxLoginConfig {
  /** 应用唯一标识 */
  appid: string;
  /** 应用授权作用域，如 snsapi_login */
  scope: string;
  /** 重定向地址，需在公众平台设置 */
  redirect_uri: string;
  /** 用于保持状态，在回调时原样返回 */
  state: string;
  /** 自定义样式类型，可选 */
  styletype?: string;
  /** 二维码尺寸大小，可选 */
  sizetype?: string;
  /** 背景颜色，可选 */
  bgcolor?: string;
  /** 复位或其他参数，可选 */
  rst?: string;
  /** 样式参数，可选 */
  style?: string;
  /** 超链接，可选 */
  href?: string;
  /** 语言设置，可选值 'en' */
  lang?: string;
  /** 精简样式，可选值 1 */
  stylelite?: number;
  /** 快速登录，可选值 0 */
  fast_login?: number;
  /** 色彩方案，可选值 'auto' | 'dark' | 'light' */
  color_scheme?: string;
  /** iframe 容器的 DOM ID */
  id: string;
  /** 是否为自动跳转，可选 */
  self_redirect?: boolean;
  /** 登录成功回调 */
  onReady?: (isReady: boolean) => void;
  /** 二维码生成成功回调 */
  onQRcodeReady?: () => void;
  /** 清理函数 */
  onCleanup?: () => void;
}

declare global {
  interface Window {
    /** 微信扫码登录类 */
    WxLogin: {
      new (config: WxLoginConfig): void;
    };
  }
}