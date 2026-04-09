/**
*
*  FileInfoVo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class FileInfoVo extends PageBean {
    /** 文件名 */
    public fileName:string;
    /** 文件大小（字节） */
    public fileSize:number;
    /** 文件类型 */
    public fileType:string;
    /** 文件URL */
    public fileUrl:string;
    /** B站Cookie（包含SESSDATA、bili_jct等），仅用于bilibili链接解析 */
    public biliCookie:string;


    /** 项目ID，仅用于某些接口传递参数 */
    public projectId:string;
    /** 幻灯片编号，仅用于某些接口传递参数 */
    public slideId:string;
}


