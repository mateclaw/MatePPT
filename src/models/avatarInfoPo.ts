/**
*
*  AvatarInfoPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class AvatarInfoPo extends PageBean {
    /** 形象ID;NOTNULL;PRIMARYKEY */
    public avatarId:string;
    /** 数字人形象名称;NOTNULL;MAXLENGTH(64) */
    public avatarName:string;
    /** 数字人描述 */
    public description:string;
    /** 形象类型：user-用户自定义，system-系统默认;NOTNULL;MAXLENGTH(16) */
    public avatarType:string;
    /** 创建人ID;NOTNULL */
    public createUserId:string;
    /** 创建人名称;NOTNULL;MAXLENGTH(32) */
    public createUserName:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
    /** 数字人路径;NOTNULL;MAXLENGTH(128) */
    public avatarPath:string;
    /** 任务状态：0-初始状态，1-排队 2-处理中 3-完成 4-失败 5-取消;NOTNULL */
    public taskStatus:number;
    /** 错误信息（失败时）;MAXLENGTH(0) */
    public errorMessage:string;
    /** 任务开始时间 */
    public startTime:string;
    /** 任务完成时间 */
    public endTime:string;
    /** 封面图片S3地址;MAXLENGTH(128) */
    public coverUrl:string;
}

