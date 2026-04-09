import React, { type FC, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import type { PPTMathElement } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import { emitter, EmitterEvents } from '@/ppt/utils/emitter'
import { useElementFlip } from '@/ppt/hooks/useElementFlip'
import MathLiveRenderer from './MathLiveRenderer'
import styles from './MathElement.module.scss'

interface MathElementProps {
  elementInfo: PPTMathElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTMathElement, canMove?: boolean) => void
  contextmenus?: () => ContextmenuItem[] | null
}

const MathElement: FC<MathElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)

  const handleSelectElement = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (elementInfo.lock) return
    e.stopPropagation()
    selectElement(e, elementInfo)
  })

  const openLatexEditor = useMemoizedFn(() => {
    if (elementInfo.inherited) return
    emitter.emit(EmitterEvents.OPEN_LATEX_EDITOR)
  })

  const handleContextMenu = useMemoizedFn((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextmenuAxis({ x: e.clientX, y: e.clientY })
  })

  const removeContextmenu = useMemoizedFn(() => {
    setContextmenuAxis(null)
  })

  const menus = useMemo(() => {
    if (!contextmenus) return []
    return contextmenus() || []
  }, [contextmenus])

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: elementInfo.top,
    left: elementInfo.left,
    width: elementInfo.width,
    height: elementInfo.height,
    opacity: elementInfo.opacity,
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
    transform: flipStyle,
  }

  return (
    <>
      <div
        className={clsx(
          styles.editableElementLatex,
          elementInfo.lock && styles.lock,
        )}
        style={containerStyle}
        data-latex-id={elementInfo.id}
      >
        <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
          <div
            className={styles.elementContent}
            style={elementContentStyle}
            onMouseDown={(e) => handleSelectElement(e as any)}
            onTouchStart={(e) => handleSelectElement(e as any)}
            onDoubleClick={openLatexEditor}
            onContextMenu={handleContextMenu}
          >
          <MathLiveRenderer
            latex={elementInfo.latex}
            mathML={elementInfo.mathML}
            width={elementInfo.width}
            height={elementInfo.height}
            color={resolvePPTColorValue(elementInfo.color)}
            fontName={elementInfo.fontName}
            fontSize={elementInfo.fontSize}
            strokeWidth={elementInfo.strokeWidth}
          />
          </div>
        </div>
      </div>

      {contextmenuAxis && (
        <Contextmenu
          axis={contextmenuAxis}
          el={document.querySelector(`[data-latex-id="${elementInfo.id}"]`) || document.body}
          menus={menus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </>
  )
}

export default MathElement
