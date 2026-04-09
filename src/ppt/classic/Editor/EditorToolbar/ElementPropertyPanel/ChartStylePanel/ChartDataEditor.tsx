import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Popover } from 'antd'

import type { ChartData, ChartType } from '@/ppt/core'
import { KEYS } from '@/ppt/configs/hotkey'
import { CHART_TYPE_MAP } from '@/ppt/configs/chart'
import { pasteCustomClipboardString, pasteExcelClipboardString, pasteHTMLTableClipboardString } from '@/ppt/utils/clipboard'
import styles from './ChartDataEditor.module.scss'

interface ChartDataEditorProps {
  type: ChartType
  data: ChartData
  onSave: (payload: { data: ChartData; type: ChartType }) => void
  onClose: () => void
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CELL_WIDTH = 100
const CELL_HEIGHT = 32
const chartList: ChartType[] = ['bar', 'column', 'line', 'area', 'scatter', 'pie', 'ring', 'radar']

export default function ChartDataEditor({ type, data, onSave, onClose }: ChartDataEditorProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [chartTypeSelectVisible, setChartTypeSelectVisible] = useState(false)
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0])
  const [tempRangeSize, setTempRangeSize] = useState({ width: 0, height: 0 })
  const tempRangeRef = useRef({ width: 0, height: 0 })
  const [focusCell, setFocusCell] = useState<[number, number] | null>(null)
  const inputsRef = useRef<Map<string, HTMLInputElement>>(new Map())

  useEffect(() => {
    setChartType(type)
    const { labels, legends, series } = data
    const rowCount = labels.length
    const colCount = series.length

    const rows: string[][] = []
    rows.push(['', ...legends])
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = [labels[rowIndex]]
      for (let colIndex = 0; colIndex < colCount; colIndex++) {
        row.push(String(series[colIndex][rowIndex]))
      }
      rows.push(row)
    }

    for (let rowIndex = 0; rowIndex < rowCount + 1; rowIndex++) {
      for (let colIndex = 0; colIndex < colCount + 1; colIndex++) {
        const inputRef = inputsRef.current.get(`cell-${rowIndex}-${colIndex}`)
        if (!inputRef) continue
        inputRef.value = rows[rowIndex][colIndex]
      }
    }

    setSelectedRange([colCount + 1, rowCount + 1])
  }, [data, type])

  useEffect(() => {
    const keyboardListener = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (key === KEYS.ENTER && focusCell) {
        const [rowIndex, colIndex] = focusCell
        const nextInput = inputsRef.current.get(`cell-${rowIndex + 1}-${colIndex}`)
        nextInput?.focus()
      }
    }
    document.addEventListener('keydown', keyboardListener)
    return () => {
      document.removeEventListener('keydown', keyboardListener)
    }
  }, [focusCell])

  const rangeLines = useMemo(() => {
    const width = selectedRange[0] * CELL_WIDTH
    const height = selectedRange[1] * CELL_HEIGHT
    return [
      { type: 't', style: { width: `${width}px` } },
      { type: 'b', style: { top: `${height}px`, width: `${width}px` } },
      { type: 'l', style: { height: `${height}px` } },
      { type: 'r', style: { left: `${width}px`, height: `${height}px` } },
    ]
  }, [selectedRange])

  const resizablePointStyle = useMemo(() => {
    const width = selectedRange[0] * CELL_WIDTH
    const height = selectedRange[1] * CELL_HEIGHT
    return { left: `${width}px`, top: `${height}px` }
  }, [selectedRange])

  const getTableData = () => {
    const [col, row] = selectedRange
    const labels: string[] = []
    let legends: string[] = []
    let series: number[][] = []

    for (let rowIndex = 1; rowIndex < row; rowIndex++) {
      let labelsItem = `类别${rowIndex}`
      const labelInputRef = inputsRef.current.get(`cell-${rowIndex}-0`)
      if (labelInputRef?.value) labelsItem = labelInputRef.value
      labels.push(labelsItem)
    }
    for (let colIndex = 1; colIndex < col; colIndex++) {
      let legendsItem = `系列${colIndex}`
      const labelInputRef = inputsRef.current.get(`cell-0-${colIndex}`)
      if (labelInputRef?.value) legendsItem = labelInputRef.value
      legends.push(legendsItem)
    }

    for (let colIndex = 1; colIndex < col; colIndex++) {
      const seriesItem: number[] = []
      for (let rowIndex = 1; rowIndex < row; rowIndex++) {
        const valueInputRef = inputsRef.current.get(`cell-${rowIndex}-${colIndex}`)
        let value = 0
        if (valueInputRef?.value && !Number.isNaN(+valueInputRef.value)) {
          value = +valueInputRef.value
        }
        seriesItem.push(value)
      }
      series.push(seriesItem)
    }

    if (chartType === 'scatter') {
      if (legends.length > 2) {
        legends = legends.slice(0, 2)
        series = series.slice(0, 2)
      }
      if (legends.length < 2) {
        legends.push('Y')
        series.push(series[0])
      }
    }
    if (chartType === 'ring' || chartType === 'pie') {
      if (legends.length > 1) {
        legends = legends.slice(0, 1)
        series = series.slice(0, 1)
      }
    }

    onSave({ data: { labels, legends, series }, type: chartType })
  }

  const clear = () => {
    for (let rowIndex = 1; rowIndex < 31; rowIndex++) {
      for (let colIndex = 1; colIndex < 7; colIndex++) {
        const inputRef = inputsRef.current.get(`cell-${rowIndex}-${colIndex}`)
        if (inputRef) inputRef.value = ''
      }
    }
  }

  const fillTableData = (tableData: string[][], rowIndex: number, colIndex: number) => {
    const maxRow = rowIndex + tableData.length
    const maxCol = colIndex + tableData[0].length
    for (let i = rowIndex; i < maxRow; i++) {
      for (let j = colIndex; j < maxCol; j++) {
        const inputRef = inputsRef.current.get(`cell-${i}-${j}`)
        if (inputRef) inputRef.value = tableData[i - rowIndex][j - colIndex]
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent, rowIndex: number, colIndex: number) => {
    e.preventDefault()
    const clipboardDataFirstItem = e.clipboardData?.items?.[0]
    if (!clipboardDataFirstItem) return

    if (clipboardDataFirstItem.kind === 'string') {
      if (clipboardDataFirstItem.type === 'text/plain') {
        clipboardDataFirstItem.getAsString((text) => {
          const clipboardData = pasteCustomClipboardString(text)
          if (typeof clipboardData === 'object') return

          const excelData = pasteExcelClipboardString(text)
          if (excelData) {
            fillTableData(excelData, rowIndex, colIndex)
            return
          }

          document.execCommand('insertText', false, text)
        })
      } else if (clipboardDataFirstItem.type === 'text/html') {
        clipboardDataFirstItem.getAsString((html) => {
          const htmlData = pasteHTMLTableClipboardString(html)
          if (htmlData) fillTableData(htmlData, rowIndex, colIndex)
        })
      }
    }
  }

  const changeSelectRange = (e: React.MouseEvent<HTMLDivElement>) => {
    let isMouseDown = true
    const startPageX = e.pageX
    const startPageY = e.pageY
    const originWidth = selectedRange[0] * CELL_WIDTH
    const originHeight = selectedRange[1] * CELL_HEIGHT
    tempRangeRef.current = { width: originWidth, height: originHeight }

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isMouseDown) return
      const x = moveEvent.pageX - startPageX
      const y = moveEvent.pageY - startPageY
      const width = originWidth + x
      const height = originHeight + y
      tempRangeRef.current = { width, height }
      setTempRangeSize({ width, height })
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      isMouseDown = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      if (startPageX === upEvent.pageX && startPageY === upEvent.pageY) return

      let width = tempRangeRef.current.width
      let height = tempRangeRef.current.height
      if (width % CELL_WIDTH > CELL_WIDTH * 0.5) width = width + (CELL_WIDTH - (width % CELL_WIDTH))
      if (height % CELL_HEIGHT > CELL_HEIGHT * 0.5) height = height + (CELL_HEIGHT - (height % CELL_HEIGHT))

      let row = Math.round(height / CELL_HEIGHT)
      let col = Math.round(width / CELL_WIDTH)

      if (row < 3) row = 3
      if (col < 2) col = 2

      setSelectedRange([col, row])
      setTempRangeSize({ width: 0, height: 0 })
      tempRangeRef.current = { width: 0, height: 0 }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div className={styles['chart-data-editor']}>
      <div className={styles['editor-content']}>
        <div className={styles.handler}>
          <div className={styles['col-header']}>
            {Array.from({ length: 7 }, (_, colIndex) => (
              <div key={colIndex} className={styles['col-header-item']}>
                <div className={styles['col-key']}>{alphabet[colIndex]}</div>
              </div>
            ))}
          </div>
          <div className={styles['row-header']}>
            {Array.from({ length: 31 }, (_, rowIndex) => (
              <div key={rowIndex} className={styles['row-header-item']}>
                <div className={styles['row-key']}>{rowIndex + 1}</div>
              </div>
            ))}
          </div>
          <div className={styles['all-header']}>
            <svg className={styles.triangle} width="8" height="8" viewBox="0 0 8 8">
              <path d="M8,0 L8,8 L0,8 L8,0" fill="#ccc" />
            </svg>
          </div>
        </div>
        <div className={styles['range-box']}>
          <div
            className={styles['temp-range']}
            style={{
              width: `${tempRangeSize.width}px`,
              height: `${tempRangeSize.height}px`,
            }}
          />
          {rangeLines.map((line) => (
            <div key={line.type} className={`${styles['range-line']} ${styles[line.type]}`} style={line.style} />
          ))}
          <div className={styles.resizable} style={resizablePointStyle} onMouseDown={changeSelectRange} />
        </div>
        <table className={styles.table}>
          <tbody>
            {Array.from({ length: 31 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 7 }, (_, colIndex) => {
                  const isHead =
                    (colIndex === 0 && rowIndex + 1 <= selectedRange[1]) ||
                    (rowIndex === 0 && colIndex + 1 <= selectedRange[0])
                  return (
                    <td key={colIndex} className={isHead ? styles.head : undefined}>
                      {!(rowIndex === 0 && colIndex === 0) && (
                        <input
                          ref={(node) => {
                            if (node) inputsRef.current.set(`cell-${rowIndex}-${colIndex}`, node)
                          }}
                          className={styles.item}
                          id={`cell-${rowIndex}-${colIndex}`}
                          autoComplete="off"
                          onFocus={() => setFocusCell([rowIndex, colIndex])}
                          onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.btns}>
        <div className={styles.left}>
          图表类型：{CHART_TYPE_MAP[chartType]}
          <Popover
            trigger="click"
            placement="top"
            open={chartTypeSelectVisible}
            onOpenChange={setChartTypeSelectVisible}
            content={
              <div>
                {chartList.map((item) => (
                  <Button key={item} type="text" onClick={() => { setChartType(item); setChartTypeSelectVisible(false) }}>
                    {CHART_TYPE_MAP[item]}
                  </Button>
                ))}
              </div>
            }
          >
            <span className={styles.change}>点击更换</span>
          </Popover>
        </div>
        <div>
          <Button className={styles.btn} onClick={onClose}>取消</Button>
          <Button className={styles.btn} onClick={clear}>清空数据</Button>
          <Button type="primary" className={styles.btn} onClick={getTableData}>确认</Button>
        </div>
      </div>
    </div>
  )
}
