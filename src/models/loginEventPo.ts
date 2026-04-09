/**
*
*  LoginEventPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class LoginEventPo extends PageBean {
    /** 登录事件ID;NOTNULL;PRIMARYKEY */
    public eventId:number;
    /** 归属用户ID（可能为空，如第三方回跳失败） */
    public userId:string;
    /** 登录提供方类型;NOTNULL;MAXLENGTH(32) */
    public provider:string;
    /** 第三方唯一ID（如openid/sub/githubid），密码/短信可为空;MAXLENGTH(256) */
    public providerUid:string;
    /** 登录结果：success/failure/locked/mfa_required;NOTNULL;MAXLENGTH(32) */
    public result:string;
    /** 事件发生时间;NOTNULL */
    public occurredAt:string;
    /** 来源IP（inet类型） */
    public ip:string;
    /** 浏览器User-Agent;MAXLENGTH(0) */
    public userAgent:string;
    /** 用户这次输入的账号（邮箱/手机号/用户名）;MAXLENGTH(256) */
    public account:string;
    /** 关联的一次性验证码记录 */
    public otpId:number;
    /** 失败原因描述;MAXLENGTH(0) */
    public failureReason:string;
}


