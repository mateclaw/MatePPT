import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import { EditorMode, ShapeCategory, type PPTShapeElement, type ShapeText } from '@/ppt/core'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import { useMainStore } from '@/ppt/store/useMainStore'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore'
import { useElementOutline } from '@/ppt/hooks/useElementOutline'
import { useElementShadow } from '@/ppt/hooks/useElementShadow'
import { useElementFlip } from '@/ppt/hooks/useElementFlip'
import { useElementFill } from '@/ppt/hooks/useElementFill'
import { buildCssGradient } from '@/ppt/utils/gradient'
import ProsemirrorEditor from '@/ppt/classic/components/ProsemirrorEditor'
import { GradientDefs } from './GradientDefs'
import { PatternDefs } from './PatternDefs'
import ImageDefs from './ImageDefs'
import AnnotationHighlight, { getElementAnnotationMeta } from '@/ppt/classic/components/element/AnnotationHighlight'
import styles from './ShapeElement.module.scss'
import { SHAPE_LIST, SHAPE_PATH_FORMULAS } from '@/ppt/configs/shapes'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

interface ShapeElementProps {
  elementInfo: PPTShapeElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTShapeElement, canMove?: boolean) => void
  contextmenus?: () => ContextmenuItem[] | null
}

const ShapeElement: React.FC<ShapeElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const shapeFormatPainter = useMainStore((state) => state.shapeFormatPainter)
  const setShapeFormatPainter = useMainStore((state) => state.setShapeFormatPainter)
  const handleElementId = useMainStore((state) => state.handleElementId)
  const mode = useMainStore((state) => state.mode)

  const theme = useSlidesStore((state) => state.theme)
  const updateElement = useSlidesStore((state) => state.updateElement)
  const removeElementProps = useSlidesStore((state) => state.removeElementProps)
  const currentSlideElements = useSlidesStore((state) => state.getCurrentSlide()?.elements || [])
  const highlightAnnotatedElements = useSlidesStore((state) => state.highlightAnnotatedElements)
  const addSnapshot = useSnapshotStore((state) => state.addSnapshot)

  const [editable, setEditable] = useState(false)
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const [contextmenuMenus, setContextmenuMenus] = useState<ContextmenuItem[]>([])
  const prosemirrorEditorRef = useRef<React.ElementRef<typeof ProsemirrorEditor>>(null)

  const handleSelectElement = useMemoizedFn((e: MouseEvent | TouchEvent, canMove = true) => {
    if (elementInfo.lock && mode !== EditorMode.ANNOTATE) return
    e.stopPropagation()
    selectElement(e, elementInfo, canMove)
  })

  const execFormatPainter = useMemoizedFn(() => {
    if (!shapeFormatPainter) return
    const { keep, ...newProps } = shapeFormatPainter

    updateElement({
      id: elementInfo.id,
      props: newProps,
    })
    addSnapshot()

    if (!keep) {
      setShapeFormatPainter(null)
    }
  })

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

    if (inEditor && mode === EditorMode.EDIT && !elementInfo.lock && !elementInfo.inherited) {
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

  const { fill } = useElementFill(elementInfo, 'editable')
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(elementInfo.outline)
  const { shadowStyle } = useElementShadow(elementInfo.shadow)
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)
  const outlineGradient = elementInfo.outline?.gradient
  const hasOutlineGradient = !!outlineGradient?.colors?.length
  const outlineGradientId = `editable-outline-gradient-${elementInfo.id}`
  const outlineStroke = hasOutlineGradient ? `url(#${outlineGradientId})` : resolvePPTColorValue(outlineColor)

  const text = useMemo<ShapeText>(() => {
    const fontColor = new PPTColor()
    const resolved = resolvePPTColorValue(theme.themeColors?.dk1, theme.themeColors) || '#000000'
    fontColor.value = resolved
    const defaultText: ShapeText = {
      content: '',
      alignV: 'middle',
      fontName: theme.fontName,
      fontColor: fontColor,
    }
    if (!elementInfo.text) return defaultText
    return {
      ...defaultText,
      ...elementInfo.text,
      fontColor: elementInfo.text.fontColor ?? defaultText.fontColor,
    }
  }, [elementInfo.text, theme.fontName, theme.themeColors])

  const updateText = useMemoizedFn((content: string, ignore = false) => {
    const nextText = { ...text, content }
    updateElement({
      id: elementInfo.id,
      props: { text: nextText },
    })
    if (!ignore) addSnapshot()
  })

  const checkEmptyText = useMemoizedFn(() => {
    if (!elementInfo.text) return
    const pureText = elementInfo.text.content.replace(/<[^>]+>/g, '')
    if (!pureText) {
      removeElementProps({ id: elementInfo.id, propName: 'text' })
      addSnapshot()
    }
  })

  const startEdit = useMemoizedFn(() => {
    if (mode !== EditorMode.EDIT) return
    if (elementInfo.inherited) return
    setEditable(true)
    setTimeout(() => {
      prosemirrorEditorRef.current?.focus()
    }, 0)
  })

  useEffect(() => {
    if (handleElementId !== elementInfo.id && editable) {
      setEditable(false)
    }
  }, [handleElementId, elementInfo.id, editable])

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
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

  const elementContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    cursor: elementInfo.lock ? 'default' : 'move',
    opacity: elementInfo.opacity,
    filter: shadowStyle ? `drop-shadow(${shadowStyle})` : undefined,
    transform: flipStyle,
    color: resolvePPTColorValue(text.fontColor, theme.themeColors) ,
    fontFamily: text.fontName,
  }

  const shapeTextStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: `${text.marginTop ?? 0}px ${text.marginRight ?? 0}px ${text.marginBottom ?? 0}px ${text.marginLeft ?? 0}px`,
    lineHeight: text.lineHeight ?? 1.2,
    letterSpacing: `${text.wordSpace ?? 0}px`,
    wordBreak: 'break-word',
    pointerEvents: 'none',
  }

  const shapeTextAlignStyle: React.CSSProperties = {
    ...shapeTextStyle,
    pointerEvents: editable || text.content ? 'all' : 'none',
    caretColor: '#000000',

  }

  if (text.alignV === 'top') {
    shapeTextAlignStyle.justifyContent = 'flex-start'
  }
  else if (text.alignV === 'middle') {
    shapeTextAlignStyle.justifyContent = 'center'
  }
  else if (text.alignV === 'bottom') {
    shapeTextAlignStyle.justifyContent = 'flex-end'
  }

  if (elementInfo.flipH || elementInfo.flipV) {
    shapeTextAlignStyle.transform = 'scaleX(-1)'
  }

  // 处理文字渐变色
  const fontGradient = buildCssGradient(text.gradient)
  if (fontGradient) {
    shapeTextAlignStyle.backgroundImage = fontGradient
    shapeTextAlignStyle.backgroundClip = 'text'
    shapeTextAlignStyle.WebkitBackgroundClip = 'text'
    shapeTextAlignStyle.color = 'transparent'
    shapeTextAlignStyle.WebkitTextFillColor = 'transparent'
  }

  const presetShape = useMemo(() => {
    if (elementInfo.category !== ShapeCategory.PRESET || !elementInfo.pathFormula) return null
    return SHAPE_LIST.flatMap((group) => group.children)
      .find((item) => item.pathFormula === elementInfo.pathFormula) || null
  }, [elementInfo.category, elementInfo.pathFormula])

  const rectShape = useMemo(() => {
    const [firstGroup] = SHAPE_LIST
    return firstGroup?.children?.[0] || null
  }, [])

  const annotationMeta = useMemo(
    () => getElementAnnotationMeta(elementInfo, currentSlideElements),
    [elementInfo, currentSlideElements]
  )
  const showAnnotationHighlight = highlightAnnotatedElements && !!annotationMeta.label

  const { shapePath, shapeViewBox } = useMemo(() => {
    if (elementInfo.category === ShapeCategory.PRESET && elementInfo.pathFormula) {
      const formula = SHAPE_PATH_FORMULAS[elementInfo.pathFormula]
      if (formula) {
        const values = elementInfo.keypoints?.length ? elementInfo.keypoints : formula.defaultValue
        return {
          shapePath: formula.formula(elementInfo.width, elementInfo.height, values),
          shapeViewBox: [elementInfo.width, elementInfo.height] as [number, number],
        }
      }
      if (presetShape?.path && presetShape.viewBox) {
        return { shapePath: presetShape.path, shapeViewBox: presetShape.viewBox }
      }
    }

    if (elementInfo.category === ShapeCategory.RECTANGLE && rectShape?.path && rectShape.viewBox) {
      return { shapePath: rectShape.path, shapeViewBox: rectShape.viewBox }
    }

    if (elementInfo.category === ShapeCategory.CUSTOM) {
      return { shapePath: elementInfo.path, shapeViewBox: elementInfo.viewBox }
    }

    return {
      shapePath: elementInfo.path || presetShape?.path || rectShape?.path,
      shapeViewBox: elementInfo.viewBox || presetShape?.viewBox || rectShape?.viewBox,
    }
  }, [
    elementInfo.category,
    elementInfo.path,
    elementInfo.pathFormula,
    elementInfo.keypoints,
    elementInfo.viewBox,
    elementInfo.width,
    elementInfo.height,
    presetShape,
    rectShape,
  ])

  const containerClassName = [
    styles['editable-element-shape'],
    elementInfo.lock ? styles.lock : '',
    shapeFormatPainter ? styles['format-painter'] : '',
  ]
    .filter(Boolean)
    .join(' ')

  const shapeTextClassName = [
    styles['shape-text'],
    styles[text.alignH] ?? '',
    editable || text.content ? styles.editable : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div
        className={containerClassName}
        style={containerStyle}
        data-shape-id={elementInfo.id}
      >
        <div className={styles['rotate-wrapper']} style={rotateWrapperStyle}>
          <div
            className={styles['element-content']}
            style={elementContentStyle}
            onMouseDown={(e) => handleSelectElement(e as any)}
            onMouseUp={execFormatPainter}
            onTouchStart={(e) => handleSelectElement(e as any)}
            onDoubleClick={startEdit}
            onContextMenu={handleContextMenu}
          >
            <svg overflow="visible" width={elementInfo.width} height={elementInfo.height}>
              <defs>
                {elementInfo.picture && (
                  <ImageDefs
                    id={`editable-picture-${elementInfo.id}`}
                    picture={elementInfo.picture}
                    width={elementInfo.width}
                    height={elementInfo.height}
                  />
                )}
                {elementInfo.pattern && (
                  <PatternDefs id={`editable-pattern-${elementInfo.id}`} pattern={elementInfo.pattern} />
                )}
                {!elementInfo.pattern && elementInfo.gradient && (
                  <GradientDefs
                    id={`editable-gradient-${elementInfo.id}`}
                    type={elementInfo.gradient.type}
                    colors={elementInfo.gradient.colors}
                    rotate={elementInfo.gradient.rotate}
                  />
                )}
                {hasOutlineGradient && (
                  <GradientDefs
                    id={outlineGradientId}
                    type={outlineGradient.type}
                    colors={outlineGradient.colors}
                    rotate={outlineGradient.rotate}
                  />
                )}
              </defs>
              {shapePath && shapeViewBox && (
                <g
                  transform={`scale(${elementInfo.width / shapeViewBox[0]}, ${elementInfo.height / shapeViewBox[1]
                    }) translate(0,0) matrix(1,0,0,1,0,0)`}
                >
                  <path
                    className={styles['shape-path']}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="butt"
                    strokeMiterlimit={8}
                    d={shapePath}
                    fill={fill}
                    stroke={outlineStroke}
                    strokeWidth={outlineWidth}
                    strokeDasharray={strokeDashArray}
                  />
                </g>
              )}
            </svg>

            <div className={shapeTextClassName} style={shapeTextAlignStyle}>
              {(editable || text.content) && (
                <ProsemirrorEditor
                  ref={prosemirrorEditorRef}
                  elementId={elementInfo.id}
                  defaultColor={resolvePPTColorValue(text.fontColor, theme.themeColors) }
                  defaultFontName={text.fontName}
                  editable={!elementInfo.lock && !elementInfo.inherited && mode === EditorMode.EDIT}
                  value={text.content}
                  style={{
                    ['--paragraphSpace' as any]: `${text.paragraphSpace === undefined ? 5 : text.paragraphSpace
                      }px`,
                  }}
                  onUpdate={({ value, ignore }) => updateText(value, ignore)}
                  onBlur={checkEmptyText}
                  onMouseDown={(e) => {

                    e.stopPropagation()
                    handleSelectElement(e as any, false)
                  }}
                />
              )}
            </div>
            {showAnnotationHighlight && <AnnotationHighlight label={annotationMeta.label} color={annotationMeta.color} />}
          </div>
        </div>
      </div>

      {contextmenuAxis && menus.length > 0 && (
        <Contextmenu
          axis={contextmenuAxis}
          el={document.querySelector(`[data-shape-id="${elementInfo.id}"]`) || document.body}
          menus={menus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </>
  )
}

export default ShapeElement
