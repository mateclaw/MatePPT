import { useEffect, useState } from 'react'
import { KEYS } from '@/ppt/configs/hotkey'
import useScreening from '@/ppt/hooks/useScreening'
import BaseView from './BaseView'
import PresenterView from './PresenterView'
import styles from './index.module.scss'

type ViewMode = 'base' | 'presenter'

export default function Screen() {
  const [viewMode, setViewMode] = useState<ViewMode>('base')
  const { exitScreening } = useScreening()

  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode)
  }

  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (key === KEYS.ESC) exitScreening()
    }

    document.addEventListener('keydown', keydownListener)
    return () => {
      document.removeEventListener('keydown', keydownListener)
    }
  }, [exitScreening])

  return (
    <div className={styles['pptist-screen']}>
      {viewMode === 'base' && <BaseView changeViewMode={changeViewMode} />}
      {viewMode === 'presenter' && <PresenterView changeViewMode={changeViewMode} />}
    </div>
  )
}
