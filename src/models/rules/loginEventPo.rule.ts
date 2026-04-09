/**
*
*  LoginEventPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const LoginEventPoRule: ValidRule[] = [
    { 
        field: 'eventId', 
        name: '登录事件ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'userId', 
        name: '归属用户ID（可能为空', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'provider', 
        name: '登录提供方类型', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'providerUid', 
        name: '第三方唯一ID（如openid/sub/githubid）', 
        types: [ 
            [ValidType.MAXLENGTH, 256], 
        ] 
    }, 
    { 
        field: 'result', 
        name: '登录结果', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'occurredAt', 
        name: '事件发生时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'ip', 
        name: '来源IP（inet类型）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'userAgent', 
        name: '浏览器User-Agent', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'account', 
        name: '用户这次输入的账号（邮箱/手机号/用户名）', 
        types: [ 
            [ValidType.MAXLENGTH, 256], 
        ] 
    }, 
    { 
        field: 'otpId', 
        name: '关联的一次性验证码记录', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'failureReason', 
        name: '失败原因描述', 
        types: [ 
            
        ] 
    }, 
] 

