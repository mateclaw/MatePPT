/**
*
*  MetaDataVo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';
import { FileInfoVo } from './fileInfoVo';
import { KbConfigVo } from './kbConfigVo';

export class MetaDataVo {
    /** 语言 */
    public language:string;
    /** 页数范围 */
    public pageRange:string;
    /** 风格 */
    public style:string;
    /** 场景 */
    public scene:string;
    /** 受众 */
    public audience:string;
    /** 是否启用搜索 */
    public searchEnable:boolean;
    /** 是否启用深度搜索 */
    public deepSearchEnable:boolean;
    /** 知识库配置列表 */
    public kbConfig:KbConfigVo[];
    /** 创意模式：风格参考图URL（可为http/https） */
    public styleImageUrl:string;
    /** 文件信息 */
    public fileInfo:FileInfoVo;
}

