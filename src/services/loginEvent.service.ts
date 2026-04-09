import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {LoginEventPo} from '../models/loginEventPo';

/**
 *
 *  LoginEventService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class LoginEventService extends BaseService<LoginEventPo> {
    private static instance:LoginEventService = new LoginEventService(HttpClientService.getInstance());
    public static getInstance() {
        return LoginEventService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 添加记录 (Auto generated code)
     *
     */
    public add(param: LoginEventPo): Observable<RSResult<any>> {
        const url = '/aippt/api/loginEvent/new';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键删除记录 (Auto generated code)
     *
     */
    public delete(param: LoginEventPo): Observable<RSResult<any>> {
        const url = '/aippt/api/loginEvent/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键查询详情 (Auto generated code)
     *
     */
    public detail(param: LoginEventPo): Observable<RSResult<any>> {
        const url = '/aippt/api/loginEvent/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: LoginEventPo): Observable<RSResult<any>> {
        const url = '/aippt/api/loginEvent/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键更新记录 (Auto generated code)
     *
     */
    public update(param: LoginEventPo): Observable<RSResult<any>> {
        const url = '/aippt/api/loginEvent/update';
        return this.httpClientService.post(url, param);
    }

}

