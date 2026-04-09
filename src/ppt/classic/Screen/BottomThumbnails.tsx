import { useCallback, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import useLoadSlides from '@/ppt/hooks/useLoadSlides'
import useExecPlay from './hooks/useExecPlay'
import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide'
import styles from './BottomThumbnails.module.scss'

export default function BottomThumbnails() {
  const { slides, slideIndex, viewportRatio } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
      viewportRatio: state.viewportRatio,
    })),
  )

  const thumbnailsRef = useRef<HTMLDivElement | null>(null)
  const { turnSlideToIndex } = useExecPlay()
  const { slidesLoadLimit } = useLoadSlides()

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

  return (
    <div className={styles['bottom-thumbnails']}>
      <div className={styles.thumbnails} ref={thumbnailsRef}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={clsx(styles.thumbnail, { [styles.active]: index === slideIndex })}
            onClick={() => turnSlideToIndex(index)}
          >
            <ThumbnailSlide
              slide={slide}
              size={100 / viewportRatio}
              visible={index < slidesLoadLimit}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
