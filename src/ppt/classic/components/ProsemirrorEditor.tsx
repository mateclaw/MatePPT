/**
 * ProseMirror 富文本编辑器 React 组件
 * 基于 Vue 版本逻辑重写，保留命令、格式刷与 attrs 同步行为
 */

import React, { useEffect, useMemo, useRef, useImperativeHandle } from 'react'
import { debounce } from 'lodash'
import { useMemoizedFn } from 'ahooks'
import type { EditorView } from 'prosemirror-view'
import type { Selection } from 'prosemirror-state'
import { DOMSerializer } from 'prosemirror-model'
import { toggleMark, wrapIn, lift } from 'prosemirror-commands'
import { initProsemirrorEditor, createDocument } from '@/ppt/utils/prosemirror'
import {
  isActiveOfParentNodeType,
  findNodesWithSameMark,
  getTextAttrs,
  autoSelectAll,
  addMark,
  markActive,
  getFontsize,
} from '@/ppt/utils/prosemirror/utils'
import { alignmentCommand } from '@/ppt/utils/prosemirror/commands/setTextAlign'
import { indentCommand, textIndentCommand } from '@/ppt/utils/prosemirror/commands/setTextIndent'
import { toggleList } from '@/ppt/utils/prosemirror/commands/toggleList'
import { setListStyle } from '@/ppt/utils/prosemirror/commands/setListStyle'
import { replaceText } from '@/ppt/utils/prosemirror/commands/replaceText'
// import message from '@/ppt/utils/message'
import { KEYS } from '@/ppt/configs/hotkey'
import { emitter, EmitterEvents, type RichTextAction, type RichTextCommand } from '@/ppt/utils/emitter'
import { useMainStore } from '@/ppt/store/useMainStore'
import { useCtrlOrShiftActive } from '@/ppt/store/useKeyboardStore'
import  '@/ppt/styles/prosemirror.scss'
import { App } from 'antd'
import type { Transform as PPTColorTransform } from '@/ppt/core/entity/presentation/PPTColor'

const normalizeFontSizeValue = (value?: string | number) => {
  if (value === undefined || value === null) return ''
  if (typeof value === 'number') return `${value}px`
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`
  return trimmed
}

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

const serializeEditorHtml = (view: EditorView) => {
  const serializer = DOMSerializer.fromSchema(view.state.schema)
  const fragment = serializer.serializeFragment(view.state.doc.content)
  const container = document.createElement('div')
  container.appendChild(fragment)
  return container.innerHTML
}

const isStringValue = (value: unknown): value is string => typeof value === 'string'
const isStringOrNumber = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number'

interface ProsemirrorEditorProps {
  elementId: string
  value: string
  defaultColor: string
  defaultFontName: string
  editable?: boolean
  autoFocus?: boolean
  onUpdate?: (payload: { value: string; ignore: boolean }) => void
  onChange?: (content: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onAttrsChange?: (attrs: ReturnType<typeof getTextAttrs>) => void
  onMouseDown?: (e: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
}

export const ProsemirrorEditor = React.forwardRef<
  {
    focus: () => void
    getContent: () => string
    getSelectionText: () => string
    getTextContent: () => string
    insertText: (text: string) => void
    deleteSelectionOrAll: () => void
    setContent: (content: string) => void
    clear: () => void
  },
  ProsemirrorEditorProps
>(({
  elementId,
  value,
  defaultColor,
  defaultFontName,
  editable = false,
  autoFocus = false,
  onUpdate,
  onChange,
  onFocus,
  onBlur,
  onAttrsChange,
  onMouseDown,
  className,
  style,
}, ref) => {
  const handleElementId = useMainStore((state) => state.handleElementId)
  const activeElementIdList = useMainStore((state) => state.activeElementIdList)
  const richTextAttrs = useMainStore((state) => state.richTextAttrs)
  const textFormatPainter = useMainStore((state) => state.textFormatPainter)
  const setDisableHotkeys = useMainStore((state) => state.setDisableHotkeys)
  const setRichTextAttrs = useMainStore((state) => state.setRichTextAttrs)
  const setTextFormatPainter = useMainStore((state) => state.setTextFormatPainter)
  const ctrlOrShiftKeyActive = useCtrlOrShiftActive()


  const { message } = App.useApp()

  const editorViewRef = useRef<EditorView | null>(null)
  const editorViewDomRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef(value)
  const handleElementIdRef = useRef(handleElementId)
  const onUpdateRef = useRef(onUpdate)
  const onChangeRef = useRef(onChange)
  const lastSelectionRef = useRef<Selection | null>(null)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    handleElementIdRef.current = handleElementId
  }, [handleElementId])

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const handleInput = useMemo(() => {
    return debounce((isHandleHistory = false) => {
      if (!editorViewRef.current) return
      const html = serializeEditorHtml(editorViewRef.current)
      if (
        valueRef.current.replace(/ style=\"\"/g, '') ===
        html.replace(/ style=\"\"/g, '')
      ) {
        return
      }
      onUpdateRef.current?.({ value: html, ignore: isHandleHistory })
      onChangeRef.current?.(html)
    }, 300)
  }, [])

  const handleFocus = useMemoizedFn(() => {
    if (!ctrlOrShiftKeyActive || activeElementIdList.length <= 1) {
      setDisableHotkeys(true)
    }
    onFocus?.()
  })

  const handleBlur = useMemoizedFn(() => {
    setDisableHotkeys(false)
    onBlur?.()
  })

  const updateLastSelection = useMemoizedFn(() => {
    if (!editorViewRef.current) return
    lastSelectionRef.current = editorViewRef.current.state.selection
  })

  const handleClick = useMemo(() => {
    return debounce(() => {
      if (!editorViewRef.current) return
      updateLastSelection()
      const attrs = getTextAttrs(editorViewRef.current, {
        color: defaultColor,
        fontname: defaultFontName,
      })
      setRichTextAttrs(attrs)
      onAttrsChange?.(attrs)
    }, 30)
  }, [defaultColor, defaultFontName, onAttrsChange, setRichTextAttrs, updateLastSelection])

  const handleKeydown = useMemoizedFn((_: EditorView, e: KeyboardEvent) => {
    const { ctrlKey, shiftKey, metaKey } = e
    const ctrlActive = ctrlKey || shiftKey || metaKey
    const key = e.key.toUpperCase()
    const isHandleHistory = ctrlActive && (key === KEYS.Z || key === KEYS.Y)
    handleInput(isHandleHistory)
    updateLastSelection()
    handleClick()
    return false
  })

  const execCommand = useMemoizedFn(({ target, action }: RichTextCommand) => {
    if (!editorViewRef.current) return
    if (!target && handleElementIdRef.current !== elementId) return
    if (target && target !== elementId) return

    const editorView = editorViewRef.current
    const actions = 'command' in action ? [action] : action

    for (const item of actions) {
      if (item.command === 'fontname' && isStringValue(item.value)) {
        const mark = editorView.state.schema.marks.fontname.create({ fontname: item.value })
        autoSelectAll(editorView)
        addMark(editorView, mark)

        if (item.value && !document.fonts.check(`16px ${item.value}`)) {
          message.warning('字体需要等待加载下载后生效，请稍等')
        }
      }
      else if (item.command === 'fontsize' && isStringOrNumber(item.value)) {
        const fontsize = normalizeFontSizeValue(item.value)
        if (!fontsize) continue
        const mark = editorView.state.schema.marks.fontsize.create({ fontsize })
        autoSelectAll(editorView)
        addMark(editorView, mark)
        setListStyle(editorView, { key: 'fontsize', value: fontsize })
      }
      else if (item.command === 'fontsize-add') {
        const step = isStringOrNumber(item.value) ? +item.value : 2
        autoSelectAll(editorView)
        const fontsize = getFontsize(editorView) + step + 'px'
        const mark = editorView.state.schema.marks.fontsize.create({ fontsize })
        addMark(editorView, mark)
        setListStyle(editorView, { key: 'fontsize', value: fontsize })
      }
      else if (item.command === 'fontsize-reduce') {
        const step = isStringOrNumber(item.value) ? +item.value : 2
        autoSelectAll(editorView)
        let fontsize = getFontsize(editorView) - step
        if (fontsize < 12) fontsize = 12
        const mark = editorView.state.schema.marks.fontsize.create({ fontsize: fontsize + 'px' })
        addMark(editorView, mark)
        setListStyle(editorView, { key: 'fontsize', value: fontsize + 'px' })
      }
      else if (item.command === 'color' && item.value) {
        const value = item.value as any
        const colorAttr = resolveColorAttr(value)
        if (!colorAttr) continue
        const mark = editorView.state.schema.marks.forecolor.create(colorAttr)
        if (editorView.state.selection.empty && lastSelectionRef.current) {
          editorView.dispatch(editorView.state.tr.setSelection(lastSelectionRef.current))
        }
        autoSelectAll(editorView)
        {
          const { $from, $to } = editorView.state.selection
          editorView.dispatch(editorView.state.tr.removeMark($from.pos, $to.pos, editorView.state.schema.marks.forecolor))
        }
        addMark(editorView, mark)
        if (typeof value === 'string') {
          setListStyle(editorView, { key: 'color', value })
        } else if (value?.color) {
          setListStyle(editorView, { key: 'color', value: value.color })
        }
      }
      else if (item.command === 'backcolor' && isStringValue(item.value)) {
        const mark = editorView.state.schema.marks.backcolor.create({ backcolor: item.value })
        autoSelectAll(editorView)
        addMark(editorView, mark)
      }
      else if (item.command === 'bold') {
        autoSelectAll(editorView)
        toggleMark(editorView.state.schema.marks.strong)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'em') {
        autoSelectAll(editorView)
        toggleMark(editorView.state.schema.marks.em)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'underline') {
        autoSelectAll(editorView)
        toggleMark(editorView.state.schema.marks.underline)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'strikethrough') {
        autoSelectAll(editorView)
        toggleMark(editorView.state.schema.marks.strikethrough)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'subscript') {
        toggleMark(editorView.state.schema.marks.subscript)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'superscript') {
        toggleMark(editorView.state.schema.marks.superscript)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'blockquote') {
        const isBlockquote = isActiveOfParentNodeType('blockquote', editorView.state)
        if (isBlockquote) lift(editorView.state, editorView.dispatch)
        else wrapIn(editorView.state.schema.nodes.blockquote)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'code') {
        toggleMark(editorView.state.schema.marks.code)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'align' && isStringValue(item.value)) {
        alignmentCommand(editorView, item.value)
      }
      else if (item.command === 'indent' && isStringOrNumber(item.value)) {
        indentCommand(editorView, +item.value)
      }
      else if (item.command === 'textIndent' && isStringOrNumber(item.value)) {
        textIndentCommand(editorView, +item.value)
      }
      else if (item.command === 'bulletList') {
        const listStyleType = isStringValue(item.value) ? item.value : ''
        const { bullet_list: bulletList, list_item: listItem } = editorView.state.schema.nodes
        const textStyle = {
          color: richTextAttrs.color,
          fontsize: normalizeFontSizeValue(richTextAttrs.fontsize),
        }
        toggleList(bulletList, listItem, listStyleType, textStyle)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'orderedList') {
        const listStyleType = isStringValue(item.value) ? item.value : ''
        const { ordered_list: orderedList, list_item: listItem } = editorView.state.schema.nodes
        const textStyle = {
          color: richTextAttrs.color,
          fontsize: normalizeFontSizeValue(richTextAttrs.fontsize),
        }
        toggleList(orderedList, listItem, listStyleType, textStyle)(editorView.state, editorView.dispatch)
      }
      else if (item.command === 'clear') {
        autoSelectAll(editorView)
        const { $from, $to } = editorView.state.selection
        editorView.dispatch(editorView.state.tr.removeMark($from.pos, $to.pos))
        setListStyle(editorView, [
          { key: 'fontsize', value: '' },
          { key: 'color', value: '' },
        ])
      }
      else if (item.command === 'link') {
        const markType = editorView.state.schema.marks.link
        const { from, to } = editorView.state.selection
        const result = findNodesWithSameMark(editorView.state.doc, from, to, markType)
        if (result) {
          if (isStringValue(item.value)) {
            const mark = editorView.state.schema.marks.link.create({
              href: item.value,
              title: item.value,
            })
            addMark(editorView, mark, { from: result.from.pos, to: result.to.pos + 1 })
          }
          else {
            editorView.dispatch(
              editorView.state.tr.removeMark(result.from.pos, result.to.pos + 1, markType)
            )
          }
        }
        else if (markActive(editorView.state, markType)) {
          if (isStringValue(item.value)) {
            const mark = editorView.state.schema.marks.link.create({
              href: item.value,
              title: item.value,
            })
            addMark(editorView, mark)
          }
          else {
            toggleMark(markType)(editorView.state, editorView.dispatch)
          }
        }
        else if (isStringValue(item.value)) {
          autoSelectAll(editorView)
          toggleMark(markType, { href: item.value, title: item.value })(
            editorView.state,
            editorView.dispatch
          )
        }
      }
      else if (item.command === 'insert' && isStringValue(item.value)) {
        editorView.dispatch(editorView.state.tr.insertText(item.value))
      }
      else if (item.command === 'replace' && isStringValue(item.value)) {
        replaceText(editorView, item.value)
      }
    }

    editorView.focus()
    handleInput(false)
    handleInput.flush()
    handleClick()
    handleClick.flush()
  })

  const handleMouseup = useMemoizedFn(() => {
    updateLastSelection()
    if (!textFormatPainter) return
    const { keep, ...newProps } = textFormatPainter

    const actions: RichTextAction[] = [{ command: 'clear' }]
    for (const key of Object.keys(newProps) as Array<keyof typeof newProps>) {
      const command = key as string
      const value = textFormatPainter[key]
      if (value === true) actions.push({ command })
      else if (value) actions.push({ command, value })
    }
    execCommand({ action: actions })
    if (!keep) setTextFormatPainter(null)
  })

  useEffect(() => {
    if (!editorViewDomRef.current) return

    const editor = initProsemirrorEditor(
      editorViewDomRef.current,
      valueRef.current,
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
          keydown: handleKeydown,
          click: () => {
            handleClick()
            return false
          },
          mouseup: () => {
            handleMouseup()
            return false
          },
        },
        editable: () => editable,
      }
    )

    editorViewRef.current = editor

    if (autoFocus) {
      editor.focus()
    }

    emitter.on(EmitterEvents.RICH_TEXT_COMMAND, execCommand)
    const syncAttrsToStore = () => {
      if (!editorViewRef.current) return
      if (handleElementIdRef.current !== elementId) return
      handleClick()
    }
    emitter.on(EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE, syncAttrsToStore)

    return () => {
      emitter.off(EmitterEvents.RICH_TEXT_COMMAND, execCommand)
      emitter.off(EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE, syncAttrsToStore)
      editor.destroy()
      handleInput.cancel()
      handleClick.cancel()
    }
  }, [
    elementId,
    editable,
    autoFocus,
    execCommand,
    handleClick,
    handleFocus,
    handleInput,
    handleKeydown,
    handleMouseup,
    handleBlur,
  ])

  useEffect(() => {
    if (!editorViewRef.current) return
    if (editorViewRef.current.hasFocus()) return

    const { doc, tr } = editorViewRef.current.state
    editorViewRef.current.dispatch(
      tr.replaceRangeWith(0, doc.content.size, createDocument(value))
    )
  }, [value])

  useEffect(() => {
    if (!editorViewRef.current) return
    editorViewRef.current.setProps({ editable: () => editable })
  }, [editable])

  useImperativeHandle(ref, () => ({
    focus: () => editorViewRef.current?.focus(),
    getContent: () => editorViewRef.current?.dom.innerHTML || '',
    getSelectionText: () => {
      if (!editorViewRef.current) return ''
      const { state } = editorViewRef.current
      const { from, to, empty } = state.selection
      if (empty) return ''
      return state.doc.textBetween(from, to, '\n')
    },
    getTextContent: () => {
      if (!editorViewRef.current) return ''
      return editorViewRef.current.state.doc.textContent || ''
    },
    insertText: (text: string) => {
      if (!editorViewRef.current) return
      const { state, dispatch } = editorViewRef.current
      dispatch(state.tr.insertText(text))
      editorViewRef.current.focus()
      handleInput(false)
    },
    deleteSelectionOrAll: () => {
      if (!editorViewRef.current) return
      const { state, dispatch } = editorViewRef.current
      const { selection, doc } = state
      if (selection.empty) {
        dispatch(state.tr.delete(0, doc.content.size))
      } else {
        dispatch(state.tr.deleteSelection())
      }
      editorViewRef.current.focus()
      handleInput(false)
    },
    setContent: (content: string) => {
      if (!editorViewRef.current) return
      const { doc, tr } = editorViewRef.current.state
      editorViewRef.current.dispatch(
        tr.replaceRangeWith(0, doc.content.size, createDocument(content))
      )
    },
    clear: () => {
      if (!editorViewRef.current) return
      const { doc, tr } = editorViewRef.current.state
      editorViewRef.current.dispatch(tr.delete(0, doc.content.size))
    },
  }))

  return (
    <>
      <div
        ref={editorViewDomRef}
        className={`prosemirror-editor ${textFormatPainter ? 'format-painter' : ''} ${
          className || ''
        }`}
        style={{
          outline: 'none',
          cursor: 'text',
          ...style,
        }}
        onMouseDown={onMouseDown}
      />
      <style>{`
        .prosemirror-editor.format-painter {
          cursor: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcuMzUuMDEybC0uMDY2Ljk5OGE1LjI3MSA1LjI3MSAwIDAwLTEuMTg0LjA2IDMuOCAzLjggMCAwMC0uOTMzLjQ3MmMtLjQ0LjM1Ni0uNzgzLjgxMS0uOTk4IDEuMzI0bC4wMTgtLjAzNnY1LjEyaDEuMDR2Ljk4aC0xLjA0bC0uMDAyIDQuMTVjLjE4Ny40MjYuNDYuODEuNzkxIDEuMTE3bC4xNzUuMTUyYy4yOTMuMjA4LjYxNS4zNzMuODkuNDcyLjQxLjA4Mi44My4xMTIgMS4yNDkuMDlsLjA1Ny45OTlhNi4wNjMgNi4wNjMgMCAwMS0xLjU4OC0uMTI5IDQuODM2IDQuODM2IDAgMDEtMS4yNS0uNjQ3IDQuNDYzIDQuNDYzIDAgMDEtLjgzOC0uODgzYy0uMjI0LjMzMi0uNS42NDItLjgyNC45MjdhNC4xMSA0LjExIDAgMDEtMS4zMDUuNjMzQTYuMTI2IDYuMTI2IDAgMDEwIDE1LjkwOWwuMDY4LS45OTdjLjQyNC4wMjYuODUtLjAwMSAxLjIxNy0uMDcuMzM2LS4wOTkuNjUxLS4yNTQuODk0LS40My40My0uMzguNzY1LS44NDcuOTgyLTEuMzY4bC0uMDA1LjAxNFY4LjkzSDIuMTE1di0uOThoMS4wNFYyLjg2MmEzLjc3IDMuNzcgMCAwMC0uNzc0LTEuMTY3bC0uMTY1LS4xNTZhMy4wNjQgMy4wNjQgMCAwMC0uODgtLjQ0OEE1LjA2MiA1LjA2MiAwIDAwLjA2NyAxLjAxTDAgLjAxMmE2LjE0IDYuMTQgMCAwMTEuNTkyLjExYy40NTMuMTM1Ljg3Ny4zNDUgMS4yOS42NS4zLjI2NS41NjUuNTY0Ljc4Ny44OS4yMzMtLjMzMS41Mi0uNjM0Ljg1My0uOTA0YTQuODM1IDQuODM1IDAgMDExLjMtLjY0OEE2LjE1NSA2LjE1NSAwIDAxNy4zNS4wMTJ6IiBmaWxsPSIjMEQwRDBEIi8+PHBhdGggZD0iTTE3LjM1IDE0LjVsNC41LTQuNS02LTZjLTIgMi0zIDItNS41IDIuNS40IDMuMiA0LjgzMyA2LjY2NyA3IDh6bTQuNTg4LTQuNDkzYS4zLjMgMCAwMC40MjQgMGwuNjgtLjY4YTEuNSAxLjUgMCAwMDAtMi4xMjJMMjEuNjkgNS44NTNsMi4wMjUtMS41ODNhMS42MjkgMS42MjkgMCAxMC0yLjI3OS0yLjI5NmwtMS42MDMgMi4wMjItMS4zNTctMS4zNTdhMS41IDEuNSAwIDAwLTIuMTIxIDBsLS42OC42OGEuMy4zIDAgMDAwIC40MjVsNi4yNjMgNi4yNjN6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE1Ljg5MiAzLjk2MnMtMS4wMyAxLjIwMi0yLjQ5NCAxLjg5Yy0xLjAwNi40NzQtMi4xOC41ODYtMi43MzQuNjI3LS4yLjAxNS0uMzQ0LjIxLS4yNzYuMzk5LjI5Mi44MiAxLjExMiAyLjggMi42NTggNC4zNDYgMi4xMjYgMi4xMjcgMy42NTggMi45NjggNC4xNDIgMy4yMDMuMS4wNDguMjE0LjAzLjI5OC0uMDQyLjM4Ni0uMzI1IDEuNS0xLjI3NyAyLjIxLTEuOTg2Ljg5Mi0uODg5IDIuMTg3LTIuNDQ3IDIuMTg3LTIuNDQ3bS40NzkuMDU1YS4zLjMgMCAwMS0uNDI0IDBsLTYuMjY0LTYuMjYzYS4zLjMgMCAwMTAtLjQyNWwuNjgtLjY4YTEuNSAxLjUgMCAwMTIuMTIyIDBsMS4zNTcgMS4zNTcgMS42MDMtMi4wMjJhMS42MjkgMS42MjkgMCAxMTIuMjggMi4yOTZMMjEuNjkgNS44NTNsMS4zNTIgMS4zNTJhMS41IDEuNSAwIDAxMCAyLjEyMmwtLjY4LjY4eiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+) 2 5, default !important;
        }
      `}</style>
    </>
  )
})

ProsemirrorEditor.displayName = 'ProsemirrorEditor'

export default ProsemirrorEditor
