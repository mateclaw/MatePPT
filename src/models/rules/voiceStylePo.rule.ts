/**
*
*  VoiceStylePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const VoiceStylePoRule: ValidRule[] = [
    { 
        field: 'styleId', 
        name: '样式ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'styleName', 
        name: '克隆音色名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'source', 
        name: '音色来源', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'language', 
        name: '语言', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'modelName', 
        name: '模型', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'createUserId', 
        name: '创建人ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'createUserName', 
        name: '创建人名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'createTime', 
        name: '创建时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'inputAudio', 
        name: '输入音频文件', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'inputText', 
        name: '输入文本（与输入音频匹配）', 
        types: [ 
            [ValidType.MAXLENGTH, 512], 
        ] 
    }, 
    { 
        field: 'previewUrl', 
        name: '试听音频地址', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'previewText', 
        name: '试听音频文本', 
        types: [ 
            [ValidType.MAXLENGTH, 512], 
        ] 
    }, 
    { 
        field: 'usageCount', 
        name: '使用次数（统计字段', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'promptWavUrl', 
        name: '音色克隆请求参数', 
        types: [ 
            
        ] 
    }, 
] 
