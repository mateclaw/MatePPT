import React, { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import type { PPTElementOutline, TableCell, TableTheme } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { THEME_COLOR_KEYS, type ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import { formatText, getHorizontalAlignStyle, getTextStyle } from './utils'
import { useHideCells } from './useHideCells'
import { useSubThemeColor } from './useSubThemeColor'
import styles from './StaticTable.module.scss'

interface StaticTableProps {
  data: TableCell[][]
  width: number
  cellMinHeight: number
  colWidths: number[]
  outline: PPTElementOutline
  theme?: TableTheme
}

const StaticTable: React.FC<StaticTableProps> = ({
  data,
  width,
  cellMinHeight,
  colWidths,
  outline,
  theme,
}) => {
  const [colSizeList, setColSizeList] = useState<number[]>([])
  const totalWidth = useMemo(() => colSizeList.reduce((a, b) => a + b, 0), [colSizeList])
  const { hideCells } = useHideCells(data)
  const { subThemeColor } = useSubThemeColor(theme)
  const themeColors = useSlidesStore((state) => state.theme?.themeColors)
  const resolveThemeMap = (raw: ThemeColors | Record<string, string> | string[] | null | undefined) => {
    if (!raw) return null
    if (Array.isArray(raw)) {
      const next: Record<string, string> = {}
      THEME_COLOR_KEYS.forEach((key, index) => {
        const value = raw[index]
        if (typeof value === 'string') next[key] = value
      })
      return Object.keys(next).length ? next : null
    }
    return raw as Record<string, string>
  }
  const resolvedThemeMap = resolveThemeMap(themeColors)

  useEffect(() => {
    setColSizeList(colWidths.map((item) => item * width))
  }, [colWidths, width])

  const tableClassName = clsx(
    styles.table,
    theme && styles.theme,
    theme?.rowHeader && styles.rowHeader,
    theme?.rowFooter && styles.rowFooter,
    theme?.colHeader && styles.colHeader,
    theme?.colFooter && styles.colFooter,
  )

  const tableStyle: React.CSSProperties = {
    ['--themeColor' as any]: resolvePPTColorValue(theme?.color, resolvedThemeMap || undefined),
    ['--subThemeColor1' as any]: subThemeColor[0],
    ['--subThemeColor2' as any]: subThemeColor[1],
  }
  const getAlignItems = (value?: string) => {
    if (value === 'top') return 'flex-start'
    if (value === 'bottom') return 'flex-end'
    return 'center'
  }
  const getOutlineStyle = () => {
    if (!outline) return {}
    const style: React.CSSProperties = {
      borderStyle: outline.style,
      borderWidth: `${outline.width}px`,
      borderColor: resolvePPTColorValue(outline.color),
    }
    if (outline.gradient && outline.gradient.colors?.length) {
      const stops = outline.gradient.colors
        .map((item) => `${resolvePPTColorValue(item.color) || 'transparent'} ${item.pos}%`)
        .join(', ')
      const angle = outline.gradient.rotate ?? 0
      style.borderImageSource = outline.gradient.type === 'radial'
        ? `radial-gradient(circle, ${stops})`
        : `linear-gradient(${angle}deg, ${stops})`
      style.borderImageSlice = 1
    }
    return style
  }
  const outlineStyle = getOutlineStyle()

  return (
    <div className={styles.staticTable} style={{ width: `${totalWidth}px` }}>
      <table className={tableClassName} style={tableStyle}>
        <colgroup>
          {colSizeList.map((colWidth, index) => (
            <col key={index} span={1} width={colWidth} />
          ))}
        </colgroup>
        <tbody>
          {data.map((rowCells, rowIndex) => (
            <tr key={rowIndex} style={{ height: `${cellMinHeight}px` }}>
              {rowCells.map((cell, colIndex) => {
                const cellKey = `${rowIndex}_${colIndex}`
                if (hideCells.includes(cellKey)) return null
                const safeCell = cell || {
                  id: `${rowIndex}_${colIndex}`,
                  rowspan: 1,
                  colspan: 1,
                  text: '',
                  style: undefined,
                }
                return (
                  <td
                    key={safeCell.id}
                    className={styles.cell}
                    rowSpan={safeCell.rowspan}
                    colSpan={safeCell.colspan}
                    style={{
                      ...outlineStyle,
                      ...getTextStyle(safeCell.style, resolvedThemeMap),
                    }}
                  >
                    <div
                      className={styles.cellContent}
                      style={{
                        alignItems: getAlignItems(safeCell.style?.alignV),
                        ...getHorizontalAlignStyle(safeCell.style?.alignH),
                      }}
                    >
                      <div
                        className={styles.cellText}
                        dangerouslySetInnerHTML={{ __html: formatText(safeCell.text || '') }}
                      />
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StaticTable
