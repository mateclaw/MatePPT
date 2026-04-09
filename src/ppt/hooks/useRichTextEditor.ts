/**
 * ProseMirror 富文本编辑器 React Hook
 * 用于初始化和管理 ProseMirror 编辑器实例
 */

import { useEffect, useRef, useCallback } from 'react'
import type { EditorView } from 'prosemirror-view'
import { DOMSerializer } from 'prosemirror-model'
import { toggleMark } from 'prosemirror-commands'
import { initProsemirrorEditor, createDocument } from '../utils/prosemirror'
import { getTextAttrs } from '../utils/prosemirror/utils'
import { emitter, EmitterEvents, type RichTextCommand, type RichTextAction } from '../utils/emitter'
import type { TextAttrs } from '../store/richTextStore'
import type { Transform as PPTColorTransform } from '@/ppt/core/entity/presentation/PPTColor'

const isStringValue = (value: unknown): value is string => typeof value === 'string'
const isStringOrNumber = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number'

interface UseRichTextEditorProps {
  elementId: string
  defaultColor?: string
  defaultFontName?: string
  initialValue?: string
  editable?: boolean
  onChange?: (content: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onAttrsChange?: (attrs: TextAttrs) => void
}

export const useRichTextEditor = ({
  elementId,
  defaultColor = '#000000',
  defaultFontName = '',
  initialValue = '',
  editable = true,
  onChange,
  onFocus,
  onBlur,
  onAttrsChange,
}: UseRichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const serializeTransforms = useCallback((transforms?: string | PPTColorTransform[] | null) => {
    if (!transforms) return undefined
    if (typeof transforms === 'string') return transforms
    if (!Array.isArray(transforms) || transforms.length === 0) return undefined
    return transforms.map((item) => `${item.type}:${item.value}`).join(';')
  }, [])

  const resolveColorAttr = useCallback((value: any) => {
    if (!value) return null
    if (typeof value === 'string') return { color: value }
    if (typeof value === 'object') {
      const color = value.color ?? value.value ?? ''
      const scheme = value.scheme
      const transforms = serializeTransforms(value.transforms)
      return { color, scheme, transforms }
    }
    return null
  }, [serializeTransforms])

  const serializeEditorHtml = useCallback((view: EditorView) => {
    const serializer = DOMSerializer.fromSchema(view.state.schema)
    const fragment = serializer.serializeFragment(view.state.doc.content)
    const container = document.createElement('div')
    container.appendChild(fragment)
    return container.innerHTML
  }, [])

  // 防抖处理内容变化
  const handleContentChange = useCallback((view: EditorView) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const html = serializeEditorHtml(view)
      onChange?.(html)
    }, 300)
  }, [onChange, serializeEditorHtml])

  // 同步文本属性到回调
  const syncAttrsToCallback = useCallback((view: EditorView) => {
    const attrs = getTextAttrs(view, {
      color: defaultColor,
      fontname: defaultFontName,
    })
    onAttrsChange?.(attrs)
  }, [defaultColor, defaultFontName, onAttrsChange])

  // 初始化编辑器
  useEffect(() => {
    if (!editorRef.current) return

    const editor = initProsemirrorEditor(
      editorRef.current,
      initialValue,
      {
        handleDOMEvents: {
          focus: () => {
            onFocus?.()
            return false
          },
          blur: () => {
            onBlur?.()
            return false
          },
          click: () => {
            syncAttrsToCallback(editor)
            return false
          },
          mouseup: () => {
            syncAttrsToCallback(editor)
            return false
          },
          keydown: () => {
            handleContentChange(editor)
            syncAttrsToCallback(editor)
            return false
          },
        },
        editable: () => editable,
        dispatchTransaction: (tr) => {
          const newState = editor.state.apply(tr)
          editor.updateState(newState)
          handleContentChange(editor)
        },
      },
      {
        placeholder: '请输入内容...',
      }
    )

    viewRef.current = editor

    // 监听富文本命令事件
    const handleCommand = (data: RichTextCommand) => {
      if (data.target && data.target !== elementId) return
      execCommand(data.action)
    }

    emitter.on(EmitterEvents.RICH_TEXT_COMMAND, handleCommand)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      emitter.off(EmitterEvents.RICH_TEXT_COMMAND, handleCommand)
      editor.destroy()
    }
  }, [elementId, editable, initialValue, handleContentChange, syncAttrsToCallback, onFocus, onBlur])

  // 执行富文本命令
  const execCommand = useCallback((action: RichTextAction | RichTextAction[]) => {
    if (!viewRef.current) return

    const view = viewRef.current
    const actions = Array.isArray(action) ? action : [action]

    for (const item of actions) {
      const { command, value } = item

      switch (command) {
        case 'fontname':
          if (isStringValue(value)) {
            const mark = view.state.schema.marks.fontname.create({ fontname: value })
            autoSelectAll(view)
            addMark(view, mark)
          }
          break

        case 'fontsize':
          if (isStringOrNumber(value)) {
            const mark = view.state.schema.marks.fontsize.create({ fontsize: value + 'px' })
            autoSelectAll(view)
            addMark(view, mark)
          }
          break

        case 'color':
          if (value) {
            const colorAttr = resolveColorAttr(value)
            if (!colorAttr) break
            const mark = view.state.schema.marks.forecolor.create(colorAttr)
            autoSelectAll(view)
            {
              const { $from, $to } = view.state.selection
              view.dispatch(view.state.tr.removeMark($from.pos, $to.pos, view.state.schema.marks.forecolor))
            }
            addMark(view, mark)
          }
          break

        case 'backcolor':
          if (isStringValue(value)) {
            const mark = view.state.schema.marks.backcolor.create({ backcolor: value })
            autoSelectAll(view)
            addMark(view, mark)
          }
          break

        case 'bold':
          autoSelectAll(view)
          toggleMarkCommand(view, 'strong')
          break

        case 'em':
          autoSelectAll(view)
          toggleMarkCommand(view, 'em')
          break

        case 'underline':
          autoSelectAll(view)
          toggleMarkCommand(view, 'underline')
          break

        case 'strikethrough':
          autoSelectAll(view)
          toggleMarkCommand(view, 'strikethrough')
          break

        case 'subscript':
          toggleMarkCommand(view, 'subscript')
          break

        case 'superscript':
          toggleMarkCommand(view, 'superscript')
          break

        case 'code':
          toggleMarkCommand(view, 'code')
          break

        case 'clear': {
          autoSelectAll(view)
          const { $from, $to } = view.state.selection
          view.dispatch(view.state.tr.removeMark($from.pos, $to.pos))
          break
        }

        case 'insert':
          if (isStringValue(value)) {
            view.dispatch(view.state.tr.insertText(value))
          }
          break

        default:
          break
      }
    }

    view.focus()
    handleContentChange(view)
    syncAttrsToCallback(view)
  }, [handleContentChange, syncAttrsToCallback])

  // 获取编辑器内容
  const getContent = useCallback(() => {
    return viewRef.current?.dom.innerHTML || ''
  }, [])

  // 设置编辑器内容
  const setContent = useCallback((content: string) => {
    if (!viewRef.current) return
    const { doc, tr } = viewRef.current.state
    viewRef.current.dispatch(tr.replaceRangeWith(0, doc.content.size, createDocument(content)))
  }, [])

  // 获取编辑器焦点
  const focus = useCallback(() => {
    viewRef.current?.focus()
  }, [])

  // 清空内容
  const clear = useCallback(() => {
    if (!viewRef.current) return
    const { doc, tr } = viewRef.current.state
    viewRef.current.dispatch(tr.delete(0, doc.content.size))
  }, [])

  return {
    editorRef,
    view: viewRef.current,
    getContent,
    setContent,
    focus,
    clear,
    execCommand,
    syncAttrsToCallback,
  }
}

// 辅助函数
const autoSelectAll = (view: EditorView) => {
  const { empty } = view.state.selection
  if (empty) {
    const { Selection } = view.state.selection.constructor as any
    const tr = view.state.tr.setSelection(
      Selection.create(view.state.doc, 0, view.state.doc.content.size)
    )
    view.dispatch(tr)
  }
}

const addMark = (view: EditorView, mark: any) => {
  const { $from, $to } = view.state.selection
  view.dispatch(view.state.tr.addMark($from.pos, $to.pos, mark))
}

const toggleMarkCommand = (view: EditorView, markName: string) => {
  const markType = view.state.schema.marks[markName]
  toggleMark(markType)(view.state, view.dispatch)
}
