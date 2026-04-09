/**
*
*  PptProjectSlidePo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';
import {PPTSlide} from "@/ppt/core";

export class PptProjectSlidePo extends PageBean {
    /** 主键ID;PRIMARYKEY */
    public slideId:string;
    /** 所属项目的业务ID;NOTNULL */
    public projectId:string;
    /** 幻灯片序号（从1开始）;NOTNULL */
    public slideNo:number;
    /** 幻灯片类型：cover-封面,catalog-目录,title-标题页,content-内容页,end-结束页等;NOTNULL;MAXLENGTH(50) */
    public slideType:string;
    /** HTML格式的幻灯片内容;MAXLENGTH(0) */
    public slideHtml:string;
    /** 单页slide（经典模式/统一按页存）  */
    public slideJson: PPTSlide;
    /** 演讲内容（该页对应的语音内容）;MAXLENGTH(0) */
    public speechContent:string;
    /** 备注信息;MAXLENGTH(0) */
    public remark:string;
    /** 总页数（包含所有类型页面）;仅用于返回结果，不进行数据库操作 */
    public totalPage:number;
    /** 业务状态：running-进行中;finished-已完成 */
    public status:string;
    /** 用户输入的修改内容，仅用于重新生成单页PPT，不进行数据库操作 */
    public userInput:string;
    /** 图片复刻插页的图片地址，仅作为请求参数使用，不进行数据库持久化 */
    public imageUrl:string;
    /** 布局ID，仅作为请求参数使用，用于插入模板页 */
    public layoutId:string;
    /** 元素ID，仅作为请求参数使用，用于图片搜索 */
    public elementId:string;
}


