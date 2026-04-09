import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Input, Modal, Tabs, message } from 'antd'
import type { TextAreaRef } from 'antd/es/input/TextArea'
import { FORMULA_LIST, SYMBOL_LIST } from '@/ppt/configs/latex'
import { measureLatex } from '@/ppt/utils/latex-utils'
import { latexToMathML, measureMathML } from '@/ppt/utils/mathlive'

const LATEX_TABS = [
  { key: 'symbol', label: '常用符号' },
  { key: 'formula', label: '预置公式' },
] as const

const SYMBOL_TABS = SYMBOL_LIST.map((item) => ({
  key: item.type,
  label: item.label,
}))

export interface MathFormulaResult {
  latex: string
  mathML: string
  width: number
  height: number
  viewBox?: [number, number]
  path?: string
}

interface MathFormulaEditorModalProps {
  open: boolean
  initialLatex?: string
  onCancel: () => void
  onConfirm: (result: MathFormulaResult) => void
}

const LatexPreview: React.FC<{
  latex: string
  maxWidth?: number
  maxHeight?: number
  showBorder?: boolean
}> = ({ latex, maxWidth = 518, maxHeight = 160, showBorder = true }) => {
  const data = useMemo(() => measureLatex(latex), [latex])
  if (!latex.trim()) {
    return (
      <div
        style={{
          width: maxWidth,
          height: maxHeight,
          border: showBorder ? '1px dashed #ddd' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          borderRadius: 4,
        }}
      >
        公式预览
      </div>
    )
  }
  if (!data) {
    return (
      <div
        style={{
          width: maxWidth,
          height: maxHeight,
          border: showBorder ? '1px solid #f5222d' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f5222d',
          borderRadius: 4,
        }}
      >
        解析失败
      </div>
    )
  }
  return (
    <div
      style={{
        width: maxWidth,
        height: maxHeight,
        border: showBorder ? '1px solid #ddd' : 'none',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 4,
      }}
    >
      <div
        style={{
          width: data.width,
          height: data.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${Math.min(maxWidth / (data.width || 1), maxHeight / (data.height || 1), 1)})`,
          transformOrigin: 'center center',
        }}
        dangerouslySetInnerHTML={{ __html: data.svg }}
      />
    </div>
  )
}

export const MathFormulaEditorModal: React.FC<MathFormulaEditorModalProps> = ({
  open,
  initialLatex = '',
  onCancel,
  onConfirm,
}) => {
  const [latexValue, setLatexValue] = useState(initialLatex)
  const [activeTab, setActiveTab] = useState<(typeof LATEX_TABS)[number]['key']>('symbol')
  const [symbolTab, setSymbolTab] = useState<string>(SYMBOL_TABS[0]?.key || '')
  const textAreaRef = useRef<TextAreaRef>(null)

  useEffect(() => {
    if (!open) return
    setLatexValue(initialLatex || '')
  }, [open, initialLatex])

  const symbolPool = useMemo(() => {
    const found = SYMBOL_LIST.find((item) => item.type === symbolTab) || SYMBOL_LIST[0]
    return found?.children || []
  }, [symbolTab])

  const insertSymbol = useCallback((content: string) => {
    const textarea = textAreaRef.current?.resizableTextArea?.textArea
    if (!textarea) return
    textarea.focus()
    const start = textarea.selectionStart ?? latexValue.length
    const end = textarea.selectionEnd ?? latexValue.length
    const next = `${latexValue.slice(0, start)}${content}${latexValue.slice(end)}`
    setLatexValue(next)
    requestAnimationFrame(() => {
      const cursor = start + content.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }, [latexValue])

  const handleFormulaSelect = useCallback((value: string) => {
    setLatexValue(value)
  }, [])

  const handleConfirm = useCallback(async () => {
    const latex = latexValue.trim()
    if (!latex) {
      message.error('公式不能为空')
      return
    }
    const mathML = await latexToMathML(latex)
    if (!mathML.trim()) {
      message.error('公式解析失败')
      return
    }
    const mathSize = await measureMathML(mathML)
    const latexSize = measureLatex(latex)
    if (!mathSize && !latexSize) {
      message.error('公式解析失败')
      return
    }
    const width = Math.max(mathSize?.width || latexSize?.width || 80, 80)
    const height = Math.max(mathSize?.height || latexSize?.height || 60, 60)
    onConfirm({
      latex,
      mathML,
      width,
      height,
      viewBox: latexSize?.viewBox,
      path: latexSize?.path,
    })
  }, [latexValue, onConfirm])

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      width={880}
      okText="确定"
      cancelText="取消"
      destroyOnHidden
    >
      <div style={{ display: 'flex', height: 560 }}>
        <div style={{ width: 540, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <Input.TextArea
              ref={textAreaRef}
              value={latexValue}
              onChange={(e) => setLatexValue(e.target.value)}
              placeholder="输入 LaTeX 公式"
              style={{ height: '100%', resize: 'none' }}
            />
          </div>
          <div style={{ marginTop: 20 }}>
            <LatexPreview latex={latexValue} maxWidth={534} maxHeight={160} />
          </div>
        </div>
        <div style={{ width: 280, marginLeft: 20, display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
          <Tabs
            size="small"
            items={LATEX_TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as typeof activeTab)}
            type="card"
          />
          <div style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'symbol' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Tabs
                  size="small"
                  items={SYMBOL_TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
                  activeKey={symbolTab}
                  onChange={setSymbolTab}
                  style={{ margin: '8px 8px 0' }}
                />
                <div
                  style={{
                    flex: 1,
                    padding: 12,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    overflow: 'auto',
                  }}
                >
                  {symbolPool.map((item) => (
                    <div
                      key={item.latex}
                      onClick={() => insertSymbol(item.latex)}
                      style={{
                        width: 60,
                        height: 44,
                        border: '1px solid #eee',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      <LatexPreview latex={item.latex} maxWidth={50} maxHeight={32} showBorder={false} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
                {FORMULA_LIST.map((item) => (
                  <div key={item.label} style={{ border: '1px solid #eee', borderRadius: 4 }}>
                    <div style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                      {item.label}
                    </div>
                    <div
                      style={{ padding: 8, cursor: 'pointer' }}
                      onClick={() => handleFormulaSelect(item.latex)}
                    >
                      <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LatexPreview latex={item.latex} maxWidth={220} maxHeight={52} showBorder={false} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default MathFormulaEditorModal
