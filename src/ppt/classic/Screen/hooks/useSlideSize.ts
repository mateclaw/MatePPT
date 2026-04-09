import { useCallback, useEffect, useState, type RefObject } from 'react'
import { useSlidesStore } from '@/ppt/store'
import { useShallow } from 'zustand/react/shallow'

export default function useSlideSize(wrapRef?: RefObject<HTMLElement | null>) {
  const { viewportRatio } = useSlidesStore(
    useShallow((state) => ({ viewportRatio: state.viewportRatio })),
  )

  const [slideWidth, setSlideWidth] = useState(0)
  const [slideHeight, setSlideHeight] = useState(0)

  // 计算和更新幻灯片内容的尺寸（按比例自适应屏幕）
  const setSlideContentSize = useCallback(() => {
    const slideWrapRef = wrapRef?.current || document.body
    const winWidth = slideWrapRef.clientWidth
    const winHeight = slideWrapRef.clientHeight
    let width = winWidth
    let height = winHeight

    if (winHeight / winWidth === viewportRatio) {
      width = winWidth
      height = winHeight
    } else if (winHeight / winWidth > viewportRatio) {
      width = winWidth
      height = winWidth * viewportRatio
    } else {
      width = winHeight / viewportRatio
      height = winHeight
    }

    setSlideWidth(width)
    setSlideHeight(height)
  }, [viewportRatio, wrapRef])

  useEffect(() => {
    setSlideContentSize()
    window.addEventListener('resize', setSlideContentSize)
    return () => {
      window.removeEventListener('resize', setSlideContentSize)
    }
  }, [setSlideContentSize])

  return {
    slideWidth,
    slideHeight,
  }
}
