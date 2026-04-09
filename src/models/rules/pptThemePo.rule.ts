/**
*
*  PptThemePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const PptThemePoRule: ValidRule[] = [
    { 
        field: 'id', 
        name: '自增主键ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'themeName', 
        name: '主题名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 24], 
        ] 
    }, 
    { 
        field: 'themeColors', 
        name: '颜色', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'projectId', 
        name: '', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'templateId', 
        name: '', 
        types: [ 
            
        ] 
    }, 
] 
