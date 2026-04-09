/**
 * PPT 颜色对象 - 支持固定色和主题色
 *
 * 设计说明：
 * - value（rrggbb或rrggbbaa）: 计算后的颜色值，用于渲染和向后兼容
 * - scheme: 主题色引用，null 表示固定颜色，直接取value
 * - transforms: 颜色修饰符列表，按应用顺序排列；当scheme不为空，需要根据scheme颜色和transforms计算出新的value
 */
export class PPTColor {
    /**
     * 计算后的颜色值（#RRGGBB 或 #RRGGBBAA）
     * 用于渲染和向后兼容
     */
    value?: string;

    /**
     * 主题色引用，undefined 表示固定颜色
     * 可选值：dk1, lt1, dk2, lt2, accent1-6, hlink, folHlink
     */
    scheme?: string;

    /**
     * 颜色修饰符列表，按应用顺序排列
     */
    transforms?: Transform[];

    /**
     * 判断是否是主题色
     */
    isThemeColor(): boolean {
        return this.scheme != null && this.scheme.length > 0;
    }

    /**
     * 判断是否有修饰符
     */
    hasTransforms(): boolean {
        return this.transforms != null && this.transforms.length > 0;
    }

    /**
     * 创建固定色
     *
     * @param value 颜色值（#RRGGBB 或 #RRGGBBAA）
     */
    static ofFixed(value: string): PPTColor {
        const color = new PPTColor();
        color.value = value;
        return color;
    }

    /**
     * 创建主题色（无修饰符）
     *
     * @param scheme 主题色引用（如 accent1, dk1）
     * @param calculatedValue 计算后的颜色值
     */
    static ofScheme(scheme: string, calculatedValue: string): PPTColor {
        const color = new PPTColor();
        color.scheme = scheme;
        color.value = calculatedValue;
        return color;
    }

    /**
     * 创建主题色（带修饰符）
     *
     * @param scheme 主题色引用
     * @param calculatedValue 计算后的颜色值
     * @param transforms 修饰符列表
     */
    static ofSchemeWithTransforms(scheme: string, calculatedValue: string, transforms: Transform[]): PPTColor {
        const color = new PPTColor();
        color.scheme = scheme;
        color.value = calculatedValue;
        color.transforms = transforms;
        return color;
    }
}

/**
 * 颜色修饰符类型
 */
export type TransformType =
    | 'lumMod'    // 亮度倍数 (0-1)
    | 'lumOff'    // 亮度偏移 (-1 到 1)
    | 'shade'     // 加深 (0-1)
    | 'tint'      // 加白 (0-1)
    | 'satMod'    // 饱和度倍数
    | 'hueMod'    // 色相倍数
    | 'alpha';    // 透明度 (0-1)

/**
 * 颜色修饰符
 */
export class Transform {
    /**
     * 修饰符类型
     */
    type: TransformType;

    /**
     * 修饰符值
     */
    value: number;

    constructor(type?: TransformType, value?: number) {
        this.type = type || 'alpha';
        this.value = value || 0;
    }
}

// ============ 便捷方法（模块级导出） ============

/**
 * 创建固定色（替代静态方法的函数式版本）
 *
 * @param value 颜色值（#RRGGBB 或 #RRGGBBAA）
 */
export function createFixedColor(value: string): PPTColor {
    return PPTColor.ofFixed(value);
}

/**
 * 创建主题色（无修饰符）（替代静态方法的函数式版本）
 *
 * @param scheme 主题色引用（如 accent1, dk1）
 * @param calculatedValue 计算后的颜色值
 */
export function createThemeColor(scheme: string, calculatedValue: string): PPTColor {
    return PPTColor.ofScheme(scheme, calculatedValue);
}

/**
 * 创建主题色（带修饰符）（替代静态方法的函数式版本）
 *
 * @param scheme 主题色引用
 * @param calculatedValue 计算后的颜色值
 * @param transforms 修饰符列表
 */
export function createThemeColorWithTransforms(
    scheme: string,
    calculatedValue: string,
    transforms: Transform[]
): PPTColor {
    return PPTColor.ofSchemeWithTransforms(scheme, calculatedValue, transforms);
}

/**
 * 判断是否是主题色（函数式版本）
 */
export function isThemeColor(color: PPTColor): boolean {
    return color.isThemeColor();
}

/**
 * 判断是否有修饰符（函数式版本）
 */
export function hasTransforms(color: PPTColor): boolean {
    return color.hasTransforms();
}
