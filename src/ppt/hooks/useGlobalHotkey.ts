/**
 * 全局快捷键 Hook (React + Zustand + ahooks)
 */

import { useEffect } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'
import { useKeyboardStore } from '../store/useKeyboardStore'
import { ElementOrderCommands } from '@/ppt/types/edit'
import { EditorMode } from '@/ppt/core'
import { textTypeOptions } from '@/ppt/types/annotation'
import { KEYS } from '../configs/hotkey'

import useSlideHandler from './useSlideHandler'
import useLockElement from './useLockElement'
import useDeleteElement from './useDeleteElement'
import useCombineElement from './useCombineElement'
import useCopyAndPasteElement from './useCopyAndPasteElement'
import useSelectElement from './useSelectElement'
import useMoveElement from './useMoveElement'
import useOrderElement from './useOrderElement'
import useHistorySnapshot from './useHistorySnapshot'
import useScreening from './useScreening'
import useScaleCanvas from './useScaleCanvas'
import { useActiveElementList } from './useActiveElementList'

const useHotkeys = () => {
  /**
   * 全部从 zustand 里取代替 storeToRefs
   */
  const {
    activeElementIdList,
    disableHotkeys,
    // handleElement,
    handleElementId,
    editorAreaFocus,
    thumbnailsFocus,
    showSearchPanel,
    mode,
    setActiveElementIdList,
    setDialogForExport,
    setSearchPanelState,
    setCreatingElement,
  } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
      disableHotkeys: state.disableHotkeys,
      // handleElement: state.handleElement,
      handleElementId: state.handleElementId,
      editorAreaFocus: state.editorAreaFocus,
      thumbnailsFocus: state.thumbnailsFocus,
      showSearchPanel: state.showSearchPanel,
      mode: state.mode,
      setActiveElementIdList: state.setActiveElementIdList,
      setDialogForExport: state.setDialogForExport,
      setSearchPanelState: state.setShowSearchPanel,
      setCreatingElement: state.setCreatingElement,
    })),
  )

  const { currentSlide } = useSlidesStore(
    useShallow((state) => ({
      currentSlide: state.getCurrentSlide(),
    })),
  )
  const highlightAnnotatedElements = useSlidesStore((state) => state.highlightAnnotatedElements)
  const updateElement = useSlidesStore((state) => state.updateElement)

  const { handleElement } = useActiveElementList()

  const {
    ctrlKeyState,
    shiftKeyState,
    spaceKeyState,
    setCtrlKeyState,
    setShiftKeyState,
    setSpaceKeyState,
  } = useKeyboardStore(
    useShallow((state) => ({
      ctrlKeyState: state.ctrlKeyState,
      shiftKeyState: state.shiftKeyState,
      spaceKeyState: state.spaceKeyState,
      setCtrlKeyState: state.setCtrlKeyState,
      setShiftKeyState: state.setShiftKeyState,
      setSpaceKeyState: state.setSpaceKeyState,
    })),
  )

  const {
    updateSlideIndex,
    copySlide,
    createSlide,
    deleteSlide,
    cutSlide,
    copyAndPasteSlide,
    selectAllSlide,
  } = useSlideHandler()

  const { combineElements, uncombineElements } = useCombineElement()
  const { deleteElement } = useDeleteElement()
  const { lockElement } = useLockElement()
  const { copyElement, cutElement, quickCopyElement } = useCopyAndPasteElement()
  const { selectAllElements } = useSelectElement()
  const { moveElement } = useMoveElement()
  const { orderElement } = useOrderElement()
  const { redo, undo } = useHistorySnapshot()
  const { enterScreening, enterScreeningFromStart } = useScreening()
  const { scaleCanvas, resetCanvas } = useScaleCanvas()

  /**
   * 包一层 useMemoizedFn，给全局事件使用，同时能拿到最新状态
   */
  const copy = useMemoizedFn(() => {
    if (activeElementIdList.length) copyElement()
    else if (thumbnailsFocus) copySlide()
  })

  const cut = useMemoizedFn(() => {
    if (activeElementIdList.length) cutElement()
    else if (thumbnailsFocus) cutSlide()
  })

  const quickCopy = useMemoizedFn(() => {
    if (activeElementIdList.length) quickCopyElement()
    else if (thumbnailsFocus) copyAndPasteSlide()
  })

  const selectAll = useMemoizedFn(() => {
    if (editorAreaFocus) selectAllElements()
    if (thumbnailsFocus) selectAllSlide()
  })

  const lock = useMemoizedFn(() => {
    if (!editorAreaFocus) return
    lockElement()
  })

  const combine = useMemoizedFn(() => {
    if (!editorAreaFocus) return
    combineElements()
  })

  const uncombine = useMemoizedFn(() => {
    if (!editorAreaFocus) return
    uncombineElements()
  })

  const remove = useMemoizedFn(() => {
    if (activeElementIdList.length) deleteElement()
    else if (thumbnailsFocus) deleteSlide()
  })

  const move = useMemoizedFn((key: string) => {
    if (activeElementIdList.length) moveElement(key)
    else if (key === KEYS.UP || key === KEYS.DOWN) updateSlideIndex(key)
  })

  const moveSlide = useMemoizedFn((key: string) => {
    if (key === KEYS.PAGEUP) updateSlideIndex(KEYS.UP)
    else if (key === KEYS.PAGEDOWN) updateSlideIndex(KEYS.DOWN)
  })

  const order = useMemoizedFn((command: ElementOrderCommands) => {
    if (!handleElement) return
    orderElement(handleElement, command)
  })

  const create = useMemoizedFn(() => {
    if (!thumbnailsFocus) return
    createSlide()
  })

  const tabActiveElement = useMemoizedFn(() => {
    if (!currentSlide || !currentSlide.elements.length) return

    if (!handleElementId) {
      const firstElement = currentSlide.elements[0]
      setActiveElementIdList([firstElement.id])
      return
    }

    const currentIndex = currentSlide.elements.findIndex(
      (el) => el.id === handleElementId,
    )
    const nextIndex =
      currentIndex >= currentSlide.elements.length - 1 ? 0 : currentIndex + 1
    const nextElementId = currentSlide.elements[nextIndex].id

    setActiveElementIdList([nextElementId])
  })

  /**
   * keydown 监听
   */
  const keydownListener = useMemoizedFn((e: KeyboardEvent) => {
    const { ctrlKey, shiftKey, altKey, metaKey } = e
    const ctrlOrMetaKeyActive = ctrlKey || metaKey
    const key = e.key.toUpperCase()

    // 修饰键状态更新
    if (ctrlOrMetaKeyActive && !ctrlKeyState) setCtrlKeyState(true)
    if (shiftKey && !shiftKeyState) setShiftKeyState(true)
    if (!disableHotkeys && key === KEYS.SPACE) setSpaceKeyState(true)

    // 非编辑区也要响应的快捷键（导出 / 播放 / 搜索 / 缩放）
    if (ctrlOrMetaKeyActive && key === KEYS.P) {
      e.preventDefault()
      setDialogForExport('pdf')
      return
    }
    if (shiftKey && key === KEYS.F5) {
      e.preventDefault()
      enterScreening()
      setShiftKeyState(false)
      return
    }
    if (key === KEYS.F5) {
      e.preventDefault()
      enterScreeningFromStart()
      return
    }
    if (ctrlKey && key === KEYS.F) {
      e.preventDefault()
      setSearchPanelState(!showSearchPanel)
      return
    }
    if (ctrlKey && key === KEYS.MINUS) {
      e.preventDefault()
      if (mode === EditorMode.ANNOTATE) return
      scaleCanvas('-')
      return
    }
    if (ctrlKey && key === KEYS.EQUAL) {
      e.preventDefault()
      if (mode === EditorMode.ANNOTATE) return
      scaleCanvas('+')
      return
    }
    if (ctrlKey && key === KEYS.DIGIT_0) {
      e.preventDefault()
      if (mode === EditorMode.ANNOTATE) return
      resetCanvas()
      return
    }

    // 标注模式快捷键：数字键快速标注
    if (
      highlightAnnotatedElements &&
      editorAreaFocus &&
      !ctrlOrMetaKeyActive &&
      altKey &&
      !shiftKey
    ) {
      const target = e.target as HTMLElement | null
      const isEditableTarget = !!target?.closest?.(
        'input, textarea, select, [contenteditable="true"], .ProseMirror, .prosemirror-editor, .ant-select, .ant-input',
      )
      const codeMatch = /^Digit(\d)$/.exec(e.code || '')
      if (!isEditableTarget && codeMatch && currentSlide) {
        const digit = Number(codeMatch[1])
        const targetId =
          (handleElementId && activeElementIdList.includes(handleElementId) && handleElementId)
          || (activeElementIdList.length === 1 ? activeElementIdList[0] : '')
        if (targetId) {
          const element = currentSlide.elements?.find((el) => el.id === targetId)
          if (element) {
            const clearLabel = () => {
              updateElement({ id: element.id, props: { labelType: undefined } })
            }
            const applyLabel = (labelType: string) => {
              updateElement({ id: element.id, props: { labelType } })
            }

            if (digit === 0) {
              e.preventDefault()
              clearLabel()
              return
            }

            const index = digit - 1
            if (element.type === 'text' || (element.type === 'shape' && (element as any).text)) {
              const option = textTypeOptions.find((item) => item.hotkey === digit)
              if (option) {
                e.preventDefault()
                applyLabel(option.value)
                return
              }
            }
          }
        }
      }
    }

    // 编辑区 / 缩略图区域之外，不再响应后面的快捷键
    if (!editorAreaFocus && !thumbnailsFocus) return

    // 下面这些基本都和 Vue 版本一模一样，只是把 .value 换成直接变量

    if (ctrlOrMetaKeyActive && key === KEYS.C) {
      if (disableHotkeys) return
      e.preventDefault()
      copy()
    }
    if (ctrlOrMetaKeyActive && key === KEYS.X) {
      if (disableHotkeys) return
      e.preventDefault()
      cut()
    }
    if (ctrlOrMetaKeyActive && key === KEYS.D) {
      if (disableHotkeys) return
      e.preventDefault()
      quickCopy()
    }
    if (ctrlOrMetaKeyActive && !shiftKey && key === KEYS.Z) {
      if (disableHotkeys) return
      e.preventDefault()
      undo()
    }
    if (ctrlOrMetaKeyActive && key === KEYS.Y) {
      if (disableHotkeys) return
      e.preventDefault()
      redo()
    }
    // Mac 标准重做快捷键: Command+Shift+Z
    if (ctrlOrMetaKeyActive && shiftKey && key === KEYS.Z) {
      if (disableHotkeys) return
      e.preventDefault()
      redo()
    }
    if (ctrlOrMetaKeyActive && key === KEYS.A) {
      if (disableHotkeys) return
      e.preventDefault()
      selectAll()
    }
    if (ctrlOrMetaKeyActive && key === KEYS.L) {
      if (disableHotkeys) return
      e.preventDefault()
      lock()
    }
    if (!shiftKey && ctrlOrMetaKeyActive && key === KEYS.G) {
      if (disableHotkeys) return
      e.preventDefault()
      combine()
    }
    if (shiftKey && ctrlOrMetaKeyActive && key === KEYS.G) {
      if (disableHotkeys) return
      e.preventDefault()
      uncombine()
    }
    if (altKey && key === KEYS.F) {
      if (disableHotkeys) return
      e.preventDefault()
      order(ElementOrderCommands.TOP)
    }
    if (altKey && key === KEYS.B) {
      if (disableHotkeys) return
      e.preventDefault()
      order(ElementOrderCommands.BOTTOM)
    }
    if (key === KEYS.DELETE || key === KEYS.BACKSPACE) {
      if (disableHotkeys) return
      e.preventDefault()
      remove()
    }
    if (key === KEYS.UP) {
      if (disableHotkeys) return
      e.preventDefault()
      move(KEYS.UP)
    }
    if (key === KEYS.DOWN) {
      if (disableHotkeys) return
      e.preventDefault()
      move(KEYS.DOWN)
    }
    if (key === KEYS.LEFT) {
      if (disableHotkeys) return
      e.preventDefault()
      move(KEYS.LEFT)
    }
    if (key === KEYS.RIGHT) {
      if (disableHotkeys) return
      e.preventDefault()
      move(KEYS.RIGHT)
    }
    if (key === KEYS.PAGEUP) {
      if (disableHotkeys) return
      e.preventDefault()
      moveSlide(KEYS.PAGEUP)
    }
    if (key === KEYS.PAGEDOWN) {
      if (disableHotkeys) return
      e.preventDefault()
      moveSlide(KEYS.PAGEDOWN)
    }
    if (key === KEYS.ENTER) {
      if (disableHotkeys) return
      e.preventDefault()
      create()
    }
    if (key === KEYS.TAB) {
      if (disableHotkeys) return
      e.preventDefault()
      tabActiveElement()
    }

    // 画布内快捷创建元素（T / R / O / L）
    if (
      editorAreaFocus &&
      !shiftKey &&
      !ctrlOrMetaKeyActive &&
      !disableHotkeys
    ) {
      if (key === KEYS.T) {
        setCreatingElement({ type: 'text' })
      } else if (key === KEYS.R) {
        setCreatingElement({
          type: 'shape',
          data: {
            viewBox: [200, 200],
            path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
          },
        })
      } else if (key === KEYS.O) {
        setCreatingElement({
          type: 'shape',
          data: {
            viewBox: [200, 200],
            path: 'M 100 0 A 50 50 0 1 1 100 200 A 50 50 0 1 1 100 0 Z',
          },
        })
      } else if (key === KEYS.L) {
        setCreatingElement({
          type: 'line',
          data: {
            path: 'M 0 0 L 20 20',
            style: 'solid',
            points: ['', ''],
          },
        })
      }
    }
  })

  /**
   * keyup / 失焦时重置修饰键状态
   */
  const keyupListener = useMemoizedFn(() => {
    if (ctrlKeyState) setCtrlKeyState(false)
    if (shiftKeyState) setShiftKeyState(false)
    if (spaceKeyState) setSpaceKeyState(false)
  })

  /**
   * 等价 onMounted / onUnmounted
   */
  useEffect(() => {
    document.addEventListener('keydown', keydownListener)
    document.addEventListener('keyup', keyupListener)
    window.addEventListener('blur', keyupListener)

    return () => {
      document.removeEventListener('keydown', keydownListener)
      document.removeEventListener('keyup', keyupListener)
      window.removeEventListener('blur', keyupListener)
    }
  }, [keydownListener, keyupListener])
}

export default useHotkeys
