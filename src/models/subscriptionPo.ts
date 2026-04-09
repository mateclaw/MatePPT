/**
*
*  SubscriptionPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class SubscriptionPo extends PageBean {
    /** ;NOTNULL;PRIMARYKEY */
    public id:number;
    /** 用户ID;NOTNULL */
    public userId:string;
    /** 引用ma_product_plan.plan_id的套餐;NOTNULL */
    public planId:number;
    /** 首次付费对应的订单号（可空）;MAXLENGTH(32) */
    public orderId:string;
    /** 语言与地区（Locale），如zh_CN/en_US/ja_JP;NOTNULL;MAXLENGTH(16) */
    public locale:string;
    /** 币种代码，如USD/CNY/JPY;NOTNULL;MAXLENGTH(8) */
    public currencyCode:string;
    /** 支付周期：monthly/yearly/lifetime;NOTNULL;MAXLENGTH(16) */
    public payCycle:string;
    /** 订阅开始时间;NOTNULL */
    public startTime:string;
    /** 订阅到期时间（lifetime为NULL） */
    public endTime:string;
    /** 是否开启自动续费 */
    public autoRenew:boolean;
    /** 订阅状态：active/expired/cancelled/pending;MAXLENGTH(16) */
    public status:string;
    /** 开通时的套餐快照JSONB（多币种多语言价格与能力）;MAXLENGTH(0) */
    public planSnapshot:string;
    /** 创建时间 */
    public createTime:string;
    /** 更新时间 */
    public updateTime:string;
}


