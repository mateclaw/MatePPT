/**
*
*  PptStylePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const PptStylePoRule: ValidRule[] = [
    { 
        field: 'styleId', 
        name: '自增主键ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'styleName', 
        name: '风格名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 50], 
        ] 
    }, 
] 
