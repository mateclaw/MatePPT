/**
*
*  PptThemePo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class PptThemePo extends PageBean {
    /** 自增主键ID;NOTNULL;PRIMARYKEY */
    public id:number;
    /** 主题名称;NOTNULL;MAXLENGTH(24) */
    public themeName:string;
    /** 主题颜色，存储12个颜色，16进制字符串（#123456,#...） */
    public themeColors:string;
    /** 项目id */
    public projectId:string;
}


