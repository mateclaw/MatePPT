/**
*
*  PptTemplatePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const PptTemplatePoRule: ValidRule[] = [
    { 
        field: 'id', 
        name: '自增主键ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'templateId', 
        name: '模板唯一业务标识符', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'templateName', 
        name: '模板名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 255], 
        ] 
    }, 
    { 
        field: 'createMode',
        name: '模板类型', 
        types: [ 
            [ValidType.MAXLENGTH, 50], 
        ] 
    }, 
    { 
        field: 'templateCategory', 
        name: '模板分类', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'styleId', 
        name: '模板风格分类ID', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'sceneId', 
        name: '模板场景分类ID', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'description', 
        name: '模板描述', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'designStyle', 
        name: '设计风格', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'document', 
        name: '模板PPTDocument数据（传统模式专用）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'coverImage', 
        name: '起始页缩略图（base64格式）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'catalogImage', 
        name: '目录页缩略图（base64格式）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'contentImage', 
        name: '内容页缩略图（base64格式）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'endImage', 
        name: '结束页缩略图（base64格式）', 
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
    { 
        field: 'updateTime', 
        name: '更新时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'createUserId', 
        name: '创建用户ID（0代表系统', 
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
        field: 'originalFileName', 
        name: '原始文件名（用户上传时的文件名）', 
        types: [ 
            [ValidType.MAXLENGTH, 255], 
        ] 
    }, 
    { 
        field: 'originalFileUrl', 
        name: '原始文件S3key（前端上传后的S3key）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'published', 
        name: '是否已发布', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slideType', 
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
        field: 'slideTitle', 
        name: '', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slideSubTitle', 
        name: '', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slideChapterNum', 
        name: '', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slideJson', 
        name: '单个pptSlide', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'projectCount', 
        name: '使用该模板的项目数量（仅用于删除检查）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
] 
