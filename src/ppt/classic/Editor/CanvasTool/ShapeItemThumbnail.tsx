import type { ShapePoolItem } from '@/ppt/configs/shapes'
import styles from './ShapeItemThumbnail.module.scss'

interface ShapeItemThumbnailProps {
  shape: ShapePoolItem
  className?: string
  onClick?: () => void
  disableHover?: boolean
}

export default function ShapeItemThumbnail({
  shape,
  className,
  onClick,
  disableHover,
}: ShapeItemThumbnailProps) {
  return (
    <div
      className={`${styles['shape-item-thumbnail']} ${disableHover ? styles['no-hover'] : ''} ${className || ''}`}
      onClick={onClick}
    >
      <div className={styles['shape-content']}>
        <svg overflow="visible" width="18" height="18">
          <g transform={`scale(${18 / shape.viewBox[0]}, ${18 / shape.viewBox[1]}) translate(0,0) matrix(1,0,0,1,0,0)`}>
            <path
              className={`${styles['shape-path']} ${shape.outlined ? styles.outlined : ''}`}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="butt"
              strokeMiterlimit={8}
              fill={shape.outlined ? '#999' : 'transparent'}
              stroke={shape.outlined ? 'transparent' : '#999'}
              strokeWidth={2}
              d={shape.path}
            />
          </g>
        </svg>
      </div>
    </div>
  )
}
