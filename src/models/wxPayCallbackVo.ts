/**
*
*  WxPayCallbackVo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class WxPayCallbackVo extends PageBean {
    /** 证书序号 */
    public certSerialNumber:string;
    /** 签名 */
    public signature:string;
    /** 时间戳 */
    public timestamp:string;
    /** nonce */
    public nonce:string;
    /** 消息体 */
    public requestBody:string;
}

