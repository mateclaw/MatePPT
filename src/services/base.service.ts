/* eslint-disable */
import { Observable } from 'rxjs';
import { RSResult } from '../models/common/rSResult';

export class BaseService<T> {

  // 分页查询
  public list(params: any): Observable<RSResult<T>> {
    throw new Error('list not implemented yet');
  }

  // 查询详情
  public detail(params: any): Observable<RSResult<T>> {
    throw new Error('info not implemented yet');
  }

  // 新增
  public add(params: any): Observable<RSResult<T>> {
    throw new Error('add not implemented yet');
  }

  // 更新
  public update(params: any): Observable<RSResult<T>> {
    throw new Error('update not implemented yet');
  }

  public addOrUpdate(params: any, add: boolean): Observable<RSResult<T>> {
    if (add) { return this.add(params); }

    return this.update(params);
  }

  // 删除
  public delete(params: any): Observable<RSResult<T>> {
    throw new Error('delete not implemented yet');
  }

}
