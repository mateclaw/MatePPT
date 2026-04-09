import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { throttle } from 'lodash'
import { message } from 'antd'
import { useLatest, useMemoizedFn } from 'ahooks'
import { useSlidesStore } from '@/ppt/store'
import { KEYS } from '@/ppt/configs/hotkey'
import { ANIMATION_CLASS_PREFIX } from '@/ppt/configs/animation'
import { useShallow } from 'zustand/react/shallow'

export default function useExecPlay() {
  const { slides, slideIndex, updateSlideIndex } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
      updateSlideIndex: state.updateSlideIndex,
    })),
  )

  // todo 去重 formatedAnimations
  const formatedAnimations = useMemo(() => {
    const currentSlide = slides[slideIndex]
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
  }, [slideIndex, slides])

  const slidesRef = useLatest(slides)
  const slideIndexRef = useLatest(slideIndex)
  const formatedAnimationsRef = useLatest(formatedAnimations)

  // 当前页的元素动画执行到的位置
  const [animationIndex, setAnimationIndex] = useState(0)
  const animationIndexRef = useRef(0)
  const updateAnimationIndex = useCallback((value: number) => {
    animationIndexRef.current = value
    setAnimationIndex(value)
  }, [])

  // 动画执行状态
  const inAnimationRef = useRef(false)

  // 最小已播放页面索引
  const playedSlidesMinIndexRef = useRef(slideIndex)

  const clearAnimationStyles = useCallback((animationIds: string[]) => {
    for (const elId of animationIds) {
      const elRef: HTMLElement | null = document.querySelector(
        `#screen-element-${elId} [class^=base-element-]`,
      )
      if (!elRef) continue
      elRef.style.removeProperty('--animate-duration')
      for (const classname of elRef.classList) {
        if (classname.indexOf(ANIMATION_CLASS_PREFIX) !== -1) {
          elRef.classList.remove(classname, `${ANIMATION_CLASS_PREFIX}animated`)
        }
      }
    }
  }, [])

  // 执行元素动画
  const runAnimation = useCallback(() => {
    if (inAnimationRef.current) return
    const animationsGroup = formatedAnimationsRef.current[animationIndexRef.current]
    if (!animationsGroup) return

    const { animations, autoNext } = animationsGroup
    updateAnimationIndex(animationIndexRef.current + 1)
    inAnimationRef.current = true

    let endAnimationCount = 0

    for (const animation of animations) {
      const elRef: HTMLElement | null = document.querySelector(
        `#screen-element-${animation.elId} [class^=base-element-]`,
      )
      if (!elRef) {
        endAnimationCount += 1
        continue
      }

      const animationName = `${ANIMATION_CLASS_PREFIX}${animation.effect}`
      elRef.style.removeProperty('--animate-duration')
      for (const classname of elRef.classList) {
        if (classname.indexOf(ANIMATION_CLASS_PREFIX) !== -1) {
          elRef.classList.remove(classname, `${ANIMATION_CLASS_PREFIX}animated`)
        }
      }

      elRef.style.setProperty('--animate-duration', `${animation.duration}ms`)
      elRef.classList.add(animationName, `${ANIMATION_CLASS_PREFIX}animated`)

      const handleAnimationEnd = () => {
        if (animation.type !== 'out') {
          elRef.style.removeProperty('--animate-duration')
          elRef.classList.remove(animationName, `${ANIMATION_CLASS_PREFIX}animated`)
        }

        endAnimationCount += 1
        if (endAnimationCount === animations.length) {
          inAnimationRef.current = false
          if (autoNext) runAnimation()
        }
      }
      elRef.addEventListener('animationend', handleAnimationEnd, { once: true })
    }
  }, [formatedAnimationsRef, updateAnimationIndex])

  useEffect(() => {
    const firstAnimations = formatedAnimationsRef.current[0]
    if (firstAnimations?.animations?.length) {
      const autoExecFirstAnimations = firstAnimations.animations.every(
        (item) => item.trigger === 'auto' || item.trigger === 'meantime',
      )
      if (autoExecFirstAnimations) runAnimation()
    }
  }, [formatedAnimationsRef, runAnimation])

  // 撤销元素动画
  const revokeAnimation = useCallback(() => {
    const nextIndex = Math.max(animationIndexRef.current - 1, 0)
    updateAnimationIndex(nextIndex)
    const { animations } = formatedAnimationsRef.current[nextIndex]
    clearAnimationStyles(animations.map((item) => item.elId))

    if (animations.every((item) => item.type === 'attention')) {
      execPrev()
    }
  }, [clearAnimationStyles, formatedAnimationsRef, updateAnimationIndex])

  const [autoPlayTimer, setAutoPlayTimer] = useState(0)
  const autoPlayTimerRef = useRef(0)

  const closeAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
      autoPlayTimerRef.current = 0
      setAutoPlayTimer(0)
    }
  }, [])

  useEffect(() => closeAutoPlay, [closeAutoPlay])

  const [loopPlay, setLoopPlayState] = useState(false)
  const loopPlayRef = useLatest(loopPlay)
  const setLoopPlay = useCallback((loop: boolean) => {
    setLoopPlayState(loop)
  }, [])

  const throttleMessage = useMemo(
    () =>
      throttle((msg: string) => {
        message.success(msg)
      }, 1000, { leading: true, trailing: false }),
    [],
  )

  const execPrev = useMemoizedFn(() => {
    const animations = formatedAnimationsRef.current
    if (animations.length && animationIndexRef.current > 0) {
      revokeAnimation()
    } else if (slideIndexRef.current > 0) {
      updateSlideIndex(slideIndexRef.current - 1)
      if (slideIndexRef.current < playedSlidesMinIndexRef.current) {
        updateAnimationIndex(0)
        playedSlidesMinIndexRef.current = slideIndexRef.current
      } else {
        updateAnimationIndex(animations.length)
      }
    } else {
      if (loopPlayRef.current) {
        turnSlideToIndex(slidesRef.current.length - 1)
      } else {
        throttleMessage('已经是第一页了')
      }
    }
    inAnimationRef.current = false
  })

  const execNext = useMemoizedFn(() => {
    const animations = formatedAnimationsRef.current
    if (animations.length && animationIndexRef.current < animations.length) {
      runAnimation()
    } else if (slideIndexRef.current < slidesRef.current.length - 1) {
      updateSlideIndex(slideIndexRef.current + 1)
      updateAnimationIndex(0)
      inAnimationRef.current = false
    } else {
      if (loopPlayRef.current) {
        turnSlideToIndex(0)
      } else {
        throttleMessage('已经是最后一页了')
        closeAutoPlay()
      }
      inAnimationRef.current = false
    }
  })

  const [autoPlayInterval, setAutoPlayIntervalState] = useState(2500)
  const autoPlayIntervalRef = useLatest(autoPlayInterval)

  const autoPlay = useCallback(() => {
    closeAutoPlay()
    message.success('开始自动放映')
    const timer = window.setInterval(execNext, autoPlayIntervalRef.current)
    autoPlayTimerRef.current = timer
    setAutoPlayTimer(timer)
  }, [autoPlayIntervalRef, closeAutoPlay, execNext])

  const setAutoPlayInterval = useCallback(
    (interval: number) => {
      closeAutoPlay()
      setAutoPlayIntervalState(interval)
      const timer = window.setInterval(execNext, interval)
      autoPlayTimerRef.current = timer
      setAutoPlayTimer(timer)
    },
    [closeAutoPlay, execNext],
  )

  const mousewheelListener = useMemo(
    () =>
      throttle((e: WheelEvent) => {
        if (e.deltaY < 0) execPrev()
        else if (e.deltaY > 0) execNext()
      }, 500, { leading: true, trailing: false }),
    [execNext, execPrev],
  )

  const touchInfoRef = useRef<{ x: number; y: number } | null>(null)
  const touchStartListener = useCallback((e: TouchEvent) => {
    touchInfoRef.current = {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
    }
  }, [])

  const touchEndListener = useCallback(
    (e: TouchEvent) => {
      if (!touchInfoRef.current) return

      const offsetX = Math.abs(touchInfoRef.current.x - e.changedTouches[0].pageX)
      const offsetY = e.changedTouches[0].pageY - touchInfoRef.current.y

      if (Math.abs(offsetY) > offsetX && Math.abs(offsetY) > 50) {
        touchInfoRef.current = null
        if (offsetY > 0) execPrev()
        else execNext()
      }
    },
    [execNext, execPrev],
  )

  const keydownListener = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (key === KEYS.UP || key === KEYS.LEFT || key === KEYS.PAGEUP) execPrev()
      else if (
        key === KEYS.DOWN ||
        key === KEYS.RIGHT ||
        key === KEYS.SPACE ||
        key === KEYS.ENTER ||
        key === KEYS.PAGEDOWN
      ) {
        execNext()
      }
    },
    [execNext, execPrev],
  )

  useEffect(() => {
    document.addEventListener('keydown', keydownListener)
    return () => {
      document.removeEventListener('keydown', keydownListener)
    }
  }, [keydownListener])

  const turnPrevSlide = useCallback(() => {
    updateSlideIndex(slideIndexRef.current - 1)
    updateAnimationIndex(0)
  }, [slideIndexRef, updateAnimationIndex, updateSlideIndex])

  const turnNextSlide = useCallback(() => {
    updateSlideIndex(slideIndexRef.current + 1)
    updateAnimationIndex(0)
  }, [slideIndexRef, updateAnimationIndex, updateSlideIndex])

  const turnSlideToIndex = useCallback(
    (index: number) => {
      updateSlideIndex(index)
      updateAnimationIndex(0)
    },
    [updateAnimationIndex, updateSlideIndex],
  )

  const turnSlideToId = useCallback(
    (id: string) => {
      const index = slidesRef.current.findIndex((slide) => slide.id === id)
      if (index !== -1) {
        updateSlideIndex(index)
        updateAnimationIndex(0)
      }
    },
    [slidesRef, updateAnimationIndex, updateSlideIndex],
  )

  return {
    autoPlayTimer,
    autoPlayInterval,
    setAutoPlayInterval,
    autoPlay,
    closeAutoPlay,
    loopPlay,
    setLoopPlay,
    mousewheelListener,
    touchStartListener,
    touchEndListener,
    turnPrevSlide,
    turnNextSlide,
    turnSlideToIndex,
    turnSlideToId,
    execPrev,
    execNext,
    animationIndex,
  }
}
