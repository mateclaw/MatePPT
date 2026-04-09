import { useCallback, useMemo } from 'react'
import clsx from 'clsx'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'
import { PPTElementType, type PPTElement } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import BaseImageElement from '@/ppt/classic/components/element/ImageElement/BaseImageElement'
import BaseTextElement from '@/ppt/classic/components/element/TextElement/BaseTextElement'
import BaseShapeElement from '@/ppt/classic/components/element/ShapeElement/BaseShapeElement'
import BaseLineElement from '@/ppt/classic/components/element/LineElement/BaseLineElement'
import BaseChartElement from '@/ppt/classic/components/element/ChartElement/BaseChartElement'
import BaseTableElement from '@/ppt/classic/components/element/TableElement/BaseTableElement'
import BaseMathElement from '@/ppt/classic/components/element/MathElement/BaseMathElement'
import BaseVideoElement from '@/ppt/classic/components/element/VideoElement/BaseVideoElement'
import BaseAudioElement from '@/ppt/classic/components/element/AudioElement/BaseAudioElement'
import styles from './ScreenElement.module.scss'

interface ScreenElementProps {
  elementInfo: PPTElement
  elementIndex: number
  animationIndex: number
  turnSlideToId: (id: string) => void
  manualExitFullscreen: () => void
}

export default function ScreenElement({
  elementInfo,
  elementIndex,
  animationIndex,
  turnSlideToId,
  manualExitFullscreen,
}: ScreenElementProps) {
  const { theme, slides, slideIndex } = useSlidesStore(
    useShallow((state) => ({
      theme: state.theme,
      slides: state.slides,
      slideIndex: state.slideIndex,
    })),
  )
  const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])
  // todo 去重 formatedAnimations
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

  const CurrentElement = useMemo(() => {
    const elementTypeMap: Record<string, React.ComponentType<any> | null> = {
      [PPTElementType.IMAGE]: BaseImageElement,
      [PPTElementType.TEXT]: BaseTextElement,
      [PPTElementType.SHAPE]: BaseShapeElement,
      [PPTElementType.LINE]: BaseLineElement,
      [PPTElementType.CHART]: BaseChartElement,
      [PPTElementType.TABLE]: BaseTableElement,
      [PPTElementType.MATH]: BaseMathElement,
      [PPTElementType.VIDEO]: BaseVideoElement,
      [PPTElementType.AUDIO]: BaseAudioElement,
      latex: BaseMathElement,
    }
    return elementTypeMap[elementInfo.type] || null
  }, [elementInfo.type])

  const needWaitAnimation = useMemo(() => {
    const elementIndexInAnimation = formatedAnimations.findIndex((item) => {
      const elIds = item.animations.map((anim) => anim.elId)
      return elIds.includes(elementInfo.id)
    })

    if (elementIndexInAnimation === -1) return false
    if (elementIndexInAnimation < animationIndex) return false

    const firstAnimation = formatedAnimations[elementIndexInAnimation].animations.find(
      (item) => item.elId === elementInfo.id,
    )
    return firstAnimation?.type === 'in'
  }, [animationIndex, elementInfo.id, formatedAnimations])

  const openLink = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'A') {
        manualExitFullscreen()
        return
      }

      const link = elementInfo.link
      if (!link) return

      if (link.type === 'web') {
        manualExitFullscreen()
        window.open(link.target)
      } else if (link.type === 'slide') {
        turnSlideToId(link.target)
      }
    },
    [elementInfo.link, manualExitFullscreen, turnSlideToId],
  )

  if (!CurrentElement) return null

  return (
    <div
      className={clsx(styles['screen-element'], { [styles.link]: elementInfo.link })}
      id={`screen-element-${elementInfo.id}`}
      style={{
        zIndex: elementIndex,
        color: theme.themeColors?.dk1,
        fontFamily: theme.fontName,
        visibility: needWaitAnimation ? 'hidden' : 'visible',
      }}
      title={elementInfo.link?.target || ''}
      onClick={openLink}
    >
      <CurrentElement elementInfo={elementInfo} />
    </div>
  )
}
