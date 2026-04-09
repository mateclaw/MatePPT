import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button, Divider, Modal, Popover, Tooltip, Input } from 'antd'
import { Icon } from 'umi'

import { useMainStore } from '@/ppt/store'
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore'
import { getImageDataURL } from '@/ppt/utils/image'
import type { ShapePoolItem } from '@/ppt/configs/shapes'
import type { LinePoolItem } from '@/ppt/configs/lines'
import useScaleCanvas from '@/ppt/hooks/useScaleCanvas'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import useCreateElement from '@/ppt/hooks/useCreateElement'
import { measureLatex } from '@/ppt/utils/latex-utils'
import ShapePool from './ShapePool'
import LinePool from './LinePool'
import ChartPool from './ChartPool'
import TableGenerator from './TableGenerator'
import MediaInput from './MediaInput'
import styles from './CanvasTool.module.scss'

const canvasScalePresetList = [200, 150, 125, 100, 75, 50]

export default function CanvasTool() {
  const {
    creatingElement,
    creatingCustomShape,
    showSelectPanel,
    showSearchPanel,
    showNotesPanel,
    showSymbolPanel,
    setCreatingElement,
    setCreatingCustomShape,
    setShowSelectPanel,
    setShowSearchPanel,
    setShowNotesPanel,
    setShowSymbolPanel,
  } = useMainStore(
    useShallow((state) => ({
      creatingElement: state.creatingElement,
      creatingCustomShape: state.creatingCustomShape,
      showSelectPanel: state.showSelectPanel,
      showSearchPanel: state.showSearchPanel,
      showNotesPanel: state.showNotesPanel,
      showSymbolPanel: state.showSymbolPanel,
      setCreatingElement: state.setCreatingElement,
      setCreatingCustomShape: state.setCreatingCustomShape,
      setShowSelectPanel: state.setShowSelectPanel,
      setShowSearchPanel: state.setShowSearchPanel,
      setShowNotesPanel: state.setShowNotesPanel,
      setShowSymbolPanel: state.setShowSymbolPanel,
    })),
  )
  const { canUndo, canRedo } = useSnapshotStore(
    useShallow((state) => ({
      canUndo: state.canUndo,
      canRedo: state.canRedo,
    })),
  )

  const { redo, undo } = useHistorySnapshot()
  const { scaleCanvas, setCanvasScalePercentage, resetCanvas, canvasScalePercentage } = useScaleCanvas()
  const {
    createImageElement,
    createChartElement,
    createTableElement,
    createLatexElement,
    createVideoElement,
    createAudioElement,
  } = useCreateElement()

  const [canvasScaleVisible, setCanvasScaleVisible] = useState(false)
  const [shapePoolVisible, setShapePoolVisible] = useState(false)
  const [linePoolVisible, setLinePoolVisible] = useState(false)
  const [chartPoolVisible, setChartPoolVisible] = useState(false)
  const [tableGeneratorVisible, setTableGeneratorVisible] = useState(false)
  const [mediaInputVisible, setMediaInputVisible] = useState(false)
  const [latexEditorVisible, setLatexEditorVisible] = useState(false)
  const [textTypeSelectVisible, setTextTypeSelectVisible] = useState(false)
  const [shapeMenuVisible, setShapeMenuVisible] = useState(false)
  const [moreVisible, setMoreVisible] = useState(false)

  const [latexValue, setLatexValue] = useState('')

  const applyCanvasPresetScale = (value: number) => {
    setCanvasScalePercentage(value)
    setCanvasScaleVisible(false)
  }

  const insertImageElement = (files: FileList | null) => {
    const imageFile = files?.[0]
    if (!imageFile) return
    getImageDataURL(imageFile).then((dataURL) => createImageElement(dataURL))
  }

  const drawText = (vertical = false) => {
    setCreatingElement({
      type: 'text',
      vertical,
    })
  }

  const drawShape = (shape: ShapePoolItem) => {
    setCreatingElement({
      type: 'shape',
      data: shape,
    })
    setShapePoolVisible(false)
  }

  const drawCustomShape = () => {
    setCreatingCustomShape(true)
    setShapePoolVisible(false)
  }

  const drawLine = (line: LinePoolItem) => {
    setCreatingElement({
      type: 'line',
      data: line,
    })
    setLinePoolVisible(false)
  }

  const toggleSelectPanel = () => setShowSelectPanel(!showSelectPanel)
  const toggleSraechPanel = () => setShowSearchPanel(!showSearchPanel)
  const toggleNotesPanel = () => setShowNotesPanel(!showNotesPanel)
  const toggleSymbolPanel = () => setShowSymbolPanel(!showSymbolPanel)

  const createLatex = () => {
    const data = measureLatex(latexValue)
    if (!data) {
      return
    }
    createLatexElement({
      path: data.path,
      latex: latexValue,
      w: data.width,
      h: data.height,
    })
    setLatexEditorVisible(false)
    setLatexValue('')
  }

  const moreMenu = (
    <div className={styles['popover-menu']}>
      <div className={styles['menu-item']} onClick={() => { toggleNotesPanel(); setMoreVisible(false) }}>
        批注面板
      </div>
      <div className={styles['menu-item']} onClick={() => { toggleSelectPanel(); setMoreVisible(false) }}>
        选择窗格
      </div>
      <div className={styles['menu-item']} onClick={() => { toggleSraechPanel(); setMoreVisible(false) }}>
        查找替换
      </div>
    </div>
  )

  const textTypeMenu = (
    <div className={styles['popover-menu']}>
      <div className={styles['menu-item']} onClick={() => { drawText(); setTextTypeSelectVisible(false) }}>
        <Icon icon="ri:text" />
        <span>横向文本框</span>
      </div>
      <div className={styles['menu-item']} onClick={() => { drawText(true); setTextTypeSelectVisible(false) }}>
        <Icon icon="ri:text" />
        <span>竖向文本框</span>
      </div>
    </div>
  )

  const shapeMenu = (
    <div className={styles['popover-menu']}>
      <div className={styles['menu-item']} onClick={() => { drawCustomShape(); setShapeMenuVisible(false) }}>
        自由绘制
      </div>
    </div>
  )

  return (
    <div className={styles['canvas-tool']}>
      <div className={styles['left-handler']}>
        <Tooltip title="撤销（Ctrl + Z）">
          <div
            className={`${styles['handler-item']} ${!canUndo ? styles.disable : ''}`}
            onClick={() => canUndo && undo()}
          >
            <Icon icon="ri:arrow-go-back-line" />
          </div>
        </Tooltip>
        <Tooltip title="重做（Ctrl + Y）">
          <div
            className={`${styles['handler-item']} ${!canRedo ? styles.disable : ''}`}
            onClick={() => canRedo && redo()}
          >
            <Icon icon="ri:arrow-go-forward-line" />
          </div>
        </Tooltip>

        <div className={styles.more}>
          <Divider type="vertical" style={{ height: 20 }} />
          <Popover
            content={moreMenu}
            trigger="click"
            open={moreVisible}
            onOpenChange={setMoreVisible}
          >
            <div className={`${styles['handler-item']} ${styles['more-icon']}`}>
              <Icon icon="ri:more-2-line" />
            </div>
          </Popover>
          <Tooltip title="批注面板">
            <div
              className={`${styles['handler-item']} ${showNotesPanel ? styles.active : ''}`}
              onClick={toggleNotesPanel}
            >
              <Icon icon="ri:message-2-line" />
            </div>
          </Tooltip>
          <Tooltip title="选择窗格">
            <div
              className={`${styles['handler-item']} ${showSelectPanel ? styles.active : ''}`}
              onClick={toggleSelectPanel}
            >
              <Icon icon="ri:list-check-2" />
            </div>
          </Tooltip>
          <Tooltip title="查找/替换（Ctrl + F）">
            <div
              className={`${styles['handler-item']} ${showSearchPanel ? styles.active : ''}`}
              onClick={toggleSraechPanel}
            >
              <Icon icon="ri:search-line" />
            </div>
          </Tooltip>
        </div>
      </div>

      <div className={styles['add-element-handler']}>
        <div className={`${styles['handler-item']} ${styles['group-btn']}`}>
          <Tooltip title="插入文字">
            <div
              className={`${styles.icon} ${creatingElement?.type === 'text' ? styles.active : ''}`}
              onClick={() => drawText()}
            >
              <Icon icon="ri:font-size" />
            </div>
          </Tooltip>
          <Popover
            content={textTypeMenu}
            trigger="click"
            open={textTypeSelectVisible}
            onOpenChange={setTextTypeSelectVisible}
          >
            <div className={styles.arrow}>
              <Icon icon="ri:arrow-down-s-line" />
            </div>
          </Popover>
        </div>

        <div className={`${styles['handler-item']} ${styles['group-btn']}`}>
          <Popover
            content={<ShapePool onSelect={drawShape} />}
            trigger="click"
            open={shapePoolVisible}
            onOpenChange={setShapePoolVisible}
          >
            <div
              className={`${styles.icon} ${
                creatingCustomShape || creatingElement?.type === 'shape' ? styles.active : ''
              }`}
            >
              <Icon icon="ri:shape-line" />
            </div>
          </Popover>
          <Popover
            content={shapeMenu}
            trigger="click"
            open={shapeMenuVisible}
            onOpenChange={setShapeMenuVisible}
          >
            <div className={styles.arrow}>
              <Icon icon="ri:arrow-down-s-line" />
            </div>
          </Popover>
        </div>

        <label className={styles['handler-item']}>
          <Tooltip title="插入图片">
            <Icon icon="ri:image-line" />
          </Tooltip>
          <input
            className={styles['file-input']}
            type="file"
            accept="image/*"
            onChange={(e) => insertImageElement(e.target.files)}
          />
        </label>

        <Popover
          content={<LinePool onSelect={drawLine} />}
          trigger="click"
          open={linePoolVisible}
          onOpenChange={setLinePoolVisible}
        >
          <div
            className={`${styles['handler-item']} ${
              creatingElement?.type === 'line' ? styles.active : ''
            }`}
          >
            <Tooltip title="插入线条">
              <Icon icon="ri:link" />
            </Tooltip>
          </div>
        </Popover>

        <Popover
          content={
            <ChartPool
              onSelect={(chart) => {
                createChartElement(chart)
                setChartPoolVisible(false)
              }}
            />
          }
          trigger="click"
          open={chartPoolVisible}
          onOpenChange={setChartPoolVisible}
        >
          <div className={styles['handler-item']}>
            <Tooltip title="插入图表">
              <Icon icon="ri:pie-chart-line" />
            </Tooltip>
          </div>
        </Popover>

        <Popover
          content={
            <TableGenerator
              onClose={() => setTableGeneratorVisible(false)}
              onInsert={({ row, col }) => {
                createTableElement(row, col)
                setTableGeneratorVisible(false)
              }}
            />
          }
          trigger="click"
          open={tableGeneratorVisible}
          onOpenChange={setTableGeneratorVisible}
        >
          <div className={styles['handler-item']}>
            <Tooltip title="插入表格">
              <Icon icon="ri:table-line" />
            </Tooltip>
          </div>
        </Popover>

        <div className={styles['handler-item']} onClick={() => setLatexEditorVisible(true)}>
          <Tooltip title="插入公式">
            <Icon icon="ri:function-line" />
          </Tooltip>
        </div>

        <Popover
          content={
            <MediaInput
              onClose={() => setMediaInputVisible(false)}
              onInsertVideo={(src) => {
                createVideoElement(src)
                setMediaInputVisible(false)
              }}
              onInsertAudio={(src) => {
                createAudioElement(src)
                setMediaInputVisible(false)
              }}
            />
          }
          trigger="click"
          open={mediaInputVisible}
          onOpenChange={setMediaInputVisible}
        >
          <div className={styles['handler-item']}>
            <Tooltip title="插入音视频">
              <Icon icon="ri:video-line" />
            </Tooltip>
          </div>
        </Popover>

        <div
          className={`${styles['handler-item']} ${showSymbolPanel ? styles.active : ''}`}
          onClick={toggleSymbolPanel}
        >
          <Tooltip title="插入符号">
            <Icon icon="ri:omega" />
          </Tooltip>
        </div>
      </div>

      <div className={styles['right-handler']}>
        <Tooltip title="画布缩小（Ctrl + -）">
          <div className={`${styles['handler-item']} ${styles['viewport-size']}`} onClick={() => scaleCanvas('-')}>
            <Icon icon="ri:subtract-line" />
          </div>
        </Tooltip>
        <Popover
          content={
            <div className={styles['popover-menu']}>
              {canvasScalePresetList.map((item) => (
                <div key={item} className={styles['menu-item']} onClick={() => applyCanvasPresetScale(item)}>
                  {item}%
                </div>
              ))}
              <div className={styles['menu-item']} onClick={() => { resetCanvas(); setCanvasScaleVisible(false) }}>
                适应屏幕
              </div>
            </div>
          }
          trigger="click"
          open={canvasScaleVisible}
          onOpenChange={setCanvasScaleVisible}
        >
          <span className={styles.text}>{canvasScalePercentage}</span>
        </Popover>
        <Tooltip title="画布放大（Ctrl + =）">
          <div className={`${styles['handler-item']} ${styles['viewport-size']}`} onClick={() => scaleCanvas('+')}>
            <Icon icon="ri:add-line" />
          </div>
        </Tooltip>
        <Tooltip title="适应屏幕（Ctrl + 0）">
          <div className={`${styles['handler-item']} ${styles['viewport-size-adaptation']}`} onClick={resetCanvas}>
            <Icon icon="ri:fullscreen-line" />
          </div>
        </Tooltip>
      </div>

      <Modal
        open={latexEditorVisible}
        width={880}
        footer={null}
        onCancel={() => setLatexEditorVisible(false)}
        destroyOnHidden
      >
        <div className={styles['latex-editor']}>
          <Input.TextArea
            rows={6}
            value={latexValue}
            onChange={(e) => setLatexValue(e.target.value)}
            placeholder="输入 LaTeX 公式"
          />
          <div className={styles['latex-actions']}>
            <Button onClick={() => setLatexEditorVisible(false)} style={{ marginRight: 10 }}>
              取消
            </Button>
            <Button type="primary" onClick={createLatex}>
              确认
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
