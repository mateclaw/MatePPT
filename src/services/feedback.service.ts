import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {FeedbackPo} from '../models/feedbackPo';

/**
 *
 *  FeedbackService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class FeedbackService extends BaseService<FeedbackPo> {
    private static instance:FeedbackService = new FeedbackService(HttpClientService.getInstance());
    public static getInstance() {
        return FeedbackService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 添加记录 (Auto generated code)
     *
     */
    public add(param: FeedbackPo): Observable<RSResult<any>> {
        const url = '/aippt/api/feedback/new';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: FeedbackPo): Observable<RSResult<any>> {
        const url = '/aippt/api/feedback/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 修改反馈记录，标记为已处理
     * 参数：
     *     feedbackId，必填
     *
     */
    public replied(param: FeedbackPo): Observable<RSResult<any>> {
        const url = '/aippt/api/feedback/replied';
        return this.httpClientService.post(url, param);
    }

}

