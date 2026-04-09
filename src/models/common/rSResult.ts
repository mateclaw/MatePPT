/**
 * RSResult 接收服务端返回内容模型
 *
 * @author zhangshengze
 */
export class RSResult<T> {

  /**
   * code: 状态码, 0成功, 1一般业务异常, -1其他异常, -2授权异常, 令牌错误或令牌过期
   */
  public code: number | undefined;

  /**
   * total: 列表总数
   */
  public total: number | undefined;
  /**
   * message: 错误消息
   */
  public msg: string | undefined;

  /**
   * data: 数据
   */
  public data: T | T[] | undefined;

}
