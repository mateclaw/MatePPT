/**
*
*  SubscriptionPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const SubscriptionPoRule: ValidRule[] = [
    { 
        field: 'id', 
        name: '', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'userId', 
        name: '用户ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'planId', 
        name: '引用ma_product_plan.plan_id的套餐', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'orderId', 
        name: '首次付费对应的订单号（可空）', 
        types: [ 
            [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'locale', 
        name: '语言与地区（Locale）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'currencyCode', 
        name: '币种代码', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 8], 
        ] 
    }, 
    { 
        field: 'payCycle', 
        name: '支付周期', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'startTime', 
        name: '订阅开始时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'endTime', 
        name: '订阅到期时间（lifetime为NULL）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'autoRenew', 
        name: '是否开启自动续费', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'status', 
        name: '订阅状态', 
        types: [ 
            [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'planSnapshot', 
        name: '开通时的套餐快照JSONB（多币种多语言价格与能力）', 
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

