import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {PptProjectSlidePo} from '../models/pptProjectSlidePo';
import {ExportTaskPo} from '../models/exportTaskPo';
import {PptProjectPo} from '../models/pptProjectPo';
import {FileInfoVo} from '../models/fileInfoVo';

/**
 *
 *  CreationService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class CreationService extends BaseService<any> {
    private static instance:CreationService = new CreationService(HttpClientService.getInstance());
    public static getInstance() {
        return CreationService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 插入单页PPT
     *必填参数：projectId（String）, slideNumber（Integer）, userInput（String）
     *说明：插入位置为slideNumber，原该位置及之后的页面序号+1
     *
     *@param param
     *        PptProjectSlidePo 请求参数，projectId、slideNumber、userInput为必填
     *@return R<PptProjectSlidePo> 新插入的单页PPT内容
     *
     */
    public aiInsert(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/creation/ai/insert';
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
    public createExportTask(request: ExportTaskPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/creation/export';
        return this.httpClientService.post(url, request);
    }

    /**
     * 生成PPT内容接口（流式）
     * 参数：
     *     projectId: 项目ID（必填）
     *     templateId: 模板ID（必填）
     *
     */
    public generateStream(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/creation/generate';
        return this.httpClientService.post(url, param);
    }

    /**
     * 轮询查询导出任务状态接口
     * 参数：
     *     taskId，必填
     * 响应结果：
     *     ExportTaskPo（包含任务的状态）
     *
     */
    public getExportTaskStatus(request: ExportTaskPo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/creation/export/status';
        return this.httpClientService.post(url, request);
    }

    /**
     * 图片复刻插入单页PPT
     *必填参数：projectId（String） imageUrl（String）；选填：slideNo（Integer）
     *
     *@param param
     *        PptProjectSlidePo 请求参数，projectId、imageUrl必填，slideNo可选
     *@return R<PptProjectSlidePo> 新插入的单页PPT内容
     *
     */
    public imageInsert(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/creation/image/insert';
        return this.httpClientService.post(url, param);
    }

    /**
     * 重新生成单页PPT
     *必填参数：projectId（String）, slideId（Integer）, userInput（String）
     *
     *@param param
     *        PptProjectPo 请求参数，projectId、slideId、userInput为必填
     *@return R<PptProjectSlidePo> 单页PPT内容
     *
     */
    public regenerate(param: PptProjectSlidePo): Observable<RSResult<any>> {
        const url = '/aippt/api/ppt/creation/regenerate';
        return this.httpClientService.post(url, param);
    }

}

