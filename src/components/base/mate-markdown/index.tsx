import ReactMarkdown from 'react-markdown'
// import ReactEcharts from 'echarts-for-react'

import RemarkMath from 'remark-math'
// import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import RemarkGfm from 'remark-gfm'
import RehypeRaw from 'rehype-raw'
import SyntaxHighlighter from 'react-syntax-highlighter'
import {
  atelierHeathDark,
  atelierHeathLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Component, FC, memo, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { CaretDownFilled, CheckCircleOutlined, CloseCircleOutlined, FileTextFilled, LoadingOutlined } from "@ant-design/icons";
import { flow, set } from 'lodash'
import Cherry from "cherry-markdown/dist/cherry-markdown.core";
import echarts from '@/utils/echarts';
// import ActionButton from '@/app/components/base/action-button'
// import CopyIcon from '@/app/components/base/copy-icon'
// import SVGBtn from '@/app/components/base/svg'
// import Flowchart from '@/app/components/base/mermaid'
// import ImageGallery from '@/app/components/base/image-gallery'
// import { useChatContext } from '@/app/components/base/chat/chat/context'
// import VideoGallery from '@/app/components/base/video-gallery'
// import AudioGallery from '@/app/components/base/audio-gallery'
// import SVGRenderer from '@/app/components/base/svg-gallery'
// import MarkdownButton from '@/app/components/base/markdown-blocks/button'
// import MarkdownForm from '@/app/components/base/markdown-blocks/form'
// import ThinkBlock from '@/app/components/base/markdown-blocks/think-block'
// import { Theme } from '@/types/app'
// import useTheme from '@/hooks/use-theme'
import cn from '@/utils/classnames'
import { useTheme, useIsDarkTheme } from '../theme-provider'
import { CherryOptions } from 'cherry-markdown/types/cherry'
import { chatConfig, defaultConfig, EditorMode, getConfig } from "./config";
import { useSetState, useThrottleEffect } from "ahooks";
import useUserStore from "@/stores/userStore";
import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactJson from 'react18-json-view';
import ExpandablePanel from "@/components/base/panel/expandable-panel";
import parse, { IsValidNodeDefinitions, Parser, ProcessNodeDefinitions } from 'html-to-react';

import echartsEngine from 'cherry-markdown/dist/addons/advance/cherry-table-echarts-plugin';
import { Tooltip } from 'antd'
import { useLayoutEffect } from 'react'
import Highlighter from "@/components/base/highlighter/sql-highlighter";


Cherry.usePlugin(echartsEngine, { echarts });

// Available language https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_HLJS.MD
const capitalizationLanguageNameMap: Record<string, string> = Object.freeze({
  sql: 'SQL',
  javascript: 'JavaScript',
  java: 'Java',
  typescript: 'TypeScript',
  vbscript: 'VBScript',
  css: 'CSS',
  html: 'HTML',
  xml: 'XML',
  php: 'PHP',
  python: 'Python',
  yaml: 'Yaml',
  mermaid: 'Mermaid',
  markdown: 'MarkDown',
  makefile: 'MakeFile',
  echarts: 'ECharts',
  shell: 'Shell',
  powershell: 'PowerShell',
  json: 'JSON',
  latex: 'Latex',
  svg: 'SVG',
})
const getCorrectCapitalizationLanguageName = (language: string) => {
  if (!language)
    return 'Plain'

  if (language in capitalizationLanguageNameMap)
    return capitalizationLanguageNameMap[language]

  return language.charAt(0).toUpperCase() + language.substring(1)
}

const preprocessLaTeX = (content: string) => {
  if (typeof content !== 'string')
    return content

  return flow([
    (str: string) => str.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\((.*?)\\\)/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/(^|[^\\])\$(.+?)\$/g, (_, prefix, equation) => `${prefix}$${equation}$`),
  ])(content)
}

const preprocessThinkTag = (content: string) => {
  return flow([
    (str: string) => str.replace('<think>\\n', '<details data-think=true>\\n'),
    (str: string) => str.replace('\\n</think>', '\\n[ENDTHINKFLAG]</details>'),
  ])(content)
}

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null)

  return (
    <pre ref={ref}>
      <span
        className="copy-code-button"
      ></span>
      {props.children}
    </pre>
  )
}

const getToolStatus = (status: string) => {
  if (status === 'success') {
    return <span className="status-icon text-green-500 success"><CheckCircleOutlined /></span>
  } if (status === 'loading') {
    return <span className="status-icon  text-blue-500  loading"><LoadingOutlined /></span>
  }
  else {
    return <span className="status-icon text-red-500 error"><CloseCircleOutlined /></span>

  }
}

const ChatFilesComponent = ({
  filesList,
}: {
  filesList: { fileName: string; fileUrl: string; fileSize: string, fileType: string }[];
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filesList.map((file, index) => (
        <div className='border rounded-md bg-fill-container  cursor-pointer  chat-files-item' data-file-url={file.fileUrl} key={index}
        >
          <div className='w-[200px] h-[64px] p-3 relative'>
            <Tooltip title={file.fileName} placement="top">
              <div className='text-sm truncate'>
                {file.fileName}
              </div>
            </Tooltip>
            <div className='flex gap-2 items-center'>
              <div className='text-primary-500 '>
                <FileTextFilled />
              </div>
              <div className='text-xs text-textcolor-300'>
                {file.fileSize}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
const ToolDetailComponent = ({
  summary,
  params,
  returns,
  status
}: {
  summary: string;
  params: string;
  returns: string;
  status: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  // 添加错误边界
  try {
    return (
      <ExpandablePanel title={
        <div>
          {summary || 'Untitled'}
          {getToolStatus(status)}
        </div>
      }>
        <div>
          {params && (
            <ExpandablePanel title={'参数'} level={1}>
              <div className='max-h-[500px] overflow-auto'>
                <JsonDisplay data={params} />
              </div>
            </ExpandablePanel>
          )}
          {returns && (
            <ExpandablePanel title={'返回结果'} level={1}>
              <div className='max-h-[500px] overflow-auto'>
                <JsonDisplay data={returns} />
              </div>
            </ExpandablePanel>
          )}
        </div>
      </ExpandablePanel>
    );
  } catch (error) {
    console.error('ToolDetailComponent render error:', error);
    return (
      <div className="tool-detail-error">
        组件渲染出错: {error.message}
      </div>
    );
  }
};


const JsonDisplay = ({ data }: { data: string }) => {
  const jsonData = useMemo(() => {
    if (!data) return null;

    try {
      // 先尝试直接解析
      return JSON.parse(data);
    } catch (e) {
      try {
        // 如果失败，尝试解码后再解析
        const decoded = decodeURIComponent(data);
        return JSON.parse(decoded);
      } catch (e2) {
        console.error('JSON parsing failed:', e2);
        return null;
      }
    }
  }, [data]);

  if (jsonData === null) {
    const normalized = decodeHtmlEntities(data);
    if (
      normalized.startsWith('<!DOCTYPE html>') ||
      normalized.startsWith('<html') ||
      normalized.startsWith('<HTML')
    ) {
      return <Highlighter language="html" value={normalized} />;
    }
    return <div className="json-parse-error">{normalized}</div>;
  }

  return <ReactJson src={jsonData} enableClipboard={false} />;
};



// // 修改 MarkdownRenderer 组件
// const MarkdownRenderer = ({ content }: { content: string }) => {
//   const htmlToReactParser = Parser();
//   const processNodeDefinitions = ProcessNodeDefinitions();
//   console.log('content', content)

//   const processingInstructions = [
//     {
//       // 处理 ToolDetail 组件  
//       shouldProcessNode: (node: any) => {
//         return node.attribs && node.attribs['data-react-component'] === 'ToolDetail';
//       },
//       processNode: (node: any, children: any, index: number) => {
//         const summary = decodeURIComponent(node.attribs['data-summary'] || '');
//         const params = decodeURIComponent(node.attribs['data-params'] || '');
//         const returns = decodeURIComponent(node.attribs['data-returns'] || '');
//         const status = decodeURIComponent(node.attribs['data-status'] || 'success');

//         return (
//           <ToolDetailComponent
//             key={index}
//             summary={summary}
//             params={params}
//             returns={returns}
//             status={status}
//           />
//         );
//       }
//     },
//     {
//       // 处理 ChatFilesContainer 组件  
//       shouldProcessNode: (node: any) => {
//         return node.attribs && node.attribs['data-react-component'] === 'ChatFilesContainer';
//       },
//       processNode: (node: any, children: any, index: number) => {
//         try {
//           const filesStr = decodeURIComponent(node.attribs['data-files'] || '');
//           const filesObj = JSON.parse(filesStr);

//           return (
//             <ChatFilesComponent
//               key={index}
//               filesList={filesObj.files}
//             />
//           );
//         } catch (e) {
//           console.error('Parse files error:', e);
//           return null;
//         }
//       }
//     },
//     {
//       // 默认处理其他所有节点  
//       shouldProcessNode: () => true,
//       processNode: processNodeDefinitions.processDefaultNode
//     }
//   ];

//   const isValidNode = () => true;

//   const reactElement = htmlToReactParser.parseWithInstructions(
//     content,
//     IsValidNodeDefinitions.alwaysValid,
//     processingInstructions
//   );

//   return <div className='h-full'>{reactElement}</div>;
// };

// 安全 decode
const safeDecode = (str: string = '') => {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
};

const decodeHtmlEntities = (input: string) => {
  if (!input) return input;
  let output = input;
  output = output.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isNaN(code) ? _ : String.fromCharCode(code);
  });
  output = output.replace(/&#(\d+);/g, (_, num) => {
    const code = Number.parseInt(num, 10);
    return Number.isNaN(code) ? _ : String.fromCharCode(code);
  });
  output = output.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isNaN(code) ? _ : String.fromCharCode(code);
  });
  output = output.replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return output;
};

// 修改后的 MarkdownRenderer
const MarkdownRenderer = ({ content }: { content: string }) => {
  const htmlToReactParser = Parser();
  const processNodeDefinitions = ProcessNodeDefinitions();



  const processingInstructions = [
    {
      // 处理 ToolDetail 组件
      shouldProcessNode: (node: any) =>
        node.attribs && node.attribs["data-react-component"] === "ToolDetail",
      processNode: (node: any, children: any, index: number) => {
        try {
          const summary = safeDecode(node.attribs["data-summary"] || "");
          const params = safeDecode(node.attribs["data-params"] || "");
          const returns = safeDecode(node.attribs["data-returns"] || "");
          const status = safeDecode(node.attribs["data-status"] || "success");

          return (
            <ToolDetailComponent
              key={index}
              summary={summary}
              params={params}
              returns={returns}
              status={status}
            />
          );
        } catch (e) {
          console.error("ToolDetail process error:", e, node);
          return null;
        }
      },
    },
    {
      // 处理 ChatFilesContainer 组件
      shouldProcessNode: (node: any) =>
        node.attribs &&
        node.attribs["data-react-component"] === "ChatFilesContainer",
      processNode: (node: any, children: any, index: number) => {
        try {
          const filesStr = safeDecode(node.attribs["data-files"] || "");
          const filesObj = JSON.parse(filesStr);

          return <ChatFilesComponent key={index} filesList={filesObj.files} />;
        } catch (e) {
          console.error("ChatFilesContainer parse error:", e, node);
          return null;
        }
      },
    },
    {
      // 默认处理，带 try/catch
      shouldProcessNode: () => true,
      processNode: (node: any, children: any, index: number) => {
        try {
          return processNodeDefinitions.processDefaultNode(node, children, index);
        } catch (e) {
          console.error("Default node parse error:", e, node);
          return null;
        }
      },
    },
  ];

  const reactElement = htmlToReactParser.parseWithInstructions(
    content,
    IsValidNodeDefinitions.alwaysValid,
    processingInstructions
  );

  return <div >{reactElement}</div>;
};


// const safeDecode = (str: string = '') => {
//   try {
//     return decodeURIComponent(str);
//   } catch {
//     return str;
//   }
// };

// // 注册映射表：data-react-component => React 组件
// const componentMap: Record<string, React.FC<any>> = {
//   ToolDetail: ToolDetailComponent,
//   ChatFilesContainer: ChatFilesComponent,
// };

// export const MarkdownRenderer = ({ content }: { content: string }) => {
//   const containerRef = React.useRef<HTMLDivElement>(null);

//   const htmlToReactParser = Parser();
//   const processNodeDefinitions = ProcessNodeDefinitions();

//   // 自定义处理指令
//   const processingInstructions = [
//     {
//       // 处理自定义 React 组件节点
//       shouldProcessNode: (node: any) =>
//         node.attribs && node.attribs['data-react-component'],
//       processNode: (node: any, children: any, index: number) => {
//         const compName = node.attribs['data-react-component'];
//         const Component = componentMap[compName];
//         if (!Component) return null;

//         // 收集 props
//         const props: Record<string, any> = {};
//         Array.from(node.attributes).forEach((attr: any) => {
//           if (attr.name.startsWith('data-') && attr.name !== 'data-react-component') {
//             let val: any = safeDecode(attr.value);
//             try {
//               val = JSON.parse(val);
//             } catch {}
//             props[attr.name.replace(/^data-/, '')] = val;
//           }
//         });

//         return <Component key={index} {...props} />;
//       },
//     },
//     {
//       // 默认处理其他节点
//       shouldProcessNode: () => true,
//       processNode: processNodeDefinitions.processDefaultNode,
//     },
//   ];

//   // 解析成 React 元素
//   const reactElement = htmlToReactParser.parseWithInstructions(
//     content,
//     IsValidNodeDefinitions.alwaysValid,
//     processingInstructions
//   );

//   return <div className="markdown-body cherry-markdown" ref={containerRef}>{reactElement}</div>;
// };

export function Markdown(props: { content: string; className?: string }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<Cherry | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const latexContent = flow([
    preprocessThinkTag,
    preprocessLaTeX,
  ])(props.content)
  return (
    <div className={cn('markdown-body', '!text-text-primary', props.className)}>
    </div>
  )
}
export interface MateMarkdownOption {
  value?: string;
  onChange?: (value: string) => void;
  options?: CherryOptions;
  ref?: React.RefObject<Cherry>;
  isPreview?: boolean;
  height?: string | number;
  uploadUrl?: string;
  className?: string;
  isChat?: boolean;
  searchText?: string;
  thinkLabel?: string[];
}

// 添加防抖处理
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 在组件顶部添加高亮处理工具函数
const highlightSearchText = (content: string, searchText?: string): string => {
  if (!searchText) return content;

  // 安全转义正则特殊字符
  const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedText})`, 'g');

  // 使用更可靠的分割方法处理文本节点
  return content.replace(regex, '[highlight]$1[/highlight]');
};

export interface MateMarkdownRef {
  getEditor: () => Cherry | null;
  setEditorValue: (value: string) => void;
}
const MarkdownMain = forwardRef<MateMarkdownRef, MateMarkdownOption>(({ value, onChange, isPreview, height, options, uploadUrl, className, isChat, searchText, thinkLabel }, ref) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [cherryInstance, setCherryInstance] = useState<Cherry | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { userInfo } = useUserStore();
  const [, refresh] = useState(0);

  // 使用防抖处理 value 变化
  const debouncedValue = useDebounce(value || '', 300);

  const uploadPath = useMemo(() => {
    return uploadUrl ? `${uploadUrl}` : `MDUpload/${userInfo.userId}`;
  }, [uploadUrl]);

  const [content, setContent] = useState('');
  const [asyncString, setAsyncString] = useState('');

  useEffect(() => {
    if (isInitialized) return;
    try {
      // 初始化编辑器
      const trueConfig = Object.assign({
        el: editorRef.current || document.createElement('div'),
        value: value || '',
        externals: { echarts },
        callback: {
          afterChange: (value: string) => {

            if (onChange) {
              onChange(value);
            }
          },
        },
        event: {

          afterAsyncRender: (text, html) => {


            setAsyncString(html);
          }
        }

      }, getConfig({ isChat, thinkLabel }))

      if (trueConfig) {
        Object.assign(trueConfig, options);
      }



      const inst = new Cherry(trueConfig);

      setCherryInstance(inst);

      setIsInitialized(true);

    } catch (error) {
      console.error('初始化 Cherry 编辑器失败', error);
    }
    refresh(pre => pre + 1)
    return () => {
      if (cherryInstance) {
        cherryInstance.destroy();
        setCherryInstance(null);

        setIsInitialized(false);
      }
    };
  }, [value, onChange, options, isChat, isInitialized]);

  // 处理预览模式变化
  useEffect(() => {
    if (!cherryInstance) return;

    const newMode = isPreview ? EditorMode.previewOnly : EditorMode.editOnly;
    cherryInstance.switchModel(newMode);
  }, [isPreview, cherryInstance]);

  // 修改处理外部 value 变化的 useEffect
  useEffect(() => {
    if (!cherryInstance || !value) return;

    // 在设置Markdown内容前进行高亮处理
    const highlightedContent = highlightSearchText(value, searchText);
    // console.log('highlightedContent', highlightedContent);
    // console.log('highlightedContent', value);
    cherryInstance.setMarkdown(highlightedContent, true);
    if (thinkLabel) {

    }
  }, [value, searchText, cherryInstance]);

  const isDark = useIsDarkTheme();

  useEffect(() => {
    if (!cherryInstance) return;

    if (isDark) {
      cherryInstance.setTheme('dark');
      cherryInstance.setCodeBlockTheme('vs-dark');
    }
    else {
      cherryInstance.setTheme('light');
      cherryInstance.setCodeBlockTheme('one-light');
    }
  }, [isDark, cherryInstance]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getEditor: () => { return cherryInstance },
    setEditorValue(value) {
      if (cherryInstance) {
        cherryInstance.setMarkdown(value, true);
      }
    },
  }), [cherryInstance]);

  useEffect(() => {
    if (cherryInstance) {

      if (thinkLabel) {
        // console.log('asyncString', asyncString);
      }

      const html = cherryInstance.cherryDom.innerHTML;

      setContent(html);

    }

  }, [asyncString, cherryInstance]);

  // useEffect(() => {
  //   if (asyncString) {
  //     console.log("使用 asyncString 渲染:", asyncString);
  //     setContent(asyncString);
  //   } else if (cherryInstance) {
  //     const html = cherryInstance.cherryDom.innerHTML;
  //     console.log("使用 cherryDom 渲染:", html);
  //     setContent(html);
  //   }
  // }, [asyncString, cherryInstance]);

  return (
    <div className={cn('mate-markdown', className)} style={{ height }}>

      {isPreview ? (
        <MarkdownRenderer content={content || ''} />
      ) : (
        <div ref={editorRef} />
      )}
    </div>
  );
})
export default React.memo(MarkdownMain);
