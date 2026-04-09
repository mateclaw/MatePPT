/**
*
*  ExportTaskPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class ExportTaskPo extends PageBean {
    /** 任务ID（对外返回给前端的标识）;PRIMARYKEY  */
    public taskId:string;
    /** 项目标识（业务ID）;NOTNULL;MAXLENGTH(64) */
    public projectId:string;
    /** 创建任务时的项目版本;NOTNULL */
    public projectVersion:number;
    /** 导出格式：pptx/pdf/html;NOTNULL;MAXLENGTH(16) */
    public exportFormat:string;
    /** 任务状态：0处理中/1成功/2失败;NOTNULL */
    public status:number;
    /** 错误信息（失败时记录）;MAXLENGTH(0) */
    public errorMsg:string;
    /** 生成的文件名（不含路径）;MAXLENGTH(255) */
    public fileName:string;
    /** S3上的文件路径（不含域名）;MAXLENGTH(512) */
    public fileUrl:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
    /** 更新时间;NOTNULL */
    public updateTime:string;
    /** 下载链接（完整可访问URL，仅返回给前端使用） */
    public downloadUrl:string;
    /** 状态描述（处理中/成功/失败原因，仅作为返回展示用） */
    public taskStatusDesc:string;
}


