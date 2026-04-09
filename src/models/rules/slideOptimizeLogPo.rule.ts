/**
*
*  SlideOptimizeLogPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const SlideOptimizeLogPoRule: ValidRule[] = [
    { 
        field: 'id', 
        name: '主键', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'modelName', 
        name: '大语言模型名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'question', 
        name: '提问内容', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'answer', 
        name: '回答内容', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'tokensizeq', 
        name: '问题的tokens', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'tokensizea', 
        name: '回答的tokens', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'projectId', 
        name: 'PPTprojectId', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'slideId', 
        name: 'PPTslideId', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'userId', 
        name: '用户ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'userName', 
        name: '用户姓名', 
        types: [ 
            [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'createTime', 
        name: '创建时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
] 

