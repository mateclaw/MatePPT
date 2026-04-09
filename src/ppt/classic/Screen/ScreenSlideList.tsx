import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import useSlidesWithTurningMode from './hooks/useSlidesWithTurningMode'
import ScreenSlide from './ScreenSlide'
import styles from './ScreenSlideList.module.scss'

interface ScreenSlideListProps {
  slideWidth: number
  slideHeight: number
  animationIndex: number
  turnSlideToId: (id: string) => void
  manualExitFullscreen: () => void
  contextmenus?: () => ContextmenuItem[]
  onWheel?: (event: WheelEvent) => void
  onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void
  onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void
}

export default function ScreenSlideList({
  slideWidth,
  slideHeight,
  animationIndex,
  turnSlideToId,
  manualExitFullscreen,
  contextmenus,
  onWheel,
  onTouchStart,
  onTouchEnd,
}: ScreenSlideListProps) {
  const { slideIndex, viewportSize } = useSlidesStore(
    useShallow((state) => ({
      slideIndex: state.slideIndex,
      viewportSize: state.viewportSize,
    })),
  )
  const { slidesWithTurningMode } = useSlidesWithTurningMode()
  const scale = useMemo(() => slideWidth / viewportSize, [slideWidth, viewportSize])
  const currentSlideTurningMode = slidesWithTurningMode[slideIndex]?.turningMode

  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const [contextmenuMenus, setContextmenuMenus] = useState<ContextmenuItem[]>([])
  const [contextmenuEl, setContextmenuEl] = useState<HTMLElement | null>(null)

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contextmenus) return
    e.preventDefault()
    e.stopPropagation()
    setContextmenuAxis({ x: e.clientX, y: e.clientY })
    setContextmenuMenus(contextmenus())
    setContextmenuEl(e.currentTarget)
  }

  const removeContextmenu = () => {
    setContextmenuAxis(null)
    setContextmenuMenus([])
    setContextmenuEl(null)
  }

  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !onWheel) return
    const handler = (event: WheelEvent) => onWheel(event)
    el.addEventListener('wheel', handler, { passive: false })
    return () => {
      el.removeEventListener('wheel', handler)
    }
  }, [onWheel])

  return (
    <div
      className={styles['screen-slide-list']}
      ref={containerRef}
      onContextMenu={handleContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slidesWithTurningMode.map((slide, index) => (
        <div
          key={slide.id}
          className={clsx(
            styles['slide-item'],
            styles[`turning-mode-${slide.turningMode}`],
            {
              [styles.current]: index === slideIndex,
              [styles.before]: index < slideIndex,
              [styles.after]: index > slideIndex,
              [styles.hide]:
                (index === slideIndex - 1 || index === slideIndex + 1) &&
                slide.turningMode !== currentSlideTurningMode,
              [styles.last]: index === slideIndex - 1,
              [styles.next]: index === slideIndex + 1,
            },
          )}
        >
          {(Math.abs(slideIndex - index) < 2 || slide.animations?.length) && (
            <div
              className={styles['slide-content']}
              style={{
                width: `${slideWidth}px`,
                height: `${slideHeight}px`,
              }}
            >
              <ScreenSlide
                slide={slide}
                scale={scale}
                animationIndex={animationIndex}
                turnSlideToId={turnSlideToId}
                manualExitFullscreen={manualExitFullscreen}
              />
            </div>
          )}
        </div>
      ))}

      {contextmenuAxis && contextmenuEl && (
        <Contextmenu
          axis={contextmenuAxis}
          el={contextmenuEl}
          menus={contextmenuMenus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </div>
  )
}
