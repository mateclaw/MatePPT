import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {PptProjectPo} from '../models/pptProjectPo';

/**
 *
 *  PptProjectService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class PptProjectService extends BaseService<PptProjectPo> {
    private static instance:PptProjectService = new PptProjectService(HttpClientService.getInstance());
    public static getInstance() {
        return PptProjectService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 创建新PptProject
     * 必填参数：
     *         userInput（String） 用户输入的生成PPT的要求
     *         metaData（String） 项目相关的元信息，比如语言、页数等
     * 响应结果：
     *     PptProjectPo
     *
     */
    public add(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/project/new';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据projectId删除记录
     *  参数：
     *     projectId，必填
     *
     */
    public delete(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/project/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键查询详情 (Auto generated code)
     *
     */
    public detail(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/project/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表
     * 说明：此接口会展示 cover 字段（项目封面图）
     *
     */
    public list(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/project/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 查询当前用户的项目列表
     * 说明：此接口只返回当前用户创建的项目，会展示 cover 字段（项目封面图）
     *
     */
    public myProject(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/project/myProject';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据projectId更新记录
     *  参数：
     *     id，必填---删除此字段，注意前端不允许传多余的参数（TODO：待整改）
     *     projectId，必填
     *     其他需要更新的字段，选填
     *
     */
    public update(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/project/update';
        return this.httpClientService.post(url, param);
    }

}

