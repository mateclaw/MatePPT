import React, { type FC, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { debounce } from 'lodash'
import { useMemoizedFn } from 'ahooks'
import { EditorMode, type PPTTextElement } from '@/ppt/core'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import { useMainStore } from '@/ppt/store/useMainStore'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore'
import { useElementShadow } from '@/ppt/hooks/useElementShadow'
import ElementOutline from '@/ppt/classic/components/ElementOutline'
import ProsemirrorEditor from '@/ppt/classic/components/ProsemirrorEditor'
import AnnotationHighlight, { getElementAnnotationMeta } from '@/ppt/classic/components/element/AnnotationHighlight'
import styles from './TextElement.module.scss'
import useElementFlip from '@/ppt/hooks/useElementFlip'
import { buildCssGradient } from '@/ppt/utils/gradient'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

interface TextElementProps {
  elementInfo: PPTTextElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTTextElement, canMove?: boolean) => void
  contextmenus?: () => ContextmenuItem[] | null
}

const TextElement: FC<TextElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const realHeightCacheRef = useRef(-1)
  const realWidthCacheRef = useRef(-1)
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const [contextmenuMenus, setContextmenuMenus] = useState<ContextmenuItem[]>([])
  const prosemirrorEditorRef = useRef<React.ElementRef<typeof ProsemirrorEditor>>(null)

  const handleElementId = useMainStore((state) => state.handleElementId)
  const mode = useMainStore((state) => state.mode)
  const readOnly = mode !== EditorMode.EDIT
  const isScaling = useMainStore((state) => state.isScaling)
  const updateElement = useSlidesStore((state) => state.updateElement)
  const deleteElement = useSlidesStore((state) => state.deleteElement)
  const currentSlideElements = useSlidesStore((state) => state.getCurrentSlide()?.elements || [])
  const highlightAnnotatedElements = useSlidesStore((state) => state.highlightAnnotatedElements)
  const addSnapshot = useSnapshotStore((state) => state.addSnapshot)

  const { shadowStyle } = useElementShadow(elementInfo.shadow)

  const contentRef = useRef(elementInfo.content || '')
  useEffect(() => {
    contentRef.current = elementInfo.content || ''
  }, [elementInfo.content])

  const checkEmptyTextRef = useRef(
    debounce(() => {
      const pureText = contentRef.current.replace(/<[^>]+>/g, '')
      if (!pureText) {
        deleteElement(elementInfo.id)
      }
    }, 300)
  )

  const handleSelectElement = useMemoizedFn((e: MouseEvent | TouchEvent, canMove = true) => {
    if (elementInfo.lock && mode !== EditorMode.ANNOTATE) return
    e.stopPropagation()
    selectElement(e, elementInfo, canMove)
  })

  const updateContent = useMemoizedFn((content: string, ignore = false) => {
    updateElement({
      id: elementInfo.id,
      props: { content },
    })
    if (!ignore) {
      addSnapshot()
    }
  })

  const paddingTop = elementInfo.marginTop ?? 0
  const paddingRight = elementInfo.marginRight ?? 0
  const paddingBottom = elementInfo.marginBottom ?? 0
  const paddingLeft = elementInfo.marginLeft ?? 0
  const paddingX = paddingLeft + paddingRight
  const paddingY = paddingTop + paddingBottom

  useEffect(() => {
    if (handleElementId !== elementInfo.id) return
    if (elementInfo.autoFit === 'none') return
    if (!isScaling) {
      if (!elementInfo.vertical && realHeightCacheRef.current !== -1) {
        updateElement({
          id: elementInfo.id,
          props: { height: realHeightCacheRef.current },
        })
        realHeightCacheRef.current = -1
      }
      if (elementInfo.vertical && realWidthCacheRef.current !== -1) {
        updateElement({
          id: elementInfo.id,
          props: { width: realWidthCacheRef.current },
        })
        realWidthCacheRef.current = -1
      }
    }
  }, [isScaling, elementInfo.id, elementInfo.vertical, handleElementId, updateElement])

  const handleResizeObserverCallback = useMemoizedFn((entries: ResizeObserverEntry[]) => {
    if (!elementRef.current) return
    if (elementInfo.autoFit === 'none') return
    const editorDom = elementRef.current.querySelector('.prosemirror-editor') as HTMLElement | null
    if (!editorDom) return
    const contentRect = entries[0].contentRect
    const realHeight = Math.ceil(Math.max(contentRect.height, editorDom.scrollHeight) + paddingY)
    const realWidth = Math.ceil(Math.max(contentRect.width, editorDom.scrollWidth) + paddingX)

    if (!elementInfo.vertical && elementInfo.height !== realHeight) {
      if (!isScaling) {
        updateElement({
          id: elementInfo.id,
          props: { height: realHeight },
        })
      }
      else {
        realHeightCacheRef.current = realHeight
      }
    }

    if (elementInfo.vertical && elementInfo.width !== realWidth) {
      if (!isScaling) {
        updateElement({
          id: elementInfo.id,
          props: { width: realWidth },
        })
      }
      else {
        realWidthCacheRef.current = realWidth
      }
    }
  })

  useEffect(() => {
    if (!elementRef.current) return
    const editorDom = elementRef.current.querySelector('.prosemirror-editor') as HTMLElement | null
    if (!editorDom) return
    resizeObserverRef.current = new ResizeObserver(handleResizeObserverCallback)
    resizeObserverRef.current.observe(editorDom)
    return () => {
      if (resizeObserverRef.current && elementRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [handleResizeObserverCallback])

  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)

  useEffect(() => {
    if (handleElementId === elementInfo.id) return
    checkEmptyTextRef.current()
  }, [handleElementId, elementInfo.id])

  useEffect(() => {
    if (elementInfo.autoFit !== 'resizeShapeToFitText') return
    if (isScaling) return
    if (!elementRef.current) return
    const editorDom = elementRef.current.querySelector('.prosemirror-editor') as HTMLElement | null
    if (!editorDom) return
    const realHeight = Math.ceil(editorDom.scrollHeight + paddingY)
    const realWidth = Math.ceil(editorDom.scrollWidth + paddingX)
    if (!elementInfo.vertical && elementInfo.height !== realHeight) {
      updateElement({ id: elementInfo.id, props: { height: realHeight } })
    }
    if (elementInfo.vertical && elementInfo.width !== realWidth) {
      updateElement({ id: elementInfo.id, props: { width: realWidth } })
    }
  }, [
    elementInfo.autoFit,
    elementInfo.content,
    elementInfo.height,
    elementInfo.id,
    elementInfo.vertical,
    elementInfo.width,
    isScaling,
    paddingX,
    paddingY,
    updateElement,
  ])

  const getSelectedText = useMemoizedFn(() => {
    return (
      prosemirrorEditorRef.current?.getSelectionText() ||
      window.getSelection()?.toString() ||
      ''
    )
  })

  const copySelectionText = useMemoizedFn(async () => {
    const selectionText = getSelectedText() || prosemirrorEditorRef.current?.getTextContent() || ''
    if (!selectionText) return
    try {
      await navigator.clipboard.writeText(selectionText)
    } catch {
      document.execCommand('copy')
    }
  })

  const pasteTextAtCursor = useMemoizedFn(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      prosemirrorEditorRef.current?.insertText(text)
    } catch {
      // ignore clipboard failures
    }
  })

  const cutSelectionText = useMemoizedFn(async () => {
    const selectionText = getSelectedText()
    if (!selectionText) return
    try {
      await navigator.clipboard.writeText(selectionText)
    } catch {
      document.execCommand('copy')
    }
    prosemirrorEditorRef.current?.deleteSelectionOrAll()
  })

  const handleContextMenu = useMemoizedFn((e: React.MouseEvent) => {
    if (!contextmenus) return
    const target = e.target as HTMLElement | null
    const inEditor = Boolean(target?.closest?.('.prosemirror-editor, .ProseMirror'))

    if (inEditor && !readOnly && !elementInfo.lock && !elementInfo.inherited) {
      e.preventDefault()
      e.stopPropagation()
      const selectionText = getSelectedText()
      setContextmenuMenus([
        { text: '复制', subText: 'Ctrl + C', handler: copySelectionText },
        { text: '剪切', subText: 'Ctrl + X', handler: cutSelectionText, disable: !selectionText },
        { text: '粘贴', subText: 'Ctrl + V', handler: pasteTextAtCursor },
      ])
      setContextmenuAxis({ x: e.clientX, y: e.clientY })
      return
    }

    if (!elementInfo.lock || mode === EditorMode.ANNOTATE) {
      selectElement(e as any, elementInfo, false)
    }
    e.preventDefault()
    e.stopPropagation()
    setContextmenuMenus(contextmenus() || [])
    setContextmenuAxis({ x: e.clientX, y: e.clientY })
  })

  const removeContextmenu = useMemoizedFn(() => {
    setContextmenuAxis(null)
  })

  const menus = useMemo(() => contextmenuMenus, [contextmenuMenus])

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: elementInfo.top,
    left: elementInfo.left,
    width: elementInfo.width,
    height: elementInfo.height,
  }

  const rotateWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `rotate(${elementInfo.rotate}deg)`,
  }

  const elementContentStyle: React.CSSProperties & Record<string, any> = {
    position: 'relative',
    padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
    lineHeight: elementInfo.lineHeight || 1.5,
    wordBreak: elementInfo.wrapText === false ? 'normal' : 'break-word',
    whiteSpace: elementInfo.wrapText === false ? 'nowrap' : 'normal',
    display: 'flex',
    flexDirection: 'column',
    transform: flipStyle,
    width: elementInfo.vertical ? 'auto' : elementInfo.width,
    height: elementInfo.height,
    backgroundColor: resolvePPTColorValue(elementInfo.fill),
    opacity: elementInfo.opacity,
    textShadow: shadowStyle,
    letterSpacing: `${elementInfo.wordSpace || 0}px`,
    color: resolvePPTColorValue(elementInfo.fontColor),
    fontFamily: elementInfo.fontName,
    writingMode: elementInfo.vertical ? 'vertical-rl' : 'horizontal-tb',
  }
  const verticalAlign = elementInfo.alignV || 'top'
  if (verticalAlign === 'top') {
    elementContentStyle.justifyContent = 'flex-start'
  } else if (verticalAlign === 'middle') {
    elementContentStyle.justifyContent = 'center'
  } else if (verticalAlign === 'bottom') {
    elementContentStyle.justifyContent = 'flex-end'
  }

  const textGradient = buildCssGradient(elementInfo.fontGradient)
  const textGradientStyle = textGradient
    ? {
        backgroundImage: textGradient,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }
    : null

  const annotationMeta = useMemo(
    () => getElementAnnotationMeta(elementInfo, currentSlideElements),
    [elementInfo, currentSlideElements]
  )
  const showAnnotationHighlight = highlightAnnotatedElements && !!annotationMeta.label

  return (
    <>
      <div
        className={clsx(
          styles.editableElementText,
          elementInfo.lock && styles.lock,
        )}
        style={containerStyle}
        data-text-id={elementInfo.id}
        >
          <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
            <div
            ref={elementRef}
            className={styles.elementContent}
            style={elementContentStyle}
            onMouseDown={(e) => handleSelectElement(e as any)}
            onTouchStart={(e) => handleSelectElement(e as any)}
            onContextMenu={handleContextMenu}
          >
            <ElementOutline
              width={elementInfo.width}
              height={elementInfo.height}
              outline={elementInfo.outline}
            />

            <ProsemirrorEditor
              ref={prosemirrorEditorRef}
              className={styles.text}
              elementId={elementInfo.id}
              defaultColor={resolvePPTColorValue(elementInfo.fontColor)}
              defaultFontName={elementInfo.fontName}
              editable={!elementInfo.lock && !readOnly && !elementInfo.inherited}
              value={elementInfo.content || ''}
              style={{
                width: '100%',
                whiteSpace: elementInfo.wrapText === false ? 'nowrap' : 'normal',
                ['--paragraphSpace' as any]: `${
                  elementInfo.paragraphSpace === undefined ? 5 : elementInfo.paragraphSpace
                }px`,
                caretColor: '#000000',

                transform: (elementInfo.flipH || elementInfo.flipV) ? 'scaleX(-1)' : 'none',
                ...(textGradientStyle || {}),
              }}
              onUpdate={({ value, ignore }) => updateContent(value, ignore)}
              onMouseDown={(e) => {
                e.stopPropagation()
                handleSelectElement(e as any, false)
              }}
            />

            <div className={clsx(styles.dragHandler, styles.dragHandlerTop)} />
            <div className={clsx(styles.dragHandler, styles.dragHandlerBottom)} />
            {showAnnotationHighlight && <AnnotationHighlight label={annotationMeta.label} color={annotationMeta.color} />}
          </div>
        </div>
      </div>

      {contextmenuAxis &&  menus.length > 0 && (
        <Contextmenu
          axis={contextmenuAxis}
          el={document.querySelector(`[data-text-id="${elementInfo.id}"]`) || document.body}
          menus={menus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </>
  )
}

export default TextElement
