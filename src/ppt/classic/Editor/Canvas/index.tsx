import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from 'antd'
import { throttle, cloneDeep } from 'lodash'
import { useMemoizedFn } from 'ahooks'

import { useShallow } from 'zustand/react/shallow'
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/ppt/store'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { type PPTElement, type PPTShapeElement, type PPTLineElement, type PPTVideoElement, type PPTAudioElement, type PPTChartElement, EditorMode } from '@/ppt/core'
import type { AlignmentLineProps, CreateCustomShapeData, OperateLineHandlers, OperateResizeHandlers } from '@/ppt/types/edit'
import { removeAllRanges } from '@/ppt/utils/selection'

import useViewportSize from './hooks/useViewportSize'
import useMouseSelection from './hooks/useMouseSelection'
import useDropImageOrText from './hooks/useDropImageOrText'
import useRotateElement from './hooks/useRotateElement'
import useScaleElement from './hooks/useScaleElement'
import useSelectAndMoveElement from './hooks/useSelectElement'
import useDragElement from './hooks/useDragElement'
import useDragLineElement from './hooks/useDragLineElement'
import useMoveShapeKeypoint from './hooks/useMoveShapeKeypoint'
import useInsertFromCreateSelection from './hooks/useInsertFromCreateSelection'

import useDeleteElement from '@/ppt/hooks/useDeleteElement'
import useCopyAndPasteElement from '@/ppt/hooks/useCopyAndPasteElement'
import useSelectElement from '@/ppt/hooks/useSelectElement'
import useScaleCanvas from '@/ppt/hooks/useScaleCanvas'
import useScreening from '@/ppt/hooks/useScreening'
import useCreateElement from '@/ppt/hooks/useCreateElement'

import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import EditableElement from './EditableElement'
import MouseSelection from './MouseSelection'
import ViewportBackground from './ViewportBackground'
import AlignmentLine from './AlignmentLine'
import Ruler from './Ruler'
import ElementCreateSelection from './ElementCreateSelection'
import ShapeCreateCanvas from './ShapeCreateCanvas'
import MultiSelectOperate from './Operate/MultiSelectOperate'
import Operate from './Operate'
import LinkDialog from './LinkDialog'

import styles from './Canvas.module.scss'
import { cn } from '@/lib/utils'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'

interface CanvasProps {
  viewportUnderlay?: React.ReactNode,
}

export default function Canvas({ viewportUnderlay }: CanvasProps) {
  const {
    activeElementIdList,
    activeGroupElementId,
    handleElementId,
    hiddenElementIdList,
    hoveredElementId,
    editorAreaFocus,
    gridLineSize,
    showRuler,
    creatingElement,
    creatingCustomShape,
    mode,
    canvasScale,
    textFormatPainter,
    setActiveElementIdList,
    setActiveGroupElementId,
    setEditorAreaFocus,
    setTextFormatPainter,
    setShowRuler,
    setGridLineSize,
  } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,
      activeGroupElementId: state.activeGroupElementId,
      handleElementId: state.handleElementId,
      hiddenElementIdList: state.hiddenElementIdList,
      hoveredElementId: state.hoveredElementId,
      editorAreaFocus: state.editorAreaFocus,
      gridLineSize: state.gridLineSize,
      showRuler: state.showRuler,
      creatingElement: state.creatingElement,
      creatingCustomShape: state.creatingCustomShape,
      mode: state.mode,
      canvasScale: state.canvasScale,
      textFormatPainter: state.textFormatPainter,
      setActiveElementIdList: state.setActiveElementIdList,
      setActiveGroupElementId: state.setActiveGroupElementId,
      setEditorAreaFocus: state.setEditorAreaFocus,
      setTextFormatPainter: state.setTextFormatPainter,
      setShowRuler: state.setShowRuler,
      setGridLineSize: state.setGridLineSize,
    })),
  )

  const { slides, slideIndex } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
    })),
  )
  const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])

  const { ctrlKeyState, spaceKeyState } = useKeyboardStore(
    useShallow((state) => ({
      ctrlKeyState: state.ctrlKeyState,
      spaceKeyState: state.spaceKeyState,
    })),
  )

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)

  const [alignmentLines, setAlignmentLines] = useState<AlignmentLineProps[]>([])
  const [elementList, setElementList] = useState<PPTElement[]>([])
  const hoveredElement = useMemo(() => {
    if (!hoveredElementId) return null
    return elementList.find((element) => element.id === hoveredElementId) || null
  }, [elementList, hoveredElementId])

  const [linkDialogVisible, setLinkDialogVisible] = useState(false)
  const openLinkDialog = useCallback(() => setLinkDialogVisible(true), [])

  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const [contextmenuMenus, setContextmenuMenus] = useState<ContextmenuItem[]>([])

  useEffect(() => {
    if (currentSlide?.elements) {
      setElementList(cloneDeep(currentSlide.elements))
    } else {
      setElementList([])
    }
  }, [currentSlide])

  useEffect(() => {
    setActiveGroupElementId('')
  }, [handleElementId, setActiveGroupElementId])

  useEffect(() => {
    if (activeElementIdList.length) {
      setTimeout(() => setActiveElementIdList([]), 0)
    }
  }, [])

  useDropImageOrText(canvasRef)

  const { viewportStyles, dragViewport } = useViewportSize(canvasRef)
  const {
    mouseSelection,
    mouseSelectionVisible,
    mouseSelectionQuadrant,
    updateMouseSelection,
  } = useMouseSelection({ elementList, viewportRef })

  const { dragElement } = useDragElement({
    elementList,
    setElementList,
    alignmentLines,
    setAlignmentLines,
    canvasScale,
  })
  const { dragLineElement } = useDragLineElement({ elementList, setElementList })
  const { selectElement } = useSelectAndMoveElement({ elementList, moveElement: dragElement })
  const { scaleElement, scaleMultiElement } = useScaleElement({
    elementList,
    setElementList,
    alignmentLines,
    setAlignmentLines,
    canvasScale,
  })
  const { rotateElement } = useRotateElement({ elementList, setElementList, viewportRef, canvasScale })
  const { moveShapeKeypoint } = useMoveShapeKeypoint({ elementList, setElementList, canvasScale })

  const { selectAllElements } = useSelectElement()
  const { deleteAllElements } = useDeleteElement()
  const { pasteElement } = useCopyAndPasteElement()
  const { enterScreeningFromStart } = useScreening()
  const { createTextElement, createShapeElement } = useCreateElement()

  const { scaleCanvas } = useScaleCanvas()
  const throttleScaleCanvas = useMemo(
    () => throttle(scaleCanvas, 100, { leading: true, trailing: false }),
    [scaleCanvas],
  )
  useEffect(() => {
    return () => {
      throttleScaleCanvas.cancel()
      if (textFormatPainter) setTextFormatPainter(null)
    }
  }, [throttleScaleCanvas, textFormatPainter, setTextFormatPainter])

  const handleClickBlankArea = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (activeElementIdList.length) setActiveElementIdList([])

      if (!spaceKeyState) updateMouseSelection(e.nativeEvent)
      else dragViewport(e.nativeEvent)

      if (!editorAreaFocus) setEditorAreaFocus(true)
      if (textFormatPainter) setTextFormatPainter(null)
      removeAllRanges()
      const activeElement = document.activeElement as HTMLElement | null
      if (activeElement?.closest?.('.prosemirror-editor, .ProseMirror')) {
        activeElement.blur()
      }
    },
    [
      activeElementIdList.length,
      spaceKeyState,
      updateMouseSelection,
      dragViewport,
      editorAreaFocus,
      setEditorAreaFocus,
      textFormatPainter,
      setTextFormatPainter,
      setActiveElementIdList,
    ],
  )

  const handleDblClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (mode !== EditorMode.EDIT) return
      if (activeElementIdList.length || creatingElement || creatingCustomShape) return
      if (!viewportRef.current) return

      const viewportRect = viewportRef.current.getBoundingClientRect()
      const left = (e.pageX - viewportRect.x) / canvasScale
      const top = (e.pageY - viewportRect.y) / canvasScale

      createTextElement({
        left,
        top,
        width: 200 / canvasScale,
        height: 0,
      })
    },
    [activeElementIdList.length, creatingElement, creatingCustomShape, canvasScale, createTextElement],
  )

  const removeEditorAreaFocus = useCallback(() => {
    if (editorAreaFocus) setEditorAreaFocus(false)
  }, [editorAreaFocus, setEditorAreaFocus])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!canvasRef.current) return
      if (canvasRef.current.contains(e.target as Node)) return
      removeEditorAreaFocus()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [removeEditorAreaFocus])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const handleCanvasMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest?.('.prosemirror-editor, .ProseMirror')) return
      removeAllRanges()
      const activeElement = document.activeElement as HTMLElement | null
      if (activeElement?.closest?.('.prosemirror-editor, .ProseMirror')) {
        activeElement.blur()
      }
    }
    el.addEventListener('mousedown', handleCanvasMouseDown, true)
    return () => {
      el.removeEventListener('mousedown', handleCanvasMouseDown, true)
    }
  }, [])

  const handleMousewheelCanvas = useCallback(
    (e: WheelEvent) => {
      if (ctrlKeyState) {
        e.preventDefault()
        if (mode === EditorMode.ANNOTATE) return
        if (e.deltaY > 0) throttleScaleCanvas('-')
        else if (e.deltaY < 0) throttleScaleCanvas('+')
      }
    },
    [ctrlKeyState, mode, throttleScaleCanvas],
  )

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    el.addEventListener('wheel', handleMousewheelCanvas, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleMousewheelCanvas)
    }
  }, [handleMousewheelCanvas])

  const toggleRuler = useCallback(() => {
    setShowRuler(!showRuler)
  }, [setShowRuler, showRuler])

  const { insertElementFromCreateSelection, formatCreateSelection } =
    useInsertFromCreateSelection(viewportRef)

  const insertCustomShape = useCallback(
    (data: CreateCustomShapeData) => {
      const { start, end, path, viewBox } = data
      const position = formatCreateSelection({ start, end })
      if (position) {
        const supplement: Partial<PPTShapeElement> = {}
        if (data.fill) supplement.fill = PPTColor.ofFixed(data.fill)
        if (data.outline) supplement.outline = data.outline
        createShapeElement(position, { path, viewBox }, supplement)
      }
    },
    [createShapeElement, formatCreateSelection],
  )

  const contextmenus = useMemoizedFn((): ContextmenuItem[] => {

    if (mode === EditorMode.EDIT) return [
      {
        text: '粘贴',
        subText: 'Ctrl + V',
        handler: pasteElement,
      },
      {
        text: '全选',
        subText: 'Ctrl + A',
        handler: selectAllElements,
      },
      {
        text: '标尺',
        subText: showRuler ? '√' : '',
        handler: toggleRuler,
      },
      {
        text: '网格线',
        handler: () => setGridLineSize(gridLineSize ? 0 : 50),
        children: [
          {
            text: '无',
            subText: gridLineSize === 0 ? '√' : '',
            handler: () => setGridLineSize(0),
          },
          {
            text: '小',
            subText: gridLineSize === 25 ? '√' : '',
            handler: () => setGridLineSize(25),
          },
          {
            text: '中',
            subText: gridLineSize === 50 ? '√' : '',
            handler: () => setGridLineSize(50),
          },
          {
            text: '大',
            subText: gridLineSize === 100 ? '√' : '',
            handler: () => setGridLineSize(100),
          },
        ],
      },
      {
        text: '重置当前页',
        handler: deleteAllElements,
      },
      { divider: true },
      {
        text: '幻灯片放映',
        subText: 'F5',
        handler: enterScreeningFromStart,
      },
    ]
    else{
      return []
    }
  })

  const openContextmenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (mode !== EditorMode.EDIT) return
      const menus = contextmenus()
      if (!menus.length) return
      e.preventDefault()
      setContextmenuAxis({ x: e.clientX, y: e.clientY })
      setContextmenuMenus(menus)
    },
    [contextmenus, mode],
  )

  const removeContextmenu = useCallback(() => {
    setContextmenuAxis(null)
  }, [])

  return (
    <div
      className={cn(styles.canvas, { [styles['canvas-annotate']]: mode === EditorMode.ANNOTATE })}
      ref={canvasRef}
      onMouseDown={handleClickBlankArea}
      onDoubleClick={handleDblClick}
      onContextMenu={openContextmenu}
      data-ppt-canvas="true"
    >
      {creatingElement && (
        <ElementCreateSelection onCreated={insertElementFromCreateSelection} />
      )}
      {creatingCustomShape && (
        <ShapeCreateCanvas onCreated={insertCustomShape} />
      )}

      <div
        className={styles['viewport-wrapper']}

        style={{
          width: `${viewportStyles.width * canvasScale}px`,
          height: `${viewportStyles.height * canvasScale}px`,
          left: `${viewportStyles.left}px`,
          top: `${viewportStyles.top}px`,
        }}
      >
        <div className={styles.operates}>
          {alignmentLines.map((line, index) => (
            <AlignmentLine
              key={index}
              type={line.type}
              axis={line.axis}
              length={line.length}
              canvasScale={canvasScale}
            />
          ))}
          {hoveredElement && !hiddenElementIdList.includes(hoveredElement.id) && (
            <div
              className={styles['hover-outline']}
              style={{
                top: `${hoveredElement.top * canvasScale}px`,
                left: `${hoveredElement.left * canvasScale}px`,
                width: `${(hoveredElement.type === 'line'
                  ? Math.max(
                    Math.abs((hoveredElement as PPTLineElement).start[0] - (hoveredElement as PPTLineElement).end[0]),
                    24,
                  )
                  : hoveredElement.width) * canvasScale}px`,
                height: `${(hoveredElement.type === 'line'
                  ? Math.max(
                    Math.abs((hoveredElement as PPTLineElement).start[1] - (hoveredElement as PPTLineElement).end[1]),
                    24,
                  )
                  : 'height' in hoveredElement
                    ? hoveredElement.height
                    : 0) * canvasScale}px`,
                transform: `rotate(${('rotate' in hoveredElement ? hoveredElement.rotate : 0) || 0}deg)`,
                transformOrigin: `${((hoveredElement.type === 'line'
                  ? Math.max(
                    Math.abs((hoveredElement as PPTLineElement).start[0] - (hoveredElement as PPTLineElement).end[0]),
                    24,
                  )
                  : hoveredElement.width) * canvasScale) / 2}px ${((hoveredElement.type === 'line'
                    ? Math.max(
                      Math.abs((hoveredElement as PPTLineElement).start[1] - (hoveredElement as PPTLineElement).end[1]),
                      24,
                    )
                    : 'height' in hoveredElement
                      ? hoveredElement.height
                      : 0) * canvasScale) / 2}px`,
              }}
            />
          )}
          {activeElementIdList.length > 1 && (
            <MultiSelectOperate elementList={elementList} scaleMultiElement={scaleMultiElement} />
          )}
          {elementList.map((element) =>
            hiddenElementIdList.includes(element.id) ? null : (
              <Operate
                key={element.id}
                elementInfo={element}
                isSelected={activeElementIdList.includes(element.id)}
                isActive={handleElementId === element.id}
                isActiveGroupElement={activeGroupElementId === element.id}
                isMultiSelect={activeElementIdList.length > 1}
                rotateElement={rotateElement as any}
                scaleElement={scaleElement as any}
                openLinkDialog={openLinkDialog}
                dragLineElement={dragLineElement as any}
                moveShapeKeypoint={moveShapeKeypoint as any}
              />
            ),
          )}
          <ViewportBackground />
        </div>

        <div
          className={styles.viewport}
          ref={viewportRef}
          style={{ transform: `scale(${canvasScale})` }}
        >
          {viewportUnderlay}
          {mouseSelectionVisible && (
            <MouseSelection
              top={mouseSelection.top}
              left={mouseSelection.left}
              width={mouseSelection.width}
              height={mouseSelection.height}
              quadrant={mouseSelectionQuadrant}
            />
          )}

          {elementList.map((element, index) =>
            hiddenElementIdList.includes(element.id) ? null : (
              <EditableElement
                key={element.id}
                elementInfo={element}
                elementIndex={index + 1}
                isMultiSelect={activeElementIdList.length > 1}
                selectElement={selectElement}
                openLinkDialog={openLinkDialog}
              />
            ),
          )}
        </div>
      </div>

      {spaceKeyState && <div className={styles['drag-mask']} />}

      {showRuler && <Ruler viewportStyles={viewportStyles} elementList={elementList} />}

      <Modal
        open={linkDialogVisible}
        width={540}
        footer={null}
        onCancel={() => setLinkDialogVisible(false)}
        destroyOnHidden
      >
        <LinkDialog onClose={() => setLinkDialogVisible(false)} />
      </Modal>

      {contextmenuAxis && (
        <Contextmenu
          axis={contextmenuAxis}
          el={canvasRef.current || document.body}
          menus={contextmenuMenus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </div>
  )
}
