/**
*
*  VideoSlidePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const VideoSlidePoRule: ValidRule[] = [
    { 
        field: 'slideId', 
        name: '主键', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'taskId', 
        name: '所属视频任务ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'dataFormat', 
        name: '数据格式', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'slideNo', 
        name: '幻灯片序号（从1开始）', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'slideType', 
        name: '幻灯片类型', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'slideHtml', 
        name: 'HTML格式的幻灯片内容（创意模式）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slideJson', 
        name: '单页PPTSlideJSON（经典模式/统一按页存）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'speechContent', 
        name: '演讲内容（该页对应的语音内容）', 
        types: [ 
            
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

