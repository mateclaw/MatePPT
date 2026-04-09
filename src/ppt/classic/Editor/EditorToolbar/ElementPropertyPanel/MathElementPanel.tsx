import React, { useEffect, useState } from 'react'
import { Button, Divider, InputNumber } from 'antd'
import { Icon } from 'umi'
import { useMemoizedFn, useThrottleFn } from 'ahooks'

import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import { emitter, EmitterEvents } from '@/ppt/utils/emitter'
import { mathMLToLatex } from '@/ppt/utils/mathlive'
import type { PPTMathElement } from '@/ppt/core'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import type { MathFormulaResult } from '@/ppt/classic/Editor/MathFormulaEditorModal'
import MathFormulaEditorModal from '@/ppt/classic/Editor/MathFormulaEditorModal'
import { PositionPanel } from './common/PositionPanel'
import ContentWrapper from './common/ContentWrapper'
import ElementOpacity from './common/ElementOpacity'
import ColorButton from './common/ColorButton'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import styles from './MathElementPanel.module.scss'

interface MathElementPanelProps { }

export const MathElementPanel: React.FC<MathElementPanelProps> = () => {
  const slidesStore = useSlidesStore()
  const theme = useSlidesStore((state) => state.theme)
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const handleMathElement = handleElement as PPTMathElement | null
  const [latexEditorVisible, setLatexEditorVisible] = useState(false)
  const [latexValue, setLatexValue] = useState('')

  useEffect(() => {
    if (!handleMathElement) return
    if (handleMathElement.mathML) {
      setLatexValue('')
      return
    }
    setLatexValue(handleMathElement.latex || '')
  }, [handleMathElement?.id, handleMathElement?.latex, handleMathElement?.mathML])

  const openLatexEditor = useMemoizedFn(() => {
    if (!handleMathElement) return
    setLatexEditorVisible(true)
  })

  useEffect(() => {
    if (!latexEditorVisible) return
    let cancelled = false
    const initLatex = async () => {
      if (!handleMathElement) return
      if (handleMathElement.mathML) {
        try {
          const latex = await mathMLToLatex(handleMathElement.mathML)
          if (!cancelled) {
            setLatexValue(latex || handleMathElement.latex || '')
          }
          return
        } catch (error) {
          console.warn('[mathlive] MathML 转 LaTeX 失败:', error)
        }
      }
      setLatexValue(handleMathElement.latex || '')
    }
    initLatex()
    return () => {
      cancelled = true
    }
  }, [latexEditorVisible, handleMathElement?.id])

  useEffect(() => {
    emitter.on(EmitterEvents.OPEN_LATEX_EDITOR, openLatexEditor)
    return () => {
      emitter.off(EmitterEvents.OPEN_LATEX_EDITOR, openLatexEditor)
    }
  }, [openLatexEditor])

  if (!handleMathElement) return null

  const updateLatex = (props: Partial<PPTMathElement>) => {
    slidesStore.updateElement({ id: handleMathElement.id, props })
    addHistorySnapshot()
  }

  const handleFormulaConfirm = (result: MathFormulaResult) => {
    updateLatex({
      latex: result.latex,
      mathML: result.mathML,
      width: Math.max(result.width || handleMathElement.width || 80, 80),
      height: Math.max(result.height || handleMathElement.height || 60, 60),
      ...(result.path ? { path: result.path } : {}),
      ...(result.viewBox ? { viewBox: result.viewBox } : {}),
    })
    setLatexEditorVisible(false)
  }

  const handleColorChange = useThrottleFn((color: PPTColor) => {
    updateLatex({ color })
  }, { wait: 200 }).run

  const isLocked = !!handleMathElement.lock

  return (
    <div>
      <PositionPanel />
      <Divider size="small" />
      <ContentWrapper title="公式">
        <div className={styles.row}>
          <Button style={{ flex: 1 }} onClick={openLatexEditor} disabled={isLocked}>
            <Icon icon="ri:edit-line" /> 编辑公式
          </Button>
        </div>

        <div className={styles.row}>
            <div className={styles.label}>颜色：</div>
            <div className={styles.control}>
              <PPTColorPicker
                value={handleMathElement.color || theme.themeColors?.dk1}
                onChange={handleColorChange}
                disabled={isLocked}
              >
                <div>
                  <ColorButton color={resolvePPTColorValue(handleMathElement.color) || theme.themeColors?.dk1} />
                </div>
              </PPTColorPicker>
            </div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>粗细：</div>
          <div className={styles.control}>
            <InputNumber
              size="small"
              min={0.5}
              max={6}
              step={0.5}
              value={handleMathElement.strokeWidth || 1}
              onChange={(value) => updateLatex({ strokeWidth: Number(value || 1) })}
              style={{ width: '100%' }}
              disabled={isLocked}
            />
          </div>
        </div>

      </ContentWrapper>
      <Divider size="small" />
      <ContentWrapper>
        <ElementOpacity />
      </ContentWrapper>

      <MathFormulaEditorModal
        open={latexEditorVisible}
        initialLatex={latexValue}
        onCancel={() => setLatexEditorVisible(false)}
        onConfirm={handleFormulaConfirm}
      />
    </div>
  )
}

export default MathElementPanel
