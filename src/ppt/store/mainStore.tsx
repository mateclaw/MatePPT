/**
 * 编辑器主状态管理 Store
 * 使用自定义 Hook 实现，不依赖外部库
 */

import { useState, useCallback, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { TextAttrs } from './richTextStore'
import type { CreatingElement, ShapeFormatPainter, TextFormatPainter } from '@/ppt/types/edit'
import type { DialogForExportTypes } from '@/ppt/types/export'
import { ToolbarStates } from '@/ppt/types/toolbar'

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

export interface MainState {
  // 元素选择状态
  activeElementIdList: string[]
  handleElementId: string
  activeGroupElementId: string
  hiddenElementIdList: string[]

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
}

export interface MainActions {
  // 元素选择相关
  setActiveElementIdList: (ids: string[]) => void
  setHandleElementId: (id: string) => void
  setActiveGroupElementId: (id: string) => void
  setHiddenElementIdList: (ids: string[]) => void

  // 画布相关
  setCanvasPercentage: (percentage: number) => void
  setCanvasScale: (scale: number) => void
  setCanvasDragged: (isDragged: boolean) => void
  setShowRuler: (show: boolean) => void
  setGridLineSize: (size: number) => void

  // 焦点和快捷键
  setThumbnailsFocus: (isFocus: boolean) => void
  setEditorAreaFocus: (isFocus: boolean) => void
  setDisableHotkeys: (disable: boolean) => void

  // 创建元素
  setCreatingElement: (element: CreatingElement | null) => void
  setCreatingCustomShape: (state: boolean) => void

  // 编辑状态
  setClipingImageElementId: (id: string) => void
  setIsScaling: (isScaling: boolean) => void
  setRichTextAttrs: (attrs: TextAttrs) => void
  setSelectedTableCells: (cells: string[]) => void
  setSelectedSlidesIndex: (indexes: number[]) => void

  // UI 面板
  setToolbarState: (state: ToolbarStates) => void
  setDialogForExport: (type: DialogForExportTypes) => void
  setShowSelectPanel: (show: boolean) => void
  setShowSearchPanel: (show: boolean) => void
  setShowNotesPanel: (show: boolean) => void
  setShowSymbolPanel: (show: boolean) => void
  setShowMarkupPanel: (show: boolean) => void
  setShowAIPPTDialog: (show: boolean) => void

  // 格式刷
  setTextFormatPainter: (painter: TextFormatPainter | null) => void
  setShapeFormatPainter: (painter: ShapeFormatPainter | null) => void

  // 重置状态
  resetState: () => void
}

export type MainStore = MainState & MainActions

/**
 * 生成数据库 ID
 */
function generateDatabaseId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const initialState: MainState = {
  activeElementIdList: [],
  handleElementId: '',
  activeGroupElementId: '',
  hiddenElementIdList: [],
  canvasPercentage: 90,
  canvasScale: 1,
  canvasDragged: false,
  showRuler: false,
  gridLineSize: 0,
  thumbnailsFocus: false,
  editorAreaFocus: false,
  disableHotkeys: false,
  creatingElement: null,
  creatingCustomShape: false,
  clipingImageElementId: '',
  isScaling: false,
  richTextAttrs: defaultRichTextAttrs,
  selectedTableCells: [],
  selectedSlidesIndex: [],
  toolbarState: ToolbarStates.SLIDE_DESIGN,
  dialogForExport: '',
  showSelectPanel: false,
  showSearchPanel: false,
  showNotesPanel: false,
  showSymbolPanel: false,
  showMarkupPanel: false,
  showAIPPTDialog: false,
  textFormatPainter: null,
  shapeFormatPainter: null,
  databaseId: generateDatabaseId(),
}

/**
 * MainStore Context
 */
const MainStoreContext = createContext<MainStore | null>(null)

/**
 * useMainStore Hook
 * 在组件中使用 Store
 */
export const useMainStore = (): MainStore => {
  const store = useContext(MainStoreContext)
  if (!store) {
    throw new Error('useMainStore must be used within MainStoreProvider')
  }
  return store
}

/**
 * MainStore Provider 组件
 */
export const MainStoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MainState>(initialState)

  // 元素选择相关
  const setActiveElementIdList = useCallback((ids: string[]) => {
    setState((prev) => ({
      ...prev,
      activeElementIdList: ids,
      handleElementId: ids.length === 1 ? ids[0] : '',
    }))
  }, [])

  const setHandleElementId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, handleElementId: id }))
  }, [])

  const setActiveGroupElementId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeGroupElementId: id }))
  }, [])

  const setHiddenElementIdList = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, hiddenElementIdList: ids }))
  }, [])

  // 画布相关
  const setCanvasPercentage = useCallback((percentage: number) => {
    setState((prev) => ({ ...prev, canvasPercentage: percentage }))
  }, [])

  const setCanvasScale = useCallback((scale: number) => {
    setState((prev) => ({ ...prev, canvasScale: scale }))
  }, [])

  const setCanvasDragged = useCallback((isDragged: boolean) => {
    setState((prev) => ({ ...prev, canvasDragged: isDragged }))
  }, [])

  const setShowRuler = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showRuler: show }))
  }, [])

  const setGridLineSize = useCallback((size: number) => {
    setState((prev) => ({ ...prev, gridLineSize: size }))
  }, [])

  // 焦点和快捷键
  const setThumbnailsFocus = useCallback((isFocus: boolean) => {
    setState((prev) => ({ ...prev, thumbnailsFocus: isFocus }))
  }, [])

  const setEditorAreaFocus = useCallback((isFocus: boolean) => {
    setState((prev) => ({ ...prev, editorAreaFocus: isFocus }))
  }, [])

  const setDisableHotkeys = useCallback((disable: boolean) => {
    setState((prev) => ({ ...prev, disableHotkeys: disable }))
  }, [])

  // 创建元素
  const setCreatingElement = useCallback((element: CreatingElement | null) => {
    setState((prev) => ({ ...prev, creatingElement: element }))
  }, [])

  const setCreatingCustomShape = useCallback((shapeState: boolean) => {
    setState((prev) => ({ ...prev, creatingCustomShape: shapeState }))
  }, [])

  // 编辑状态
  const setClipingImageElementId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, clipingImageElementId: id }))
  }, [])

  const setIsScaling = useCallback((isScaling: boolean) => {
    setState((prev) => ({ ...prev, isScaling: isScaling }))
  }, [])

  const setRichTextAttrs = useCallback((attrs: TextAttrs) => {
    setState((prev) => ({ ...prev, richTextAttrs: attrs }))
  }, [])

  const setSelectedTableCells = useCallback((cells: string[]) => {
    setState((prev) => ({ ...prev, selectedTableCells: cells }))
  }, [])

  const setSelectedSlidesIndex = useCallback((indexes: number[]) => {
    setState((prev) => ({ ...prev, selectedSlidesIndex: indexes }))
  }, [])

  // UI 面板
  const setToolbarState = useCallback((toolbarState: ToolbarStates) => {
    setState((prev) => ({ ...prev, toolbarState: toolbarState }))
  }, [])

  const setDialogForExport = useCallback((type: DialogForExportTypes) => {
    setState((prev) => ({ ...prev, dialogForExport: type }))
  }, [])

  const setShowSelectPanel = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showSelectPanel: show }))
  }, [])

  const setShowSearchPanel = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showSearchPanel: show }))
  }, [])

  const setShowNotesPanel = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showNotesPanel: show }))
  }, [])

  const setShowSymbolPanel = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showSymbolPanel: show }))
  }, [])

  const setShowMarkupPanel = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showMarkupPanel: show }))
  }, [])

  const setShowAIPPTDialog = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showAIPPTDialog: show }))
  }, [])

  // 格式刷
  const setTextFormatPainter = useCallback((painter: TextFormatPainter | null) => {
    setState((prev) => ({ ...prev, textFormatPainter: painter }))
  }, [])

  const setShapeFormatPainter = useCallback((painter: ShapeFormatPainter | null) => {
    setState((prev) => ({ ...prev, shapeFormatPainter: painter }))
  }, [])

  // 重置状态
  const resetState = useCallback(() => {
    setState(initialState)
  }, [])

  const store: MainStore = {
    ...state,
    setActiveElementIdList,
    setHandleElementId,
    setActiveGroupElementId,
    setHiddenElementIdList,
    setCanvasPercentage,
    setCanvasScale,
    setCanvasDragged,
    setShowRuler,
    setGridLineSize,
    setThumbnailsFocus,
    setEditorAreaFocus,
    setDisableHotkeys,
    setCreatingElement,
    setCreatingCustomShape,
    setClipingImageElementId,
    setIsScaling,
    setRichTextAttrs,
    setSelectedTableCells,
    setSelectedSlidesIndex,
    setToolbarState,
    setDialogForExport,
    setShowSelectPanel,
    setShowSearchPanel,
    setShowNotesPanel,
    setShowSymbolPanel,
    setShowMarkupPanel,
    setShowAIPPTDialog,
    setTextFormatPainter,
    setShapeFormatPainter,
    resetState,
  }

  return <MainStoreContext.Provider value={store}>{children}</MainStoreContext.Provider>
}

export default useMainStore
