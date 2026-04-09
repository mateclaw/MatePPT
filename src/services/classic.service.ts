import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {ExportTaskPo} from '../models/exportTaskPo';
import {PptProjectSlidePo} from '../models/pptProjectSlidePo';
import {AiImageGenerateVo} from '../models/aiImageGenerateVo';
import {PptProjectPo} from '../models/pptProjectPo';

/**
 *
 *  ClassicService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class ClassicService extends BaseService<any> {
    private static instance:ClassicService = new ClassicService(HttpClientService.getInstance());
    public static getInstance() {
        return ClassicService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 经典模式插入单页PPT：插入位置为slideNo，原该位置及之后的页面序号+1
     * 必填参数：
     *     projectId
     *     slideNo
     *     userInput
     * 响应结果：
     *     PptProjectSlidePo
     *
     */
    public aiInsert(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/slide/ai/insert';
        return this.httpClientService.post(url, param);
    }

    /**
     * 经典模式插入空白页：插入位置为slideNo，原该位置及之后的页面序号+1
     * 必填参数：
     *     projectId
     *     slideNo
     * 响应结果：
     *     PptProjectSlidePo（slideJson为空，elements为空列表）
     *
     */
    public blankInsert(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/slide/blank/insert';
        return this.httpClientService.post(url, param);
    }

    /**
     * 创建导出任务接口：返回任务ID（以及可能的初始状态）
     * 参数：
     *     projectId，必填
     *     exportFormat，可选，默认pdf
     * 响应结果：
     *     ExportTaskPo（仅包含taskId）
     *
     */
    public createExportTask(param: ExportTaskPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/export/task';
        return this.httpClientService.post(url, param);
    }

    /**
     * 经典模式删除单页PPT
     * 请求参数：
     *     slideId，必填
     * 说明：
     *     删除指定位置的slideId，原该位置之后的页面序号-1，并同步更新宣讲稿与大纲字段
     * 响应结果：
     *     Boolean 是否删除成功
     *
     */
    public deleteSlide(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/slide/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * AI 生成图片列表
     *请求参数:
     *     projectId, slideId, elementId, prompt 为必填
     *
     */
    public generateAiImages(param: AiImageGenerateVo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/image/ai/generate';
        return this.httpClientService.post(url, param);
    }

    /**
     * 流式生成 Excalidraw 流程图
     *参数:
     *     userInput: 用户输入文本（必填）
     *
     */
    public generateExcalidraw(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/excalidraw/generate';
        return this.httpClientService.post(url, param);
    }

    /**
     * 流式生成 Infographic 信息图 DSL
     *参数:
     *     userInput: 用户输入文本（必填）
     *
     */
    public generateInfographic(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/infographic/generate';
        return this.httpClientService.post(url, param);
    }

    /**
     * 生成PPT内容接口（流式）
     * 请求参数：
     *     projectId: 项目Id，必填
     *     templateId：模版Id，必填
     * 响应结果<SSE>：
     *     流式返回单页json
     *
     */
    public generateStream(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/generate';
        return this.httpClientService.post(url, param);
    }

    /**
     * 查询经典模式导出任务状态
     * 请求参数：
     *     taskId，必填
     * 响应结果：
     *     ExportTaskPo（包含任务的状态）
     *
     */
    public getExportTaskStatus(param: ExportTaskPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/export/task/status';
        return this.httpClientService.post(url, param);
    }

    /**
     * 经典模式插入模板页（从布局表选择布局插入）：插入位置为slideNo，原该位置及之后的页面序号+1
     * 必填参数：
     *     projectId
     *     slideNo
     *     layoutId
     * 响应结果：
     *     PptProjectSlidePo
     *
     */
    public insertLayout(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/slide/layout/insert';
        return this.httpClientService.post(url, param);
    }

    /**
     * 获取图片搜索候选URL列表
     * 请求参数：
     *     projectId（String），必填
     *     slideId（Integer），必填
     *     elementId（String），必填
     *     userInput（String），可选
     * 说明：
     *     根据项目、幻灯片和元素信息，搜索并返回候选图片URL列表,分为预览URL和下载URL
     * 响应结果：
     *     List<SearchImageVo>
     *
     */
    public searchImages(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/image/search';
        return this.httpClientService.post(url, param);
    }

    /**
     * 经典模式切换模板的接口
     * 参数：
     *     projectId: 项目ID（必填）
     *     templateId: 模板ID（必填）
     * 返回：
     *     List<PptProjectSlidePo>
     *
     */
    public switchTemplate(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/classic/template/switch';
        return this.httpClientService.post(url, param);
    }

}

