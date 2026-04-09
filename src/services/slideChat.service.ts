import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {SlidePatchApplyVo} from '../models/slidePatchApplyVo';
import {SlideOptimizeLogPo} from '../models/slideOptimizeLogPo';

/**
 *
 *  SlideChatService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class SlideChatService extends BaseService<any> {
    private static instance:SlideChatService = new SlideChatService(HttpClientService.getInstance());
    public static getInstance() {
        return SlideChatService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 应用 unified diff 到 html，返回应用后的 html（不落库）
     * 请求参数：
     *     html: 原始 HTML
     *     patch: unified diff 文本
     * 返回：
     *     R<String>，data 为应用后的 HTML
     *
     */
    public applyPatch(param: SlidePatchApplyVo): Observable<RSResult<any>> {
        const url = '/aippt/api/slide/chat/applyPatch';
        return this.httpClientService.post(url, param);
    }

    /**
     * PPT Slide通过对话方式优化（适应于创意模式编辑页面），流式输出
     * 参数：
     *     projectId，必填
     *     slideId，必填
     *     question：用户问题，必填
     *     modelName：大语言模型名称，选填
     * 返回数据结构：SseEmitter
     *
     */
    public optimizeStream(param: SlideOptimizeLogPo): Observable<RSResult<any>> {
        const url = '/aippt/api/slide/chat/optimizeStream';
        return this.httpClientService.post(url, param);
    }

}

