/**
*
*  PptTemplatePo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';
import {PPTDocument, PPTMaster, PPTSlide} from "@/ppt/core";
import {HtmlSlideVo} from "@/models/htmlSlideVo";

export class PptTemplatePo extends PageBean {
    /** 主键，模板唯一业务标识符;PRIMARYKEY */
    public templateId:string;
    /** 模板名称;NOTNULL;MAXLENGTH(255) */
    public templateName:string;
    /** 模板类型：creative-创作,classic-经典;MAXLENGTH(50) */
    public createMode:string;
    /** 模板分类：该字段目前还未使用 */
    public templateCategory:string;
    /** 模板风格分类ID */
    public styleId:number;
    /** 模板场景分类ID */
    public sceneId:number;
    /** 模板描述;MAXLENGTH(0) */
    public description:string;
    /** 设计风格;MAXLENGTH(0) */
    public designStyle:string;
    /** 模板PPTDocument数据（传统模式专用） */
    public document:PPTDocument;
    /** 母版列表List<PPTMaster>（传统模式专用） */
    public masters:PPTMaster[];
    /** HTML幻灯片列表List<HtmlSlideVo>（创意模式专用） */
    public htmlSlides:HtmlSlideVo[];
    /** 起始页缩略图（base64格式）;MAXLENGTH(0) */
    public coverImage:string;
    /** 目录页缩略图（base64格式）;MAXLENGTH(0) */
    public catalogImage:string;
    /** 内容页缩略图（base64格式）;MAXLENGTH(0) */
    public contentImage:string;
    /** 结束页缩略图（base64格式）;MAXLENGTH(0) */
    public endImage:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
    /** 更新时间;NOTNULL */
    public updateTime:string;
    /** 创建用户ID（0代表系统，其余数字对应userId） */
    public createUserId:string;
    /** 创建用户姓名;MAXLENGTH(64) */
    public createUserName:string;
    /** 原始文件名（用户上传时的文件名）;MAXLENGTH(255) */
    public originalFileName:string;
    /** 原始文件S3key（前端上传后的S3key）;MAXLENGTH(0) */
    public originalFileUrl:string;
    /** 是否已发布;默认false */
    public published:boolean;
    /**  */
    public slideType:string;
    /**  */
    public slideNo:number;
    /**  */
    public slideTitle:string;
    /**  */
    public slideSubTitle:string;
    /**  */
    public slideChapterNum:string;
    /** 单个pptSlide，用于部分更新 */
    public slideJson:PPTSlide;
    /** 使用该模板的项目数量（仅用于删除检查） */
    public projectCount:number;
}


