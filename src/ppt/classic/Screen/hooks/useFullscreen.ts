import { useCallback, useEffect, useRef, useState } from 'react'
import { exitFullscreen, isFullscreen } from '@/ppt/utils/fullscreen'
import useScreening from '@/ppt/hooks/useScreening'

export default function useFullscreen() {
  const [fullscreenState, setFullscreenState] = useState(true)
  const escExitRef = useRef(true)

  const { exitScreening } = useScreening()

  const handleFullscreenChange = useCallback(() => {
    const isFull = isFullscreen()
    setFullscreenState(isFull)
    if (!isFull && escExitRef.current) exitScreening()

    escExitRef.current = true
  }, [exitScreening])

  useEffect(() => {
    setFullscreenState(isFullscreen())
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [handleFullscreenChange])

  const manualExitFullscreen = useCallback(() => {
    if (!fullscreenState) return
    escExitRef.current = false
    exitFullscreen()
  }, [fullscreenState])

  return {
    fullscreenState,
    manualExitFullscreen,
  }
}
