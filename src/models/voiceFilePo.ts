/**
*
*  VoiceFilePo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class VoiceFilePo extends PageBean {
    /** 音频文件ID，主键;NOTNULL;PRIMARYKEY */
    public fileId:string;
    /** 文件名;NOTNULL;MAXLENGTH(128) */
    public fileName:string;
    /** 文件所在S3key;NOTNULL;MAXLENGTH(128) */
    public fileUrl:string;
    /** 文件大小，单位KB;NOTNULL */
    public fileSize:number;
    /** 文件格式;MAXLENGTH(32) */
    public fileFormat:string;
    /** 创建人ID;NOTNULL */
    public createUserId:string;
    /** 创建人姓名;MAXLENGTH(32) */
    public createUserName:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
    /** 合成文本;MAXLENGTH(0) */
    public inputText:string;
    /** 音色id;NOTNULL;MAXLENGTH(32) */
    public styleId:string;
    /** 音色名称（语音文件生成不会改变，记录当时使用的音色id和名称）;NOTNULL;MAXLENGTH(64) */
    public styleName:string;
    /** 模型，doubao/local_cosyvoice..;NOTNULL;MAXLENGTH(32) */
    public modelName:string;
    /** 合成语速（支持两位小数，如0.95） */
    public speed:number;
    /** 文本流数据（用于接收外部传入的文本流） */
    public textStream:string;
    /** 文本片段（用于流式传输） */
    public textChunk:string;
    /** 流ID（用于标识流式连接） */
    public streamId:string;
    /** 音频格式类型：0-原始PCM数据，1-Base64WAV格式，2-Base64MP3格式 */
    public audioFormat:number;
    /** LiveTalking会话ID */
    public sessionID:number;
    /** 数字人ID */
    public avatarId:string;
}

