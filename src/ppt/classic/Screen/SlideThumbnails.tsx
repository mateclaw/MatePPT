import { RiArrowLeftCircleLine } from '@remixicon/react'
import clsx from 'clsx'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import useLoadSlides from '@/ppt/hooks/useLoadSlides'
import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide'
import styles from './SlideThumbnails.module.scss'

interface SlideThumbnailsProps {
  turnSlideToIndex: (index: number) => void
  onClose: () => void
}

export default function SlideThumbnails({ turnSlideToIndex, onClose }: SlideThumbnailsProps) {
  const { slides, slideIndex } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
    })),
  )
  const { slidesLoadLimit } = useLoadSlides()

  const handleTurnSlide = (index: number) => {
    turnSlideToIndex(index)
    onClose()
  }

  return (
    <div className={styles['slide-thumbnails']}>
      <div className={styles['return-button']}>
        <RiArrowLeftCircleLine className={styles.icon} onClick={onClose} />
      </div>
      <div className={styles['slide-thumbnails-content']}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={clsx(styles.thumbnail, { [styles.active]: index === slideIndex })}
            onClick={() => handleTurnSlide(index)}
          >
            <ThumbnailSlide slide={slide} size={150} visible={index < slidesLoadLimit} />
          </div>
        ))}
      </div>
    </div>
  )
}
