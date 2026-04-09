/**
*
*  OrderPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class OrderPo extends PageBean {
    /** 主键;NOTNULL;PRIMARYKEY */
    public id:string;
    /** 业务订单号，全局唯一;NOTNULL;MAXLENGTH(32) */
    public orderId:string;
    /** 下单用户ID;NOTNULL */
    public userId:string;
    /** 下单用户名称;NOTNULL;MAXLENGTH(32) */
    public userName:string;
    /** 下单用户手机;MAXLENGTH(20) */
    public mobile:string;
    /** 下单用户email;MAXLENGTH(128) */
    public email:string;
    /** 用户地址;MAXLENGTH(128) */
    public address:string;
    /** 关联的套餐ID（引用ma_product_plan）;NOTNULL */
    public planId:number;
    /** 关联的订阅ID（支付成功后回填） */
    public subscriptionId:number;
    /** 产品代码，如aippt/aidoc/aiaudio;NOTNULL;MAXLENGTH(32) */
    public productCode:string;
    /** 套餐代码，如free/plus/pro;NOTNULL;MAXLENGTH(32) */
    public planCode:string;
    /** 套餐名称（下单时的名称快照）;NOTNULL;MAXLENGTH(64) */
    public planName:string;
    /** 下单时的语言与地区（Locale）;NOTNULL;MAXLENGTH(16) */
    public locale:string;
    /** 币种代码（USD/CNY/JPY）;NOTNULL;MAXLENGTH(8) */
    public currencyCode:string;
    /** 支付周期：年/月/终身;MAXLENGTH(16) */
    public payCycle:string;
    /** 购买数量;NOTNULL */
    public amount:number;
    /** 下单单价（分）;NOTNULL */
    public unitPrice:number;
    /** 折扣百分比（整数表示） */
    public discountRate:number;
    /** 优惠金额（分）;NOTNULL */
    public discountAmount:number;
    /** 订单总额（分）;NOTNULL */
    public orderTotal:number;
    /** 实付金额（分）;NOTNULL */
    public payTotal:number;
    /** 原始plan快照JSON，完整保留所有套餐信息用于审计;MAXLENGTH(0) */
    public planSnapshot:string;
    /** 支付通道类型：WechatPay、AliPay、UnionPay、Stripe、PayPal;NOTNULL */
    public payType:string;
    /** 订单支付状态：0待付/2成功/3结束不可退/5失败/6支付中/7撤销/8退款;NOTNULL */
    public payStatus:number;
    /** 第三方支付平台交易号;MAXLENGTH(64) */
    public transactionId:string;
    /** 支付成功时间 */
    public payTime:string;
    /** 支付回调通知时间 */
    public notifyTime:string;
    /** 订单完成时间 */
    public finishTime:string;
    /** 创建时间 */
    public createTime:string;
    /** 更新时间 */
    public updateTime:string;
}


