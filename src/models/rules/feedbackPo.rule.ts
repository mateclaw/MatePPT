/**
*
*  FeedbackPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const FeedbackPoRule: ValidRule[] = [
    { 
        field: 'id', 
        name: '主键', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'feedbackNo', 
        name: '反馈编号（格式', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'userId', 
        name: '用户ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'userName', 
        name: '用户名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'category', 
        name: '反馈类型', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'content', 
        name: '反馈正文内容', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'contact', 
        name: '联系方式（手机、邮箱等）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'status', 
        name: '处理状态', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'createdAt', 
        name: '创建时间（反馈提交时间）', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'replyAt', 
        name: '首次客服回复时间（可为空）', 
        types: [ 
            
        ] 
    }, 
] 

