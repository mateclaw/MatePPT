import 'umi/typings';
import '@/types/global.d'
import '@/types/wx.d'





// 模块扩充Observable 类的方法
declare module 'rxjs' {
  interface Observable<T> {
    /**
     * 获取URL字符串
     * @returns 返回URL字符串
     */
    getUrl(): string;
  }
}

