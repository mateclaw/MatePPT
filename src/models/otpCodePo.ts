/**
*
*  OtpCodePo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class OtpCodePo extends PageBean {
    /** ;NOTNULL;PRIMARYKEY */
    public otpId:number;
    /** 通道：sms/email;NOTNULL;MAXLENGTH(16) */
    public channel:string;
    /** 接收者：手机号或邮箱;NOTNULL;MAXLENGTH(256) */
    public receiver:string;
    /** 用途：login/register/reset_password等;NOTNULL;MAXLENGTH(32) */
    public purpose:string;
    /** 验证码;NOTNULL;MAXLENGTH(16) */
    public code:string;
    /** 发送时间;NOTNULL */
    public sentAt:string;
    /** 过期时间;NOTNULL */
    public expiresAt:string;
    /** 使用时间（验证通过时写入） */
    public usedAt:string;
    /** 尝试次数（防刷）;NOTNULL */
    public attemptCount:number;
}

