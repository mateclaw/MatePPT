/**
*
*  PptVideoTaskPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';
import {PPTMaster} from "@/ppt/core";
import {SlideTagBo} from "@/models/slideTagBo";
import {SubtitlesBo} from "@/models/subtitlesBo";
import {PPTColor} from "@/ppt/core/entity/presentation/PPTColor";

export class PptVideoTaskPo extends PageBean {
    /** 任务编号（主键）;NOTNULL;PRIMARYKEY */
    public taskId:string;
    /** 渲染模式：0-普通视频1-PPT视频;NOTNULL */
    public renderMode:number;
    /** 形象ID（无数字人时可为空） */
    public avatarId:string;
    /** 形象名称（无数字人时可填固定值）;MAXLENGTH(32) */
    public avatarName:string;
    /** 数字人区域X（像素） */
    public avatarX:number;
    /** 数字人区域Y（像素） */
    public avatarY:number;
    /** 数字人区域高（像素） */
    public avatarHeight:number;
    /** 数字人区域宽（像素） */
    public avatarWidth:number;
    /** 音色ID;NOTNULL;MAXLENGTH(32) */
    public styleId:string;
    /** 音色名称;NOTNULL;MAXLENGTH(32) */
    public styleName:string;
    /** 合成语速（支持两位小数，如0.95）;NOTNULL */
    public speed:number;
    /** 字幕配置 */
    public subtitlesJson:SubtitlesBo;
    /** 标记配置 */
    public tagJson:SlideTagBo;
    /** 输出视频宽度 */
    public outWidth:number;
    /** 输出视频高度 */
    public outHeight:number;
    /** PPT标题;MAXLENGTH(64) */
    public pptTitle:string;
    /** PPT封面（图片地址或key）;MAXLENGTH(128) */
    public pptCover:string;
    /** PPT画布宽(px) */
    public pptWidth:number;
    /** PPT画布高(px) */
    public pptHeight:number;
    /** 所属项目业务ID；非从project创建则为NULL */
    public projectId:string;
    /** PPT模板母版（经典模式使用，JSONB格式） */
    public masters:PPTMaster[];
    /** 总页数;NOTNULL */
    public totalSlide:number;
    /** 当前处理到的页数（进度） */
    public currentSlide:number;
    /** 任务状态：0-初始状态，1-排队2-处理中3-完成4-失败5-取消;NOTNULL */
    public taskStatus:number;
    /** 失败原因;MAXLENGTH(0) */
    public errorMessage:string;
    /** 创建用户ID;NOTNULL */
    public createUserId:string;
    /** 创建用户姓名;MAXLENGTH(32) */
    public createUserName:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
    /** 开始处理时间 */
    public startTime:string;
    /** 结束时间 */
    public endTime:string;
    /** 背景颜色 */
    public background:PPTColor;
    /** 指定slide */
    public slideId:string;
}


