import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {ProductPlanPo} from '../models/productPlanPo';

/**
 *
 *  ProductPlanService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class ProductPlanService extends BaseService<ProductPlanPo> {
    private static instance:ProductPlanService = new ProductPlanService(HttpClientService.getInstance());
    public static getInstance() {
        return ProductPlanService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 添加记录 (Auto generated code)
     *
     */
    public add(param: ProductPlanPo): Observable<RSResult<any>> {
        const url = '/aippt/api/productPlan/new';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键删除记录 (Auto generated code)
     *
     */
    public delete(param: ProductPlanPo): Observable<RSResult<any>> {
        const url = '/aippt/api/productPlan/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键查询详情 (Auto generated code)
     *
     */
    public detail(param: ProductPlanPo): Observable<RSResult<any>> {
        const url = '/aippt/api/productPlan/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: ProductPlanPo): Observable<RSResult<any>> {
        const url = '/aippt/api/productPlan/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键更新记录 (Auto generated code)
     *
     */
    public update(param: ProductPlanPo): Observable<RSResult<any>> {
        const url = '/aippt/api/productPlan/update';
        return this.httpClientService.post(url, param);
    }

}

