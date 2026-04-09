/**
*
*  FeedbackPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class FeedbackPo extends PageBean {
    /** 主键，反馈编号;PRIMARYKEY */
    public feedbackId:string;
    /** 用户ID;NOTNULL */
    public userId:string;
    /** 用户名称;NOTNULL;MAXLENGTH(64) */
    public userName:string;
    /** 反馈类型：BugReport=问题报告，Business=商务联系;NOTNULL;MAXLENGTH(32) */
    public category:string;
    /** 反馈正文内容;NOTNULL;MAXLENGTH(0) */
    public content:string;
    /** 联系方式（手机、邮箱等）;NOTNULL;MAXLENGTH(64) */
    public contact:string;
    /** 处理状态：open=待处理，replied=已回复，resolved=已解决，closed=已关闭;NOTNULL;MAXLENGTH(16) */
    public status:string;
    /** 创建时间（反馈提交时间）;NOTNULL */
    public createdAt:string;
    /** 首次客服回复时间（可为空） */
    public replyAt:string;
}


