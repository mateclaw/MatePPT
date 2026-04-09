import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties } from 'react'
import { debounce } from 'lodash'
import { Popover } from 'antd'
import { Icon } from 'umi'
import type { EditorView } from 'prosemirror-view'
import { DOMSerializer } from 'prosemirror-model'
import { toggleMark } from 'prosemirror-commands'

import { useMainStore } from '@/ppt/store'
import { initProsemirrorEditor, createDocument } from '@/ppt/utils/prosemirror'
import { addMark, autoSelectAll, getTextAttrs, type TextAttrs } from '@/ppt/utils/prosemirror/utils'
import { toggleList } from '@/ppt/utils/prosemirror/commands/toggleList'
import { PPTColor, type Transform as PPTColorTransform } from '@/ppt/core/entity/presentation/PPTColor'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import '@/ppt/styles/prosemirror.scss'
import styles from './Editor.module.scss'

interface RemarkEditorProps {
  value: string
  onUpdate: (value: string) => void
}

export interface RemarkEditorRef {
  updateTextContent: () => void
}

const RemarkEditor = forwardRef<RemarkEditorRef, RemarkEditorProps>(({ value, onUpdate }, ref) => {
  const setDisableHotkeys = useMainStore((state) => state.setDisableHotkeys)

  const editorWrapRef = useRef<HTMLDivElement | null>(null)
  const editorViewRef = useRef<EditorView | null>(null)
  const editorViewDomRef = useRef<HTMLDivElement | null>(null)
  const menuAnchorRef = useRef<HTMLSpanElement | null>(null)

  const [attrs, setAttrs] = useState<TextAttrs>()
  const [menuVisible, setMenuVisible] = useState(false)
  const [anchorStyle, setAnchorStyle] = useState<CSSProperties>()

  const serializeTransforms = (transforms?: string | PPTColorTransform[] | null) => {
    if (!transforms) return undefined
    if (typeof transforms === 'string') return transforms
    if (!Array.isArray(transforms) || transforms.length === 0) return undefined
    return transforms.map((item) => `${item.type}:${item.value}`).join(';')
  }

  const resolveColorAttr = (value: any) => {
    if (!value) return null
    if (typeof value === 'string') return { color: value }
    if (typeof value === 'object') {
      const color = value.color ?? value.value ?? ''
      const scheme = value.scheme
      const transforms = serializeTransforms(value.transforms)
      return { color, scheme, transforms }
    }
    return null
  }

  const hideMenuInstance = () => {
    setMenuVisible(false)
  }

  const handleInput = useMemo(() => {
    return debounce(() => {
      if (!editorViewRef.current) return
      const serializer = DOMSerializer.fromSchema(editorViewRef.current.state.schema)
      const fragment = serializer.serializeFragment(editorViewRef.current.state.doc.content)
      const container = document.createElement('div')
      container.appendChild(fragment)
      onUpdate(container.innerHTML)
    }, 300)
  }, [onUpdate])

  const handleFocus = () => {
    setDisableHotkeys(true)
  }

  const handleBlur = () => {
    setDisableHotkeys(false)
  }

  const updateTextContent = () => {
    if (!editorViewRef.current) return
    const { doc, tr } = editorViewRef.current.state
    editorViewRef.current.dispatch(
      tr.replaceRangeWith(0, doc.content.size, createDocument(value))
    )
  }

  const handleMouseup = () => {
    const selection = window.getSelection()
    if (
      !selection ||
      !selection.anchorNode ||
      !selection.focusNode ||
      selection.isCollapsed ||
      selection.type === 'Caret' ||
      selection.type === 'None'
    ) {
      return
    }

    if (!editorViewRef.current || !editorWrapRef.current) return
    const range = selection.getRangeAt(0)
    setAttrs(getTextAttrs(editorViewRef.current))

    const wrapRect = editorWrapRef.current.getBoundingClientRect()
    const { left, top } = range.getBoundingClientRect()
    setAnchorStyle({
      position: 'absolute',
      left: left - wrapRect.left,
      top: top - wrapRect.top,
      width: 0,
      height: 0,
      pointerEvents: 'none',
    })
    setMenuVisible(true)
  }

  const execCommand = (command: string, value?: any) => {
    if (!editorViewRef.current) return
    const editorView = editorViewRef.current

    if (command === 'color' && value) {
      const colorAttr = resolveColorAttr(value)
      if (!colorAttr) return
      const mark = editorView.state.schema.marks.forecolor.create(colorAttr)
      autoSelectAll(editorView)
      {
        const { $from, $to } = editorView.state.selection
        editorView.dispatch(editorView.state.tr.removeMark($from.pos, $to.pos, editorView.state.schema.marks.forecolor))
      }
      addMark(editorView, mark)
    }
    else if (command === 'backcolor' && value) {
      const mark = editorView.state.schema.marks.backcolor.create({ backcolor: value })
      autoSelectAll(editorView)
      addMark(editorView, mark)
    }
    else if (command === 'bold') {
      autoSelectAll(editorView)
      toggleMark(editorView.state.schema.marks.strong)(editorView.state, editorView.dispatch)
    }
    else if (command === 'em') {
      autoSelectAll(editorView)
      toggleMark(editorView.state.schema.marks.em)(editorView.state, editorView.dispatch)
    }
    else if (command === 'underline') {
      autoSelectAll(editorView)
      toggleMark(editorView.state.schema.marks.underline)(editorView.state, editorView.dispatch)
    }
    else if (command === 'strikethrough') {
      autoSelectAll(editorView)
      toggleMark(editorView.state.schema.marks.strikethrough)(editorView.state, editorView.dispatch)
    }
    else if (command === 'bulletList') {
      const { bullet_list: bulletList, list_item: listItem } = editorView.state.schema.nodes
      toggleList(bulletList, listItem, '')(editorView.state, editorView.dispatch)
    }
    else if (command === 'orderedList') {
      const { ordered_list: orderedList, list_item: listItem } = editorView.state.schema.nodes
      toggleList(orderedList, listItem, '')(editorView.state, editorView.dispatch)
    }
    else if (command === 'clear') {
      autoSelectAll(editorView)
      const { $from, $to } = editorView.state.selection
      editorView.dispatch(editorView.state.tr.removeMark($from.pos, $to.pos))
    }

    editorView.focus()
    handleInput()
    setAttrs(getTextAttrs(editorView))
  }

  useEffect(() => {
    if (!editorViewDomRef.current) return
    const editor = initProsemirrorEditor(
      editorViewDomRef.current,
      value,
      {
        handleDOMEvents: {
          focus: () => {
            handleFocus()
            return false
          },
          blur: () => {
            handleBlur()
            return false
          },
          mouseup: () => {
            handleMouseup()
            return false
          },
          mousedown: () => {
            window.getSelection()?.removeAllRanges()
            hideMenuInstance()
            return false
          },
          keydown: () => {
            hideMenuInstance()
            return false
          },
          input: () => {
            handleInput()
            return false
          },
        },
      },
      { placeholder: '点击输入演讲者备注' }
    )

    editorViewRef.current = editor

    return () => {
      editor.destroy()
      handleInput.cancel()
    }
  }, [handleInput, value])

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (!editorWrapRef.current) return
      if (editorWrapRef.current.contains(target)) return
      hideMenuInstance()
    }
    document.addEventListener('mousedown', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    updateTextContent,
  }))

  const handleColorChange = (color: PPTColor) => {
    execCommand('color', color as any)
  }

  const handleBackcolorChange = (color: PPTColor) => {
    const resolved = resolvePPTColorValue(color)
    execCommand('backcolor', resolved)
  }

  const menuContent = (
    <div className={styles.menu}>
      <button
        className={`${styles.btn} ${attrs?.bold ? styles.active : ''}`}
        onClick={() => execCommand('bold')}
      >
        <Icon icon="ri:bold" />
      </button>
      <button
        className={`${styles.btn} ${attrs?.em ? styles.active : ''}`}
        onClick={() => execCommand('em')}
      >
        <Icon icon="ri:italic" />
      </button>
      <button
        className={`${styles.btn} ${attrs?.underline ? styles.active : ''}`}
        onClick={() => execCommand('underline')}
      >
        <Icon icon="ri:underline" />
      </button>
      <button
        className={`${styles.btn} ${attrs?.strikethrough ? styles.active : ''}`}
        onClick={() => execCommand('strikethrough')}
      >
        <Icon icon="ri:strikethrough" />
      </button>
      <PPTColorPicker value={attrs?.color} onChange={handleColorChange}>
        <button className={styles.btn}>
          <Icon icon="ri:font-color" />
        </button>
      </PPTColorPicker>
      <PPTColorPicker value={attrs?.backcolor} onChange={handleBackcolorChange}>
        <button className={styles.btn}>
          <Icon icon="ri:mark-pen-line" />
        </button>
      </PPTColorPicker>
      <button
        className={`${styles.btn} ${attrs?.bulletList ? styles.active : ''}`}
        onClick={() => execCommand('bulletList')}
      >
        <Icon icon="ri:list-unordered" />
      </button>
      <button
        className={`${styles.btn} ${attrs?.orderedList ? styles.active : ''}`}
        onClick={() => execCommand('orderedList')}
      >
        <Icon icon="ri:list-ordered" />
      </button>
      <button className={styles.btn} onClick={() => execCommand('clear')}>
        <Icon icon="ri:format-clear" />
      </button>
    </div>
  )

  return (
    <div className={styles.editor} ref={editorWrapRef}>
      <div className={styles['prosemirror-editor']} ref={editorViewDomRef} />
      <Popover
        open={menuVisible}
        placement="topLeft"
        trigger="click"
        content={menuContent}
        getPopupContainer={() => editorWrapRef.current ?? document.body}
      >
        <span ref={menuAnchorRef} style={anchorStyle} />
      </Popover>
    </div>
  )
})

RemarkEditor.displayName = 'RemarkEditor'

export default RemarkEditor
