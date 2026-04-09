/**
*
*  LayoutPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const LayoutPoRule: ValidRule[] = [
    { 
        field: 'layoutId', 
        name: '自增主键ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'slideType', 
        name: '页类型', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 24], 
        ] 
    }, 
    { 
        field: 'slideJson', 
        name: '单页完整json数据', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'groupCount', 
        name: '单页内容组数量（catalog/content存在', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'elementCount', 
        name: '内容组中的元素数量', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'image', 
        name: '页面缩略图', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'category', 
        name: '布局分类ID', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'projectId', 
        name: '', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slideNo', 
        name: '', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'themeColors', 
        name: '当前页面主题色', 
        types: [ 
            
        ] 
    }, 
] 

