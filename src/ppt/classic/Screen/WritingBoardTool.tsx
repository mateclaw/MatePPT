import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Divider, Popover, Slider, Tooltip } from 'antd'
import {
  RiArrowRightLine,
  RiBrushLine,
  RiCircleLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiEraserLine,
  RiMarkPenLine,
  RiPaintFill,
  RiSquareLine,
} from '@remixicon/react'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import { db } from '@/ppt/utils/database'
import WritingBoard, { type WritingBoardHandle } from '@/components/WritingBoard'
import MoveablePanel from '@/components/MoveablePanel'
import styles from './WritingBoardTool.module.scss'

const writingBoardColors = [
  '#000000',
  '#ffffff',
  '#1e497b',
  '#4e81bb',
  '#e2534d',
  '#9aba60',
  '#8165a0',
  '#47acc5',
  '#f9974c',
  '#ffff3a',
]

type WritingBoardModel = 'pen' | 'mark' | 'eraser' | 'shape'
type ShapeType = 'rect' | 'circle' | 'arrow'

interface WritingBoardToolProps {
  slideWidth: number
  slideHeight: number
  left?: number
  top?: number
  onClose: () => void
}

export default function WritingBoardTool({
  slideWidth,
  slideHeight,
  left = -5,
  top = -5,
  onClose,
}: WritingBoardToolProps) {
  const { slides, slideIndex } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
    })),
  )
  const currentSlide = slides[slideIndex]

  const writingBoardRef = useRef<WritingBoardHandle | null>(null)
  const [writingBoardColor, setWritingBoardColor] = useState('#e2534d')
  const [writingBoardModel, setWritingBoardModel] = useState<WritingBoardModel>('pen')
  const [blackboard, setBlackboard] = useState(false)
  const [sizePopoverType, setSizePopoverType] = useState<'' | WritingBoardModel>('')
  const [shapeType, setShapeType] = useState<ShapeType>('rect')

  const [penSize, setPenSize] = useState(6)
  const [markSize, setMarkSize] = useState(24)
  const [rubberSize, setRubberSize] = useState(80)
  const [shapeSize, setShapeSize] = useState(4)

  const changeModel = (model: WritingBoardModel) => {
    setWritingBoardModel(model)
    setSizePopoverType((prev) => (prev === model ? '' : model))
  }

  const clearCanvas = () => {
    writingBoardRef.current?.clearCanvas()
  }

  const changeColor = (color: string) => {
    if (writingBoardModel === 'eraser') setWritingBoardModel('pen')
    setWritingBoardColor(color)
  }

  useEffect(() => {
    if (!currentSlide?.id) return
    db.writingBoardImgs
      .where('id')
      .equals(currentSlide.id)
      .toArray()
      .then((ret) => {
        const currentImg = ret[0]
        writingBoardRef.current?.setImageDataURL(currentImg?.dataURL || '')
      })
  }, [currentSlide?.id])

  const handleWritingEnd = () => {
    if (!currentSlide?.id) return
    const dataURL = writingBoardRef.current?.getImageDataURL()
    if (!dataURL) return

    db.writingBoardImgs
      .where('id')
      .equals(currentSlide.id)
      .toArray()
      .then((ret) => {
        const currentImg = ret[0]
        if (currentImg) db.writingBoardImgs.update(currentImg, { dataURL })
        else db.writingBoardImgs.add({ id: currentSlide.id, dataURL })
      })
  }

  return (
    <div className={styles['writing-board-tool']}>
      <div
        className={styles['writing-board-wrap']}
        style={{ width: `${slideWidth}px`, height: `${slideHeight}px` }}
      >
        <WritingBoard
          ref={writingBoardRef}
          color={writingBoardColor}
          blackboard={blackboard}
          model={writingBoardModel}
          penSize={penSize}
          markSize={markSize}
          rubberSize={rubberSize}
          shapeSize={shapeSize}
          shapeType={shapeType}
          onEnd={handleWritingEnd}
        />
      </div>

      <MoveablePanel className={styles['tools-panel']} width={510} height={50} left={left} top={top}>
        <div className={styles.tools} onMouseDown={(e) => e.stopPropagation()}>
          <div className={styles['tool-content']}>
            <Popover
              placement="top"
              open={sizePopoverType === 'pen'}
              onOpenChange={(open) => setSizePopoverType(open ? 'pen' : '')}
              content={
                <div className={styles.setting}>
                  <div className={styles.label}>墨迹粗细：</div>
                  <Slider
                    className={styles['size-slider']}
                    min={4}
                    max={10}
                    step={2}
                    value={penSize}
                    onChange={(value) => setPenSize(value as number)}
                  />
                </div>
              }
            >
              <Tooltip title="画笔">
                <div
                  className={clsx(styles.btn, { [styles.active]: writingBoardModel === 'pen' })}
                  onClick={() => changeModel('pen')}
                >
                  <RiBrushLine className={styles.icon} />
                </div>
              </Tooltip>
            </Popover>
            <Popover
              placement="top"
              open={sizePopoverType === 'shape'}
              onOpenChange={(open) => setSizePopoverType(open ? 'shape' : '')}
              content={
                <div className={clsx(styles.setting, styles.shape)}>
                  <div className={styles.shapes}>
                    <RiSquareLine
                      className={clsx(styles.icon, { [styles.active]: shapeType === 'rect' })}
                      onClick={() => setShapeType('rect')}
                    />
                    <RiCircleLine
                      className={clsx(styles.icon, { [styles.active]: shapeType === 'circle' })}
                      onClick={() => setShapeType('circle')}
                    />
                    <RiArrowRightLine
                      className={clsx(styles.icon, { [styles.active]: shapeType === 'arrow' })}
                      onClick={() => setShapeType('arrow')}
                    />
                  </div>
                  <Divider type="vertical" />
                  <div className={styles.label}>墨迹粗细：</div>
                  <Slider
                    className={styles['size-slider']}
                    min={2}
                    max={8}
                    step={2}
                    value={shapeSize}
                    onChange={(value) => setShapeSize(value as number)}
                  />
                </div>
              }
            >
              <Tooltip title="形状">
                <div
                  className={clsx(styles.btn, { [styles.active]: writingBoardModel === 'shape' })}
                  onClick={() => changeModel('shape')}
                >
                  <RiSquareLine className={styles.icon} />
                </div>
              </Tooltip>
            </Popover>
            <Popover
              placement="top"
              open={sizePopoverType === 'mark'}
              onOpenChange={(open) => setSizePopoverType(open ? 'mark' : '')}
              content={
                <div className={styles.setting}>
                  <div className={styles.label}>墨迹粗细：</div>
                  <Slider
                    className={styles['size-slider']}
                    min={16}
                    max={40}
                    step={4}
                    value={markSize}
                    onChange={(value) => setMarkSize(value as number)}
                  />
                </div>
              }
            >
              <Tooltip title="荧光笔">
                <div
                  className={clsx(styles.btn, { [styles.active]: writingBoardModel === 'mark' })}
                  onClick={() => changeModel('mark')}
                >
                  <RiMarkPenLine className={styles.icon} />
                </div>
              </Tooltip>
            </Popover>
            <Popover
              placement="top"
              open={sizePopoverType === 'eraser'}
              onOpenChange={(open) => setSizePopoverType(open ? 'eraser' : '')}
              content={
                <div className={styles.setting}>
                  <div className={styles.label}>橡皮大小：</div>
                  <Slider
                    className={styles['size-slider']}
                    min={20}
                    max={200}
                    step={20}
                    value={rubberSize}
                    onChange={(value) => setRubberSize(value as number)}
                  />
                </div>
              }
            >
              <Tooltip title="橡皮擦">
                <div
                  className={clsx(styles.btn, { [styles.active]: writingBoardModel === 'eraser' })}
                  onClick={() => changeModel('eraser')}
                >
                  <RiEraserLine className={styles.icon} />
                </div>
              </Tooltip>
            </Popover>
            <Tooltip title="清除墨迹">
              <div className={styles.btn} onClick={clearCanvas}>
                <RiDeleteBin6Line className={styles.icon} />
              </div>
            </Tooltip>
            <Tooltip title="黑板">
              <div
                className={clsx(styles.btn, { [styles.active]: blackboard })}
                onClick={() => setBlackboard((prev) => !prev)}
              >
                <RiPaintFill className={styles.icon} />
              </div>
            </Tooltip>
            <div className={styles.colors}>
              {writingBoardColors.map((color) => (
                <div
                  key={color}
                  className={clsx(styles.color, {
                    [styles.active]: color === writingBoardColor,
                    [styles.white]: color === '#ffffff',
                  })}
                  style={{ backgroundColor: color }}
                  onClick={() => changeColor(color)}
                />
              ))}
            </div>
          </div>
          <Tooltip title="关闭画笔">
            <div className={clsx(styles.btn, styles.close)} onClick={onClose}>
              <RiCloseLine className={styles.icon} />
            </div>
          </Tooltip>
        </div>
      </MoveablePanel>
    </div>
  )
}
