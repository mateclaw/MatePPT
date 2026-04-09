/**
*
*  UserPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class UserPo extends PageBean {
    /** 用户ID;NOTNULL;PRIMARYKEY */
    public userId:string;
    /** 用户名称;NOTNULL;MAXLENGTH(128) */
    public userName:string;
    /** 邮箱（可选，用于通知/找回）;MAXLENGTH(256) */
    public email:string;
    /** 手机号（可选，用于通知/找回）;MAXLENGTH(32) */
    public mobile:string;
    /** 性别：0未知，1男，2女;NOTNULL */
    public gender:number;
    /** 用户状态：0待激活，1正常，2停用;NOTNULL */
    public status:number;
    /** 省份;MAXLENGTH(64) */
    public province:string;
    /** 城市;MAXLENGTH(64) */
    public city:string;
    /** 出生日期 */
    public birthday:LocalDate;
    /** 头像URL;MAXLENGTH(512) */
    public avatarUrl:string;
    /** 是否关注公众号;NOTNULL */
    public isSubscribed:boolean;
    /** 会员等级：0-普通，1-专业，2-企业，3-定制;NOTNULL */
    public levelId:number;
    /** 累计充值金额 */
    public totalDeposit:number;
    /** 账号停用原因;MAXLENGTH(256) */
    public blockReason:string;
    /** 邀请码;MAXLENGTH(32) */
    public inviteCode:string;
    /** 邀请人user_id */
    public inviterUserId:string;
    /** 赠送点数;NOTNULL */
    public giftPoints:number;
    /** 会员或点数失效时间 */
    public vipExpireAt:string;
    /** 创建人用户id（后台） */
    public createdBy:string;
    /** 创建人姓名;MAXLENGTH(64) */
    public createdByName:string;
    /** 创建时间;NOTNULL */
    public createdAt:string;
    /** 更新时间;NOTNULL */
    public updatedAt:string;
    /** 注册时间;NOTNULL */
    public registerAt:string;
    /** 最近登录时间 */
    public lastLoginAt:string;
    /** 最近登录来源IP;MAXLENGTH(128) */
    public lastLoginIp:string;
    /** 登录状态：0未登录，1登录 */
    public loginStatus:number;
    /** 登录提供商：password,sms,wechat_mp,wechat_website,google,github;MAXLENGTH(32) */
    public provider:string;
    /** 第三方唯一ID：openid/OAuthsub等;MAXLENGTH(128) */
    public providerUid:string;
    /** 微信unionId;MAXLENGTH(128) */
    public unionId:string;
    /** 加密后的密码;MAXLENGTH(512) */
    public password:string;
    /** 新密码 */
    public token:string;
    /** 验证码 */
    public checkCode:string;
    /** vx前端获取的code */
    public code:string;
    /** vx登录获取的access_token */
    public access_token:string;
}


