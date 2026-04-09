/**
*
*  AvatarVideoPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class AvatarVideoPo extends PageBean {
    /** 任务ID，主键;NOTNULL;PRIMARYKEY */
    public taskId:string;
    /** 数字人形象ID */
    public avatarId:string;
    /** 数字人形象名称;MAXLENGTH(32) */
    public avatarName:string;
    /** 音色/语音风格ID;MAXLENGTH(64) */
    public styleId:string;
    /** 音色/语音风格名称;MAXLENGTH(64) */
    public styleName:string;
    /** 语音合成语速（范围：0.50-2.00，两位小数），默认1.0;NOTNULL */
    public speed:number;
    /** 合成文本内容，支持整段文本或摘要;NOTNULL;MAXLENGTH(0) */
    public inputText:string;
    /** 视频文件名，格式：avatarName_timestamp.mp4;MAXLENGTH(64) */
    public fileName:string;
    /** 视频文件在S3存储中的地址（key）;MAXLENGTH(255) */
    public fileUrl:string;
    /** 视频封面图片在S3存储中的地址（key）;MAXLENGTH(255) */
    public coverUrl:string;
    /** 文件大小，单位MB */
    public fileSize:number;
    /** 文件格式，默认mp4;MAXLENGTH(16) */
    public fileFormat:string;
    /** 输出视频宽度，单位像素(px) */
    public videoWidth:number;
    /** 输出视频高度，单位像素(px) */
    public videoHeight:number;
    /** 视频实际时长，单位秒(s) */
    public duration:number;
    /** 视频流平均帧率 */
    public fps:number;
    /** 视频码率，单位kbps */
    public bitrateKbps:number;
    /** 任务状态：0-初始状态，1-排队2-处理中3-完成4-失败5-取消;NOTNULL */
    public taskStatus:number;
    /** 任务失败时的错误信息;MAXLENGTH(0) */
    public errorMessage:string;
    /** 任务创建用户ID;NOTNULL */
    public createUserId:string;
    /** 任务创建用户名称;MAXLENGTH(32) */
    public createUserName:string;
    /** 任务创建时间;NOTNULL */
    public createTime:string;
    /** 任务开始处理时间 */
    public startTime:string;
    /** 任务结束时间（成功或失败） */
    public endTime:string;
}


