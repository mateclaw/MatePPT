/**
*
*  BaseLlmPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class BaseLlmPo extends PageBean {
    /** 自增加主键;NOTNULL;PRIMARYKEY */
    public llmId:number;
    /** 调用官方api时使用的标识符;NOTNULL;MAXLENGTH(64) */
    public modelName:string;
    /** 模型提供商：OpenAI/Azure/Alibaba/Huawei/Zhipu/Meta/Mistral，仅用于前端显示;NOTNULL;MAXLENGTH(32) */
    public provider:string;
    /** 模型状态：0-禁用，1-启用;NOTNULL */
    public status:number;
    /** 最大上下文长度;NOTNULL */
    public maxTokenLen:number;
    /** 模型接口调用地址;NOTNULL;MAXLENGTH(128) */
    public baseUrl:string;
    /** 是否默认模型;NOTNULL */
    public isDefault:boolean;
    /** 模型类型：0-聊天模型1-多模态模型2-嵌入模型3-重排模型;NOTNULL */
    public llmType:number;
    /** 线上模型apiKey */
    public apiKey:string;
    /** 是否为OpenAI兼容的接口调用形式 */
    public openaiApi:boolean;
}

