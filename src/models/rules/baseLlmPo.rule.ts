/**
*
*  BaseLlmPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const BaseLlmPoRule: ValidRule[] = [
    { 
        field: 'llmId', 
        name: '自增加主键', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'modelName', 
        name: '调用官方api时使用的标识符', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'provider', 
        name: '模型提供商', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'status', 
        name: '模型状态', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'maxTokenLen', 
        name: '最大上下文长度', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'baseUrl', 
        name: '模型接口调用地址', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'isDefault', 
        name: '是否默认模型', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'llmType', 
        name: '模型类型', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'apiKey', 
        name: '线上模型apiKey', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'openaiApi', 
        name: '是否为OpenAI兼容的接口调用形式', 
        types: [ 
            
        ] 
    }, 
] 
