/**
*
*  PptProjectSlidePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const PptProjectSlidePoRule: ValidRule[] = [
    { 
        field: 'slideId', 
        name: '自增主键ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'projectId', 
        name: '所属项目的业务ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
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
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 50], 
        ] 
    }, 
    { 
        field: 'slideHtml', 
        name: 'HTML格式的幻灯片内容', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slideJson', 
        name: '单页PptDocumentJSON（经典模式/统一按页存）', 
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
        field: 'remark', 
        name: '备注信息', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'totalPage', 
        name: '总页数（包含所有类型页面）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'status', 
        name: '业务状态', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'userInput', 
        name: '用户输入的修改内容', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'imageUrl', 
        name: '图片复刻插页的图片地址', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'layoutId', 
        name: '布局ID', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'elementId', 
        name: '元素ID', 
        types: [ 
            
        ] 
    }, 
] 

