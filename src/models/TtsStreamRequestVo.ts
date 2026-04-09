/**
 * TTS流式请求DTO
 *
 * @author bubuxiu@gmail.com
 */
import {PageBean} from './common/pageBean';

export class TtsStreamRequestVo extends PageBean {
    /** 幻灯片ID，必填 */
    public slideId:string;
    /** 音色ID，可选（不传则从关联的task读取） */
    public styleId:string;
    /** 语速，可选（默认1.0） */
    public speed:number;
    /** TTS模型名称，必填可选值：-local_cosyvoice,doubao */
    public modelName:string;
}

