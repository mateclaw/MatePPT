/**
*
*  PptScenePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const PptScenePoRule: ValidRule[] = [
    { 
        field: 'sceneId', 
        name: '自增主键ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'sceneName', 
        name: '场景名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 50], 
        ] 
    }, 
] 
