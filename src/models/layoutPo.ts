/**
*
*  LayoutPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';
import {PPTDocument} from "@/ppt/core";
import {ThemeColors} from "@/ppt/core/entity/presentation/ThemeColors";

export class LayoutPo extends PageBean {
    /** 主键ID;PRIMARYKEY */
    public layoutId:string;
    /** 页类型:cover/catalog/title/content/end;NOTNULL;MAXLENGTH(24) */
    public slideType:string;
    /** 布局完整json数据（只有一页）  */
    public documentJson:PPTDocument;
    /** 单页内容组数量（catalog/content存在，其余类型为0）;NOTNULL */
    public groupCount:number;
    /** 内容组中的元素数量;NOTNULL */
    public elementCount:number;
    /** 页面缩略图;MAXLENGTH(0) */
    public image:string;
    /** 布局分类ID */
    public category:number;
    /** 幻灯片Id */
    public slideId:string;
    /** 当前页面主题色  */
    public themeColors:ThemeColors;
}


