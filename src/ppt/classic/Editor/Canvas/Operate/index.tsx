import { useMemo } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import clsx from 'clsx'
import { Icon } from 'umi'
import { useMainStore, useSlidesStore } from '@/ppt/store'
import {
  type PPTElement,
  type PPTLineElement,
  type PPTVideoElement,
  type PPTAudioElement,
  type PPTShapeElement,
  type PPTChartElement,
  EditorMode,
} from '@/ppt/core'
import type { OperateLineHandlers, OperateResizeHandlers } from '@/ppt/types/edit'
import { ToolbarStates } from '@/ppt/types/toolbar'
import ImageElementOperate from './ImageElementOperate'
import TextElementOperate from './TextElementOperate'
import ShapeElementOperate from './ShapeElementOperate'
import LineElementOperate from './LineElementOperate'
import TableElementOperate from './TableElementOperate'
import CommonElementOperate from './CommonElementOperate'
import LinkHandler from './LinkHandler'
import styles from './Operate.module.scss'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import emitter, { EmitterEvents } from '@/ppt/utils/emitter'



interface OperateProps {
  elementInfo: PPTElement
  isSelected: boolean
  isActive: boolean
  isActiveGroupElement: boolean
  isMultiSelect: boolean
  rotateElement: (
    e: MouseEvent,
    element: Exclude<PPTElement, PPTChartElement | PPTLineElement | PPTVideoElement | PPTAudioElement>,
  ) => void
  scaleElement: (
    e: MouseEvent,
    element: Exclude<PPTElement, PPTLineElement>,
    command: OperateResizeHandlers,
  ) => void
  dragLineElement: (e: MouseEvent, element: PPTLineElement, command: OperateLineHandlers) => void
  moveShapeKeypoint: (e: MouseEvent, element: PPTShapeElement, index: number) => void
  openLinkDialog: () => void
}

export default function Operate({
  elementInfo,
  isSelected,
  isActive,
  isActiveGroupElement,
  isMultiSelect,
  rotateElement,
  scaleElement,
  dragLineElement,
  moveShapeKeypoint,
  openLinkDialog,
}: OperateProps) {
  const { canvasScale, toolbarState, mode } = useMainStore(
    useShallow((state) => ({
      canvasScale: state.canvasScale,
      toolbarState: state.toolbarState,
      mode: state.mode,
    })),
  )
  const { slides, slideIndex, updateSlide } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
      updateSlide: state.updateSlide,
      setSlides: state.setSlides,
    })),
  )
  const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])
  const { addHistorySnapshot } = useHistorySnapshot()

  const allowEdit = mode === EditorMode.EDIT || Boolean((elementInfo as any).digitbotRole)

  // todo 去重formatedAnimations
  const formatedAnimations = useMemo(() => {
    if (!currentSlide?.animations) return []
    const els = currentSlide.elements || []
    const elIds = els.map((el) => el.id)
    const animations = currentSlide.animations.filter((animation) => elIds.includes(animation.elId))

    const formatted: Array<{ animations: any[]; autoNext: boolean }> = []
    for (const animation of animations) {
      if (animation.trigger === 'click' || !formatted.length) {
        formatted.push({ animations: [animation], autoNext: false })
      } else if (animation.trigger === 'meantime') {
        const last = formatted[formatted.length - 1]
        last.animations = last.animations.filter((item) => item.elId !== animation.elId)
        last.animations.push(animation)
        formatted[formatted.length - 1] = last
      } else if (animation.trigger === 'auto') {
        const last = formatted[formatted.length - 1]
        last.autoNext = true
        formatted[formatted.length - 1] = last
        formatted.push({ animations: [animation], autoNext: false })
      }
    }
    return formatted
  }, [currentSlide])

  const currentOperateComponent = useMemo(() => {
    const elementTypeMap: Record<string, React.ComponentType<any>> = {
      image: ImageElementOperate,
      text: TextElementOperate,
      shape: ShapeElementOperate,
      line: LineElementOperate,
      table: TableElementOperate,
      chart: CommonElementOperate,
      latex: CommonElementOperate,
      math: CommonElementOperate,
      video: CommonElementOperate,
      audio: CommonElementOperate,
    }
    return elementTypeMap[elementInfo.type] || null
  }, [elementInfo.type])

  const elementIndexListInAnimation = useMemo(() => {
    const indexList: number[] = []
    for (let i = 0; i < formatedAnimations.length; i += 1) {
      const elIds = formatedAnimations[i].animations.map((item) => item.elId)
      if (elIds.includes(elementInfo.id)) indexList.push(i)
    }
    return indexList
  }, [formatedAnimations, elementInfo.id])

  const rotate = 'rotate' in elementInfo ? elementInfo.rotate : 0
  const isLine = elementInfo.type === 'line'
  const lineWidth = isLine
    ? (() => {
      const line = elementInfo as PPTLineElement
      const start = Array.isArray(line.start) ? line.start : [0, 0]
      const end = Array.isArray(line.end) ? line.end : [0, 0]
      return Math.max(Math.abs(start[0] - end[0]), 24)
    })()
    : elementInfo.width
  const lineHeight = isLine
    ? (() => {
      const line = elementInfo as PPTLineElement
      const start = Array.isArray(line.start) ? line.start : [0, 0]
      const end = Array.isArray(line.end) ? line.end : [0, 0]
      return Math.max(Math.abs(start[1] - end[1]), 24)
    })()
    : ('height' in elementInfo ? elementInfo.height : 0)

  const OperateComponent = currentOperateComponent
  const hasDigitbotRole = Boolean((elementInfo as any).digitbotRole)

  const handleDigitbotRemove = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!currentSlide) return
    const avatarRole = (elementInfo as any).digitbotRole === 'digitbot-avatar'
    if (!avatarRole) {
      const nextElements = (currentSlide.elements || []).filter((el) => el.id !== elementInfo.id)
      updateSlide({ elements: nextElements })
      const { activeElementIdList, activeGroupElementId, setActiveElementIdList, setActiveGroupElementId } =
        useMainStore.getState()
      if (activeGroupElementId === elementInfo.id) {
        setActiveGroupElementId('')
      }
      if (activeElementIdList.includes(elementInfo.id)) {
        setActiveElementIdList(activeElementIdList.filter((id) => id !== elementInfo.id))
      }
      addHistorySnapshot()
      return
    }

    const avatarKey = (elementInfo as any).digitbotAvatarKey
    const removedIds: string[] = []
    const nextSlides = slides.map((slide) => {
      const nextElements = (slide.elements || []).filter((el) => {
        if ((el as any).digitbotRole !== 'digitbot-avatar') return true
        if (avatarKey && (el as any).digitbotAvatarKey !== avatarKey) return true
        removedIds.push(el.id)
        return false
      })
      return { ...slide, elements: nextElements }
    })

    useSlidesStore.getState().setSlides(nextSlides)

    const { activeElementIdList, activeGroupElementId, setActiveElementIdList, setActiveGroupElementId } =
      useMainStore.getState()
    if (activeGroupElementId && removedIds.includes(activeGroupElementId)) {
      setActiveGroupElementId('')
    }
    if (removedIds.length && activeElementIdList.length) {
      setActiveElementIdList(activeElementIdList.filter((id) => !removedIds.includes(id)))
    }
    addHistorySnapshot()
    emitter.emit(EmitterEvents.DIGITBOT_AVATAR_REMOVE, { avatarKey })
  }

  return (
    <div
      className={clsx(styles.operate, isMultiSelect && !isActive && styles['multi-select'])}
      style={{
        top: `${elementInfo.top * canvasScale}px`,
        left: `${elementInfo.left * canvasScale}px`,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: `${(lineWidth * canvasScale) / 2}px ${(lineHeight * canvasScale) / 2}px`,
      }}
    >
      {hasDigitbotRole && isSelected && (
        <button
          type="button"
          className={styles['digitbot-close']}
          style={{
            left: `${lineWidth * canvasScale}px`,
            top: '0px',
          }}
          aria-label="Remove digitbot element"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={handleDigitbotRemove}
        >
          <Icon icon="ri:close-line" />
        </button>
      )}
      {isSelected && !elementInfo.inherited && OperateComponent && (
        <OperateComponent
          elementInfo={elementInfo as any}
          handlerVisible={allowEdit && !elementInfo.lock && (isActiveGroupElement || !isMultiSelect)}
          rotateElement={rotateElement as any}
          scaleElement={scaleElement as any}
          dragLineElement={dragLineElement as any}
          moveShapeKeypoint={moveShapeKeypoint as any}
        />
      )}

      {toolbarState === ToolbarStates.EL_ANIMATION && elementIndexListInAnimation.length > 0 && (
        <div className={styles['animation-index']}>
          {elementIndexListInAnimation.map((index) => (
            <div key={index} className={styles['index-item']}>
              {index + 1}
            </div>
          ))}
        </div>
      )}

      {isActive && elementInfo.link && allowEdit && (
        <LinkHandler
          elementInfo={elementInfo}
          link={elementInfo.link}
          openLinkDialog={openLinkDialog}
        />
      )}
    </div>
  )
}
