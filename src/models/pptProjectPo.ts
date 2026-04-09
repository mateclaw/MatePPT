/**
*
*  PptProjectPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';
import {MetaDataVo} from "@/models/metaDataVo";
import {OutlineSlideVo} from "@/models/outlineSlideVo";
import {PPTTheme} from "@/ppt/core";

export class PptProjectPo extends PageBean {
    /** 主键I，项目唯一业务标识符;PRIMARYKEY*/
    public projectId:string;
    /** 项目名称;MAXLENGTH(128) */
    public projectName:string;
    /** 项目类型：creative（创作）/classic（经典）;NOTNULL;MAXLENGTH(50) */
    public createMode:string;
    /** 用户需求描述文本;NOTNULL;MAXLENGTH(0) */
    public userInput:string;
    /** 元数据：语言/页数/功能开关（联网搜索/知识库/文件上传）模板ID/面向场景/风格  */
    public metaData: MetaDataVo;
    /** 选择的模板ID;MAXLENGTH(64) */
    public templateId:string;
    /** 当前状态：pending-等待处理,processing-处理中,completed-已完成,failed-失败;NOTNULL;MAXLENGTH(50) */
    public status:string;
    /** 生成的大纲内容JSON形式;MAXLENGTH(0) */
    public outline: OutlineSlideVo[];
    /** 主题（经典模式特有）;MAXLENGTH(0) */
    public theme: PPTTheme;
    /** 画布宽（经典模式特有） */
    public width:number;
    /** 画布高（经典模式特有） */
    public height:number;
    /** 执行失败的信息;MAXLENGTH(0) */
    public errorInfo:string;
    /** 创建用户ID */
    public createUserId:string;
    /** 创建用户姓名;MAXLENGTH(64) */
    public createUserName:string;
    /** 项目封面图（S3url）;MAXLENGTH(0) */
    public cover:string;
    /** 宣讲稿，格式：[{"slideNo":1,"speechCraft":"..."},...];MAXLENGTH(0) */
    public speechDraft:string;
    /** 创建时间戳;NOTNULL */
    public createTime:string;
    /** 项目内容版本号;NOTNULL */
    public version:number;
    /** 项目来源类型：user_input-用户输入、user_upload-用户上传文件、bilibili-哔哩哔哩导入、link-输入在线地址;NOTNULL;MAXLENGTH(50) */
    public sourceType:string;
    /** 插入索引位置（0-based，仅用于经典模式插入单页） */
    public insertIndex:number;
    /** 哔哩哔哩Cookie（仅用于Bilibili模式） */
    public biliCookie:string;
    /** 生成的结果（传统模式专用）;MAXLENGTH(0) */
    public slides:string;
}


