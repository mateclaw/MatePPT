import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {LayoutCategoryPo} from '../models/layoutCategoryPo';

/**
 *
 *  LayoutCategoryService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class LayoutCategoryService extends BaseService<LayoutCategoryPo> {
    private static instance:LayoutCategoryService = new LayoutCategoryService(HttpClientService.getInstance());
    public static getInstance() {
        return LayoutCategoryService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: LayoutCategoryPo): Observable<RSResult<any>> {
        const url = '/aippt/api/layout/category/list';
        return this.httpClientService.post(url, param);
    }

}

