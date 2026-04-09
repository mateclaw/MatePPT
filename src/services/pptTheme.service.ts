import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {PptThemePo} from '../models/pptThemePo';

/**
 *
 *  PptThemeService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class PptThemeService extends BaseService<PptThemePo> {
    private static instance:PptThemeService = new PptThemeService(HttpClientService.getInstance());
    public static getInstance() {
        return PptThemeService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 添加记录 (Auto generated code)
     *
     */
    public add(param: PptThemePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/theme/new';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键删除记录 (Auto generated code)
     *
     */
    public delete(param: PptThemePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/theme/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键查询详情 (Auto generated code)
     *
     */
    public detail(param: PptThemePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/theme/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: PptThemePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/theme/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 恢复模板默认主题色
     * 参数：
     *     projectId，必填
     * 响应结果：
     *     R<PPTDocument>
     *
     */
    public switchOrigin(param: PptThemePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/theme/default';
        return this.httpClientService.post(url, param);
    }

    /**
     * 主题色切换
     * 参数：
     *     projectId，必填
     *     themeColors，必填
     * 响应结果：
     *     R<PPTDocument>
     *
     */
    public switchTheme(param: PptThemePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/theme/switch';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键更新记录 (Auto generated code)
     *
     */
    public update(param: PptThemePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/theme/update';
        return this.httpClientService.post(url, param);
    }

}

