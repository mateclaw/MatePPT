/**
*
*  TtsStreamResponseVo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

export class TtsStreamResponseVo {
    /** 事件类型：audio-音频数据,complete-完成,error-错误 */
    public type:string;
    /** 音频数据（Base64编码），仅type=audio时有值 */
    public data:string;
    /** 当前chunk索引，仅type=audio时有值 */
    public index:number;
    /** 当前chunk大小（字节），仅type=audio时有值 */
    public size:number;
    /** 音频格式，仅type=audio时有值 */
    public format:string;
    /** 句子文本，仅type=audio时有值（方便调试） */
    public text:string;
    /** 总chunk数量，仅type=complete时有值 */
    public totalChunks:number;
    /** 总大小（字节），仅type=complete时有值 */
    public totalSize:number;
    /** 错误码，仅type=error时有值 */
    public code:string;
    /** 错误信息，仅type=error时有值 */
    public message:string;
}

