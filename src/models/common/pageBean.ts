/**
 * PageBean 分页属性
 *
 * @author zhangshengze
 */
import {BaseBean} from './baseBean';

export class PageBean extends BaseBean {
  /**
   * 总记录数
   */
  public total: number | undefined;
  /** 页面大小 */
  public pageSize = 10;

  /** 当前页码 */
  public pageNum = 1;

}
