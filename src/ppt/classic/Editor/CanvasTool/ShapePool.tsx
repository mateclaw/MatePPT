import { SHAPE_LIST, type ShapePoolItem } from '@/ppt/configs/shapes'
import ShapeItemThumbnail from './ShapeItemThumbnail'
import styles from './ShapePool.module.scss'

interface ShapePoolProps {
  onSelect: (shape: ShapePoolItem) => void
}

export default function ShapePool({ onSelect }: ShapePoolProps) {
  return (
    <div className={styles['shape-pool']}>
      {SHAPE_LIST.map((item) => (
        <div className={styles.category} key={item.type}>
          <div className={styles['category-name']}>{item.type}</div>
          <div className={styles['shape-list']}>
            {item.children.map((shape, index) => (
              <ShapeItemThumbnail
                key={index}
                className={styles['shape-item']}
                shape={shape}
                onClick={() => onSelect(shape)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
