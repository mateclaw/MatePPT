/**
 * BaseBean 基础类
 *
 * @author zhangshengze
 */
export class BaseBean {

   /**
      * 主键 
      */
   public ztIdField = 'id';
   /**
      * 勾选 
      */
   public ztChecked = false;

   /**
    *  排序方式 
    * */
   public sortord: string | undefined;

   /** 模糊条件 */
   public term: string | undefined;

}

