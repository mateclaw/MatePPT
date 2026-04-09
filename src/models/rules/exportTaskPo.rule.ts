/**
*
*  ExportTaskPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const ExportTaskPoRule: ValidRule[] = [
    { 
        field: 'id', 
        name: '自增主键ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'taskId', 
        name: '任务ID（对外返回给前端的标识）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'projectId', 
        name: '项目标识（业务ID）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'projectVersion', 
        name: '创建任务时的项目版本', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'exportFormat', 
        name: '导出格式', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'status', 
        name: '任务状态', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'errorMsg', 
        name: '错误信息（失败时记录）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'fileName', 
        name: '生成的文件名（不含路径）', 
        types: [ 
            [ValidType.MAXLENGTH, 255], 
        ] 
    }, 
    { 
        field: 'fileUrl', 
        name: 'S3上的文件路径（不含域名）', 
        types: [ 
            [ValidType.MAXLENGTH, 512], 
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
        field: 'updateTime', 
        name: '更新时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'downloadUrl', 
        name: '下载链接（完整可访问URL', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'taskStatusDesc', 
        name: '状态描述（处理中/成功/失败原因', 
        types: [ 
            
        ] 
    }, 
] 
