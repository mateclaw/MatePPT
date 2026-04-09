import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {OtpCodePo} from '../models/otpCodePo';

/**
 *
 *  OtpCodeService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class OtpCodeService extends BaseService<OtpCodePo> {
    private static instance:OtpCodeService = new OtpCodeService(HttpClientService.getInstance());
    public static getInstance() {
        return OtpCodeService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 添加记录 (Auto generated code)
     *
     */
    public add(param: OtpCodePo): Observable<RSResult<any>> {
        const url = '/aippt/api/otpCode/new';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键删除记录 (Auto generated code)
     *
     */
    public delete(param: OtpCodePo): Observable<RSResult<any>> {
        const url = '/aippt/api/otpCode/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键查询详情 (Auto generated code)
     *
     */
    public detail(param: OtpCodePo): Observable<RSResult<any>> {
        const url = '/aippt/api/otpCode/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: OtpCodePo): Observable<RSResult<any>> {
        const url = '/aippt/api/otpCode/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键更新记录 (Auto generated code)
     *
     */
    public update(param: OtpCodePo): Observable<RSResult<any>> {
        const url = '/aippt/api/otpCode/update';
        return this.httpClientService.post(url, param);
    }

}

