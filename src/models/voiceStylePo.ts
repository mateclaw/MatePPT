/**
*
*  VoiceStylePo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class VoiceStylePo extends PageBean {
    /** 样式ID;NOTNULL;MAXLENGTH(32);PRIMARYKEY */
    public styleId:string;
    /** 克隆音色名称;NOTNULL;MAXLENGTH(64) */
    public styleName:string;
    /** 音色来源：user-用户自定义，system-系统默认;NOTNULL;MAXLENGTH(32) */
    public source:string;
    /** 语言，CN/EN..;NOTNULL;MAXLENGTH(16) */
    public language:string;
    /** 模型，doubao/local_cosyvoice..;NOTNULL;MAXLENGTH(32) */
    public modelName:string;
    /** 创建人ID;NOTNULL */
    public createUserId:string;
    /** 创建人名称;NOTNULL;MAXLENGTH(32) */
    public createUserName:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
    /** 输入音频文件;MAXLENGTH(128) */
    public inputAudio:string;
    /** 输入文本（与输入音频匹配）;MAXLENGTH(512) */
    public inputText:string;
    /** 试听音频地址;MAXLENGTH(128) */
    public previewUrl:string;
    /** 试听音频文本;MAXLENGTH(512) */
    public previewText:string;
    /** 使用次数（统计字段，不存储在数据库） */
    public usageCount:number;
    /** 音色克隆请求参数：音频文件S3URL（用于请求参数，不存储在数据库） */
    public promptWavUrl:string;
}

