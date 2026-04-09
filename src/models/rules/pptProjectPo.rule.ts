/**
*
*  PptProjectPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const PptProjectPoRule: ValidRule[] = [
    { 
        field: 'id', 
        name: '自增主键ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'projectId', 
        name: '项目唯一业务标识符', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'projectName', 
        name: '项目名称', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'projectType', 
        name: '项目类型', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 50], 
        ] 
    }, 
    { 
        field: 'userInput', 
        name: '用户需求描述文本', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'metaData', 
        name: '元数据', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'templateId', 
        name: '选择的模板ID', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'status', 
        name: '当前状态', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 50], 
        ] 
    }, 
    { 
        field: 'outline', 
        name: '生成的大纲内容JSON形式', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'theme', 
        name: '主题（经典模式特有）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'width', 
        name: '画布宽（经典模式特有）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'height', 
        name: '画布高（经典模式特有）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'errorInfo', 
        name: '执行失败的信息', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'createUserId', 
        name: '创建用户ID', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'createUserName', 
        name: '创建用户姓名', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'cover', 
        name: '项目封面图（S3url）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'speechDraft', 
        name: '宣讲稿', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'createTime', 
        name: '创建时间戳', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'version', 
        name: '项目内容版本号', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'sourceType', 
        name: '项目来源类型', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 50], 
        ] 
    }, 
    { 
        field: 'insertIndex', 
        name: '插入索引位置（0-based', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'biliCookie', 
        name: '哔哩哔哩Cookie（仅用于Bilibili模式）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slides', 
        name: '生成的结果（传统模式专用）', 
        types: [ 
            
        ] 
    }, 
] 
