/**
*
*  AiImageGenerateVo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class AiImageGenerateVo extends PageBean {
    /** 项目ID */
    public projectId:string;
    /** 幻灯片ID */
    public slideId:string;
    /** 元素ID */
    public elementId:string;
    /** 模型名称（非必须，如：即梦4.0、即梦3.1，不传默认使用即梦4.0） */
    public modelName:string;
    /** 文生图提示词 */
    public prompt:string;
}


