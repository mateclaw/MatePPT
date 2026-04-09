import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useIsDarkTheme } from "@/components/base/theme-provider";
import type { FC } from 'react'
import React, { useMemo, useState, useRef, useEffect } from 'react'
import { format } from "prettier-sql";

export type IVarHighlightProps = {
  language?: string
  style?: React.CSSProperties
  value?: string
  autoScroll?: boolean
}

const formattedCodeOrInitial = (code: string, dialect: any) => {
  try {
    return format(code, { language: dialect });
  } catch {
    return code;
  }
};

const Highlighter: FC<IVarHighlightProps> = (props) => {
  const isDarkTheme = useIsDarkTheme()
  const highlighterRef = useRef<HTMLDivElement>(null);

  const {
    language = 'sql',
    value,
    autoScroll
  } = props

  const [formattedCode, setFormattedCode] = useState<string>(() =>
    formattedCodeOrInitial(value || '', language)
  );

  // 支持外部 value/language 更新时同步重新格式化
  React.useEffect(() => {
    setFormattedCode(formattedCodeOrInitial(value || '', language));
  }, [value, language]);

  // 值变更时滚动到底部
  useEffect(() => {
    if (!autoScroll) return;
    if (highlighterRef.current) {
      setTimeout(() => {
        highlighterRef.current?.scrollTo(0, highlighterRef.current.scrollHeight);
      }, 0);
    }
  }, [formattedCode, autoScroll]);

  return (
    <div
      ref={highlighterRef}
      style={{
        borderRadius: '8px',
        flex: "1",
        overflow: "auto",
        ...props.style
      }}
    >
      <SyntaxHighlighter
        wrapLines={true}
        customStyle={{
          borderRadius: '8px',
          margin: 0,
          // scrollbarWidth: "none",
          // background: "transparent",
        }}
        language={language}
        style={isDarkTheme ? atomDark : coldarkCold}
        children={formattedCode}
      >
      </SyntaxHighlighter>
    </div>
  )
}

export default React.memo(Highlighter)