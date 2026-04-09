import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { Divider, Tooltip } from 'antd'
import { useMemoizedFn } from 'ahooks'
import {
  RiAddLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiMagicLine,
  RiPencilLine,
  RiFlowerLine,
  RiPresentationLine,
  RiSubtractLine,
  RiTimerLine,
} from '@remixicon/react'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import type { ContextmenuItem } from '@/ppt/classic/components/Contextmenu/types'
import { enterFullscreen } from '@/ppt/utils/fullscreen'
import { parseText2Paragraphs } from '@/ppt/utils/textParser'
import useScreening from '@/ppt/hooks/useScreening'
import useLoadSlides from '@/ppt/hooks/useLoadSlides'
import useExecPlay from './hooks/useExecPlay'
import useSlideSize from './hooks/useSlideSize'
import useFullscreen from './hooks/useFullscreen'
import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide'
import ScreenSlideList from './ScreenSlideList'
import WritingBoardTool from './WritingBoardTool'
import CountdownTimer from './CountdownTimer'
import styles from './PresenterView.module.scss'

interface PresenterViewProps {
  changeViewMode: (mode: 'base' | 'presenter') => void
}

export default function PresenterView({ changeViewMode }: PresenterViewProps) {
  const { slides, slideIndex, viewportRatio } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
      viewportRatio: state.viewportRatio,
    })),
  )
  const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])

  const slideListWrapRef = useRef<HTMLDivElement | null>(null)
  const thumbnailsRef = useRef<HTMLDivElement | null>(null)
  const [writingBoardToolVisible, setWritingBoardToolVisible] = useState(false)
  const [timerVisible, setTimerVisible] = useState(false)
  const [laserPen, setLaserPen] = useState(false)

  const {
    mousewheelListener,
    touchStartListener,
    touchEndListener,
    turnPrevSlide,
    turnNextSlide,
    turnSlideToIndex,
    turnSlideToId,
    animationIndex,
  } = useExecPlay()

  const { slideWidth, slideHeight } = useSlideSize(slideListWrapRef)
  const { exitScreening } = useScreening()
  const { slidesLoadLimit } = useLoadSlides()
  const { fullscreenState, manualExitFullscreen } = useFullscreen()

  const [remarkFontSize, setRemarkFontSize] = useState(16)
  const currentSlideRemark = useMemo(() => {
    if (!currentSlide?.remark) return ''
    return parseText2Paragraphs(currentSlide.remark)
  }, [currentSlide?.remark])

  const handleMousewheelThumbnails = useCallback((e: WheelEvent) => {
    e.preventDefault()
    thumbnailsRef.current?.scrollBy({ left: e.deltaY, top: 0 })
  }, [])

  useEffect(() => {
    const el = thumbnailsRef.current
    if (!el) return
    el.addEventListener('wheel', handleMousewheelThumbnails, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleMousewheelThumbnails)
    }
  }, [handleMousewheelThumbnails])

  const changeRemarkFontSize = (nextSize: number) => {
    if (nextSize < 12 || nextSize > 40) return
    setRemarkFontSize(nextSize)
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!thumbnailsRef.current) return
      const activeThumbnailRef = thumbnailsRef.current.querySelector<HTMLElement>(
        `.${styles.thumbnail}.${styles.active}`,
      )
      if (!activeThumbnailRef) return

      const width = thumbnailsRef.current.offsetWidth
      const offsetLeft = activeThumbnailRef.offsetLeft + activeThumbnailRef.clientWidth / 2
      thumbnailsRef.current.scrollTo({ left: offsetLeft - width / 2, behavior: 'smooth' })
    })

    return () => cancelAnimationFrame(raf)
  }, [slideIndex, slides.length])

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
      text: '画笔工具',
      handler: () => setWritingBoardToolVisible(true),
    },
    {
      text: '普通视图',
      handler: () => changeViewMode('base'),
    },
    { divider: true },
    {
      text: '结束放映',
      subText: 'ESC',
      handler: exitScreening,
    },
  ])

  return (
    <div className={styles['presenter-view']}>
      <div className={styles.toolbar}>
        <div className={styles['tool-btn']} onClick={() => changeViewMode('base')}>
          <RiPresentationLine className={styles['tool-icon']} />
          <span>普通视图</span>
        </div>
        <div
          className={clsx(styles['tool-btn'], { [styles.active]: writingBoardToolVisible })}
          onClick={() => setWritingBoardToolVisible((prev) => !prev)}
        >
          <RiPencilLine className={styles['tool-icon']} />
          <span>画笔</span>
        </div>
        <div
          className={clsx(styles['tool-btn'], { [styles.active]: laserPen })}
          onClick={() => setLaserPen((prev) => !prev)}
        >
          <RiMagicLine className={styles['tool-icon']} />
          <span>激光笔</span>
        </div>
        <div
          className={clsx(styles['tool-btn'], { [styles.active]: timerVisible })}
          onClick={() => setTimerVisible((prev) => !prev)}
        >
          <RiTimerLine className={styles['tool-icon']} />
          <span>计时器</span>
        </div>
        <div
          className={styles['tool-btn']}
          onClick={() => (fullscreenState ? manualExitFullscreen() : enterFullscreen())}
        >
          {fullscreenState ? (
            <RiFullscreenExitLine className={styles['tool-icon']} />
          ) : (
            <RiFullscreenLine className={styles['tool-icon']} />
          )}
          <span>{fullscreenState ? '退出全屏' : '全屏'}</span>
        </div>
        <Divider className={styles.divider} />
        <div className={styles['tool-btn']} onClick={exitScreening}>
          <RiFlowerLine className={styles['tool-icon']} />
          <span>结束放映</span>
        </div>
      </div>

      <div className={styles.content}>
        <div
          className={clsx(styles['slide-list-wrap'], { [styles['laser-pen']]: laserPen })}
          ref={slideListWrapRef}
        >
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
          {writingBoardToolVisible && (
            <WritingBoardTool
              slideWidth={slideWidth}
              slideHeight={slideHeight}
              left={-365}
              top={-155}
              onClose={() => setWritingBoardToolVisible(false)}
            />
          )}

          {timerVisible && <CountdownTimer left={75} onClose={() => setTimerVisible(false)} />}
        </div>
        <div className={styles.thumbnails} ref={thumbnailsRef}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={clsx(styles.thumbnail, { [styles.active]: index === slideIndex })}
              onClick={() => turnSlideToIndex(index)}
            >
              <ThumbnailSlide
                slide={slide}
                size={120 / viewportRatio}
                visible={index < slidesLoadLimit}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.remark}>
        <div className={styles.header}>
          <span>演讲者备注</span>
          <span>
            P {slideIndex + 1} / {slides.length}
          </span>
        </div>
        <div
          className={clsx(styles['remark-content'], 'ProseMirror-static', {
            [styles.empty]: !currentSlideRemark,
          })}
          style={{ fontSize: `${remarkFontSize}px` }}
          dangerouslySetInnerHTML={{ __html: currentSlideRemark || '无备注' }}
        />
        <div className={styles['remark-scale']}>
          <Tooltip title="减小字体">
            <div
              className={clsx(styles['scale-btn'], {
                [styles.disable]: remarkFontSize === 12,
              })}
              onClick={() => changeRemarkFontSize(remarkFontSize - 2)}
            >
              <RiSubtractLine />
            </div>
          </Tooltip>
          <Tooltip title="增大字体">
            <div
              className={clsx(styles['scale-btn'], {
                [styles.disable]: remarkFontSize === 40,
              })}
              onClick={() => changeRemarkFontSize(remarkFontSize + 2)}
            >
              <RiAddLine />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
