/**
*
*  OutlineSlideVo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class OutlineSlideVo extends PageBean {
    /** 幻灯片序号 */
    public slideNo:number;
    /** 幻灯片标题 */
    public title:string;
    /** 幻灯片类型（cover、catalog、title、content、end） */
    public slideType:string;
    /** 内容要点列表 */
    public contentPoint:string[];
    /** 幻灯片描述 */
    public description:string;
}

