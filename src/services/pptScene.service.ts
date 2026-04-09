import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {PptScenePo} from '../models/pptScenePo';

/**
 *
 *  PptSceneService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class PptSceneService extends BaseService<PptScenePo> {
    private static instance:PptSceneService = new PptSceneService(HttpClientService.getInstance());
    public static getInstance() {
        return PptSceneService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: PptScenePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/scene/list';
        return this.httpClientService.post(url, param);
    }

}

