/**
*
*  LayoutCategoryPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const LayoutCategoryPoRule: ValidRule[] = [
    { 
        field: 'categoryId', 
        name: '', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'categoryName', 
        name: '', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 50], 
        ] 
    }, 
] 
