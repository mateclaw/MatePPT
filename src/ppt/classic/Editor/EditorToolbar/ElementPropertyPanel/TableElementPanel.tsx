import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, Col, Divider, Popover, Radio, Row, Select, Switch, Tooltip } from 'antd'
import { Icon } from 'umi'
import { nanoid } from 'nanoid'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore, useSlidesStore } from '@/ppt/store'
import type { PPTTableElement, TableCell, TableCellStyle, TableTheme, TextAlign } from '@/ppt/core'
import { FONTS, FONT_SIZE_OPTIONS } from '@/ppt/configs'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { normalizePPTColor, resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

import { PositionPanel } from './common/PositionPanel'
import ContentWrapper from './common/ContentWrapper'
import ElementOutline from './common/ElementOutline'
import ColorButton from './common/ColorButton'
import ElementOpacity from './common/ElementOpacity'
import fontStyles from './common/FontPanel.scss'
import styles from './TableElementPanel.module.scss'
import type { TextVerticalAlign } from '@/ppt/core'

type TableTextAttrs = Omit<TableCellStyle, 'fontSize'> & { fontSize: number }

interface TableElementPanelProps { }

const defaultTextAttrs: TableTextAttrs = {
  bold: false,
  em: false,
  underline: false,
  strikethrough: false,
  color: PPTColor.ofFixed('#000000'),
  backColor: PPTColor.ofFixed('#00000000'),
  fontSize: 12,
  fontName: '',
  alignH: 'left',
  alignV: 'middle',
}

const createRow = (count: number) =>
  new Array(count).fill(null).map(() => ({
    id: nanoid(10),
    colspan: 1,
    rowspan: 1,
    text: '',
  }))

const normalizeFontSize = (value?: TableCellStyle['fontSize']): number => {
  if (value === undefined || value === null) return defaultTextAttrs.fontSize
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat(value as unknown as string)
  return Number.isNaN(parsed) ? defaultTextAttrs.fontSize : parsed
}

const parseFontSizeInput = (value?: string | number) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

const getInitialTableTextAttrs = (table: PPTTableElement | null): TableTextAttrs => {
  if (!table?.data?.length || !table.data[0]?.length) return { ...defaultTextAttrs }
  const style = table.data[0][0]?.style || {}
  return {
    bold: !!style.bold,
    em: !!style.em,
    underline: !!style.underline,
    strikethrough: !!style.strikethrough,
    color: normalizePPTColor(style.color) || defaultTextAttrs.color,
    backColor: normalizePPTColor(style.backColor) || defaultTextAttrs.backColor,
    fontSize: normalizeFontSize(style.fontSize),
    fontName: style.fontName || defaultTextAttrs.fontName,
    alignH: style.alignH || defaultTextAttrs.alignH,
    alignV: style.alignV || defaultTextAttrs.alignV,
  }
}

export const TableElementPanel: React.FC<TableElementPanelProps> = () => {
  const slidesStore = useSlidesStore()
  const themeColors = useSlidesStore((state) => state.theme.themeColors)
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()
  const { selectedTableCells, handleElementId } = useMainStore(
    useShallow((state) => ({
      selectedTableCells: state.selectedTableCells,
      handleElementId: state.handleElementId,
    })),
  )

  const handleTableElement = handleElement as PPTTableElement | null
  const themeColor = useMemo(() => normalizePPTColor((themeColors as any)?.[0]) || PPTColor.ofFixed('#000000'), [themeColors])

  const [textAttrs, setTextAttrs] = useState<TableTextAttrs>(defaultTextAttrs)
  const [tableDefaultAttrs, setTableDefaultAttrs] = useState<TableTextAttrs>(defaultTextAttrs)
  const [theme, setTheme] = useState<TableTheme | undefined>()
  const [hasTheme, setHasTheme] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [colCount, setColCount] = useState(0)
  const hasSelection = selectedTableCells.length > 0

  useEffect(() => {
    if (!handleTableElement || handleTableElement.type !== 'table') return
    setTheme(handleTableElement.theme)
    setHasTheme(!!handleTableElement.theme)
    setRowCount(handleTableElement.data.length)
    setColCount(handleTableElement.data[0]?.length || 0)
  }, [handleTableElement])

  useEffect(() => {
    if (!handleTableElement) return
    const initialAttrs = getInitialTableTextAttrs(handleTableElement)
    setTableDefaultAttrs(initialAttrs)
    setTextAttrs(initialAttrs)
  }, [handleTableElement?.id])

  const updateElement = (props: Partial<PPTTableElement>) => {
    if (!handleTableElement) return
    const targetId = handleElementId || handleTableElement.id
    slidesStore.updateElement({ id: targetId, props })
    addHistorySnapshot()
  }

  const updateTextAttrState = useCallback(() => {
    if (!handleTableElement || handleTableElement.type !== 'table') return
    if (!handleTableElement.data.length || !handleTableElement.data[0]?.length) return

    if (!hasSelection) {
      setTextAttrs(tableDefaultAttrs)
      return
    }

    const selectedCell = selectedTableCells[0]
    const rowIndex = Number(selectedCell.split('_')[0])
    const colIndex = Number(selectedCell.split('_')[1])

    const cell = handleTableElement.data[rowIndex]?.[colIndex]
    if (!cell?.style) {
      setTextAttrs(defaultTextAttrs)
      return
    }

    const style = cell.style
    setTextAttrs({
      bold: !!style.bold,
      em: !!style.em,
      underline: !!style.underline,
      strikethrough: !!style.strikethrough,
      color: normalizePPTColor(style.color) || PPTColor.ofFixed('#000000'),
      backColor: normalizePPTColor(style.backColor) || PPTColor.ofFixed('#00000000'),
      fontSize: normalizeFontSize(style.fontSize),
      fontName: style.fontName || '',
      alignH: style.alignH || 'left',
      alignV: style.alignV || 'middle',
    })
  }, [handleTableElement, hasSelection, selectedTableCells, tableDefaultAttrs])

  useEffect(() => {
    updateTextAttrState()
  }, [updateTextAttrState])

  const updateTextAttrs = (textAttrProp: Partial<TableCellStyle>) => {
    if (!handleTableElement) return
    const data: TableCell[][] = JSON.parse(JSON.stringify(handleTableElement.data))
    const nextTextAttrs = { ...textAttrs, ...textAttrProp }
    
    if ('fontSize' in textAttrProp) {
      const parsed = parseFontSizeInput(textAttrProp.fontSize as any)
      if (parsed !== undefined) {
        nextTextAttrs.fontSize = parsed
        textAttrProp.fontSize = parsed
      }
    }
    setTextAttrs(nextTextAttrs)

    if (hasSelection) {
      const selectedCell = selectedTableCells[0]
      const rowIndex = Number(selectedCell.split('_')[0])
      const colIndex = Number(selectedCell.split('_')[1])
      const style = data[rowIndex]?.[colIndex]?.style || {}
      if (data[rowIndex]?.[colIndex]) {
        data[rowIndex][colIndex].style = { ...style, ...textAttrProp } as TableCellStyle
      }
    } else {
      setTableDefaultAttrs(nextTextAttrs)
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          const style = data[i][j].style || {}
          data[i][j].style = { ...style, ...textAttrProp } as TableCellStyle
        }
      }
    }

    updateElement({ data })
  }

  const updateTheme = (themeProp: Partial<TableTheme>) => {
    if (!theme) return
    const next = { ...theme, ...themeProp }
    setTheme(next)
    updateElement({ theme: next })
  }

  const toggleTheme = (checked: boolean) => {
    if (!checked) {
      slidesStore.removeElementProps({ id: handleElementId, propName: 'theme' })
      addHistorySnapshot()
      setHasTheme(false)
      setTheme(undefined)
      return
    }

    const nextTheme: TableTheme = {
      color: themeColor,
      rowHeader: true,
      rowFooter: false,
      colHeader: false,
      colFooter: false,
    }
    updateElement({ theme: nextTheme })
    setHasTheme(true)
    setTheme(nextTheme)
  }

  const setTableRow = (value: number) => {
    if (!handleTableElement) return
    const currentRowCount = handleTableElement.data.length

    if (value > currentRowCount) {
      const newRows: TableCell[][] = new Array(value - currentRowCount)
        .fill(null)
        .map(() => createRow(colCount))
      const tableCells: TableCell[][] = JSON.parse(JSON.stringify(handleTableElement.data))
      tableCells.push(...newRows)
      updateElement({ data: tableCells })
    } else {
      const tableCells: TableCell[][] = handleTableElement.data.slice(0, value)
      updateElement({ data: tableCells })
    }
    setRowCount(value)
  }

  const setTableCol = (value: number) => {
    if (!handleTableElement) return
    const currentColCount = handleTableElement.data[0]?.length || 0

    let tableCells = handleTableElement.data
    const baseWidths =
      handleTableElement.colWidths?.length === currentColCount
        ? handleTableElement.colWidths
        : new Array(currentColCount).fill(1 / Math.max(currentColCount, 1))
    let colSizeList = baseWidths.map((item) => item * handleTableElement.width)

    if (value > currentColCount) {
      tableCells = tableCells.map((item) => {
        const cells = new Array(value - currentColCount).fill(null).map(() => ({
          id: nanoid(10),
          colspan: 1,
          rowspan: 1,
          text: '',
        }))
        item.push(...cells)
        return item
      })
      const newColSizeList: number[] = new Array(value - currentColCount).fill(100)
      colSizeList.push(...newColSizeList)
    } else {
      tableCells = tableCells.map((item) => item.slice(0, value))
      colSizeList = colSizeList.slice(0, value)
    }

    const width = colSizeList.reduce((a, b) => a + b, 0)
    const colWidths = width
      ? colSizeList.map((item) => item / width)
      : new Array(Math.max(value, 1)).fill(1 / Math.max(value, 1))

    updateElement({ width: width, data: tableCells, colWidths })
    setColCount(value)
  }

  if (!handleTableElement) return null

  return (
    <div>
      <PositionPanel />
      <Divider size="small" />

      <ContentWrapper title="单元格样式">
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Select
              style={{ width: '100%' }}
              value={textAttrs.fontName}
              showSearch
              optionFilterProp="label"
              placeholder="字体"
              onChange={(value) => updateTextAttrs({ fontName: value })}
              options={FONTS}
            />
          </Col>
          <Col span={4}>
            <Tooltip title="文字颜色">
              <span>
                <PPTColorPicker
                  value={textAttrs.color}
                  onChange={(color) => updateTextAttrs({ color })}
                />
              </span>
            </Tooltip>
          </Col>
          <Col span={4}>
            <Tooltip title="单元格填充">
              <span>
                <PPTColorPicker
                  value={textAttrs.backColor}
                  onChange={(color) => updateTextAttrs({ backColor: color })}
                />
              </span>
            </Tooltip>
          </Col>
          <Col span={16}>
            <Select
              style={{ width: '100%' }}
              value={textAttrs.fontSize}

              optionFilterProp="label"
              placeholder="字号"
              onChange={(value) => updateTextAttrs({ fontSize: value })}
              options={FONT_SIZE_OPTIONS.map((item) => ({ label: item.toString(), value: item }))}
            />
          </Col>
          <Col span={24}>
            <div className={fontStyles['font-setting-actions']}>
              <Tooltip title="加粗">
                <Button size="small" type={textAttrs.bold ? 'primary' : 'text'} onClick={() => updateTextAttrs({ bold: !textAttrs.bold })}>
                  <Icon icon="ri:bold" />
                </Button>
              </Tooltip>
              <Tooltip title="斜体">
                <Button size="small" type={textAttrs.em ? 'primary' : 'text'} onClick={() => updateTextAttrs({ em: !textAttrs.em })}>
                  <Icon icon="ri:italic" />
                </Button>
              </Tooltip>
              <Tooltip title="下划线">
                <Button size="small" type={textAttrs.underline ? 'primary' : 'text'} onClick={() => updateTextAttrs({ underline: !textAttrs.underline })}>
                  <Icon icon="ri:underline" />
                </Button>
              </Tooltip>
              <Tooltip title="删除线">
                <Button size="small" type={textAttrs.strikethrough ? 'primary' : 'text'} onClick={() => updateTextAttrs({ strikethrough: !textAttrs.strikethrough })}>
                  <Icon icon="ri:strikethrough" />
                </Button>
              </Tooltip>
            </div>
          </Col>

        </Row>
      </ContentWrapper>
      <Divider size="small" />

      <ContentWrapper title="排版">
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <div className={fontStyles['font-setting-actions']}>
              <Tooltip title="左对齐">
                <Button size="small" type={textAttrs.alignH === 'left' ? 'primary' : 'text'} onClick={() => updateTextAttrs({ alignH: 'left' })}>
                  <Icon icon="ri:align-left" />
                </Button>
              </Tooltip>
              <Tooltip title="左右居中">
                <Button size="small" type={textAttrs.alignH === 'center' ? 'primary' : 'text'} onClick={() => updateTextAttrs({ alignH: 'center' })}>
                  <Icon icon="ri:align-center" />
                </Button>
              </Tooltip>
              <Tooltip title="右对齐">
                <Button size="small" type={textAttrs.alignH === 'right' ? 'primary' : 'text'} onClick={() => updateTextAttrs({ alignH: 'right' })}>
                  <Icon icon="ri:align-right" />
                </Button>
              </Tooltip>
              <Tooltip title="两端对齐">
                <Button size="small" type={textAttrs.alignH === 'justify' ? 'primary' : 'text'} onClick={() => updateTextAttrs({ alignH: 'justify' })}>
                  <Icon icon="ri:align-justify" />
                </Button>
              </Tooltip>
            </div>
          </Col>
          <Col span={24}>
            <div className={fontStyles['font-setting-actions']}>
              <Tooltip title="顶部对齐">
                <Button size="small" type={textAttrs.alignV === 'top' ? 'primary' : 'text'} onClick={() => updateTextAttrs({ alignV: 'top' })}>
                  <Icon icon="ri:align-top" />
                </Button>
              </Tooltip>
              <Tooltip title="上下居中">
                <Button size="small" type={textAttrs.alignV === 'middle' ? 'primary' : 'text'} onClick={() => updateTextAttrs({ alignV: 'middle' })}>
                  <Icon icon="ri:align-vertically" />
                </Button>
              </Tooltip>
              <Tooltip title="底部对齐">
                <Button size="small" type={textAttrs.alignV === 'bottom' ? 'primary' : 'text'} onClick={() => updateTextAttrs({ alignV: 'bottom' })}>
                  <Icon icon="ri:align-bottom" />
                </Button>
              </Tooltip>
            </div>
          </Col>
        </Row>
      </ContentWrapper>

      <Divider size="small" />

      <ContentWrapper title="行列">

        <div className={styles.row}>
          <div className={styles.label}>行数：</div>
          <div className={styles.setCount}>
            <Button className={styles.btn} disabled={rowCount <= 1} onClick={() => setTableRow(rowCount - 1)}>
              <Icon icon="ri:subtract-line" />
            </Button>
            <div className={styles.countText}>{rowCount}</div>
            <Button className={styles.btn} disabled={rowCount >= 30} onClick={() => setTableRow(rowCount + 1)}>
              <Icon icon="ri:add-line" />
            </Button>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>列数：</div>
          <div className={styles.setCount}>
            <Button className={styles.btn} disabled={colCount <= 1} onClick={() => setTableCol(colCount - 1)}>
              <Icon icon="ri:subtract-line" />
            </Button>
            <div className={styles.countText}>{colCount}</div>
            <Button className={styles.btn} disabled={colCount >= 30} onClick={() => setTableCol(colCount + 1)}>
              <Icon icon="ri:add-line" />
            </Button>
          </div>
        </div>

      </ContentWrapper>
      <Divider size="small" />

      <ContentWrapper title="主题表格">

        <div className={`${styles.row} ${styles.themeSwitch}`}>
          <div className={styles.label} style={{ width: '120px' }}>启用主题表格：</div>
          <div className={styles.switchWrapper}>
            <Switch checked={hasTheme} onChange={toggleTheme} />
          </div>
        </div>

        {hasTheme && theme && (
          <>
            <div className={styles.row}>
              <Checkbox
                checked={theme.rowHeader}
                onChange={(e) => updateTheme({ rowHeader: e.target.checked })}
                className={styles.grow}
              >
                标题行
              </Checkbox>
              <Checkbox
                checked={theme.rowFooter}
                onChange={(e) => updateTheme({ rowFooter: e.target.checked })}
                className={styles.grow}
              >
                汇总行
              </Checkbox>
            </div>
            <div className={styles.row}>
              <Checkbox
                checked={theme.colHeader}
                onChange={(e) => updateTheme({ colHeader: e.target.checked })}
                className={styles.grow}
              >
                第一列
              </Checkbox>
              <Checkbox
                checked={theme.colFooter}
                onChange={(e) => updateTheme({ colFooter: e.target.checked })}
                className={styles.grow}
              >
                最后一列
              </Checkbox>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>主题颜色：</div>
       
                <div className={styles.control}>
                  <PPTColorPicker value={theme.color} onChange={(color) => updateTheme({ color })}>
                    <ColorButton color={resolvePPTColorValue(theme.color)} />
                  </PPTColorPicker>
                </div>
            
            </div>
          </>
        )}

      </ContentWrapper>
      <Divider size="small" />

      <ContentWrapper title="边框">

        <ElementOutline fixed />

      </ContentWrapper>
    </div>
  )
}

export default TableElementPanel
