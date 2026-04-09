/**
 * 编辑器主状态管理 Store (Zustand)
 */


import { create } from 'zustand'
import type { TextAttrs } from './richTextStore'
import type { CreatingElement, ShapeFormatPainter, TextFormatPainter } from '../types/edit'
import type { DialogForExportTypes } from '../types/export'
import { ToolbarStates } from '../types/toolbar'
import { customAlphabet } from 'nanoid'
import { EditorMode } from '../core'

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
}


const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
export const databaseId = nanoid(10)

export interface MainState {
  // 元素选择状态
  activeElementIdList: string[]
  handleElementId: string
  activeGroupElementId: string
  hiddenElementIdList: string[]
  hoveredElementId: string

  // 画布相关状态
  canvasPercentage: number
  canvasScale: number
  canvasDragged: boolean
  showRuler: boolean
  gridLineSize: number

  // 焦点和快捷键状态
  thumbnailsFocus: boolean
  editorAreaFocus: boolean
  disableHotkeys: boolean
  mode: EditorMode

  // 创建元素状态
  creatingElement: CreatingElement | null
  creatingCustomShape: boolean

  // 编辑状态
  clipingImageElementId: string
  isScaling: boolean
  richTextAttrs: TextAttrs
  selectedTableCells: string[]
  selectedSlidesIndex: number[]

  // UI 面板状态
  toolbarState: ToolbarStates
  dialogForExport: DialogForExportTypes
  showSelectPanel: boolean
  showSearchPanel: boolean
  showNotesPanel: boolean
  showSymbolPanel: boolean
  showMarkupPanel: boolean
  showAIPPTDialog: boolean

  // 格式刷状态
  textFormatPainter: TextFormatPainter | null
  shapeFormatPainter: ShapeFormatPainter | null

  // 数据库 ID
  databaseId: string

  // Actions
  setActiveElementIdList: (ids: string[]) => void
  setHandleElementId: (id: string) => void
  setActiveGroupElementId: (id: string) => void
  setHiddenElementIdList: (ids: string[]) => void
  setHoveredElementId: (id: string) => void
  setCanvasPercentage: (percentage: number) => void
  setCanvasScale: (scale: number) => void
  setCanvasDragged: (isDragged: boolean) => void
  setShowRuler: (show: boolean) => void
  setGridLineSize: (size: number) => void
  setThumbnailsFocus: (isFocus: boolean) => void
  setEditorAreaFocus: (isFocus: boolean) => void
  setDisableHotkeys: (disable: boolean) => void
  setMode: (mode: EditorMode) => void
  setCreatingElement: (element: CreatingElement | null) => void
  setCreatingCustomShape: (state: boolean) => void
  setClipingImageElementId: (id: string) => void
  setIsScaling: (isScaling: boolean) => void
  setRichTextAttrs: (attrs: TextAttrs) => void
  setSelectedTableCells: (cells: string[]) => void
  setSelectedSlidesIndex: (indexes: number[]) => void
  setToolbarState: (state: ToolbarStates) => void
  setDialogForExport: (type: DialogForExportTypes) => void
  setShowSelectPanel: (show: boolean) => void
  setShowSearchPanel: (show: boolean) => void
  setShowNotesPanel: (show: boolean) => void
  setShowSymbolPanel: (show: boolean) => void
  setShowMarkupPanel: (show: boolean) => void
  setShowAIPPTDialog: (show: boolean) => void
  setTextFormatPainter: (painter: TextFormatPainter | null) => void
  setShapeFormatPainter: (painter: ShapeFormatPainter | null) => void
  resetState: () => void
}

const initialState = {
  activeElementIdList: [],
  handleElementId: '',
  activeGroupElementId: '',
  hiddenElementIdList: [],
  hoveredElementId: '',
  canvasPercentage: 90,
  canvasScale: 1,
  canvasDragged: false,
  showRuler: false,
  gridLineSize: 0,
  thumbnailsFocus: false,
  editorAreaFocus: false,
  disableHotkeys: false,
  mode: EditorMode.EDIT,
  creatingElement: null,
  creatingCustomShape: false,
  clipingImageElementId: '',
  isScaling: false,
  richTextAttrs: defaultRichTextAttrs,
  selectedTableCells: [],
  selectedSlidesIndex: [],
  toolbarState: ToolbarStates.SLIDE_DESIGN,
  dialogForExport: '' as DialogForExportTypes,
  showSelectPanel: false,
  showSearchPanel: false,
  showNotesPanel: false,
  showSymbolPanel: false,
  showMarkupPanel: false,
  showAIPPTDialog: false,
  textFormatPainter: null,
  shapeFormatPainter: null,
  databaseId: databaseId,
}

export const useMainStore = create<MainState>((set) => ({
  ...initialState,

  setActiveElementIdList: (ids: string[]) => set({
    activeElementIdList: ids,
    handleElementId: ids.length === 1 ? ids[0] : '',
  }),

  setHandleElementId: (id: string) => set({ handleElementId: id }),

  setActiveGroupElementId: (id: string) => set({ activeGroupElementId: id }),

  setHiddenElementIdList: (ids: string[]) => set({ hiddenElementIdList: ids }),

  setHoveredElementId: (id: string) => set({ hoveredElementId: id }),

  setCanvasPercentage: (percentage: number) => set({ canvasPercentage: percentage }),

  setCanvasScale: (scale: number) => set({ canvasScale: scale }),

  setCanvasDragged: (isDragged: boolean) => set({ canvasDragged: isDragged }),

  setShowRuler: (show: boolean) => set({ showRuler: show }),

  setGridLineSize: (size: number) => set({ gridLineSize: size }),

  setThumbnailsFocus: (isFocus: boolean) => set({ thumbnailsFocus: isFocus }),

  setEditorAreaFocus: (isFocus: boolean) => set({ editorAreaFocus: isFocus }),

  setDisableHotkeys: (disable: boolean) => set({ disableHotkeys: disable }),

  setMode: (mode: EditorMode) => set({ mode }),

  setCreatingElement: (element: CreatingElement | null) => set({ creatingElement: element }),

  setCreatingCustomShape: (shapeState: boolean) => set({ creatingCustomShape: shapeState }),

  setClipingImageElementId: (id: string) => set({ clipingImageElementId: id }),

  setIsScaling: (isScaling: boolean) => set({ isScaling }),

  setRichTextAttrs: (attrs: TextAttrs) => set({ richTextAttrs: attrs }),

  setSelectedTableCells: (cells: string[]) => set({ selectedTableCells: cells }),

  setSelectedSlidesIndex: (indexes: number[]) => set({ selectedSlidesIndex: indexes }),

  setToolbarState: (toolbarState: ToolbarStates) => set({ toolbarState }),

  setDialogForExport: (type: DialogForExportTypes) => set({ dialogForExport: type }),

  setShowSelectPanel: (show: boolean) => set({ showSelectPanel: show }),

  setShowSearchPanel: (show: boolean) => set({ showSearchPanel: show }),

  setShowNotesPanel: (show: boolean) => set({ showNotesPanel: show }),

  setShowSymbolPanel: (show: boolean) => set({ showSymbolPanel: show }),

  setShowMarkupPanel: (show: boolean) => set({ showMarkupPanel: show }),

  setShowAIPPTDialog: (show: boolean) => set({ showAIPPTDialog: show }),

  setTextFormatPainter: (painter: TextFormatPainter | null) => set({ textFormatPainter: painter }),

  setShapeFormatPainter: (painter: ShapeFormatPainter | null) => set({ shapeFormatPainter: painter }),

  resetState: () => set(initialState),
}))

export default useMainStore
