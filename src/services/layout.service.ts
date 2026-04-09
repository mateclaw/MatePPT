import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {LayoutPo} from '../models/layoutPo';

/**
 *
 *  LayoutService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class LayoutService extends BaseService<LayoutPo> {
    private static instance:LayoutService = new LayoutService(HttpClientService.getInstance());
    public static getInstance() {
        return LayoutService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 根据主键查询详情 (Auto generated code)
     *
     */
    public detail(param: LayoutPo): Observable<RSResult<any>> {
        const url = '/aippt/api/layout/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表（不根据 groupCount 和 elementCount 筛选）
     * 请求参数
     *     themeColors 主题色，必填
     *     category 布局分类，可选参数
     *     slideType 页面类型，可选参数
     * 请求示例：
     * {
     *     "category": 1,
     *     "themeColors": {
     *         "accent1": "#5B9BD5",
     *         "accent2": "#ED7D31",
     *         "accent3": "#A5A5A5",
     *         "accent4": "#FFC000",
     *         "accent5": "#4472C4",
     *         "accent6": "#70AD47"
     *     }
     * }
     *
     */
    public list(param: LayoutPo): Observable<RSResult<any>> {
        const url = '/aippt/api/layout/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表（根据 groupCount 和 elementCount 筛选）
     * 请求参数
     *     groupCount 组数，必填
     *     elementCount 元素数，必填
     *     themeColors 主题色，必填
     * 响应结果：
     *     List<LayoutPo>
     *
     */
    public listByGroupCount(param: LayoutPo): Observable<RSResult<any>> {
        const url = '/aippt/api/layout/listByGroupCount';
        return this.httpClientService.post(url, param);
    }

    /**
     * 页面布局切换
     * 请求参数：
     *     slideId 当前幻灯片id，必填
     *     layoutId 选中的布局id，必填
     * 响应结果：
     *     PPTDocument
     *
     */
    public switchLayout(param: LayoutPo): Observable<RSResult<any>> {
        const url = '/aippt/api/layout/switch';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键更新记录 (Auto generated code)
     *
     */
    public update(param: LayoutPo): Observable<RSResult<any>> {
        const url = '/aippt/api/layout/update';
        return this.httpClientService.post(url, param);
    }

}

