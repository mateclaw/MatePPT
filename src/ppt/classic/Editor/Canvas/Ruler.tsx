import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMainStore, useSlidesStore } from '@/ppt/store'
import { getElementListRange } from '@/ppt/utils/element'
import type { PPTElement } from '@/ppt/core'
import styles from './Ruler.module.scss'

interface ViewportStyles {
  top: number
  left: number
  width: number
  height: number
}

interface RulerProps {
  viewportStyles: ViewportStyles
  elementList: PPTElement[]
}

export default function Ruler({ viewportStyles, elementList }: RulerProps) {
  const { canvasScale, activeElementIdList } = useMainStore(
    useShallow((state) => ({
      canvasScale: state.canvasScale,
      activeElementIdList: state.activeElementIdList,
    })),
  )
  const { viewportRatio, viewportSize } = useSlidesStore(
    useShallow((state) => ({
      viewportRatio: state.viewportRatio,
      viewportSize: state.viewportSize,
    })),
  )

  const elementListRange = useMemo(() => {
    const els = elementList.filter((el) => activeElementIdList.includes(el.id))
    if (!els.length) return null
    return getElementListRange(els)
  }, [elementList, activeElementIdList])

  const markerSize = useMemo(() => {
    return (viewportStyles.width * canvasScale) / (viewportSize / 100)
  }, [viewportStyles.width, canvasScale, viewportSize])

  return (
    <div className={styles.ruler}>
      <div
        className={styles.h}
        style={{
          width: `${viewportStyles.width * canvasScale}px`,
          left: `${viewportStyles.left}px`,
        }}
      >
        {Array.from({ length: 20 }, (_, index) => index + 1).map((marker) => (
          <div
            key={`h-marker-100-${marker}`}
            className={`${styles['ruler-marker-100']} ${
              markerSize < 36 ? styles.hide : ''
            } ${markerSize < 72 ? styles.omit : ''}`}
            style={{ width: `${markerSize}px` }}
          >
            {marker * 100 <= viewportSize && <span>{marker * 100}</span>}
          </div>
        ))}

        {elementListRange && (
          <div
            className={styles.range}
            style={{
              left: `${elementListRange.minX * canvasScale}px`,
              width: `${(elementListRange.maxX - elementListRange.minX) * canvasScale}px`,
            }}
          />
        )}
      </div>

      <div
        className={styles.v}
        style={{
          height: `${viewportStyles.height * canvasScale}px`,
          top: `${viewportStyles.top}px`,
        }}
      >
        {Array.from({ length: 20 }, (_, index) => index + 1).map((marker) => (
          <div
            key={`v-marker-100-${marker}`}
            className={`${styles['ruler-marker-100']} ${
              markerSize < 36 ? styles.hide : ''
            } ${markerSize < 72 ? styles.omit : ''}`}
            style={{ height: `${markerSize}px` }}
          >
            {marker * 100 <= viewportSize * viewportRatio && <span>{marker * 100}</span>}
          </div>
        ))}

        {elementListRange && (
          <div
            className={styles.range}
            style={{
              top: `${elementListRange.minY * canvasScale}px`,
              height: `${(elementListRange.maxY - elementListRange.minY) * canvasScale}px`,
            }}
          />
        )}
      </div>
    </div>
  )
}
