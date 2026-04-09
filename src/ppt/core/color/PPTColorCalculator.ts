import {PPTColor, Transform} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * PPT 颜色计算器 (TypeScript 版)
 * * 核心特性：
 * 1. 严格遵循 Office DrawingML (ISO/IEC 29500-1) 算法。
 * 2. 包含 HSL/RGB 转换引擎。
 * 3. 内置 Memoization 缓存机制，优化大规模文档切换主题时的性能。
 *
 * 使用方法：
 * - 在前端 React/Vue 框架中，如果你有一个大型 JSON，只需在“切换主题”按钮的 onClick 事件中调用 PPTColorCalculator.clearCache()，然后执行递归更新即可。
 */
export class PPTColorCalculator {
    // 缓存池：避免在大文档中重复进行相同的 HSL 数学运算
    private static cache: Map<string, string> = new Map();

    /**
     * 清空缓存
     * 在全局切换主题色之前调用，确保计算基于最新的基色
     */
    static clearCache(): void {
        this.cache.clear();
    }

    /**
     * 基于新主题色重新计算 PPTColor 的渲染值
     * * @param pptColor 颜色对象 (包含 scheme 和 transforms)
     * @param schemeMap 主题色映射表 { accent1: '#4472C4', ... }
     * @returns 计算后的 Hex 字符串
     */
    static recalculate(pptColor: PPTColor, schemeMap: Record<string, string>): string | undefined {
        if (!pptColor.scheme || !schemeMap[pptColor.scheme]) {
            return pptColor.value;
        }

        const baseHex = schemeMap[pptColor.scheme];

        // 如果没有任何变换，直接返回基色
        if (!pptColor.transforms || pptColor.transforms.length === 0) {
            return baseHex;
        }

        // 生成唯一的缓存 Key
        const transformKey = pptColor.transforms
            .map(t => `${t.type}:${t.value}`)
            .join('|');
        const cacheKey = `${pptColor.scheme}_${transformKey}`;

        // 命中缓存
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // 执行计算
        const result = this.applyTransforms(baseHex, pptColor.transforms);

        // 存入缓存
        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * 应用 DrawingML 颜色变换列表
     * 算法说明：Office 的变换是在 HSL 线性空间内依次叠加计算的
     */
    static applyTransforms(baseHex: string, transforms: Transform[]): string {
        // 1. 解析颜色并转为 HSL
        let { r, g, b, a } = this.parseHex(baseHex);
        let [h, s, l] = this.rgbToHsl(r, g, b);

        // 2. 依次应用变换 (Order Matters!)
        for (const t of transforms) {
            const val = t.value;
            switch (t.type) {
                case 'shade':
                    // L = L * val
                    l *= val;
                    break;
                case 'tint':
                    // L = L * val + (1 - val)
                    l = l * val + (1.0 - val);
                    break;
                case 'lumMod':
                    l *= val;
                    break;
                case 'lumOff':
                    l += val;
                    break;
                case 'satMod':
                    s *= val;
                    break;
                case 'hueMod':
                    h = (h * val) % 1.0;
                    break;
                case 'alpha':
                    a = Math.round(val * 255);
                    break;
            }
        }

        // 3. 边界处理与转回 RGB
        l = Math.max(0, Math.min(1, l));
        s = Math.max(0, Math.min(1, s));
        const [finalR, finalG, finalB] = this.hslToRgb(h, s, l);

        return this.toHex(finalR, finalG, finalB, a);
    }

    // ==================== 内部数学引擎 ====================

    private static parseHex(hex: string): { r: number, g: number, b: number, a: number } {
        let cleaned = hex.replace('#', '');
        if (cleaned.length === 3) {
            cleaned = cleaned.split('').map(c => c + c).join('');
        }

        const r = parseInt(cleaned.substring(0, 2), 16) || 0;
        const g = parseInt(cleaned.substring(2, 4), 16) || 0;
        const b = parseInt(cleaned.substring(4, 6), 16) || 0;
        const a = cleaned.length === 8 ? parseInt(cleaned.substring(6, 8), 16) : 255;

        return { r, g, b, a };
    }

    private static toHex(r: number, g: number, b: number, a: number): string {
        const toHexStr = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
        const alpha = a < 255 ? toHexStr(a) : '';
        return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(b)}${alpha}`;
    }

    private static rgbToHsl(r: number, g: number, b: number): [number, number, number] {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h /= 6;
        }
        return [h, s, l];
    }

    private static hslToRgb(h: number, s: number, l: number): [number, number, number] {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const hue2rgb = (t: number) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            r = hue2rgb(h + 1/3);
            g = hue2rgb(h);
            b = hue2rgb(h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
}