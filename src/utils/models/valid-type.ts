export enum ValidType { 
    REQUIRED,       // 必填
    REQUIREDSELECT, // 枚举类型的必填
    INT,    // 整数
    NUMBER, // 数字
    DATE,   // 日期，后端自动生成约束规则暂时不支持，建议日期数据库定义为字符串
    MOBILE, 
    NUMBERANDLETTER, 
    EMAIL, 
    MAXLENGTH, // 字符串类型，最大长度
    JSONTEXT,
    CUSTOM }
