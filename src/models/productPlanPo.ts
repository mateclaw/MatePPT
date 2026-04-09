/**
*
*  ProductPlanPo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class ProductPlanPo extends PageBean {
    /** 主键ID，自增;NOTNULL;PRIMARYKEY */
    public planId:number;
    /** 产品代码，如aippt/aidoc/aiaudio;NOTNULL;MAXLENGTH(32) */
    public productCode:string;
    /** 套餐代码，如free/plus/pro（与product_code、locale组合唯一）;NOTNULL;MAXLENGTH(32) */
    public planCode:string;
    /** 套餐名称（展示用）;NOTNULL;MAXLENGTH(64) */
    public planName:string;
    /** 套餐描述（展示用文案）;MAXLENGTH(256) */
    public planDesc:string;
    /** 语言与地区（Locale），如zh_CN/en_US/ja_JP;MAXLENGTH(16) */
    public locale:string;
    /** 币种代码，如USD/CNY/JPY;MAXLENGTH(8) */
    public currencyCode:string;
    /** 按月付价格（单位：分，整数；每月结算一次） */
    public priceMonthly:number;
    /** 按年付总价（单位：分，整数；一次性结算全年） */
    public priceYearly:number;
    /** 终身一次性买断价（单位：分，整数） */
    public priceLifetime:number;
    /** 折扣百分比（整数0-100；例如35表示35%OFF，仅用于展示或营销） */
    public discountRate:number;
    /** AI生成次数上限（按日）；NULL表示不限 */
    public aiGenerationLimit:number;
    /** AI图片额度上限（按月）；NULL表示不限 */
    public aiImageLimit:number;
    /** 最大幻灯片页数上限；NULL表示不限 */
    public maxSlidesLimit:number;
    /** 是否支持本地文件导入 */
    public importLocalFile:boolean;
    /** 是否支持通过URL导入 */
    public importFromUrl:boolean;
    /** 是否支持GoogleDrive导入 */
    public importGoogleDrive:boolean;
    /** 导出是否无水印（TRUE=无水印） */
    public watermarkFree:boolean;
    /** 是否允许导出PPTX */
    public exportPptx:boolean;
    /** 是否允许导出PDF */
    public exportPdf:boolean;
    /** 是否支持用户自定义模板 */
    public userDefineTemplate:boolean;
    /** 是否提供客服/优先支持 */
    public customerSupport:boolean;
    /** 是否启用该套餐（TRUE=上架） */
    public isActive:boolean;
    /** 创建时间 */
    public createTime:string;
    /** 更新时间 */
    public updateTime:string;
}

