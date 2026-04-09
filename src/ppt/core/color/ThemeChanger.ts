import { PPTColorCalculator } from './PPTColorCalculator';
import {PPTColor, Transform} from "@/ppt/core/entity/presentation/PPTColor";

/**
 * PPT 主题切换器
 * 负责遍历整个文档对象模型，识别所有主题色引用并进行重算。
 *
 * 关键实现细节说明：
 * - 原地修改 (In-place Update)： 由于 JavaScript 对象是引用传递，ThemeChanger 直接在原 JSON 树上修改 value 属性。这在前端 React/Vue 状态管理中，通常意味着你需要先对文档进行一次深拷贝（如 JSON.parse(JSON.stringify(doc))）后再调用此方法，以触发 UI 的响应式更新。
 * - 属性过滤： 在遍历过程中，过滤了 id, width, height 等字段。在一个有数千个形状的 PPT 中，这些字段的数量非常庞大，跳过它们能显著减少递归开销。
 * - HTML 样式处理： cleanHtmlStyles 用于处理那些存放在 ShapeText 或 TableCell 里的 HTML 字符串。如果切换主题后文字颜色没变，通常是因为 HTML 内部标签带了 inline style，调用这个方法可以将其“重置”。
 */
/**
 * 解决 HTML 往返丢失的问题，需要在 HTML 中用 data-* 属性保存 scheme 和 transforms，比如：
 *   <span style="color: #A2C4E0;" data-scheme="accent1" data-transforms="tint:0.6">文本</span>
 * 后端 -> 前端：后端解析 PPTX 时，把 DrawingML 的属性映射到 data-*。
 * 前端编辑：用户点击加粗或改色，前端编辑器通过读取 data-* 知道该文本原本属于哪个主题色。
 * 前端 -> 后端：保存时，后端解析 HTML 标签，优先读取 data-* 属性写回 PPTX 的 XML。
 * 前后端解耦： 如果用户在前端手动选了一个固定色（非主题色），你只需要删掉 data-scheme，后端就知道这不再是一个主题引用，而是一个硬编码的颜色。
 * */
export class ThemeChanger {

    /**
     * 切换文档主题
     * @param docJson PPT 文档的根对象（JSON 树）
     * @param newThemeMap 新主题的颜色映射 (e.g., { 'accent1': '#FF0000', ... })
     * @returns 修改后的原对象
     */
    static changeTheme(docJson: any, newThemeMap: Record<string, string>): any {
        if (!docJson || !newThemeMap) {
            console.warn('Document or theme map is missing.');
            return docJson;
        }

        // 1. 切换前清空计算器缓存，确保旧主题的计算结果不会干扰新主题
        PPTColorCalculator.clearCache();

        // 2. 开始深度遍历重算
        this.traverse(docJson, newThemeMap);

        return docJson;
    }
    /**
     * 深度优先遍历对象树
     */
    private static traverse(obj: any, schemeMap: Record<string, string>): void {
        if (!obj || typeof obj !== 'object') return;

        // 1. 处理数组
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                this.traverse(obj[i], schemeMap);
            }
            return;
        }

        // 2. 核心逻辑：识别并重算 PPTColor 对象 (形状背景、边框、阴影等)
        if (obj.scheme !== undefined && obj.value !== undefined) {// 精确匹配 PPTColor 的结构（scheme + value 是 PPTColor 的特征字段）
            const pptColor = obj as PPTColor;
            const isTheme = typeof pptColor.isThemeColor === 'function'
                ? pptColor.isThemeColor()
                : (pptColor.scheme !== null && pptColor.scheme !== '');

            if (isTheme) {
                const newValue = PPTColorCalculator.recalculate(pptColor, schemeMap);
                if (newValue) {
                    obj.value = newValue;
                }
            }
            return;
        }

        // 3. 递归处理对象属性 + HTML 富文本拦截
        for (const key in obj) {
            // 性能优化：跳过基础字段
            if (['id', 'type', 'version', 'name', 'width', 'height', 'left', 'top'].includes(key)) {
                continue;
            }

            const value = obj[key];
            if (!value) continue;

            // --- 新增：富文本处理逻辑 ---
            // 如果字段是 content 且是字符串，说明是 HTML 富文本
            if (key === 'content' && typeof value === 'string') {
                if (value.includes('data-scheme')) {
                    obj[key] = this.updateHtmlTheme(value, schemeMap);
                }
                continue; // 处理完字符串后不需要再递归进去
            }

            // 递归处理子对象
            if (typeof value === 'object') {
                this.traverse(value, schemeMap);
            }
        }
    }

    /**
     * 辅助方法：清理 HTML 富文本中的样式
     * 在前端切换主题时，如果 HTML 字符串里写死了旧的颜色，需要清理掉让父级主题色生效
     */
    static cleanHtmlStyles(htmlContent: string): string {
        if (!htmlContent) return htmlContent;
        return htmlContent
            // .replace(/(?i)color\s*:\s*[^;]+;?/g, '')
            // .replace(/(?i)font-family\s*:\s*[^;]+;?/g, '')
            .replace(/color\s*:\s*[^;]+;?/gi, '')
            .replace(/font-family\s*:\s*[^;]+;?/gi, '')
            .replace(/\s*data-scheme="[^"]*"/g, '') // data-* 也需要清掉?
            .replace(/\s*data-transforms="[^"]*"/g, '');
    }

    /**
     * 新增：专门处理 HTML 内部的主题色更新
     */
    static updateHtmlTheme(html: string, schemeMap: Record<string, string>): string {
        if (!html || !html.includes('data-scheme')) return html;

        // 在浏览器环境下利用 DOMParser 解析 HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 寻找所有带有主题标记的标签
        const colorElements = doc.querySelectorAll('[data-scheme]');

        colorElements.forEach(el => {
            const scheme = el.getAttribute('data-scheme');
            const transformsStr = el.getAttribute('data-transforms'); // 格式: "tint:0.6|satMod:0.5"

            if (scheme && schemeMap[scheme]) {
                const baseHex = schemeMap[scheme];
                let transforms: Transform[] = [];

                if (transformsStr) {
                    // 后端序列化用的是分号 ; 保持一致
                    transforms = transformsStr.split(';').map(str => {
                        const [type, val] = str.split(':');
                        return new Transform(type as any, parseFloat(val));
                    });
                }

                // 计算新颜色并回写到 style
                const newHex = PPTColorCalculator.applyTransforms(baseHex, transforms);
                (el as HTMLElement).style.color = newHex;
            }
        });

        return doc.body.innerHTML;
    }
}