import { useState } from 'react'
import clsx from 'clsx'
import { Tooltip } from 'antd'
import { useMemoizedFn } from 'ahooks'
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiMagicLine,
  RiPencilLine,
  RiFlowerLine,
  RiPresentationLine,
  RiTimerLine,
} from '@remixicon/react'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import type { ContextmenuItem } from '@/ppt/classic/components/Contextmenu/types'
import { enterFullscreen } from '@/ppt/utils/fullscreen'
import useScreening from '@/ppt/hooks/useScreening'
import useExecPlay from './hooks/useExecPlay'
import useSlideSize from './hooks/useSlideSize'
import useFullscreen from './hooks/useFullscreen'
import ScreenSlideList from './ScreenSlideList'
import SlideThumbnails from './SlideThumbnails'
import WritingBoardTool from './WritingBoardTool'
import CountdownTimer from './CountdownTimer'
import BottomThumbnails from './BottomThumbnails'
import styles from './BaseView.module.scss'

interface BaseViewProps {
  changeViewMode: (mode: 'base' | 'presenter') => void
}

export default function BaseView({ changeViewMode }: BaseViewProps) {
  const { slides, slideIndex } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
    })),
  )

  const {
    autoPlayTimer,
    autoPlay,
    closeAutoPlay,
    autoPlayInterval,
    setAutoPlayInterval,
    loopPlay,
    setLoopPlay,
    mousewheelListener,
    touchStartListener,
    touchEndListener,
    turnPrevSlide,
    turnNextSlide,
    turnSlideToIndex,
    turnSlideToId,
    execPrev,
    execNext,
    animationIndex,
  } = useExecPlay()

  const { slideWidth, slideHeight } = useSlideSize()
  const { exitScreening } = useScreening()
  const { fullscreenState, manualExitFullscreen } = useFullscreen()

  const [rightToolsVisible, setRightToolsVisible] = useState(false)
  const [writingBoardToolVisible, setWritingBoardToolVisible] = useState(false)
  const [timerVisible, setTimerVisible] = useState(false)
  const [slideThumbnailModelVisible, setSlideThumbnailModelVisible] = useState(false)
  const [bottomThumbnailsVisible, setBottomThumbnailsVisible] = useState(false)
  const [laserPen, setLaserPen] = useState(false)

  const contextmenus = useMemoizedFn((): ContextmenuItem[] => [
    {
      text: '上一页',
      subText: '↑ ←',
      disable: slideIndex <= 0,
      handler: () => turnPrevSlide(),
    },
    {
      text: '下一页',
      subText: '↓ →',
      disable: slideIndex >= slides.length - 1,
      handler: () => turnNextSlide(),
    },
    {
      text: '第一页',
      disable: slideIndex === 0,
      handler: () => turnSlideToIndex(0),
    },
    {
      text: '最后一页',
      disable: slideIndex === slides.length - 1,
      handler: () => turnSlideToIndex(slides.length - 1),
    },
    { divider: true },
    {
      text: autoPlayTimer ? '取消自动放映' : '自动放映',
      handler: autoPlayTimer ? closeAutoPlay : autoPlay,
      children: [
        {
          text: '2.5秒',
          subText: autoPlayInterval === 2500 ? '√' : '',
          handler: () => setAutoPlayInterval(2500),
        },
        {
          text: '5秒',
          subText: autoPlayInterval === 5000 ? '√' : '',
          handler: () => setAutoPlayInterval(5000),
        },
        {
          text: '7.5秒',
          subText: autoPlayInterval === 7500 ? '√' : '',
          handler: () => setAutoPlayInterval(7500),
        },
        {
          text: '10秒',
          subText: autoPlayInterval === 10000 ? '√' : '',
          handler: () => setAutoPlayInterval(10000),
        },
      ],
    },
    {
      text: '循环放映',
      subText: loopPlay ? '√' : '',
      handler: () => setLoopPlay(!loopPlay),
    },
    { divider: true },
    {
      text: '显示工具栏',
      handler: () => setRightToolsVisible(true),
    },
    {
      text: '查看所有幻灯片',
      handler: () => setSlideThumbnailModelVisible(true),
    },
    {
      text: '触底显示缩略图',
      subText: bottomThumbnailsVisible ? '√' : '',
      handler: () => setBottomThumbnailsVisible((prev) => !prev),
    },
    {
      text: '画笔工具',
      handler: () => setWritingBoardToolVisible(true),
    },
    {
      text: '演讲者视图',
      handler: () => changeViewMode('presenter'),
    },
    { divider: true },
    {
      text: '结束放映',
      subText: 'ESC',
      handler: exitScreening,
    },
  ])

  return (
    <div className={clsx(styles['base-view'], { [styles['laser-pen']]: laserPen })}>
      <ScreenSlideList
        slideWidth={slideWidth}
        slideHeight={slideHeight}
        animationIndex={animationIndex}
        turnSlideToId={turnSlideToId}
        manualExitFullscreen={manualExitFullscreen}
        onWheel={mousewheelListener}
        onTouchStart={(e) => touchStartListener(e.nativeEvent)}
        onTouchEnd={(e) => touchEndListener(e.nativeEvent)}
        contextmenus={contextmenus}
      />

      {slideThumbnailModelVisible && (
        <SlideThumbnails
          turnSlideToIndex={turnSlideToIndex}
          onClose={() => setSlideThumbnailModelVisible(false)}
        />
      )}

      {writingBoardToolVisible && (
        <WritingBoardTool
          slideWidth={slideWidth}
          slideHeight={slideHeight}
          onClose={() => setWritingBoardToolVisible(false)}
        />
      )}

      {timerVisible && <CountdownTimer onClose={() => setTimerVisible(false)} />}

      <div className={styles['tools-left']}>
        <RiArrowLeftSLine className={styles['tool-btn']} onClick={execPrev} />
        <RiArrowRightSLine className={styles['tool-btn']} onClick={execNext} />
      </div>

      <div
        className={clsx(styles['tools-right'], { [styles.visible]: rightToolsVisible })}
        onMouseLeave={() => setRightToolsVisible(false)}
        onMouseEnter={() => setRightToolsVisible(true)}
      >
        <div className={styles.content}>
          <div
            className={clsx(styles['tool-btn'], styles['page-number'])}
            onClick={() => setSlideThumbnailModelVisible(true)}
          >
            幻灯片 {slideIndex + 1} / {slides.length}
          </div>

          <Tooltip title="画笔工具">
            <RiPencilLine
              className={styles['tool-btn']}
              onClick={() => setWritingBoardToolVisible(true)}
            />
          </Tooltip>

          <Tooltip title="激光笔">
            <RiMagicLine
              className={clsx(styles['tool-btn'], { [styles.active]: laserPen })}
              onClick={() => setLaserPen((prev) => !prev)}
            />
          </Tooltip>

          <Tooltip title="计时器">
            <RiTimerLine
              className={clsx(styles['tool-btn'], { [styles.active]: timerVisible })}
              onClick={() => setTimerVisible((prev) => !prev)}
            />
          </Tooltip>

          <Tooltip title="演讲者视图">
            <RiPresentationLine
              className={styles['tool-btn']}
              onClick={() => changeViewMode('presenter')}
            />
          </Tooltip>

          {fullscreenState ? (
            <Tooltip title="退出全屏">
              <RiFullscreenExitLine
                className={styles['tool-btn']}
                onClick={manualExitFullscreen}
              />
            </Tooltip>
          ) : (
            <Tooltip title="进入全屏">
              <RiFullscreenLine
                className={styles['tool-btn']}
                onClick={enterFullscreen}
              />
            </Tooltip>
          )}

          <Tooltip title="结束放映">
            <RiFlowerLine className={styles['tool-btn']} onClick={exitScreening} />
          </Tooltip>
        </div>
      </div>

      {bottomThumbnailsVisible && <BottomThumbnails />}
    </div>
  )
}
