import { useMemo } from 'react'
import { EditorMode, type PPTElement } from '@/ppt/core'
import type { ContextmenuItem } from '@/ppt/classic/components/Contextmenu/types'
import { ElementOrderCommands, ElementAlignCommands } from '@/ppt/types/edit'

import useLockElement from '@/ppt/hooks/useLockElement'
import useDeleteElement from '@/ppt/hooks/useDeleteElement'
import useCombineElement from '@/ppt/hooks/useCombineElement'
import useOrderElement from '@/ppt/hooks/useOrderElement'
import useAlignElementToCanvas from '@/ppt/hooks/useAlignElementToCanvas'
import useCopyAndPasteElement from '@/ppt/hooks/useCopyAndPasteElement'
import useSelectElement from '@/ppt/hooks/useSelectElement'

import ImageElement from '@/ppt/classic/components/element/ImageElement'
import TextElement from '@/ppt/classic/components/element/TextElement/TextElement'
import ShapeElement from '@/ppt/classic/components/element/ShapeElement'
import LineElement from '@/ppt/classic/components/element/LineElement'
import ChartElement from '@/ppt/classic/components/element/ChartElement'
import TableElement from '@/ppt/classic/components/element/TableElement'
import MathElement from '@/ppt/classic/components/element/MathElement'
import VideoElement from '@/ppt/classic/components/element/VideoElement'
import AudioElement from '@/ppt/classic/components/element/AudioElement/AudioElement'
import { useMainStore } from '@/ppt/store/useMainStore'

interface EditableElementProps {
  elementInfo: PPTElement
  elementIndex: number
  isMultiSelect: boolean
  selectElement: (e: MouseEvent | TouchEvent, element: PPTElement, canMove?: boolean) => void
  openLinkDialog: () => void
}

export default function EditableElement({
  elementInfo,
  elementIndex,
  isMultiSelect,
  selectElement,
  openLinkDialog,
}: EditableElementProps) {
  const currentElementComponent = useMemo(() => {
    const elementTypeMap: Record<string, React.ComponentType<any>> = {
      image: ImageElement,
      text: TextElement,
      shape: ShapeElement,
      line: LineElement,
      chart: ChartElement,
      table: TableElement,
      latex: MathElement,
      math: MathElement,
      video: VideoElement,
      audio: AudioElement,
    }
    return elementTypeMap[elementInfo.type] || null
  }, [elementInfo.type])

  const { orderElement } = useOrderElement()
  const { alignElementToCanvas } = useAlignElementToCanvas()
  const { combineElements, uncombineElements } = useCombineElement()
  const { deleteElement } = useDeleteElement()
  const { lockElement, unlockElement } = useLockElement()
  const { copyElement, pasteElement, cutElement } = useCopyAndPasteElement()
  const { selectAllElements } = useSelectElement()
  const readOnly = useMainStore((state) => state.mode !== EditorMode.EDIT)

  const contextmenus = useMemo((): ContextmenuItem[] => {
    if (readOnly) return []
    if (elementInfo.lock) {
      return [
        {
          text: '解锁',
          handler: () => unlockElement(elementInfo as any),
        },
      ]
    }

    return [
      {
        text: '剪切',
        subText: 'Ctrl + X',
        handler: cutElement,
      },
      {
        text: '复制',
        subText: 'Ctrl + C',
        handler: copyElement,
      },
      {
        text: '粘贴',
        subText: 'Ctrl + V',
        handler: pasteElement,
      },
      { divider: true },
      {
        text: '水平居中',
        handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
        children: [
          { text: '水平垂直居中', handler: () => alignElementToCanvas(ElementAlignCommands.CENTER) },
          { text: '水平居中', handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL) },
          { text: '左对齐', handler: () => alignElementToCanvas(ElementAlignCommands.LEFT) },
          { text: '右对齐', handler: () => alignElementToCanvas(ElementAlignCommands.RIGHT) },
        ],
      },
      {
        text: '垂直居中',
        handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
        children: [
          { text: '水平垂直居中', handler: () => alignElementToCanvas(ElementAlignCommands.CENTER) },
          { text: '垂直居中', handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL) },
          { text: '顶部对齐', handler: () => alignElementToCanvas(ElementAlignCommands.TOP) },
          { text: '底部对齐', handler: () => alignElementToCanvas(ElementAlignCommands.BOTTOM) },
        ],
      },
      { divider: true },
      {
        text: '置于顶层',
        disable: isMultiSelect && !elementInfo.groupId,
        handler: () => orderElement(elementInfo as any, ElementOrderCommands.TOP),
        children: [
          { text: '置于顶层', handler: () => orderElement(elementInfo as any, ElementOrderCommands.TOP) },
          { text: '上移一层', handler: () => orderElement(elementInfo as any, ElementOrderCommands.UP) },
        ],
      },
      {
        text: '置于底层',
        disable: isMultiSelect && !elementInfo.groupId,
        handler: () => orderElement(elementInfo as any, ElementOrderCommands.BOTTOM),
        children: [
          { text: '置于底层', handler: () => orderElement(elementInfo as any, ElementOrderCommands.BOTTOM) },
          { text: '下移一层', handler: () => orderElement(elementInfo as any, ElementOrderCommands.DOWN) },
        ],
      },
      { divider: true },
      {
        text: '设置链接',
        handler: openLinkDialog,
      },
      {
        text: elementInfo.groupId ? '取消组合' : '组合',
        subText: 'Ctrl + G',
        handler: elementInfo.groupId ? uncombineElements : combineElements,
        hide: !isMultiSelect,
      },
      {
        text: '全选',
        subText: 'Ctrl + A',
        handler: selectAllElements,
      },
      {
        text: '锁定',
        subText: 'Ctrl + L',
        handler: lockElement,
      },
      {
        text: '删除',
        subText: 'Delete',
        handler: deleteElement,
      },
    ]
  }, [
    alignElementToCanvas,
    combineElements,
    copyElement,
    cutElement,
    deleteElement,
    elementInfo,
    isMultiSelect,
    lockElement,
    openLinkDialog,
    orderElement,
    pasteElement,
    selectAllElements,
    uncombineElements,
    unlockElement,
    readOnly,
  ])

  const CurrentElement = currentElementComponent
  if (!CurrentElement) return null

  return (
    <div
      className="editable-element"
      id={`editable-element-${elementInfo.id}`}
      style={{ zIndex: elementIndex }}
    >
      <CurrentElement
        elementInfo={elementInfo as any}
        selectElement={selectElement}
        contextmenus={() => contextmenus}
      />
    </div>
  )
}
