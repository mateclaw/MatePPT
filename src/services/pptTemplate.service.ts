import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {PptTemplatePo} from '../models/pptTemplatePo';

/**
 *
 *  PptTemplateService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class PptTemplateService extends BaseService<PptTemplatePo> {
    private static instance:PptTemplateService = new PptTemplateService(HttpClientService.getInstance());
    public static getInstance() {
        return PptTemplateService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 上传自定义模板，经典模式专用，前端先将pptx文件上传至S3，然后将url传给该接口，
     * 其中fileName为处理后类似UUID的文件名，数据库需要存原始文件名
     *
     * 必填字段： originalFileUrl      pptx文件S3地址
     *          originalFileName     文件原始名
     *          templateName         模板名称 如果用户没填可以默认使用文件名
     * 响应结果：
     *     R<PptTemplatePo>，标注后的模板
     *
     */
    public addClassic(param: PptTemplatePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/template/classic/new';
        return this.httpClientService.post(url, param);
    }

    /**
     * 更新模板的单个 slide 标注结果
     *
     *请求参数：
     *     templateId(模板ID)，必填
     *     slideNo (当前页码数，从1开始) ，必填
     *     slideJson(单个PPTSlide)，必填
     *响应结果：
     *     R<Integer> - 更新记录条数（前端可以忽略）
     *
     */
    public annotateClassicSlide(param: PptTemplatePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/template/classic/annotate';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据templateId删除记录
     *  请求参数：
     *     templateId，必填
     * 响应结果：
     *     成功删除记录数量
     *
     */
    public delete(param: PptTemplatePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/template/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键查询详情 (Auto generated code)
     *
     */
    public detail(param: PptTemplatePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/template/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表
     *  说明：此接口只返回系统模板（create_user_id = 0），不包含用户自定义模板；如需查询用户自定义模板，请使用 /mytemplate 接口
     * 请求参数：
     *     PptTemplatePo
     * 响应结果：
     *     List<PptTemplatePo>
     *
     */
    public list(param: PptTemplatePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/template/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 查询当前用户的模板列表
     *
     */
    public myTemplate(param: PptTemplatePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/template/myTemplate';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键更新记录 (Auto generated code)
     *
     */
    public update(param: PptTemplatePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/template/update';
        return this.httpClientService.post(url, param);
    }

    /**
     * 更新模板发布状态
     *支持同时更新published状态（后端自动设置为true）和可选的完整slides JSON
     *同时支持更新templateName、styleId、sceneId字段
     *
     *请求参数：
     *     templateId(模板ID)，必填
     *     templateName(模板名称) ，可选
     *     styleId(风格ID)，可选
     *     sceneId(场景ID)，可选
     *响应结果：
     *     R<Integer> - 更新记录条数（前端可以忽略）
     *
     */
    public updateClassicPublished(param: PptTemplatePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/template/classic/publish';
        return this.httpClientService.post(url, param);
    }

}

