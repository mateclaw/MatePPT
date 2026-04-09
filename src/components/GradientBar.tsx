import { useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'

import type { GradientColor } from '@/ppt/core'
import { buildCssGradient } from '@/ppt/utils/gradient'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import styles from './GradientBar.module.scss'

interface GradientBarProps {
  value: GradientColor[]
  index: number
  onChange: (value: GradientColor[]) => void
  onIndexChange: (index: number) => void
}

export default function GradientBar({
  value,
  index,
  onChange,
  onIndexChange,
}: GradientBarProps) {
  const [points, setPoints] = useState<GradientColor[]>([])
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setPoints(value)
    if (index > value.length - 1) onIndexChange(0)
  }, [value, index, onIndexChange])

  const gradientStyle = useMemo(() => {
    return buildCssGradient({ type: 'linear', rotate: 90, colors: points }) || 'none'
  }, [points])

  const removePoint = (removeIndex: number) => {
    if (value.length <= 2) return

    let targetIndex = 0
    if (removeIndex === index) {
      targetIndex = removeIndex - 1 < 0 ? 0 : removeIndex - 1
    } else if (index === value.length - 1) {
      targetIndex = value.length - 2
    }

    const values = value.filter((_, i) => i !== removeIndex)
    onIndexChange(targetIndex)
    onChange(values)
  }

  const movePoint = (pointIndex: number, startEvent: React.MouseEvent) => {
    if (startEvent.button !== 0) return
    startEvent.preventDefault()

    let isMouseDown = true

    const handleMove = (moveEvent: MouseEvent) => {
      if (!isMouseDown || !barRef.current) return

      const rect = barRef.current.getBoundingClientRect()
      let pos = Math.round(((moveEvent.clientX - rect.left) / rect.width) * 100)
      if (pos > 100) pos = 100
      if (pos < 0) pos = 0

      setPoints((prev) =>
        prev.map((item, idx) => (idx === pointIndex ? { ...item, pos } : item)),
      )
    }

    const handleUp = () => {
      isMouseDown = false

      setPoints((prev) => {
        const point = prev[pointIndex]
        const rest = [...prev]
        rest.splice(pointIndex, 1)

        let targetIndex = 0
        for (let i = 0; i < rest.length; i++) {
          if (point.pos > rest[i].pos) targetIndex = i + 1
        }
        rest.splice(targetIndex, 0, point)

        onIndexChange(targetIndex)
        onChange(rest)
        return rest
      })

      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const addPoint = (e: React.MouseEvent) => {
    if (value.length >= 6 || !barRef.current) return

    const rect = barRef.current.getBoundingClientRect()
    const pos = Math.round(((e.clientX - rect.left) / rect.width) * 100)

    let targetIndex = 0
    for (let i = 0; i < value.length; i++) {
      if (pos > value[i].pos) targetIndex = i + 1
    }
    const color = value[targetIndex - 1] ? value[targetIndex - 1].color : value[targetIndex].color
    const next = [...value]
    next.splice(targetIndex, 0, { pos, color })
    onIndexChange(targetIndex)
    onChange(next)
  }

  return (
    <div className={styles['gradient-bar']}>
      <div
        ref={barRef}
        className={styles.bar}
        style={{ backgroundImage: gradientStyle }}
        onClick={addPoint}
      />
      {points.map((item, i) => (
        <div
          key={`${item.pos}-${i}`}
          className={classNames(styles.point, i === index && styles.active)}
          style={{ backgroundColor: resolvePPTColorValue(item.color) || '#FFFFFF', left: `calc(${item.pos}% - 5px)` }}
          onMouseDown={(e) => movePoint(i, e)}
          onContextMenu={(e) => {
            e.preventDefault()
            removePoint(i)
          }}
        />
      ))}
    </div>
  )
}
