/**
*
*  UserPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const UserPoRule: ValidRule[] = [
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
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'email', 
        name: '邮箱（可选', 
        types: [ 
            [ValidType.MAXLENGTH, 256], 
        ] 
    }, 
    { 
        field: 'mobile', 
        name: '手机号（可选', 
        types: [ 
            [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'gender', 
        name: '性别', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'status', 
        name: '用户状态', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'province', 
        name: '省份', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'city', 
        name: '城市', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'birthday', 
        name: '出生日期', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'avatarUrl', 
        name: '头像URL', 
        types: [ 
            [ValidType.MAXLENGTH, 512], 
        ] 
    }, 
    { 
        field: 'isSubscribed', 
        name: '是否关注公众号', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'levelId', 
        name: '会员等级', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'totalDeposit', 
        name: '累计充值金额', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'blockReason', 
        name: '账号停用原因', 
        types: [ 
            [ValidType.MAXLENGTH, 256], 
        ] 
    }, 
    { 
        field: 'inviteCode', 
        name: '邀请码', 
        types: [ 
            [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'inviterUserId', 
        name: '邀请人user_id', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'giftPoints', 
        name: '赠送点数', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'vipExpireAt', 
        name: '会员或点数失效时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'createdBy', 
        name: '创建人用户id（后台）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'createdByName', 
        name: '创建人姓名', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'createdAt', 
        name: '创建时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'updatedAt', 
        name: '更新时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'registerAt', 
        name: '注册时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'lastLoginAt', 
        name: '最近登录时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'lastLoginIp', 
        name: '最近登录来源IP', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'loginStatus', 
        name: '登录状态', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'provider', 
        name: '登录提供商', 
        types: [ 
            [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'providerUid', 
        name: '第三方唯一ID', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'unionId', 
        name: '微信unionId', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'password', 
        name: '加密后的密码', 
        types: [ 
            [ValidType.MAXLENGTH, 512], 
        ] 
    }, 
    { 
        field: 'token', 
        name: '新密码', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'checkCode', 
        name: '验证码', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'code', 
        name: 'vx前端获取的code', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'access_token', 
        name: 'vx登录获取的access_token', 
        types: [ 
            
        ] 
    }, 
] 

