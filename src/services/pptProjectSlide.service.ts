import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {PptProjectSlidePo} from '../models/pptProjectSlidePo';

/**
 *
 *  PptProjectSlideService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class PptProjectSlideService extends BaseService<PptProjectSlidePo> {
    private static instance:PptProjectSlideService = new PptProjectSlideService(HttpClientService.getInstance());
    public static getInstance() {
        return PptProjectSlideService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 添加记录 (Auto generated code)
     *
     */
    public add(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/slide/new';
        return this.httpClientService.post(url, param);
    }

    /**
     *  批量更新页表记录 ，用于经典模式保存按钮
     *  请求参数：
     *      List<PptProjectSlidePo>
     *  说明：PptProjectSlidePo包含：slideId、slideType、slideJson、speechContent、remark，其中slideId必填
     *
     */
    public updateBatch(slides: PptProjectSlidePo[]): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/slide/updateBatch';
        return this.httpClientService.post(url, slides);
    }

    /**
     * 根据主键slideId删除记录
     *
     */
    public delete(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/slide/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键slideId查询详情
     *
     */
    public detail(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/slide/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     *  分页查询指定project的幻灯片列表
     *  请求参数：
     *      - projectId，必填
     *
     */
    public list(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/slide/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键更新记录 (Auto generated code)
     *
     */
    public update(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/slide/update';
        return this.httpClientService.post(url, param);
    }

}

