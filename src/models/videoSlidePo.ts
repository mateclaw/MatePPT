/**
*
*  VideoSlidePo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';
import {PPTSlide} from "@/ppt/core";

export class VideoSlidePo extends PageBean {
    /** 主键，幻灯片页ID（注意此Id与project_slideId不相干）;NOTNULL;PRIMARYKEY */
    public slideId:string;
    /** 所属视频任务ID;NOTNULL */
    public taskId:string;
    /** 创建模式：creative/classic;NOTNULL;MAXLENGTH(16) */
    public createMode:string;
    /** 幻灯片序号（从1开始）;NOTNULL */
    public slideNo:number;
    /** 幻灯片类型：cover-封面,catalog-目录,transition-章节过渡页,content-内容页,end-结束页等;NOTNULL;MAXLENGTH(32) */
    public slideType:string;
    /** HTML格式的幻灯片内容（创意模式）;MAXLENGTH(0) */
    public slideHtml:string;
    /** 单页PPTSlideJSON（经典模式/统一按页存）;MAXLENGTH(0) */
    public slideJson:PPTSlide;
    /** 演讲内容（该页对应的语音内容）;MAXLENGTH(0) */
    public speechContent:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
}


