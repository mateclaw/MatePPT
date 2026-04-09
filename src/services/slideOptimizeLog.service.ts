import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {SlideOptimizeLogPo} from '../models/slideOptimizeLogPo';

/**
 *
 *  SlideOptimizeLogService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class SlideOptimizeLogService extends BaseService<SlideOptimizeLogPo> {
    private static instance:SlideOptimizeLogService = new SlideOptimizeLogService(HttpClientService.getInstance());
    public static getInstance() {
        return SlideOptimizeLogService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 分页查询列表，默认按时间倒序排序
     *  参数：
     *     projectId，必填
     *     slideId，必填
     *
     */
    public list(param: SlideOptimizeLogPo): Observable<RSResult<any>> {
        const url = '/aippt/api/slideOptimizeLog/list';
        return this.httpClientService.post(url, param);
    }

}

