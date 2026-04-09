/**
*
*  OrderPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const OrderPoRule: ValidRule[] = [
    { 
        field: 'id', 
        name: '主键', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'orderId', 
        name: '业务订单号', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'userId', 
        name: '下单用户ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'userName', 
        name: '下单用户名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'mobile', 
        name: '下单用户手机', 
        types: [ 
            [ValidType.MAXLENGTH, 20], 
        ] 
    }, 
    { 
        field: 'email', 
        name: '下单用户email', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'address', 
        name: '用户地址', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'planId', 
        name: '关联的套餐ID（引用ma_product_plan）', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'subscriptionId', 
        name: '关联的订阅ID（支付成功后回填）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'productCode', 
        name: '产品代码', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'planCode', 
        name: '套餐代码', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'planName', 
        name: '套餐名称（下单时的名称快照）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'locale', 
        name: '下单时的语言与地区（Locale）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'currencyCode', 
        name: '币种代码（USD/CNY/JPY）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 8], 
        ] 
    }, 
    { 
        field: 'payCycle', 
        name: '支付周期', 
        types: [ 
            [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'amount', 
        name: '购买数量', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'unitPrice', 
        name: '下单单价（分）', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'discountRate', 
        name: '折扣百分比（整数表示）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'discountAmount', 
        name: '优惠金额（分）', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'orderTotal', 
        name: '订单总额（分）', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'payTotal', 
        name: '实付金额（分）', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'planSnapshot', 
        name: '原始plan快照JSON', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'payType', 
        name: '支付通道类型', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'payStatus', 
        name: '订单支付状态', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'transactionId', 
        name: '第三方支付平台交易号', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'payTime', 
        name: '支付成功时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'notifyTime', 
        name: '支付回调通知时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'finishTime', 
        name: '订单完成时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'createTime', 
        name: '创建时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'updateTime', 
        name: '更新时间', 
        types: [ 
            
        ] 
    }, 
] 

