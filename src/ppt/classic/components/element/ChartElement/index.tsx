import React, { type FC, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import type { PPTChartElement } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import type { ContextmenuItem, Axis } from '../../Contextmenu/types'
import { Contextmenu } from '../../Contextmenu'
import { emitter, EmitterEvents } from '@/ppt/utils/emitter'
import ElementOutline from '../../ElementOutline'
import Chart from './Chart'
import styles from './ChartElement.module.scss'

interface ChartElementProps {
  elementInfo: PPTChartElement
  selectElement: (e: MouseEvent | TouchEvent, element: PPTChartElement, canMove?: boolean) => void
  contextmenus?: () => ContextmenuItem[] | null
}

const ChartElement: FC<ChartElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)

  const handleSelectElement = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (elementInfo.lock) return
    e.stopPropagation()
    selectElement(e, elementInfo)
  })

  const openDataEditor = useMemoizedFn(() => {
    if (elementInfo.inherited) return
    emitter.emit(EmitterEvents.OPEN_CHART_DATA_EDITOR)
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
  }

  const rotateWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `rotate(${elementInfo.rotate}deg)`,
  }

  const elementContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: elementInfo.fill,
    overflow: 'hidden',
  }

  return (
    <>
      <div
        className={clsx(
          styles.editableElementChart,
          elementInfo.lock && styles.lock,
        )}
        style={containerStyle}
        data-chart-id={elementInfo.id}
      >
        <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
          <div
            className={styles.elementContent}
            style={elementContentStyle}
            onMouseDown={(e) => handleSelectElement(e as any)}
            onTouchStart={(e) => handleSelectElement(e as any)}
            onDoubleClick={openDataEditor}
            onContextMenu={handleContextMenu}
          >
            <ElementOutline
              width={elementInfo.width}
              height={elementInfo.height}
              outline={elementInfo.outline}
            />
            <Chart
              width={elementInfo.width}
              height={elementInfo.height}
              type={elementInfo.chartType}
              data={elementInfo.data}
              themeColors={(elementInfo.themeColors || []).map((color) => resolvePPTColorValue(color))}
              // textColor={elementInfo.textColor}
              lineColor={resolvePPTColorValue(elementInfo.lineColor)}
              options={elementInfo.options}
              title={elementInfo.title}
              style={elementInfo.style}
            />
          </div>
        </div>
      </div>

      {contextmenuAxis && menus.length > 0 && (
        <Contextmenu
          axis={contextmenuAxis}
          el={document.querySelector(`[data-chart-id="${elementInfo.id}"]`) || document.body}
          menus={menus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </>
  )
}

export default ChartElement
