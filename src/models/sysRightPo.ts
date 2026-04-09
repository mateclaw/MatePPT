/**
*
*  SysRightPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class SysRightPo extends PageBean {
    /** 自增加主键;NOTNULL;PRIMARYKEY */
    public rightId:number;
    /** 父权限id;NOTNULL */
    public parentId:number;
    /** 权限名称,检索条件;NOTNULL;MAXLENGTH(32) */
    public rightName:string;
    /** 子类：menu-菜单action-操作;NOTNULL;MAXLENGTH(16) */
    public rightObject:string;
    /** 描述,检索条件;MAXLENGTH(128) */
    public description:string;
    /** 页面地址;MAXLENGTH(256) */
    public pageUrl:string;
    /** 排序码;NOTNULL */
    public sortCode:number;
    /** 状态：1-正常2-禁用;NOTNULL */
    public status:number;
    /** 图标;MAXLENGTH(128) */
    public icon:string;
    /** 修改人id */
    public updateUserId:number;
    /** 修改人姓名;MAXLENGTH(32) */
    public updateUserName:string;
    /** 修改时间;NOTNULL;MAXLENGTH(20) */
    public updateTime:string;
    /** 角色id */
    public roleId:number;
    /** 用户id */
    public userId:string;
}


