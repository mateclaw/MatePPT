import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import { debounce, isEqual } from 'lodash'
import { nanoid } from 'nanoid'
import { KEYS } from '@/ppt/configs/hotkey'
import type { PPTElementOutline, TableCell, TableTheme } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import { useMainStore } from '@/ppt/store/useMainStore'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { THEME_COLOR_KEYS, type ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import { formatText, getHorizontalAlignStyle, getTextStyle } from './utils'
import { useHideCells } from './useHideCells'
import { useSubThemeColor } from './useSubThemeColor'
import CustomTextarea from './CustomTextarea'
import styles from './EditableTable.module.scss'

interface EditableTableProps {
  data: TableCell[][]
  width: number
  cellMinHeight: number
  colWidths: number[]
  outline: PPTElementOutline
  theme?: TableTheme
  editable?: boolean
  onChange: (data: TableCell[][]) => void
  onChangeColWidths: (widths: number[]) => void
  onChangeSelectedCells: (cells: string[]) => void
}

const EditableTable: React.FC<EditableTableProps> = ({
  data,
  width,
  cellMinHeight,
  colWidths,
  outline,
  theme,
  editable = true,
  onChange,
  onChangeColWidths,
  onChangeSelectedCells,
}) => {
  const canvasScale = useMainStore((state) => state.canvasScale)
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

  const [tableCells, setTableCells] = useState<TableCell[][]>(data)
  const tableCellsRef = useRef<TableCell[][]>(data)
  const [colSizeList, setColSizeList] = useState<number[]>([])
  const colSizeListRef = useRef<number[]>([])
  const [isStartSelect, setIsStartSelect] = useState(false)
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [endCell, setEndCell] = useState<[number, number] | null>(null)
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const [contextmenuEl, setContextmenuEl] = useState<HTMLElement | null>(null)
  const [contextmenuMenus, setContextmenuMenus] = useState<ContextmenuItem[]>([])

  const { subThemeColor } = useSubThemeColor(theme)

  useEffect(() => {
    setTableCells(data)
  }, [data])

  useEffect(() => {
    tableCellsRef.current = tableCells
  }, [tableCells])

  useEffect(() => {
    setColSizeList(colWidths.map((item) => item * width))
  }, [colWidths, width])

  useEffect(() => {
    colSizeListRef.current = colSizeList
  }, [colSizeList])

  const totalWidth = useMemo(() => colSizeList.reduce((a, b) => a + b, 0), [colSizeList])

  const { hideCells } = useHideCells(tableCells)

  const removeSelectedCells = useMemoizedFn(() => {
    setStartCell(null)
    setEndCell(null)
  })

  useEffect(() => {
    if (!editable) {
      removeSelectedCells()
    }
  }, [editable, removeSelectedCells])

  const dragLinePosition = useMemo(() => {
    const positions: number[] = []
    for (let i = 1; i < colSizeList.length + 1; i++) {
      const pos = colSizeList.slice(0, i).reduce((a, b) => a + b, 0)
      positions.push(pos)
    }
    return positions
  }, [colSizeList])

  const selectedCells = useMemo(() => {
    if (!startCell) return []
    const [startX, startY] = startCell

    if (!endCell) return [`${startX}_${startY}`]
    const [endX, endY] = endCell

    if (startX === endX && startY === endY) return [`${startX}_${startY}`]

    const selected: string[] = []
    const minX = Math.min(startX, endX)
    const minY = Math.min(startY, endY)
    const maxX = Math.max(startX, endX)
    const maxY = Math.max(startY, endY)

    for (let i = 0; i < tableCells.length; i++) {
      const rowCells = tableCells[i]
      for (let j = 0; j < rowCells.length; j++) {
        if (i >= minX && i <= maxX && j >= minY && j <= maxY) {
          selected.push(`${i}_${j}`)
        }
      }
    }
    return selected
  }, [startCell, endCell, tableCells])

  const selectedCellsRef = useRef<string[]>([])
  useEffect(() => {
    if (isEqual(selectedCells, selectedCellsRef.current)) return
    selectedCellsRef.current = selectedCells
    onChangeSelectedCells(selectedCells)
  }, [selectedCells, onChangeSelectedCells])

  const activedCell = useMemo(() => {
    if (selectedCells.length > 1) return null
    return selectedCells[0] || null
  }, [selectedCells])

  const isHideCell = useMemoizedFn((rowIndex: number, colIndex: number) => {
    return hideCells.includes(`${rowIndex}_${colIndex}`)
  })

  const handleMouseup = useMemoizedFn(() => {
    setIsStartSelect(false)
  })

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseup)
    return () => {
      document.removeEventListener('mouseup', handleMouseup)
    }
  }, [handleMouseup])

  const handleCellMousedown = useMemoizedFn((e: React.MouseEvent, rowIndex: number, colIndex: number) => {
    if (e.button !== 0) return
    if (editable) e.stopPropagation()
    setEndCell(null)
    setStartCell([rowIndex, colIndex])
    if (!editable) {
      setIsStartSelect(true)
    } else {
      setIsStartSelect(false)
    }
  })

  const handleCellMouseenter = useMemoizedFn((rowIndex: number, colIndex: number) => {
    if (!isStartSelect || editable) return
    setEndCell([rowIndex, colIndex])
  })

  const updateTableCells = useMemoizedFn((nextData: TableCell[][]) => {
    setTableCells(nextData)
    onChange(nextData)
  })

  const selectCol = useMemoizedFn((index: number) => {
    const maxRow = tableCells.length - 1
    setStartCell([0, index])
    setEndCell([maxRow, index])
  })

  const selectRow = useMemoizedFn((index: number) => {
    const maxCol = tableCells[index].length - 1
    setStartCell([index, 0])
    setEndCell([index, maxCol])
  })

  const selectAll = useMemoizedFn(() => {
    const maxRow = tableCells.length - 1
    const maxCol = tableCells[maxRow].length - 1
    setStartCell([0, 0])
    setEndCell([maxRow, maxCol])
  })

  const deleteRow = useMemoizedFn((rowIndex: number) => {
    const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))

    const targetCells = tableCells[rowIndex]
    const hideCellsPos: number[] = []
    for (let i = 0; i < targetCells.length; i++) {
      if (isHideCell(rowIndex, i)) hideCellsPos.push(i)
    }

    for (const pos of hideCellsPos) {
      for (let i = rowIndex; i >= 0; i--) {
        if (!isHideCell(i, pos)) {
          nextCells[i][pos].rowspan = nextCells[i][pos].rowspan - 1
          break
        }
      }
    }

    nextCells.splice(rowIndex, 1)
    updateTableCells(nextCells)
  })

  const deleteCol = useMemoizedFn((colIndex: number) => {
    const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    const hideCellsPos: number[] = []

    for (let i = 0; i < tableCells.length; i++) {
      if (isHideCell(i, colIndex)) hideCellsPos.push(i)
    }

    for (const pos of hideCellsPos) {
      for (let i = colIndex; i >= 0; i--) {
        if (!isHideCell(pos, i)) {
          nextCells[pos][i].colspan = nextCells[pos][i].colspan - 1
          break
        }
      }
    }

    const nextCellsTrimmed = nextCells.map((item) => {
      item.splice(colIndex, 1)
      return item
    })

    updateTableCells(nextCellsTrimmed)
    setColSizeList((prev) => {
      const next = [...prev]
      next.splice(colIndex, 1)
      onChangeColWidths(next)
      return next
    })
  })

  const insertRow = useMemoizedFn((rowIndex: number) => {
    const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))

    const rowCells: TableCell[] = []
    for (let i = 0; i < nextCells[0].length; i++) {
      rowCells.push({
        colspan: 1,
        rowspan: 1,
        text: '',
        id: nanoid(10),
      })
    }

    nextCells.splice(rowIndex, 0, rowCells)
    updateTableCells(nextCells)
  })

  const insertCol = useMemoizedFn((colIndex: number) => {
    const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    const updated = nextCells.map((item) => {
      const cell = {
        colspan: 1,
        rowspan: 1,
        text: '',
        id: nanoid(10),
      }
      item.splice(colIndex, 0, cell)
      return item
    })
    updateTableCells(updated)
    setColSizeList((prev) => {
      const next = [...prev]
      next.splice(colIndex, 0, 100)
      onChangeColWidths(next)
      return next
    })
  })

  const fillTable = useMemoizedFn((rowCount: number, colCount: number) => {
    let nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    const defaultCell = { colspan: 1, rowspan: 1, text: '' }

    if (rowCount) {
      const newRows = []
      for (let i = 0; i < rowCount; i++) {
        const rowCells: TableCell[] = []
        for (let j = 0; j < nextCells[0].length; j++) {
          rowCells.push({
            ...defaultCell,
            id: nanoid(10),
          })
        }
        newRows.push(rowCells)
      }
      nextCells = [...nextCells, ...newRows]
    }
    if (colCount) {
      nextCells = nextCells.map((item) => {
        const cells: TableCell[] = []
        for (let i = 0; i < colCount; i++) {
          const cell = {
            ...defaultCell,
            id: nanoid(10),
          }
          cells.push(cell)
        }
        return [...item, ...cells]
      })
      setColSizeList((prev) => {
        const next = [...prev, ...new Array(colCount).fill(100)]
        onChangeColWidths(next)
        return next
      })
    }

    updateTableCells(nextCells)
  })

  const mergeCells = useMemoizedFn(() => {
    if (!startCell || !endCell) return
    const [startX, startY] = startCell
    const [endX, endY] = endCell

    const minX = Math.min(startX, endX)
    const minY = Math.min(startY, endY)
    const maxX = Math.max(startX, endX)
    const maxY = Math.max(startY, endY)

    const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    nextCells[minX][minY].rowspan = maxX - minX + 1
    nextCells[minX][minY].colspan = maxY - minY + 1

    updateTableCells(nextCells)
    removeSelectedCells()
  })

  const splitCells = useMemoizedFn((rowIndex: number, colIndex: number) => {
    const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    nextCells[rowIndex][colIndex].rowspan = 1
    nextCells[rowIndex][colIndex].colspan = 1
    updateTableCells(nextCells)
    removeSelectedCells()
  })

  const handleMousedownColHandler = useMemoizedFn((e: React.MouseEvent, colIndex: number) => {
    removeSelectedCells()
    let isMouseDown = true

    const originWidth = colSizeList[colIndex]
    const startPageX = e.pageX
    const minWidth = 50

    document.onmousemove = (event: MouseEvent) => {
      if (!isMouseDown) return
      const moveX = (event.pageX - startPageX) / canvasScale
      const nextWidth = originWidth + moveX < minWidth ? minWidth : Math.round(originWidth + moveX)
      setColSizeList((prev) => {
        const next = [...prev]
        next[colIndex] = nextWidth
        return next
      })
    }

    document.onmouseup = () => {
      isMouseDown = false
      document.onmousemove = null
      document.onmouseup = null
      onChangeColWidths(colSizeListRef.current)
    }
  })

  const clearSelectedCellText = useMemoizedFn(() => {
    const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))

    for (let i = 0; i < nextCells.length; i++) {
      for (let j = 0; j < nextCells[i].length; j++) {
        if (selectedCells.includes(`${i}_${j}`)) {
          nextCells[i][j].text = ''
        }
      }
    }
    updateTableCells(nextCells)
  })

  const focusActiveCell = useMemoizedFn(() => {
    setTimeout(() => {
      const textRef = document.querySelector(`.${styles.cellText}.${styles.active}`) as HTMLDivElement | null
      if (textRef) textRef.focus()
    }, 0)
  })

  const tabActiveCell = useMemoizedFn(() => {
    const getNextCell = (i: number, j: number): [number, number] | null => {
      if (!tableCells[i]) return null
      if (!tableCells[i][j]) return getNextCell(i + 1, 0)
      if (isHideCell(i, j)) return getNextCell(i, j + 1)
      return [i, j]
    }

    setEndCell(null)

    if (!startCell) return
    const nextRow = startCell[0]
    const nextCol = startCell[1] + 1

    const nextCell = getNextCell(nextRow, nextCol)
    if (!nextCell) {
      insertRow(nextRow + 1)
      setStartCell([nextRow + 1, 0])
    }
    else {
      setStartCell(nextCell)
    }

    focusActiveCell()
  })

  const moveActiveCell = useMemoizedFn((dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!selectedCells.length) return
    const rowIndex = +selectedCells[0].split('_')[0]
    const colIndex = +selectedCells[0].split('_')[1]

    const rowLen = tableCells.length
    const colLen = tableCells[0].length

    const getEffectivePos = (pos: [number, number]): [number, number] => {
      if (pos[0] < 0 || pos[1] < 0 || pos[0] > rowLen - 1 || pos[1] > colLen - 1) {
        return [0, 0]
      }

      const p = `${pos[0]}_${pos[1]}`
      if (!hideCells.includes(p)) return pos

      if (dir === 'UP') return getEffectivePos([pos[0], pos[1] - 1])
      if (dir === 'DOWN') return getEffectivePos([pos[0], pos[1] - 1])
      if (dir === 'LEFT') return getEffectivePos([pos[0] - 1, pos[1]])
      if (dir === 'RIGHT') return getEffectivePos([pos[0] - 1, pos[1]])
      return [0, 0]
    }

    if (dir === 'UP') {
      const nextRow = rowIndex - 1
      if (nextRow < 0) return
      setEndCell(null)
      setStartCell(getEffectivePos([nextRow, colIndex]))
    }
    else if (dir === 'DOWN') {
      const nextRow = rowIndex + 1
      if (nextRow > rowLen - 1) return
      setEndCell(null)
      setStartCell(getEffectivePos([nextRow, colIndex]))
    }
    else if (dir === 'LEFT') {
      const nextCol = colIndex - 1
      if (nextCol < 0) return
      setEndCell(null)
      setStartCell(getEffectivePos([rowIndex, nextCol]))
    }
    else if (dir === 'RIGHT') {
      const nextCol = colIndex + 1
      if (nextCol > colLen - 1) return
      setEndCell(null)
      setStartCell(getEffectivePos([rowIndex, nextCol]))
    }

    focusActiveCell()
  })

  useEffect(() => {
    if (!editable || !activedCell) return
    focusActiveCell()
  }, [activedCell, editable, focusActiveCell])

  const getCaretPosition = useMemoizedFn((element: HTMLDivElement) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(element)
      preCaretRange.setEnd(range.startContainer, range.startOffset)
      const start = preCaretRange.toString().length
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      const end = preCaretRange.toString().length
      const len = element.textContent?.length || 0
      return { start, end, len }
    }
    return null
  })

  const keydownListener = useMemoizedFn((e: KeyboardEvent) => {
    if (!editable || !selectedCells.length) return
    const key = e.key.toUpperCase()
    if (selectedCells.length < 2) {
      if (key === KEYS.TAB) {
        e.preventDefault()
        tabActiveCell()
      }
      else if (e.ctrlKey && key === KEYS.UP) {
        e.preventDefault()
        const rowIndex = +selectedCells[0].split('_')[0]
        insertRow(rowIndex)
      }
      else if (e.ctrlKey && key === KEYS.DOWN) {
        e.preventDefault()
        const rowIndex = +selectedCells[0].split('_')[0]
        insertRow(rowIndex + 1)
      }
      else if (e.ctrlKey && key === KEYS.LEFT) {
        e.preventDefault()
        const colIndex = +selectedCells[0].split('_')[1]
        insertCol(colIndex)
      }
      else if (e.ctrlKey && key === KEYS.RIGHT) {
        e.preventDefault()
        const colIndex = +selectedCells[0].split('_')[1]
        insertCol(colIndex + 1)
      }
      else if (key === KEYS.UP) {
        const range = getCaretPosition(e.target as HTMLDivElement)
        if (range && range.start === range.end && range.start === 0) {
          moveActiveCell('UP')
        }
      }
      else if (key === KEYS.DOWN) {
        const range = getCaretPosition(e.target as HTMLDivElement)
        if (range && range.start === range.end && range.start === range.len) {
          moveActiveCell('DOWN')
        }
      }
      else if (key === KEYS.LEFT) {
        const range = getCaretPosition(e.target as HTMLDivElement)
        if (range && range.start === range.end && range.start === 0) {
          moveActiveCell('LEFT')
        }
      }
      else if (key === KEYS.RIGHT) {
        const range = getCaretPosition(e.target as HTMLDivElement)
        if (range && range.start === range.end && range.start === range.len) {
          moveActiveCell('RIGHT')
        }
      }
    }
    else if (key === KEYS.DELETE) {
      clearSelectedCellText()
    }
  })

  useEffect(() => {
    document.addEventListener('keydown', keydownListener)
    return () => {
      document.removeEventListener('keydown', keydownListener)
    }
  }, [keydownListener])

  const debouncedInput = useMemo(
    () =>
      debounce((value: string, rowIndex: number, colIndex: number) => {
        const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCellsRef.current))
        if (nextCells[rowIndex]?.[colIndex]) {
          nextCells[rowIndex][colIndex].text = value
          updateTableCells(nextCells)
        }
      }, 300),
    [updateTableCells]
  )

  useEffect(() => {
    return () => {
      debouncedInput.cancel()
    }
  }, [debouncedInput])

  const handleInput = useMemoizedFn((value: string, rowIndex: number, colIndex: number) => {
    debouncedInput(value, rowIndex, colIndex)
  })

  const insertExcelData = useMemoizedFn((dataRows: string[][], rowIndex: number, colIndex: number) => {
    const maxRow = dataRows.length
    const maxCol = dataRows[0].length

    let fillRowCount = 0
    let fillColCount = 0
    if (rowIndex + maxRow > tableCells.length) fillRowCount = rowIndex + maxRow - tableCells.length
    if (colIndex + maxCol > tableCells[0].length) fillColCount = colIndex + maxCol - tableCells[0].length
    if (fillRowCount || fillColCount) fillTable(fillRowCount, fillColCount)

    setTimeout(() => {
      const nextCells: TableCell[][] = JSON.parse(JSON.stringify(tableCellsRef.current))
      for (let i = 0; i < maxRow; i++) {
        for (let j = 0; j < maxCol; j++) {
          if (nextCells[rowIndex + i]?.[colIndex + j]) {
            nextCells[rowIndex + i][colIndex + j].text = dataRows[i][j]
          }
        }
      }
      updateTableCells(nextCells)
    }, 0)
  })

  const getEffectiveTableCells = useMemoizedFn(() => {
    const effectiveTableCells = []
    for (let i = 0; i < tableCells.length; i++) {
      const rowCells = tableCells[i]
      const nextRowCells = []
      for (let j = 0; j < rowCells.length; j++) {
        if (!isHideCell(i, j)) nextRowCells.push(rowCells[j])
      }
      if (nextRowCells.length) effectiveTableCells.push(nextRowCells)
    }
    return effectiveTableCells
  })

  const checkCanDeleteRowOrCol = useMemoizedFn(() => {
    const effectiveTableCells = getEffectiveTableCells()
    const canDeleteRow = effectiveTableCells.length > 1
    const canDeleteCol = effectiveTableCells[0].length > 1
    return { canDeleteRow, canDeleteCol }
  })

  const checkCanMergeOrSplit = useMemoizedFn((rowIndex: number, colIndex: number) => {
    const isMultiSelected = selectedCells.length > 1
    const targetCell = tableCells[rowIndex][colIndex]
    const canMerge = isMultiSelected
    const canSplit = !isMultiSelected && (targetCell.rowspan > 1 || targetCell.colspan > 1)
    return { canMerge, canSplit }
  })

  const buildCellMenus = useMemoizedFn((rowIndex: number, colIndex: number): ContextmenuItem[] => {
    if (!selectedCells.includes(`${rowIndex}_${colIndex}`)) {
      setStartCell([rowIndex, colIndex])
      setEndCell(null)
    }

    const { canMerge, canSplit } = checkCanMergeOrSplit(rowIndex, colIndex)
    const { canDeleteRow, canDeleteCol } = checkCanDeleteRowOrCol()

    return [
      {
        text: '插入列',
        children: [
          { text: '到左侧', handler: () => insertCol(colIndex) },
          { text: '到右侧', handler: () => insertCol(colIndex + 1) },
        ],
      },
      {
        text: '插入行',
        children: [
          { text: '到上方', handler: () => insertRow(rowIndex) },
          { text: '到下方', handler: () => insertRow(rowIndex + 1) },
        ],
      },
      {
        text: '删除列',
        disable: !canDeleteCol,
        handler: () => deleteCol(colIndex),
      },
      {
        text: '删除行',
        disable: !canDeleteRow,
        handler: () => deleteRow(rowIndex),
      },
      { divider: true },
      {
        text: '合并单元格',
        disable: !canMerge,
        handler: mergeCells,
      },
      {
        text: '取消合并单元格',
        disable: !canSplit,
        handler: () => splitCells(rowIndex, colIndex),
      },
      { divider: true },
      {
        text: '选中当前列',
        handler: () => selectCol(colIndex),
      },
      {
        text: '选中当前行',
        handler: () => selectRow(rowIndex),
      },
      {
        text: '选中全部单元格',
        handler: selectAll,
      },
    ]
  })

  const handleCellContextMenu = useMemoizedFn(
    (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
      e.preventDefault()
      e.stopPropagation()
      const target = e.target as HTMLElement | null
      const isEditableText = Boolean(target?.isContentEditable || target?.closest?.('[contenteditable="true"]'))

      if (editable && isEditableText) {
        const selectionText = window.getSelection()?.toString() || ''
        const cellTextEl = target?.closest?.(`.${styles.cellText}`) as HTMLDivElement | null
        const allText = cellTextEl?.innerText ?? cellTextEl?.textContent ?? ''

        const copySelectionText = async () => {
          const text = selectionText || allText
          if (!text) return
          try {
            await navigator.clipboard.writeText(text)
          } catch {
            document.execCommand('copy')
          }
        }

        const cutSelectionText = async () => {
          if (!selectionText) return
          try {
            await navigator.clipboard.writeText(selectionText)
          } catch {
            document.execCommand('copy')
          }
          if (window.getSelection) {
            window.getSelection()?.deleteFromDocument()
          } else {
            document.execCommand('delete')
          }
        }

        const pasteTextAtCursor = async () => {
          try {
            const text = await navigator.clipboard.readText()
            if (!text) return
            cellTextEl?.focus()
            document.execCommand('insertText', false, text)
          } catch {
            // ignore clipboard failures
          }
        }

        setContextmenuAxis({ x: e.clientX, y: e.clientY })
        setContextmenuEl(cellTextEl || (e.currentTarget as HTMLElement))
        setContextmenuMenus([
          { text: '复制', subText: 'Ctrl + C', handler: copySelectionText },
          { text: '剪切', subText: 'Ctrl + X', handler: cutSelectionText, disable: !selectionText },
          { text: '粘贴', subText: 'Ctrl + V', handler: pasteTextAtCursor },
        ])
        return
      }

      const menus = buildCellMenus(rowIndex, colIndex)
      setContextmenuAxis({ x: e.clientX, y: e.clientY })
      setContextmenuEl(e.currentTarget as HTMLElement)
      setContextmenuMenus(menus)
    }
  )

  const removeContextmenu = useMemoizedFn(() => {
    setContextmenuAxis(null)
    setContextmenuEl(null)
    setContextmenuMenus([])
  })

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
    <>
      <div
        className={styles.editableTable}
        style={{ width: `${totalWidth}px` }}
        onMouseDown={(e) => {
          if (editable) e.stopPropagation()
        }}
      >
        {editable && (
          <div className={styles.handler}>
            {dragLinePosition.map((pos, index) => (
              <div
                key={index}
                className={styles.dragLine}
                style={{ left: `${pos}px` }}
                onMouseDown={(e) => handleMousedownColHandler(e, index)}
              />
            ))}
          </div>
        )}
        <table className={tableClassName} style={tableStyle}>
          <colgroup>
            {colSizeList.map((colWidth, index) => (
              <col key={index} span={1} width={colWidth} />
            ))}
          </colgroup>
          <tbody>
            {tableCells.map((rowCells, rowIndex) => (
                <tr key={rowIndex} style={{ height: `${cellMinHeight}px` }}>
                  {rowCells.map((cell, colIndex) => {
                    const cellIndex = `${rowIndex}_${colIndex}`
                    if (hideCells.includes(cellIndex)) return null
                    const safeCell = cell || {
                      id: `${rowIndex}_${colIndex}`,
                      rowspan: 1,
                      colspan: 1,
                      text: '',
                      style: undefined,
                    }

                    const isSelected = selectedCells.includes(cellIndex) && selectedCells.length > 1
                    const isActive = activedCell === cellIndex

                    return (
                      <td
                        key={safeCell.id}
                        className={clsx(
                          styles.cell,
                          isSelected && styles.selected,
                          isActive && styles.active,
                        )}
                        rowSpan={safeCell.rowspan}
                        colSpan={safeCell.colspan}
                        data-cell-index={cellIndex}
                        style={{
                          ...outlineStyle,
                          ...getTextStyle(safeCell.style, resolvedThemeMap),
                        }}
                        onMouseDown={(e) => handleCellMousedown(e, rowIndex, colIndex)}
                        onMouseEnter={() => handleCellMouseenter(rowIndex, colIndex)}
                        onContextMenu={(e) => handleCellContextMenu(e, rowIndex, colIndex)}
                      >
                        <div
                          className={styles.cellContent}
                          style={{
                            alignItems: getAlignItems(safeCell.style?.alignV),
                            ...getHorizontalAlignStyle(safeCell.style?.alignH),
                          }}
                        >
                          {isActive ? (
                            <CustomTextarea
                              className={clsx(styles.cellText, styles.active)}
                              value={safeCell.text}
                              onUpdateValue={(value) => handleInput(value, rowIndex, colIndex)}
                              onInsertExcelData={(value) => insertExcelData(value, rowIndex, colIndex)}
                            />
                          ) : (
                            <div
                              className={styles.cellText}
                              dangerouslySetInnerHTML={{ __html: formatText(safeCell.text || '') }}
                            />
                          )}
                        </div>
                      </td>
                    )
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contextmenuAxis && contextmenuMenus.length > 0 && (
        <Contextmenu
          axis={contextmenuAxis}
          el={contextmenuEl || document.body}
          menus={contextmenuMenus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </>
  )
}

export default EditableTable
