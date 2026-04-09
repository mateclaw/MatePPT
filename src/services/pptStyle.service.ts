import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {PptStylePo} from '../models/pptStylePo';

/**
 *
 *  PptStyleService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class PptStyleService extends BaseService<PptStylePo> {
    private static instance:PptStyleService = new PptStyleService(HttpClientService.getInstance());
    public static getInstance() {
        return PptStyleService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: PptStylePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/style/list';
        return this.httpClientService.post(url, param);
    }

}

