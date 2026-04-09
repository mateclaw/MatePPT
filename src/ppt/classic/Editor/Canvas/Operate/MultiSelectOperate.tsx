import { useMemo } from 'react'
import { useMainStore } from '@/ppt/store'
import type { PPTElement } from '@/ppt/core'
import { EditorMode } from '@/ppt/core'
import { getElementListRange } from '@/ppt/utils/element'
import type { OperateResizeHandlers, MultiSelectRange } from '@/ppt/types/edit'
import useCommonOperate from '../hooks/useCommonOperate'
import ResizeHandler from './ResizeHandler'
import BorderLine from './BorderLine'
import styles from './MultiSelectOperate.module.scss'
import { useShallow } from "zustand/react/shallow";

interface MultiSelectOperateProps {
  elementList: PPTElement[]
  scaleMultiElement: (e: MouseEvent, range: MultiSelectRange, command: OperateResizeHandlers) => void
}

export default function MultiSelectOperate({
  elementList,
  scaleMultiElement,
}: MultiSelectOperateProps) {
  // const activeElementIdList = useMainStore((state) => state.activeElementIdList)
  // const canvasScale = useMainStore((state) => state.canvasScale)

  const { activeElementIdList, canvasScale, mode } = useMainStore(useShallow((state) => ({
    activeElementIdList: state.activeElementIdList,
    canvasScale: state.canvasScale,
    mode: state.mode,
  })))

  const localActiveElementList = useMemo(
    () => elementList.filter((el) => activeElementIdList.includes(el.id)),
    [elementList, activeElementIdList],
  )

  const range = useMemo(() => {
    const { minX, maxX, minY, maxY } = getElementListRange(localActiveElementList)
    return { minX, maxX, minY, maxY }
  }, [localActiveElementList])

  const width = (range.maxX - range.minX) * canvasScale
  const height = (range.maxY - range.minY) * canvasScale
  const { resizeHandlers, borderLines } = useCommonOperate(width, height)

  const disableResize = useMemo(() => {
    return localActiveElementList.some((item) => {
      if ((item.type === 'image' || item.type === 'shape') && !item.rotate) return false
      return true
    })
  }, [localActiveElementList])

  return (
    <div
      className={styles['multi-select-operate']}
      style={{
        left: `${range.minX * canvasScale}px`,
        top: `${range.minY * canvasScale}px`,
      }}
    >
      {borderLines.map((line) => (
        <BorderLine key={line.type} type={line.type} style={line.style} />
      ))}

      {!disableResize && mode === EditorMode.EDIT && (
        <>
          {resizeHandlers.map((point) => (
            <ResizeHandler
              key={point.direction}
              type={point.direction}
              style={point.style}
              onMouseDown={(e) => {
                e.stopPropagation()
                scaleMultiElement(e.nativeEvent, range, point.direction)
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
