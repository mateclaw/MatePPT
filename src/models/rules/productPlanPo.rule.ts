/**
*
*  ProductPlanPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const ProductPlanPoRule: ValidRule[] = [
    { 
        field: 'planId', 
        name: '主键ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
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
        name: '套餐名称（展示用）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'planDesc', 
        name: '套餐描述（展示用文案）', 
        types: [ 
            [ValidType.MAXLENGTH, 256], 
        ] 
    }, 
    { 
        field: 'locale', 
        name: '语言与地区（Locale）', 
        types: [ 
            [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'currencyCode', 
        name: '币种代码', 
        types: [ 
            [ValidType.MAXLENGTH, 8], 
        ] 
    }, 
    { 
        field: 'priceMonthly', 
        name: '按月付价格（单位', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'priceYearly', 
        name: '按年付总价（单位', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'priceLifetime', 
        name: '终身一次性买断价（单位', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'discountRate', 
        name: '折扣百分比（整数0-100', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'aiGenerationLimit', 
        name: 'AI生成次数上限（按日）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'aiImageLimit', 
        name: 'AI图片额度上限（按月）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'maxSlidesLimit', 
        name: '最大幻灯片页数上限', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'importLocalFile', 
        name: '是否支持本地文件导入', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'importFromUrl', 
        name: '是否支持通过URL导入', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'importGoogleDrive', 
        name: '是否支持GoogleDrive导入', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'watermarkFree', 
        name: '导出是否无水印（TRUE=无水印）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'exportPptx', 
        name: '是否允许导出PPTX', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'exportPdf', 
        name: '是否允许导出PDF', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'userDefineTemplate', 
        name: '是否支持用户自定义模板', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'customerSupport', 
        name: '是否提供客服/优先支持', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'isActive', 
        name: '是否启用该套餐（TRUE=上架）', 
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
