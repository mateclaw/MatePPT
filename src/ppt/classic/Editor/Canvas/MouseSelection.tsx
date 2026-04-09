import clsx from 'clsx'
import styles from './MouseSelection.module.scss'

interface MouseSelectionProps {
  top: number
  left: number
  width: number
  height: number
  quadrant: number
}

export default function MouseSelection({
  top,
  left,
  width,
  height,
  quadrant,
}: MouseSelectionProps) {
  return (
    <div
      className={clsx(styles['mouse-selection'], styles[`quadrant-${quadrant}`])}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  )
}
