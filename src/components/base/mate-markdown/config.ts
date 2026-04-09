
import Cherry from "cherry-markdown/dist/cherry-markdown.core";
import { CherryEngineOptions, CherryToolbarsOptions, CherryEditorOptions, CherryPreviewerOptions, CherryOptions, CustomSyntaxRegConfig } from "cherry-markdown/types/cherry";
import { before } from "lodash";
export enum EditorMode {
    editOnly = 'editOnly', // 纯编辑模式
    editAndPreview = 'edit&preview', // 双栏编辑预览模式
    previewOnly = 'previewOnly', // 预览模式
}


/**
 * @param {string} hookName 语法名
 * @param {string} type 语法类型，行内语法为Cherry.constants.HOOKS_TYPE_LIST.SEN，段落语法为Cherry.constants.HOOKS_TYPE_LIST.PAR
 * @param {object} options 自定义语法的主体逻辑
 */
// Cherry.createSyntaxHook(hookName, type, options)
/**
 * 自定义一个语法，识别形如 ***ABC*** 的内容，并将其替换成 <span style="color: red"><strong>ABC</strong></span>
 */
// var thinkBlockHook = Cherry.createSyntaxHook('thinkBlock', Cherry.constants.HOOKS_TYPE_LIST.PAR, {
//     needCache: true, // 表明要使用缓存，也是实现排他的必要操作
//     makeHtml(str, sentenceMakeFunc) {
//         const that = this;


//         const TAG_REGEX = /<think>|<\/think>/g;

//         // 自动补全闭合标签
//         if (str.indexOf('<think>') !== -1 && str.indexOf('</think>') === -1) {
//           str += '</think>';
//         }

//         return str.replace(this.RULE.reg, function(whole, m1) {

//             // const sign = that.$engine.md5(whole); // 定义sign，用来实现局部渲染
//             const lines = that.getLineCount(whole); // 定义行号，用来实现联动滚动
//             const { sign, html } = sentenceMakeFunc(m1); // 解析行内语法

//             const result =`
//             <div data-sign="${sign}" data-lines="${lines}">

//             <div class="think-button down">已深度思考 <span class="anticon"><svg viewBox="64 64 896 896" focusable="false" data-icon="up" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M890.5 755.3L537.9 269.2c-12.8-17.6-39-17.6-51.7 0L133.5 755.3A8 8 0 00140 768h75c5.1 0 9.9-2.5 12.9-6.6L512 369.8l284.1 391.6c3 4.1 7.8 6.6 12.9 6.6h75c6.5 0 10.3-7.4 6.5-12.7z"></path></svg></span></div>
//             <div class="think-block"  >
//               <div class="think-divider"></div>
//               <div class="think-content">${html}</div>
//             </div>
//             </div>
//             `
//             // const result = `\n<div data-sign="${sign}" data-lines="${lines}" style="border: 1px solid;border-radius: 15px;background: gold;">${html}</div>\n`;
//             return that.pushCache(result, sign, lines); // 将结果转成占位符
//         });
//     },
//     rule(str) {
//         return { 
//             reg: /<think>\n([\s\S]+?\n)<\/think>/g,
//          };
//     },
// });

const getThinkBlockHook = (thinkLabel?: string[]) => {
    return Cherry.createSyntaxHook('thinkBlock',
        Cherry.constants.HOOKS_TYPE_LIST.PAR, {
        needCache: true,

        makeHtml(str, sentenceMakeFunc) {
            const that = this;
            const TAG_REGEX = /<think>|<\/think>/gi;

            // 自动补全闭合标签
            const openTagCount = (str.match(/<think>/g) || []).length;
            const closeTagCount = (str.match(/<\/think>/g) || []).length;
            if (openTagCount > closeTagCount) {
                str += '</think>';
            }

            const trueThinkLabel = thinkLabel || ['已深度思考', '已深度思考'];

            return str.replace(this.RULE.reg, (whole, m1) => {
                const lines = that.getLineCount(whole); // 定义行号，用来实现联动滚动
                // const innerHtml = that.$engine.makeHtml(m1);
                // const sign = that.$engine.md5(whole);
                const { sign, html } = sentenceMakeFunc(m1); // 解析行内语法
                
                return that.pushCache(`
          <aside class="think-container" data-sign="${sign}" data-lines="${lines}" >
             <div class="think-button "><span class="think-button-label think-button-label-down">${trueThinkLabel[0]}</span><span class="think-button-label think-button-label-up">${trueThinkLabel[1]}</span> <span class="anticon"><svg viewBox="64 64 896 896" focusable="false" data-icon="up" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M890.5 755.3L537.9 269.2c-12.8-17.6-39-17.6-51.7 0L133.5 755.3A8 8 0 00140 768h75c5.1 0 9.9-2.5 12.9-6.6L512 369.8l284.1 391.6c3 4.1 7.8 6.6 12.9 6.6h75c6.5 0 10.3-7.4 6.5-12.7z"></path></svg></span></div>
             <div class="think-block"  >
               <div class="think-divider"></div>
               <div class="think-content">${html}</div>
             </div>
          </aside>
        `, sign, lines);
            });
        },

        rule() {
            return {
                reg: /<think>([\s\S]*?)<\/think>/g,
            };
        }
    })
}
const reasoningHook = Cherry.createSyntaxHook('reasoning',
    Cherry.constants.HOOKS_TYPE_LIST.PAR, {
    needCache: true,

    makeHtml(str, sentenceMakeFunc) {
        const that = this;
        const TAG_REGEX = /<reasoning>|<\/reasoning>/gi;

        // 自动补全闭合标签
        const openTagCount = (str.match(/<reasoning>/g) || []).length;
        const closeTagCount = (str.match(/<\/reasoning>/g) || []).length;
        if (openTagCount > closeTagCount) {
            str += '</reasoning>';
        }

        return str.replace(this.RULE.reg, (whole, m1) => {
            const lines = that.getLineCount(whole); // 定义行号，用来实现联动滚动
            const { sign, html } = sentenceMakeFunc(m1); // 解析行内语法

            // const innerHtml = that.$engine.makeHtml(m1);
            // const sign = that.$engine.md5(whole);

            return that.pushCache(`
          <aside class="reasoning-container" data-sign="${sign}" data-lines="${lines}">
             <div class="reasoning-title ">
             <div class="reasoning-title-left">
             <span class="anticon"><svg t="1756578826351" class="icon" viewBox="0 0 1025 1024" version="1.1"
    xmlns="http://www.w3.org/2000/svg" p-id="6513"
    xmlns:xlink="http://www.w3.org/1999/xlink" width="14" height="14">
    <path d="M187.732004 156.526779c-13.330296-13.331627-34.948251-13.331627-48.263899 0-13.335622 13.326301-13.335622 34.937598 0 48.274552l48.263899 48.263899c13.331627 13.331627 34.933604 13.331627 48.269226 0 13.326301-13.326301 13.326301-34.932272 0-48.263899L187.732004 156.526779 187.732004 156.526779 187.732004 156.526779zM836.261339 156.526779l-48.269226 48.274552c-13.326301 13.331627-13.326301 34.937598 0 48.263899 13.315648 13.331627 34.932272 13.331627 48.269226 0l48.258573-48.263899c13.336953-13.336953 13.336953-34.942925 0-48.274552C871.194942 143.200478 849.592966 143.200478 836.261339 156.526779L836.261339 156.526779 836.261339 156.526779zM102.402665 426.66267 34.139994 426.66267C15.28903 426.66267 0.002666 441.945039 0.002666 460.789345c0 18.854958 15.28237 34.137328 34.137328 34.137328l68.262672 0c18.850963 0 34.132002-15.28237 34.132002-34.137328C136.534667 441.945039 121.253629 426.66267 102.402665 426.66267L102.402665 426.66267 102.402665 426.66267zM989.85468 426.66267l-68.264003 0c-18.849632 0-34.137328 15.28237-34.137328 34.126675 0 18.854958 15.286364 34.137328 34.137328 34.137328l68.264003 0c18.849632 0 34.142654-15.28237 34.142654-34.137328C1023.997334 441.945039 1008.704312 426.66267 989.85468 426.66267L989.85468 426.66267 989.85468 426.66267zM477.862672 34.132002l0 68.264003c0 18.854958 15.28237 34.13067 34.132002 34.13067 18.844306 0 34.137328-15.275712 34.137328-34.13067L546.132002 34.132002C546.132002 15.28237 530.838979 0 511.994674 0 493.145042 0 477.862672 15.28237 477.862672 34.132002L477.862672 34.132002 477.862672 34.132002zM273.066668 511.992008c0-131.955413 106.967267-238.928006 238.928006-238.928006 131.960739 0 238.933332 106.972593 238.933332 238.928006 0 131.960739-106.972593 238.937327-238.933332 238.937327C380.033935 750.929335 273.066668 643.951415 273.066668 511.992008L273.066668 511.992008 273.066668 511.992008zM204.803996 511.992008c0 169.675982 137.525348 307.211982 307.190677 307.211982S819.190677 681.667989 819.190677 511.992008c0-169.665329-137.530675-307.190677-307.196004-307.190677S204.803996 342.326679 204.803996 511.992008L204.803996 511.992008 204.803996 511.992008zM443.730671 989.862667c0 18.838979 15.28237 34.137328 34.132002 34.137328l68.269329 0c18.849632 0 34.132002-15.297017 34.132002-34.137328 0-18.860284-15.28237-34.132002-34.132002-34.132002l-68.269329 0C459.01304 955.730665 443.730671 971.002382 443.730671 989.862667L443.730671 989.862667 443.730671 989.862667zM375.467999 887.466662c0 18.834985 15.281038 34.132002 34.126675 34.132002l204.799999 0c18.849632 0 34.132002-15.297017 34.132002-34.132002 0-18.865611-15.28237-34.142654-34.132002-34.142654L409.594674 853.324008C390.743711 853.325339 375.467999 868.601051 375.467999 887.466662L375.467999 887.466662 375.467999 887.466662zM375.467999 887.466662" fill="currentColor" p-id="6514"></path>
</svg></span>思考过程
                </div>
              </div>
             <div class="reasoning-content"  >
             
               ${html}
             </div>
          </aside>
        `, sign, lines);
        });
    },

    rule() {
        return {
            reg: /<reasoning>([\s\S]*?)<\/reasoning>/g,
        };
    }
});
const highlightDetailHook = Cherry.createSyntaxHook('highlight-detail',
    Cherry.constants.HOOKS_TYPE_LIST.PAR, {
    needCache: true,

    makeHtml(str, sentenceMakeFunc) {
        const that = this;
        const TAG_REGEX = /<highlight-detail>|<\/highlight-detail>/gi;

        // 自动补全闭合标签
        const openTagCount = (str.match(/<highlight-detail>/g) || []).length;
        const closeTagCount = (str.match(/<\/highlight-detail>/g) || []).length;
        if (openTagCount > closeTagCount) {
            str += '</highlight-detail>';
        }

        return str.replace(this.RULE.reg, (whole, m1) => {
            const lines = that.getLineCount(whole); // 定义行号，用来实现联动滚动
            const { sign, html } = sentenceMakeFunc(m1); // 解析行内语法

            // const innerHtml = that.$engine.makeHtml(m1);
            // const sign = that.$engine.md5(whole);

            return that.pushCache(`
          <aside class="highlight-detail-container" data-sign="${sign}" data-lines="${lines}">

               ${html}
 
          </aside>
        `, sign, lines);
        });
    },

    rule() {
        return {
            reg: /<highlight-detail>([\s\S]*?)<\/highlight-detail>/g,
        };
    }
});



// const dealReport = (str, that) => {
//     // 自动补全闭合标签
//     const openTagCount = (str.match(/<report>/g) || []).length;
//     const closeTagCount = (str.match(/<\/report>/g) || []).length;

//     if (openTagCount > closeTagCount) {
//         str += '</report>';
//     }

//     // 只处理 <report> 标签内的内容，移除标签外的内容
//     let result = '';
//     let match;
//     const reportRegex = /<report>([\s\S]*?)<\/report>/g;

//     while ((match = reportRegex.exec(str)) !== null) {
//         const whole = match[0];
//         const content = match[1];

//         // 检查内容中是否包含 <title> 标签
//         const titleRegex = /<title>(.*?)<\/title>/i;
//         let processedContent = content;
//         let titleContent = '';

//         // 如果有 title 标签，提取标题内容
//         const titleMatch = content.match(titleRegex);
//         if (titleMatch && titleMatch[1]) {
//             titleContent = '正在总结报告：' + titleMatch[1];
//             // 移除 title 标签
//             processedContent = content.replace(titleRegex, '');
//         }

//         // 生成唯一标识和行号
//         const sign = that.$engine.md5(whole);
//         const lines = that.getLineCount(whole);



//         // 解析内部内容为HTML
//         console.log('that', that)
//         const innerHtml = that.$engine.makeHtml(processedContent);
//         console.log("innerHtml", innerHtml)

//         // 构建显示文本，如果有标题则显示标题，否则显示"正在总结"
//         const displayText = titleContent || '正在总结报告';

//         // 添加处理后的内容到结果中
//         result += `<aside class="reasoning-container chat-report-container cursor-pointer" data-sign="${sign}" data-lines="${lines}" data-title="${titleContent}"  >
//     <div class="reasoning-title ">
//         <div class="reasoning-title-left flex items-center">
//             <span class="anticon"><svg t="1757907619295" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13784" width="16" height="16"><path d="M0 0h1024v1024H0z" fill="#FFFFFF" opacity=".01" p-id="13785"></path><path d="M896 887.466667H128c-42.666667 0-76.8-34.133333-76.8-76.8V213.333333C51.2 170.666667 85.333333 136.533333 128 136.533333h768c42.666667 0 76.8 34.133333 76.8 76.8v597.333334c0 42.666667-34.133333 76.8-76.8 76.8zM128 204.8c-4.266667 0-8.533333 4.266667-8.533333 8.533333v597.333334c0 4.266667 4.266667 8.533333 8.533333 8.533333h768c4.266667 0 8.533333-4.266667 8.533333-8.533333V213.333333c0-4.266667-4.266667-8.533333-8.533333-8.533333H128z" fill="#333333" p-id="13786"></path><path d="M256 674.133333c-8.533333 0-17.066667-4.266667-25.6-12.8-12.8-12.8-8.533333-34.133333 4.266667-46.933333L354.133333 512 234.666667 409.6c-12.8-12.8-12.8-34.133333-4.266667-46.933333 12.8-12.8 29.866667-17.066667 46.933333-4.266667l149.333334 128c8.533333 4.266667 12.8 17.066667 12.8 25.6s-4.266667 17.066667-12.8 25.6l-149.333334 128c-8.533333 4.266667-12.8 8.533333-21.333333 8.533333zM768 716.8h-277.333333c-17.066667 0-34.133333-12.8-34.133334-34.133333s12.8-34.133333 34.133334-34.133334H768c17.066667 0 34.133333 12.8 34.133333 34.133334s-17.066667 34.133333-34.133333 34.133333z" fill="currentColor" p-id="13787"></path></svg></span>
//             <span>${displayText}</span>
//         </div>
//     </div>

// </aside>`;


//     }

//     return result;
// };

const dealReport = (str, that) => {
    // 自动补全闭合标签
    const openTagCount = (str.match(/<report>/g) || []).length;
    const closeTagCount = (str.match(/<\/report>/g) || []).length;

    if (openTagCount > closeTagCount) {
        str += '</report>';
    }

    // 只处理 <report> 标签内的内容，移除标签外的内容
    let result = '';
    let match;
    const reportRegex = /<report>([\s\S]*?)<\/report>/g;

    while ((match = reportRegex.exec(str)) !== null) {
        const whole = match[0];
        const content = match[1];

        // 检查内容中是否包含 <title> 标签
        const titleRegex = /<title>(.*?)<\/title>/i;
        let processedContent = content;
        let titleContent = '';

        // 如果有 title 标签，提取标题内容
        const titleMatch = content.match(titleRegex);
        if (titleMatch && titleMatch[1]) {
            titleContent = '正在生成报告：' + titleMatch[1];
            // 移除 title 标签
            processedContent = content.replace(titleRegex, '');
        }

        // 生成唯一标识和行号
        const sign = that.$engine.md5(whole);
        const lines = that.getLineCount(whole);

        // 将原始内容进行编码保存
        const originalContent = encodeURIComponent(content);

        // 构建显示文本，如果有标题则显示标题，否则显示"正在总结"
        const displayText = titleContent || '正在生成报告';

        // 添加处理后的内容到结果中
        result += `<aside class="reasoning-container chat-report-container cursor-pointer" data-sign="${sign}" data-lines="${lines}" data-original-content="${originalContent}" data-title="${titleContent}"  >
    <div class="reasoning-title ">
        <div class="reasoning-title-left flex items-center">
            <span class="anticon"><svg t="1757907619295" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13784" width="16" height="16"><path d="M0 0h1024v1024H0z" fill="#FFFFFF" opacity=".01" p-id="13785"></path><path d="M896 887.466667H128c-42.666667 0-76.8-34.133333-76.8-76.8V213.333333C51.2 170.666667 85.333333 136.533333 128 136.533333h768c42.666667 0 76.8 34.133333 76.8 76.8v597.333334c0 42.666667-34.133333 76.8-76.8 76.8zM128 204.8c-4.266667 0-8.533333 4.266667-8.533333 8.533333v597.333334c0 4.266667 4.266667 8.533333 8.533333 8.533333h768c4.266667 0 8.533333-4.266667 8.533333-8.533333V213.333333c0-4.266667-4.266667-8.533333-8.533333-8.533333H128z" fill="#333333" p-id="13786"></path><path d="M256 674.133333c-8.533333 0-17.066667-4.266667-25.6-12.8-12.8-12.8-8.533333-34.133333 4.266667-46.933333L354.133333 512 234.666667 409.6c-12.8-12.8-12.8-34.133333-4.266667-46.933333 12.8-12.8 29.866667-17.066667 46.933333-4.266667l149.333334 128c8.533333 4.266667 12.8 17.066667 12.8 25.6s-4.266667 17.066667-12.8 25.6l-149.333334 128c-8.533333 4.266667-12.8 8.533333-21.333333 8.533333zM768 716.8h-277.333333c-17.066667 0-34.133333-12.8-34.133334-34.133333s12.8-34.133333 34.133334-34.133334H768c17.066667 0 34.133333 12.8 34.133333 34.133334s-17.066667 34.133333-34.133333 34.133333z" fill="currentColor" p-id="13787"></path></svg></span>
            <span>${displayText}</span>
        </div>
    </div>
</aside>`;
    }

    return result;
};

const reportHook = Cherry.createSyntaxHook('report',
    Cherry.constants.HOOKS_TYPE_LIST.PAR, {
    needCache: true,

    makeHtml(str, sentenceMakeFunc) {
        const that = this;

        // 添加计数器
        let reportIndex = 0;

        // 自动补全闭合标签 
        const openTagCount = (str.match(/<report>/g) || []).length;
        const closeTagCount = (str.match(/<\/report>/g) || []).length;
        if (openTagCount > closeTagCount) {
            str += '</report>';
        }

        // 处理每个 <report> 标签
        return str.replace(/<report>([\s\S]*?)<\/report>/g, (whole, m1, m2) => {

            // 增加计数器
            reportIndex++;

            // 生成唯一标识
            // const sign = that.$engine.md5(whole);
            const lines = that.getLineCount(whole);
            const { sign, html } = sentenceMakeFunc(m1); // 解析行内语法

            // 将原始内容编码保存
            // const encodedContent = encodeURIComponent(content.trim());
            // 检查内容中是否包含 <title> 标签
            const titleRegex = /<title>(.*?)<\/title>/i;
            let processedContent = m1;
            let titleContent = '';

            // 如果有 title 标签，提取标题内容
            const titleMatch = m1.match(titleRegex);
            if (titleMatch && titleMatch[1]) {
                titleContent = '正在生成报告：' + titleMatch[1];
                // 移除 title 标签
                processedContent = m1.replace(titleRegex, '');
            }

            // 将原始内容进行编码保存
            const originalContent = encodeURIComponent(m1);


            // 构建显示文本，如果有标题则显示标题，否则显示"正在总结"
            const displayText = titleContent || '正在生成报告';

            // 生成按钮HTML
            return that.pushCache(`
                <aside class="reasoning-container chat-report-container cursor-pointer" data-sign="${sign}" data-lines="${lines}"  data-report-index="${reportIndex}" data-title="${titleContent}"  >
    <div class="reasoning-title ">
        <div class="reasoning-title-left flex items-center">
            <span class="anticon"><svg t="1757907619295" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13784" width="16" height="16"><path d="M0 0h1024v1024H0z" fill="#FFFFFF" opacity=".01" p-id="13785"></path><path d="M896 887.466667H128c-42.666667 0-76.8-34.133333-76.8-76.8V213.333333C51.2 170.666667 85.333333 136.533333 128 136.533333h768c42.666667 0 76.8 34.133333 76.8 76.8v597.333334c0 42.666667-34.133333 76.8-76.8 76.8zM128 204.8c-4.266667 0-8.533333 4.266667-8.533333 8.533333v597.333334c0 4.266667 4.266667 8.533333 8.533333 8.533333h768c4.266667 0 8.533333-4.266667 8.533333-8.533333V213.333333c0-4.266667-4.266667-8.533333-8.533333-8.533333H128z" fill="#333333" p-id="13786"></path><path d="M256 674.133333c-8.533333 0-17.066667-4.266667-25.6-12.8-12.8-12.8-8.533333-34.133333 4.266667-46.933333L354.133333 512 234.666667 409.6c-12.8-12.8-12.8-34.133333-4.266667-46.933333 12.8-12.8 29.866667-17.066667 46.933333-4.266667l149.333334 128c8.533333 4.266667 12.8 17.066667 12.8 25.6s-4.266667 17.066667-12.8 25.6l-149.333334 128c-8.533333 4.266667-12.8 8.533333-21.333333 8.533333zM768 716.8h-277.333333c-17.066667 0-34.133333-12.8-34.133334-34.133333s12.8-34.133333 34.133334-34.133334H768c17.066667 0 34.133333 12.8 34.133333 34.133334s-17.066667 34.133333-34.133333 34.133333z" fill="currentColor" p-id="13787"></path></svg></span>
            <span>${displayText} </span>
        </div>
    </div>
</aside>
            `, sign, lines);
        });
    },

    rule() {
        return {
            reg: /<report>([\s\S]*?)<\/report>/g,
        };
    }
});

const filesHook = Cherry.createSyntaxHook('filesHook',
    Cherry.constants.HOOKS_TYPE_LIST.PAR, {
    needCache: true,

    makeHtml(str, sentenceMakeFunc) {
        const that = this;
        return str.replace(that.RULE.reg, (whole, content) => {

            const lines = that.getLineCount(whole);
            const { sign, html } = sentenceMakeFunc(content);
            return that.pushCache(`
                <aside class="chat-files-container" data-sign="${sign}" data-lines="${lines}" data-react-component="ChatFilesContainer" data-files="${encodeURIComponent(whole)}"  >
   
</aside>
            `, sign, lines);
        });
    },

    rule() {
        return {
            reg: /{\"files\"\:\[([\s\S]*?)]}/g,
        };
    }
});

const toolDetailHook = Cherry.createSyntaxHook('toolDetail',
    Cherry.constants.HOOKS_TYPE_LIST.PAR, {
    needCache: true,
    // beforeMakeHtml(str) {
    //     let $str = str;

    //     // 在这里匹配并缓存原始数据  
    //     $str = $str.replace(this.RULE.reg, (match, ...args) => {
    //         const originalData = match; // 这里是完整的原始数据  
    //         console.log('originalData', originalData)
    //         const sign = this.$engine.hash(match);

    //         // 将原始数据存储到自定义缓存中  
    //         this.originalDataCache = this.originalDataCache || {};
    //         this.originalDataCache[sign] = originalData;

    //         // 返回缓存标记  
    //         return this.pushCache(match, sign);
    //     });

    //     return $str;
    // },
    makeHtml(str, sentenceMakeFunc) {
        const that = this;
        // 先还原缓存的内容  
        let $str = this.restoreCache(str);
        const openTagCount = (str.match(/<tool-detail>/g) || []).length;
        const closeTagCount = (str.match(/<\/tool-detail>/g) || []).length;

        if (openTagCount > closeTagCount) {
            str += '</tool-detail>';
        }

        return str.replace(/<tool-detail>([\s\S]*?)<\/tool-detail>/g, (whole, content) => {
            const lines = that.getLineCount(whole);
            const sign = that.$engine.md5(whole);

            // 检查内容中是否包含 <report> 标签
            let reportContent = '';
            // if (content.includes('<report>')) {
            //     // 调用 dealReport 处理 report 标签

            //     reportContent = dealReport($str, that);

            //     // 从原始内容中移除 report 部分，避免重复渲染
            //     const contentWithoutReport = content.replace(/<report>[\s\S]*?<\/report>/g, '');

            //     // 重新解析不包含 report 的内容
            //     content = contentWithoutReport;
            // }



            // 解析 tool-detail 内部结构
            const summary = content.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] || 'Untitled';
            const params = content.match(/<params>([\s\S]*?)<\/params>/)?.[1] || '';

            // 提取 returns 内容和状态
            const returnsMatch = content.match(/<return(.*?)>([\s\S]*?)<\/return>/);
            const returnsAttrs = returnsMatch?.[1] || '';
            const returnsContent = returnsMatch?.[2] || '';
            const statusMatch = returnsAttrs.match(/data-status="([^"]+)"/);
            const status = statusMatch?.[1] || 'success';

            // 生成 React 组件挂载点
            const ress = that.pushCache(`
        <div class="tool-detail-container" 
             data-react-component="ToolDetail"
             data-summary="${encodeURIComponent(summary)}"
             data-params="${encodeURIComponent(params)}"
             data-returns="${encodeURIComponent(returnsContent)}"
             data-status="${returnsContent ? status : 'loading'}"
             data-sign="${sign}"
             data-lines="${lines}">
        </div>
        ${reportContent}
      `, sign, lines)

            return ress;
        });
    },

    rule() {
        return {
            reg: /<tool-detail>([\s\S]*?)<\/tool-detail>/g,
        };
    }
});

const highlightHook = Cherry.createSyntaxHook('highlight',
    Cherry.constants.HOOKS_TYPE_LIST.PAR, {
    needCache: true,

    makeHtml(str, sentenceMakeFunc) {
        const that = this;

        return str.replace(this.RULE.reg, (whole, m1) => {
            const lines = that.getLineCount(whole); // 定义行号，用来实现联动滚动
            // const { sign, html } = sentenceMakeFunc(m1); // 解析行内语法

            const innerHtml = that.$engine.makeHtml(m1);
            const sign = that.$engine.md5(whole);

            return that.pushCache(`
          <div class="hightlight-block"  data-sign="${sign}" data-lines="${lines}">

               ${innerHtml}
             </div>
          </div>
        `, sign, lines);
        });
    },

    rule() {
        return {
            reg: /\[highlight\]([\s\S]*?)\[\/highlight\]/g,
        };
    }
});
// 去除多余的方括号
const convertCitations = (text: string) => {
    // 正则表达式匹配[[...]]部分
    const pattern = /\[\[(.*?)\]\]/g;

    return text.replace(pattern, (match, p1) => {
        // 构建用于匹配检查的字符串，重新添加单层括号以符合预期格式
        const checkPart = `[${p1}]`;

        // 检查是否完全由一个或多个[citation:x]组成
        if (checkPart.match(/(\[citation:\d+\])+/)) {
            // 如果是，则直接替换原始字符串中匹配到的内容，从双括号变成单括号
            return checkPart;
        } else {
            // 保持原样，不需要做任何处理
            return `[[${p1}]]`;
        }
    });
}


// 将方括号转为markdown的链接
const markdownParse = (text: string) => {
    return text.replace(/(<tool-detail>[\s\S]*?<\/tool-detail>)|(\[\[([cC])itation)|([cC]itation:(\d+)]])|(\[\[([cC]itation:\d+)]])|(\[[cC]itation:(\d+)])/g,
        (match, toolDetailMatch) => {
            if (toolDetailMatch) {
                // 如果是 tool-detail 区域，保持原样
                return toolDetailMatch;
            } else {
                // 否则处理 citation
                return match
                    .replace(/\[\[([cC])itation/g, "[citation")
                    .replace(/[cC]itation:(\d+)]]/g, "citation:$1]")
                    .replace(/\[\[([cC]itation:\d+)]](?!])/g, `[$1]`)
                    .replace(/\[[cC]itation:(\d+)]/g, "[citation]($1)");
            }
        });
};
const citationHook = Cherry.createSyntaxHook('citation', Cherry.constants.HOOKS_TYPE_LIST.PAR, {
    needCache: true,
    beforeMakeHtml: (str) => {
        const input1 = str;
        const input2 = convertCitations(input1);
        const input3 = markdownParse(input2);
        return input3
    },
    // makeHtml(str, sentenceMakeFunc) {
    //     const that = this;
    //     const TAG_REGEX = /<think>|<\/think>/gi;



    //     const input1 = str;
    //     const input2 = convertCitations(input1);
    //     const input3 = markdownParse(input2);
    //     return input3
    // },
})
const customLinkHook = Cherry.createSyntaxHook('customLink',
    Cherry.constants.HOOKS_TYPE_LIST.SEN, {
    makeHtml(str, sentenceMakeFunc) {



        const isToolDetail = /<tool-detail>[\s\S]*<\/tool-detail>/.test(str);
        return str.replace(this.RULE.reg, (whole, text, href, title) => {

            const isCitation = text.trim().toLowerCase() === 'citation';
            // if (isToolDetail && isCitation) {
            //     return `[[citation:${href}]]`
            // }
            const res = isCitation
                ? `<span class="message-source-link" title="${href || ''}">${href}</span>`
                : `<a title="${title}" href="${href}"><span class="message-link">${text}</span></a>`;

            return res
        });
    },
    rule() {
        return {
            reg: /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
        };
    }
});
var customMenuB = Cherry.createMenuHook('预览', {

    // iconName: 'preview',
    onClick: function () {
        // 'edit&preview'|'editOnly'|'previewOnly'

        const previewer = this.$cherry.getPreviewer();

        const isPreviewerHidden = previewer.isPreviewerHidden();
        if (isPreviewerHidden) {
            this.dom.title = '关闭预览';
            this.dom.innerText = '预览';
            // this.$cherry.switchModel('edit&preview');
            this.editor.previewer.recoverPreviewer(true);

        }
        else {
            this.dom.title = '打开预览';
            this.dom.innerText = '预览';
            this.editor.previewer.editOnly(true);

        }


    }
});

export const defaultConfig = {
    // el: mdRef.value,
    // value: modelValue.value,
    themeSettings: {
        toolbarTheme: 'light',
        codeBlockTheme: 'vs-dark'
    },
    // theme: [
    //     { className: 'default', label: '默认' },
    //     { className: 'dark', label: '黑' },
    //     { className: 'light', label: '白' },
    //     { className: 'green', label: '绿' },
    //     { className: 'red', label: '粉' },
    //     { className: 'violet', label: '紫' },
    //     { className: 'blue', label: '蓝' },
    // ],


    engine: {
        global: {
            htmlWhiteList: 'think|tool-detail|summary|params|return|reasoning|report|title',
            flowSessionContext: true,

        },
        // syntax: {
        //     header: {
        //         anchorStyle: 'none'
        //     },
        // },
        syntax: {
            header: {
                anchorStyle: 'none'
            },
            codeBlock: {
                lineNumber: true, // 默认显示行号
                expandCode: false,

            },
        },
        customSyntax: {

            // "thinkBlock": {
            //     syntaxClass: getThinkBlockHook,
            //     before: 'normalParagraph',
            // },
            "highlightHook": {
                syntaxClass: highlightHook,
                before: 'normalParagraph',
            },
            'citation': {
                syntaxClass: citationHook,
                before: 'normalParagraph',
            },
            // "toolDetail": {
            //     syntaxClass: toolDetailHook,
            //     before: 'normalParagraph',
            // },
            "reportHook": {
                syntaxClass: reportHook,
                before: 'codeBlock',
            },
            "customLink": {
                syntaxClass: customLinkHook,
                force: true,
                before: 'link'
                // 在默认链接处理器之前执行
            },
            "highlightDetailHook": {
                syntaxClass: highlightDetailHook,
                before: 'normalParagraph',
            },

        } as Record<string, CustomSyntaxRegConfig>


    } as CherryEngineOptions,
    toolbars: {
        // 定义顶部工具栏
        toolbar: [
            'undo', 'redo', '|',
            // 把字体样式类按钮都放在加粗按钮下面
            { bold: ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup'] },
            // { name:'bold',icon:'bold',subMenu: [{name:'italic'},{name:'underline'}], config: ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup', 'ruby'] },
            // 'color', 
            // 'size', 
            'quote', '|', 'header', 'list', '|', 'hr',
            // 'br', 
            'code',
            //  'formula',
            'toc', 'table',
            // 把插入类按钮都放在插入按钮下面
            { insert: ['image', 'link',] },

        ],
        shortcutKey: false,
        shortcutKeySettings: {
            /** 是否替换已有的快捷键, true: 替换默认快捷键； false： 会追加到默认快捷键里，相同的shortcutKey会覆盖默认的 */
            isReplace: false,
            shortcutKeyMap: {
                // 'Alt-Digit1': {
                //   hookName: 'header',
                //   aliasName: '标题',
                // },
                // 'Control-Shift-KeyB': {
                //   hookName: 'bold',
                //   aliasName: '加粗',
                // },
            },
        },
        // 定义侧边栏，默认为空
        // sidebar: ['theme', 'mobilePreview', 'copy','togglePreview',],
        // 定义顶部右侧工具栏，默认为空
        toolbarRight: ['fullScreen', 'customMenuBName'],
        // 定义选中文字时弹出的“悬浮工具栏”，默认为 ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup', 'quote', '|', 'size', 'color']
        // bubble: ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup', 'ruby', '|', 'color', 'size',],
        bubble: false,
        // 定义光标出现在行首位置时出现的“提示工具栏”，默认为 ['h1', 'h2', 'h3', '|', 'checklist', 'quote', 'table', 'code']
        // float: ['table', 'code'],
        float: false,
        customMenu: {
            customMenuBName: customMenuB,
        },

    } as CherryToolbarsOptions,
    // isPreviewOnly:true,
    editor: {
        // theme: 'dark',
        convertWhenPaste: false,
        defineModel: 'editOnly',
        codemirror: {
            autofocus: false
        }
        // defaultModel 编辑器初始化后的默认模式，一共有三种模式：1、双栏编辑预览模式；2、纯编辑模式；3、预览模式
        // edit&preview: 双栏编辑预览模式
        // editOnly: 纯编辑模式（没有预览，可通过toolbar切换成双栏或预览模式）
        // previewOnly: 预览模式（没有编辑框，toolbar只显示“返回编辑”按钮，可通过toolbar切换成编辑模式）
        // defaultModel: 'previewOnly',
    } as CherryEditorOptions,
    previewer: {
        dom: false,
        className: 'cherry-markdown',
        // 是否启用预览区域编辑能力（目前支持编辑图片尺寸、编辑表格内容）
        enablePreviewerBubble: false,

    } as CherryPreviewerOptions,
    // fileUpload: myFileUpload,
} as CherryOptions;


export const chatConfig = {
    themeSettings: {
        toolbarTheme: 'light',
        codeBlockTheme: 'vs-dark'
    },
    editor: {
        height: 'auto',
        defaultModel: 'previewOnly',
    },
    engine: {
        global: {

            htmlWhiteList: 'think|tool-detail|summary|params|return|reasoning|report|title|highlight-detail',

            // 开启流式模式 （默认 true）
            flowSessionContext: true,
            // flowSessionCursor: 'default',
        },
        syntax: {
            codeBlock: {
                selfClosing: false,
            },
            header: {
                anchorStyle: 'none',
            },
            table: {
                selfClosing: false,
            },
            fontEmphasis: {
                selfClosing: false,
            }
        },
        customSyntax: {
            // "thinkBlock": {
            //     syntaxClass: getThinkBlockHook,
            //     before: 'normalParagraph',
            // },
            "toolDetail": {
                syntaxClass: toolDetailHook,
                before: 'normalParagraph',
            },

            "reasoningHook": {
                syntaxClass: reasoningHook,
                before: 'normalParagraph',
            },
            "highlightHook": {
                syntaxClass: highlightHook,
                before: 'normalParagraph',
            },
            'citation': {
                syntaxClass: citationHook,
                before: 'normalParagraph',
            },

            "customLink": {
                syntaxClass: customLinkHook,
                force: true,
                before: 'link'
                // 在默认链接处理器之前执行
            },
            "reportHook": {
                syntaxClass: reportHook,
                before: 'normalParagraph',
            },
            "filesHook": {
                syntaxClass: filesHook,
                before: 'normalParagraph',
            },
            "highlightDetailHook": {
                syntaxClass: highlightDetailHook,
                before: 'normalParagraph',
            },

        } as Record<string, CustomSyntaxRegConfig>
    },
    previewer: {
        enablePreviewerBubble: false,
    },
    isPreviewOnly: true,
} as CherryOptions;

export const getConfig = (props: { thinkLabel?: string[], isChat?: boolean }) => {
    const res = {} as CherryOptions;
    if (props.isChat) {

        Object.assign(res, { ...chatConfig })

    }
    else {
        Object.assign(res, { ...defaultConfig })
    }


    res.engine.customSyntax.thinkBlock = {
        syntaxClass: getThinkBlockHook(props.thinkLabel),
        before: 'normalParagraph',
    }

    return res;

}