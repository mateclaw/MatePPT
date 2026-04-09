import React, { type FC, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import { EditorMode, type PPTTableElement, type TableCell } from '@/ppt/core'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import { useMainStore } from '@/ppt/store/useMainStore'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore'
import EditableTable from './EditableTable'
import styles from './TableElement.module.scss'

interface TableElementProps {
  elementInfo: PPTTableElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTTableElement, canMove?: boolean) => void
  contextmenus?: () => ContextmenuItem[] | null
}

const TableElement: FC<TableElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const realHeightCacheRef = useRef(-1)

  const canvasScale = useMainStore((state) => state.canvasScale)
  const handleElementId = useMainStore((state) => state.handleElementId)
  const isScaling = useMainStore((state) => state.isScaling)
  const setDisableHotkeys = useMainStore((state) => state.setDisableHotkeys)
  const setSelectedTableCells = useMainStore((state) => state.setSelectedTableCells)
  const readOnly = useMainStore((state) => state.mode !== EditorMode.EDIT)

  const updateElement = useSlidesStore((state) => state.updateElement)
  const addSnapshot = useSnapshotStore((state) => state.addSnapshot)

  const [editable, setEditable] = useState(false)
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)

  useEffect(() => {
    if (handleElementId !== elementInfo.id) {
      setEditable(false)
    }
  }, [handleElementId, elementInfo.id])

  useEffect(() => {
    setDisableHotkeys(editable)
  }, [editable, setDisableHotkeys])

  const handleSelectElement = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (elementInfo.lock) return
    e.stopPropagation()
    selectElement(e, elementInfo)
  })

  const startEdit = useMemoizedFn(() => {
    if (readOnly) return
    if (elementInfo.inherited) return
    if (!elementInfo.lock) {
      setEditable(true)
    }
  })

  const updateTableElementHeight = useMemoizedFn((entries: ResizeObserverEntry[]) => {
    const contentRect = entries[0].contentRect
    if (!elementRef.current) return

    const realHeight = contentRect.height
    if (elementInfo.height !== realHeight) {
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
  })

  useEffect(() => {
    if (!elementRef.current) return
    resizeObserverRef.current = new ResizeObserver(updateTableElementHeight)
    resizeObserverRef.current.observe(elementRef.current)

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
    }
  }, [updateTableElementHeight])

  useEffect(() => {
    if (handleElementId !== elementInfo.id) return
    if (isScaling) setEditable(false)

    if (!isScaling && realHeightCacheRef.current !== -1) {
      updateElement({
        id: elementInfo.id,
        props: { height: realHeightCacheRef.current },
      })
      realHeightCacheRef.current = -1
    }
  }, [handleElementId, elementInfo.id, isScaling, updateElement])

  const updateTableCells = useMemoizedFn((data: TableCell[][]) => {
    updateElement({
      id: elementInfo.id,
      props: { data },
    })
    addSnapshot()
  })

  const updateColWidths = useMemoizedFn((widths: number[]) => {
    const totalWidth = widths.reduce((a, b) => a + b, 0)
    const colWidths = widths.map((item) => item / totalWidth)

    updateElement({
      id: elementInfo.id,
      props: { width: totalWidth, colWidths },
    })
    addSnapshot()
  })

  const updateSelectedCells = useMemoizedFn((cells: string[]) => {
    setTimeout(() => setSelectedTableCells(cells), 0)
  })

  const handleContextMenu = useMemoizedFn((e: React.MouseEvent) => {
    if (!contextmenus) return
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
  }

  const rotateWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `rotate(${elementInfo.rotate}deg)`,
  }

  return (
    <>
      <div
        ref={elementRef}
        className={clsx(
          styles.editableElementTable,
          elementInfo.lock && styles.lock,
        )}
        style={containerStyle}
        data-table-id={elementInfo.id}
      >
        <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
          <div className={styles.elementContent} onContextMenu={handleContextMenu}>
            <EditableTable
              data={elementInfo.data}
              width={elementInfo.width}
              cellMinHeight={elementInfo.cellMinHeight}
              colWidths={elementInfo.colWidths}
              outline={elementInfo.outline}
              theme={elementInfo.theme}
              editable={editable}
              onChange={updateTableCells}
              onChangeColWidths={updateColWidths}
              onChangeSelectedCells={updateSelectedCells}
            />
            {(!editable || elementInfo.lock) && (
              <div
                className={clsx(
                  styles.tableMask,
                  elementInfo.lock && styles.lock,
                )}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  selectElement(e.nativeEvent, elementInfo, false)
                  startEdit()
                }}
                onMouseDown={(e) => handleSelectElement(e as any)}
                onTouchStart={(e) => handleSelectElement(e as any)}
              >
                {handleElementId === elementInfo.id && (
                  <div
                    className={styles.maskTip}
                    style={{ transform: `scale(${1 / canvasScale})` }}
                  >
                    双击编辑
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {contextmenuAxis &&  menus.length > 0 && (
        <Contextmenu
          axis={contextmenuAxis}
          el={document.querySelector(`[data-table-id="${elementInfo.id}"]`) || document.body}
          menus={menus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </>
  )
}

export default TableElement
