import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {PptProjectPo} from '../models/pptProjectPo';
import {FileInfoVo} from '../models/fileInfoVo';

/**
 *
 *  OutlineService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class OutlineService extends BaseService<any> {
    private static instance:OutlineService = new OutlineService(HttpClientService.getInstance());
    public static getInstance() {
        return OutlineService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 生成PPT大纲（Bilibili）
     *
     *参数：
     *     projectId，必填
     *     biliCookie，必填
     * 响应结果：
     *     role: assistant -> 流式输出内容
     *     role: OUTLINE -> 完整PPT大纲-->List<OutlineSlideVo>
     * 创建新项目时，必填的字段
     * MetaData如下：
     * {
     *   "fileInfo":
     *     {
     *       "fileUrl": "https://www.bilibili.com/video/BV17x2vBLEve/?spm_id_from=333.1007.tianma.1-2-2.click&vd_source=4c58ae761e0bcef609052731995630eb",
     *       "fileType": "bilibili"
     *     },
     *   "language": "zh-CN",
     *   "pageRange": "5-10",
     *   "searchEnable": false
     * }
     *
     */
    public generateBilibili(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/outline/generate/bilibili';
        return this.httpClientService.post(url, param);
    }

    /**
     * 生成PPT大纲（外链）
     *参数：
     *     projectId，必填
     * 响应结果：
     *     role: assistant -> 流式输出内容
     *     role: OUTLINE -> 完整PPT大纲-->List<OutlineSlideVo>
     * 创建新项目时，必填的字段
     * MetaData如下：
     * {
     *   "fileInfo":
     *     {
     *       "fileUrl": "",
     *       "fileName": "link 可以不填",
     *       "fileSize":  link 可以不填,
     *       "fileType": "实际的文件类型，如果是纯网页，就写link，如果是外部的S3存储的文件，就写对应的类型，如pdf、docx等"
     *     },
     *   "language": "zh-CN",
     *   "pageRange": "5-10",
     *   "searchEnable": false
     * }
     *
     */
    public generateLink(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/outline/generate/link';
        return this.httpClientService.post(url, param);
    }

    /**
     * 生成PPT大纲（用户输入）
     *参数：
     *     projectId，必填
     * 响应结果：
     *     role: assistant -> 流式输出内容
     *     role: OUTLINE -> 完整PPT大纲-->List<OutlineSlideVo>
     * 创建新项目时，必填的字段
     * MetaData如下：
     * {
     *   "language": "zh-CN",
     *   "pageRange": "5-10",
     *   "searchEnable": false
     * }
     *
     */
    public generateUserInput(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/outline/generate/userInput';
        return this.httpClientService.post(url, param);
    }

    /**
     * 生成PPT大纲（用户上传）
     *
     *参数：
     *     projectId，必填
     * 响应结果：
     *     role: assistant -> 流式输出内容
     *     role: OUTLINE -> 完整PPT大纲-->List<OutlineSlideVo>
     * 创建新项目时，必填的字段
     * MetaData如下：
     * {
     *   "fileInfo":
     *     {
     *       "fileUrl": "https://mateai.co:9000/mateai-studio/aippt/userUpload/files/斗破苍穹-Nl2tGW0joSsEOMHmoPFNf.txt",
     *       "fileName": "斗破苍穹.txt",
     *       "fileSize": 36477 ,
     *       "fileType": "真实的文件类型，如txt、pdf、docx等"
     *     },
     *   "language": "zh-CN",
     *   "pageRange": "5-10",
     *   "searchEnable": false
     * }
     *
     */
    public generateUserUpload(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/outline/generate/userUpload';
        return this.httpClientService.post(url, param);
    }

    /**
     * 更新PPT大纲
     *参数：
     *     projectId，必填
     *     outline，必填（json）-->List<OutlineSlideVo>
     * 响应结果：
     *     Integer，非0表示成功更新记录数量
     *
     */
    public updateOutline(param: PptProjectPo): Observable<RSResult<any>> {
        const url = '/aippt/api/outline/update';
        return this.httpClientService.post(url, param);
    }

}

