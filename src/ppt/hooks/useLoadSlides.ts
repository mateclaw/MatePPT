// useLazyLoadSlides.ts
import { useEffect, useRef, useState } from 'react'
import { useSlidesStore } from '../store/useSlidesStore'
import { useShallow } from 'zustand/react/shallow'

export const useLazyLoadSlides = () => {
  const { slides } = useSlidesStore(
    useShallow((state) => ({ slides: state.slides }))
  )

  const [slidesLoadLimit, setSlidesLoadLimit] = useState(50)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const loadSlide = () => {
    if (slides.length > slidesLoadLimit) {
      timerRef.current = setTimeout(() => {
        setSlidesLoadLimit((v) => v + 20)
        loadSlide() // 继续递归加载
      }, 600)
    } else {
      // 加载完所有
      setSlidesLoadLimit(9999)
    }
  }

  useEffect(() => {
    loadSlide()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, []) // 模拟 Vue 的 onMounted / onUnmounted

  return {
    slidesLoadLimit,
  }
}

export default useLazyLoadSlides
