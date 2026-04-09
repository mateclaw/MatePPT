/**
*
*  AvatarInfoPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const AvatarInfoPoRule: ValidRule[] = [
    { 
        field: 'avatarId', 
        name: '形象ID', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'avatarName', 
        name: '数字人形象名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 100], 
        ] 
    }, 
    { 
        field: 'avatarType', 
        name: '形象类型', 
        types: [ 
            ValidType.REQUIRED, 
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
        name: '创建人姓名', 
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
        field: 'avatarPath', 
        name: '数字人路径', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 500], 
        ] 
    }, 
    { 
        field: 'taskStatus', 
        name: '任务状态', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'errorMessage', 
        name: '错误信息（失败时）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'startTime', 
        name: '任务开始时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'endTime', 
        name: '任务完成时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'coverUrl', 
        name: '封面图片S3地址（预留字段）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'videoFile', 
        name: '视频文件（用于上传）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'sessionId', 
        name: '会话ID（用于切换数字人）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'modelType', 
        name: '模型类型（wav2lip/musetalk）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'imgSize', 
        name: '图片尺寸', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
] 
