// useScreening.ts
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useScreenStore } from '@/ppt/store/useScreenStore'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'

import {
  enterFullscreen,
  exitFullscreen,
  isFullscreen,
} from '@/ppt/utils/fullscreen'

export const useScreening = () => {
  const { setScreening } = useScreenStore(
    useShallow((state) => ({
      setScreening: state.setScreening,
    })),
  )

  const { updateSlideIndex } = useSlidesStore(
    useShallow((state) => ({
      updateSlideIndex: state.updateSlideIndex,
    })),
  )

  /** 进入放映（从当前页） */
  const enterScreening = useMemoizedFn((target?: Element | null) => {
    enterFullscreen(target)
    setScreening(true)
  })

  /** 进入放映（从第一页） */
  const enterScreeningFromStart = useMemoizedFn((target?: Element | null) => {
    updateSlideIndex(0)
    enterScreening(target)
  })

  /** 退出放映 */
  const exitScreening = useMemoizedFn(() => {
    setScreening(false)
    if (isFullscreen()) exitFullscreen()
  })

  return {
    enterScreening,
    enterScreeningFromStart,
    exitScreening,
  }
}

export default useScreening
