import { useMemo } from 'react'
import { Select } from 'antd'

import { useMainStore, useSlidesStore } from '@/ppt/store'
import type { SlideLabelType, ShapeText, PPTShapeElement } from '@/ppt/core'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import MoveablePanel from '@/components/MoveablePanel'
import styles from './MarkupPanel.module.scss'
import { useShallow } from "zustand/react/shallow";

interface SelectOption<T> {
  label: string
  value: T | ''
}

export default function MarkupPanel() {
  // const currentSlide = useSlidesStore((state) => state.getCurrentSlide())
  // const updateSlide = useSlidesStore((state) => state.updateSlide)
  // const removeSlideProps = useSlidesStore((state) => state.removeSlideProps)
  // const updateElement = useSlidesStore((state) => state.updateElement)
  // const removeElementProps = useSlidesStore((state) => state.removeElementProps)

  const {
    currentSlide,
    updateSlide,
    removeSlideProps,
    updateElement,
    removeElementProps,
  } = useSlidesStore(useShallow(
    (state) => ({
      currentSlide: state.getCurrentSlide(),
      updateSlide: state.updateSlide,
      removeSlideProps: state.removeSlideProps,
      updateElement: state.updateElement,
      removeElementProps: state.removeElementProps,
    })
  ))


  // const setShowMarkupPanel = useMainStore((state) => state.setShowMarkupPanel)
  // const handleElementId = useMainStore((state) => state.handleElementId)
  const { setShowMarkupPanel, handleElementId } = useMainStore(
    useShallow((state) => ({
      setShowMarkupPanel: state.setShowMarkupPanel,
      handleElementId: state.handleElementId,
    }))
  )
  const { handleElement } = useActiveElementList()

  const slideTypeOptions = useMemo<SelectOption<SlideLabelType>[]>(() => [
    { label: '未标记类型', value: '' },
    { label: '封面页', value: 'cover' },
    { label: '目录页', value: 'contents' },
    { label: '过渡页', value: 'transition' },
    { label: '内容页', value: 'content' },
    { label: '结束页', value: 'end' },
  ], [])

  const textTypeOptions = useMemo<SelectOption<SlideLabelType>[]>(() => [
    { label: '未标记类型', value: '' },
    { label: '标题', value: 'title' },
    { label: '副标题', value: 'subtitle' },
    { label: '正文', value: 'content' },
    { label: '列表项目', value: 'item' },
    { label: '列表项标题', value: 'itemTitle' },
    { label: '注释', value: 'notes' },
    { label: '页眉', value: 'header' },
    { label: '页脚', value: 'footer' },
    { label: '节编号', value: 'partNumber' },
    { label: '项目编号', value: 'itemNumber' },
  ], [])

  const imageTypeOptions = useMemo<SelectOption<SlideLabelType>[]>(() => [
    { label: '未标记类型', value: '' },
    { label: '页面插图', value: 'pageFigure' },
    { label: '项目插图', value: 'itemFigure' },
    { label: '背景图', value: 'background' },
  ], [])

  const slideType = currentSlide?.type || ''
  const textType = useMemo(() => {
    if (!handleElement) return ''
    if (handleElement.type === 'text') return handleElement.labelType || ''
    if (handleElement.type === 'shape' && handleElement.text) return handleElement.labelType || ''
    return ''
  }, [handleElement])
  const imageType = useMemo(() => {
    if (!handleElement) return ''
    if (handleElement.type === 'image') return handleElement.labelType || ''
    return ''
  }, [handleElement])

  const updateSlideType = (type: SlideLabelType | '') => {
    if (!currentSlide) return
    if (type) updateSlide({ type })
    else {
      removeSlideProps({
        id: currentSlide.id,
        propName: 'type',
      })
    }
  }

  const updateElementType = (type: SlideLabelType | '') => {
    if (!handleElement) return
    if (handleElement.type === 'image') {
      if (type) {
        updateElement({ id: handleElementId, props: { labelType: type as SlideLabelType } })
      } else {
        removeElementProps({
          id: handleElementId,
          propName: 'imageType',
        })
      }
    }
    if (handleElement.type === 'text') {
      if (type) {
        updateElement({ id: handleElementId, props: { labelType: type as SlideLabelType } })
      } else {
        removeElementProps({
          id: handleElementId,
          propName: 'textType',
        })
      }
    }
    if (handleElement.type === 'shape') {
      const text = handleElement.text
      if (!text) return

      if (type) {
        updateElement({
          id: handleElementId,
          props: {
            ...handleElement, text: {
              ...text,

            },
            labelType: type as SlideLabelType
          },
        })
      } else {
        const { labelType: _removed, ...rest } = handleElement;
        updateElement({
          id: handleElementId,
          props: { ...rest },
        })
      }
    }
  }

  return (
    <MoveablePanel
      className={styles['notes-panel']}
      width={300}
      height={130}
      title="幻灯片类型标注"
      left={-270}
      top={90}
      onClose={() => setShowMarkupPanel(false)}
    >
      <div className={styles.container}>
        <div className={styles.row}>
          <div style={{ width: '40%' }}>当前页面类型：</div>
          <Select
            style={{ width: '60%' }}
            value={slideType}
            onChange={(value) => updateSlideType(value as SlideLabelType | '')}
            options={slideTypeOptions}
          />
        </div>
        {handleElement && (handleElement.type === 'text' || (handleElement.type === 'shape' && handleElement.text)) && (
          <div className={styles.row}>
            <div style={{ width: '40%' }}>当前文本类型：</div>
            <Select
              style={{ width: '60%' }}
              value={textType}
              onChange={(value) => updateElementType(value as SlideLabelType | '')}
              options={textTypeOptions}
            />
          </div>
        )}
        {handleElement && handleElement.type === 'image' && (
          <div className={styles.row}>
            <div style={{ width: '40%' }}>当前图片类型：</div>
            <Select
              style={{ width: '60%' }}
              value={imageType}
              onChange={(value) => updateElementType(value as SlideLabelType | '')}
              options={imageTypeOptions}
            />
          </div>
        )}
        {!handleElement && (
          <div className={styles.placeholder}>选中图片、文字、带文字的形状，标记类型</div>
        )}
      </div>
    </MoveablePanel>
  )
}
