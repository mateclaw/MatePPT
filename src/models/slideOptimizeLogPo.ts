/**
*
*  SlideOptimizeLogPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class SlideOptimizeLogPo extends PageBean {
    /** 主键，自增;NOTNULL;PRIMARYKEY */
    public id:string;
    /** 大语言模型名称;NOTNULL;MAXLENGTH(32) */
    public modelName:string;
    /** 提问内容;NOTNULL;MAXLENGTH(0) */
    public question:string;
    /** 回答内容;NOTNULL;MAXLENGTH(0) */
    public answer:string;
    /** 问题的tokens;NOTNULL */
    public tokensizeq:number;
    /** 回答的tokens;NOTNULL */
    public tokensizea:number;
    /** PPTprojectId;NOTNULL */
    public projectId:string;
    /** PPTslideId;NOTNULL */
    public slideId:string;
    /** 用户ID;NOTNULL */
    public userId:string;
    /** 用户姓名;MAXLENGTH(32) */
    public userName:string;
    /** 创建时间;NOTNULL */
    public createTime:string;
}



