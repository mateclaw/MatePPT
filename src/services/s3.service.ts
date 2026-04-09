import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {S3RequestVo} from '../models/s3RequestVo';
import {FileInfoVo} from '../models/fileInfoVo';
/**
 *
 *  S3Service Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class S3Service extends BaseService<any> {
    private static instance:S3Service = new S3Service(HttpClientService.getInstance());
    public static getInstance() {
        return S3Service.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 创建音频克隆的输入音频，上传到S3的 url
     * 请求参数：
     *     fileName，必填，文件名
     * 响应结果：
     *     R<String>，用于上传文件的url地址（带签名）
     *
     */
    public getAudioCloneUploadUrl(request: S3RequestVo): Observable<RSResult<any>> {
        const url = '/aiavatar/api/s3/audio/clone/upload/url';
        return this.httpClientService.post(url, request);
    }

    /**
     * 创建数字人形象的输入视频，上传到S3的 url
     * 请求参数：
     *     fileName，必填，文件名
     * 响应结果：
     *     R<String>，用于上传文件的url地址（带签名）
     *
     */
    public getAvatarVideoUploadUrl(request: S3RequestVo): Observable<RSResult<any>> {
        const url = '/aiavatar/api/s3/avatar/video/upload/url';
        return this.httpClientService.post(url, request);
    }


    /**
     * 生成PPT单页图片克隆上传url
     * 获取上传PPT图片克隆上传url,此文件用于复刻图片，生成单页HTML
     * 请求参数：
     *     fileName，必填，文件名
     * 响应结果：
     *     R<String>，用于上传文件的url地址（带签名）
     *
     */
    public getImageCloneUrl(request: FileInfoVo): Observable<RSResult<any>> {
        const url = '/aippt/api/s3/creation/imageCloneUrl';
        return this.httpClientService.post(url, request);
    }

    /**
     * PPT单页元素文件上传url,
     * 获取上传PPT单页元素文件上传url，此文件用于单页内添加的图片元素、音频、视频等
     * 请求参数：
     *     fileName，必填，文件名
     *     projectId，必填，项目ID
     *     slideId，必填，幻灯片Id
     * 响应结果：
     *     R<String>，用于上传文件的url地址（带签名）
     *
     */
    public getPptSlideUploadUrl(request: FileInfoVo): Observable<RSResult<any>> {
        const url = '/aippt/api/s3/slide/element/uploadUrl';
        return this.httpClientService.post(url, request);
    }

    /**
     * 生成PPT指定风格样式参考图片上传url
     * 获取上传PPT风格样式参考图片的URL，此文件用于生成PPT时提取风格参考
     * 请求参数：
     *     fileName，必填，文件名
     * 响应结果：
     *     R<String>，用于上传文件的url地址（带签名）
     *
     */
    public getStyleExtracUrl(request: FileInfoVo): Observable<RSResult<any>> {
        const url = '/aippt/api/s3/creation/styleExtractUrl';
        return this.httpClientService.post(url, request);
    }

    /**
     * 自定义PPT模版文件上传url
     * 获取上传模版文件上传url（经典模式），前端拿到这个url后进行文件上传
     * 请求参数：
     *     fileName，必填，文件名
     * 响应结果：
     *     R<String>，用于上传文件的url地址（带签名）
     *
     */
    public getTemplateUploadUrl(request: FileInfoVo): Observable<RSResult<any>> {
        const url = '/aippt/api/s3/classic/template/uploadUrl';
        return this.httpClientService.post(url, request);
    }

    /**
     * 生成PPT用户上传文件上传url
     * 获取用户上传文件上传url，从文件生成大纲的txt、pdf、docx、markdown、视频、音频等文件
     * 请求参数：
     *     fileName，必填，文件名
     * 响应结果：
     *     R<String>，用于上传文件的url地址（带签名）
     *
     */
    public getUserUploadUrl(request: FileInfoVo): Observable<RSResult<any>> {
        const url = '/aippt/api/s3/outline/userUploadUrl';
        return this.httpClientService.post(url, request);
    }

    /**
     * PPT-AI生图结果图片上传到S3
     * 用于生图的结果存在时间限制的情况（例如：即梦AI生成图片的链接仅24小时有效），需要在插入PPT页面之前将图片先上传到S3
     * 请求参数：
     *     fileUrl，必填，源图片链接地址
     *     projectId，必填，项目ID
     *     slideId，必填，幻灯片Id
     * 响应结果：
     *     R<String>，用于直接添加到PPT中的可以访问的图片URL地址，不需要前端再次上传
     *
     */
    public savePptSlideAiImage(request: FileInfoVo): Observable<RSResult<any>> {
        const url = '/aippt/api/s3/slide/element/ai/image/save';
        return this.httpClientService.post(url, request);
    }

    /**
     * PPT单页元素文件删除
     * 删除单页内添加的图片元素、音频、视频等
     * 请求参数：
     *     fileUrl，必填，文件路径
     *     projectId，必填，项目ID
     *     slideId，必填，幻灯片ID
     * 响应结果：
     *     R<Integer>，
     *
     */
    public deletePptSlideElement(request: FileInfoVo): Observable<RSResult<any>> {
        const url = '/aippt/api/s3/slide/element/delete';
        return this.httpClientService.post(url, request);
    }

}

