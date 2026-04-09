/**
*
*  PptVideoFilePo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class PptVideoFilePo extends PageBean {
    /** 视频编号（主键）;NOTNULL;PRIMARYKEY */
    public videoId:string;
    /** 所属视频任务ID;NOTNULL */
    public taskId:string;
    /** 渲染模式：0-普通视频1-PPT视频;NOTNULL */
    public renderMode:number;
    /** 数字人ID（无数字人时可为空） */
    public avatarId:string;
    /** 数字人名称（无数字人时可为空）;MAXLENGTH(64) */
    public avatarName:string;
    /** 音色ID;NOTNULL;MAXLENGTH(32) */
    public styleId:string;
    /** 音色名称;NOTNULL;MAXLENGTH(64) */
    public styleName:string;
    /** 语速快照（支持两位小数，如0.95）;NOTNULL */
    public speed:number;
    /** 合成文本（审计/回溯用途）;MAXLENGTH(0) */
    public inputText:string;
    /** 文件名：avatarName_timestamp.mp4;MAXLENGTH(64) */
    public fileName:string;
    /** 视频文件S3地址;MAXLENGTH(128) */
    public fileUrl:string;
    /** 封面图片S3地址;MAXLENGTH(128) */
    public coverUrl:string;
    /** 文件大小（单位MB） */
    public fileSize:number;
    /** 文件格式（默认mp4）;MAXLENGTH(16) */
    public fileFormat:string;
    /** 输出视频宽(px) */
    public videoWidth:number;
    /** 输出视频高(px) */
    public videoHeight:number;
    /** 输出视频时长(ms) */
    public duration:number;
    /** 输出视频帧率 */
    public fps:number;
    /** 输出视频码率(kbps) */
    public bitrateKbps:number;
    /** 创建用户ID;NOTNULL */
    public createUserId:string;
    /** 创建用户姓名;MAXLENGTH(32) */
    public createUserName:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
}


