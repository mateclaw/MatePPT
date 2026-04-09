import { PPTColorCalculator } from './PPTColorCalculator';
import {PPTColor, Transform} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * PPT 主题色变体生成器
 * - 负责生成 Office PowerPoint 颜色面板中，每个主题色下方的 5 个标准变体颜色。
 *
 * 使用方法：
 * - 当你在 Vue 或 React 中渲染颜色选择器时，你可以遍历 ThemeColors 的 10 个基础键名，对每个键名调用 getVariantColors。这样就能渲染出类似 Office 那样 10 列 x 6 行（1行基准 + 5行变体）的完美色板了
 */
export class ThemeColorVariants {

    /**
     * 获取指定主题色列下的 5 个扩展变体颜色对象
     * * @param scheme 主题色引用键值 (如 'accent1', 'lt1' 等)
     * @param schemeMap 当前主题的颜色映射表 { 'accent1': '#4472C4', ... }
     * @returns 5 个计算好 value 且带 transforms 轨迹的 PPTColor 对象
     */
    static getVariantColors(scheme: string, schemeMap: Record<string, string>): PPTColor[] {
        const baseHex = schemeMap[scheme];
        if (!baseHex) {
            return [];
        }

        // 获取 Office 标准的 5 行变换规则
        const matrix = this.getOfficeMatrix(scheme);

        // 依次计算每个变体
        return matrix.map(transforms => {
            // 使用计算器应用这些变换得到最终颜色值
            const calculatedHex = PPTColorCalculator.applyTransforms(baseHex, transforms);

            // 构建并返回完整的 PPTColor 对象
            return PPTColor.ofSchemeWithTransforms(scheme, calculatedHex, transforms);
        });
    }

    /**
     * 定义 PowerPoint 颜色面板纵向的 5 行变换矩阵
     * * 规则说明：
     * 1. Accent (强调色): 使用简单的 Tint/Shade 比例。
     * 2. Text/Background (文本/背景): 使用 LumMod/LumOff 组合，以适应明暗主题的自动切换。
     */
    private static getOfficeMatrix(scheme: string): Transform[][] {
        const matrix: Transform[][] = [];

        if (scheme.startsWith('accent')) {
            // --- 强调色 (Accent 1-6) 5 行标准配置 ---
            // 第一行：变亮 80% (保留 20% 原色亮度)
            matrix.push([new Transform('tint', 0.2)]);
            // 第二行：变亮 60%
            matrix.push([new Transform('tint', 0.4)]);
            // 第三行：变亮 40%
            matrix.push([new Transform('tint', 0.6)]);
            // 第四行：变暗 25% (保留 75% 亮度)
            matrix.push([new Transform('shade', 0.75)]);
            // 第五行：变暗 50%
            matrix.push([new Transform('shade', 0.5)]);
        } else {
            // --- 文本/背景色 (lt1, dk1, lt2, dk2) 5 行标准配置 ---
            // 第一行：极浅 (50%亮度倍率 + 50%亮度偏移)
            matrix.push([new Transform('lumMod', 0.5), new Transform('lumOff', 0.5)]);
            // 第二行：较浅 (65%亮度倍率 + 35%亮度偏移)
            matrix.push([new Transform('lumMod', 0.65), new Transform('lumOff', 0.35)]);
            // 第三行：中浅 (85%亮度倍率 + 15%亮度偏移)
            matrix.push([new Transform('lumMod', 0.85), new Transform('lumOff', 0.15)]);
            // 第四行：稍深 (75%亮度倍率)
            matrix.push([new Transform('lumMod', 0.75)]);
            // 第五行：极深 (50%亮度倍率)
            matrix.push([new Transform('lumMod', 0.5)]);
        }

        return matrix;
    }
}