import { useEffect, useState } from 'react'
import { Slider } from 'antd'

import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import styles from './ElementOpacity.module.scss'

export default function ElementOpacity() {
  const slidesStore = useSlidesStore()
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    if (!handleElement) return
    if ('opacity' in handleElement && handleElement.opacity !== undefined) {
      setOpacity(handleElement.opacity as number)
    } else {
      setOpacity(1)
    }
  }, [handleElement])

  const updateOpacity = (value: number) => {
    if (!handleElement) return
    slidesStore.updateElement({ id: handleElement.id, props: { opacity: value } })
    addHistorySnapshot()
    setOpacity(value)
  }

  return (
    <div>
      <div className={styles.row}>
        <div className={styles.label}>不透明度：</div>
        <Slider
          className={styles.control}
          min={0}
          max={1}
          step={0.1}
          value={opacity}
          onChange={(value) => updateOpacity(value as number)}
        />
      </div>
    </div>
  )
}
