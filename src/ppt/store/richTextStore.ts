/**
 * Zustand 富文本状态管理
 * 使用前需要: npm install zustand
 */

type SetState<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void

export interface TextAttrs {
  bold: boolean
  em: boolean
  underline: boolean
  strikethrough: boolean
  superscript: boolean
  subscript: boolean
  code: boolean
  color: string
  backcolor: string
  fontsize: string
  fontname: string
  link: string
  align: 'left' | 'center' | 'right' | 'justify' | 'distributed'
  bulletList: boolean
  orderedList: boolean
  blockquote: boolean
  colorScheme?: string
  colorTransforms?: string
}

export const defaultRichTextAttrs: TextAttrs = {
  bold: false,
  em: false,
  underline: false,
  strikethrough: false,
  superscript: false,
  subscript: false,
  code: false,
  color: '#000000',
  backcolor: '',
  fontsize: '16px',
  fontname: '',
  link: '',
  align: 'left',
  bulletList: false,
  orderedList: false,
  blockquote: false,
  colorScheme: '',
  colorTransforms: '',
}

export interface TextFormatPainter {
  keep: boolean
  bold: boolean
  em: boolean
  underline: boolean
  strikethrough: boolean
  color: string
  backcolor: string
  fontname: string
  fontsize: string
  align: TextAttrs['align']
}

interface RichTextStoreState {
  richTextAttrs: TextAttrs
  textFormatPainter: TextFormatPainter | null
  handleElementId: string
  
  setRichTextAttrs: (attrs: Partial<TextAttrs>) => void
  setTextFormatPainter: (painter: TextFormatPainter | null) => void
  setHandleElementId: (id: string) => void
  resetRichTextAttrs: () => void
}

// ============ Zustand 实现 ============
// 如果您已安装 zustand，使用下面的代码：

import { create } from 'zustand'

export const useRichTextStore = create<RichTextStoreState>((set) => ({
  richTextAttrs: defaultRichTextAttrs,
  textFormatPainter: null,
  handleElementId: '',

  setRichTextAttrs: (attrs) =>
    set((state) => ({
      richTextAttrs: { ...state.richTextAttrs, ...attrs },
    })),

  setTextFormatPainter: (painter) => set({ textFormatPainter: painter }),

  setHandleElementId: (id) => set({ handleElementId: id }),

  resetRichTextAttrs: () =>
    set({ richTextAttrs: { ...defaultRichTextAttrs } }),
}))


