import { useMemo } from 'react'
import type { AlignmentLineAxis } from '@/ppt/types/edit'
import styles from './AlignmentLine.module.scss'

interface AlignmentLineProps {
  type: 'vertical' | 'horizontal'
  axis: AlignmentLineAxis
  length: number
  canvasScale: number
}

export default function AlignmentLine({
  type,
  axis,
  length,
  canvasScale,
}: AlignmentLineProps) {
  const left = useMemo(() => `${axis.x * canvasScale}px`, [axis.x, canvasScale])
  const top = useMemo(() => `${axis.y * canvasScale}px`, [axis.y, canvasScale])

  const sizeStyle = useMemo(() => {
    if (type === 'vertical') return { height: `${length * canvasScale}px` }
    return { width: `${length * canvasScale}px` }
  }, [type, length, canvasScale])

  return (
    <div className={styles['alignment-line']} style={{ left, top }}>
      <div className={`${styles.line} ${styles[type]}`} style={sizeStyle} />
    </div>
  )
}
