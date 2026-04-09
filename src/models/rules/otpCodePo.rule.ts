/**
*
*  OtpCodePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const OtpCodePoRule: ValidRule[] = [
    { 
        field: 'otpId', 
        name: '', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'channel', 
        name: '通道', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'receiver', 
        name: '接收者', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 256], 
        ] 
    }, 
    { 
        field: 'purpose', 
        name: '用途', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'code', 
        name: '验证码', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'sentAt', 
        name: '发送时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'expiresAt', 
        name: '过期时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'usedAt', 
        name: '使用时间（验证通过时写入）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'attemptCount', 
        name: '尝试次数（防刷）', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
] 
