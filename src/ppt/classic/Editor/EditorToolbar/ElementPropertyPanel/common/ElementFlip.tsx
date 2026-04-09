import { useEffect, useState } from 'react'
import { Button } from 'antd'
import { Icon } from 'umi'

import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import type { ImageOrShapeFlip } from '@/ppt/core'
import styles from './ElementFlip.module.scss'

export default function ElementFlip() {
  const slidesStore = useSlidesStore()
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)

  useEffect(() => {
    if (!handleElement) return
    if (handleElement.type === 'image' || handleElement.type === 'shape') {
      setFlipH(!!(handleElement as any).flipH)
      setFlipV(!!(handleElement as any).flipV)
    }
  }, [handleElement])

  const updateFlip = (flipProps: ImageOrShapeFlip) => {
    if (!handleElement) return
    slidesStore.updateElement({ id: handleElement.id, props: flipProps })
    addHistorySnapshot()
  }

  return (
    <div>
      <div className={styles.row}>
        <Button
          className={styles.btn}
          type={flipV ? 'primary' : 'default'}
          onClick={() => updateFlip({ flipV: !flipV })}
          icon={<Icon icon="ri:flip-vertical-line" />}
        >
          垂直翻转
        </Button>
        <Button
          className={styles.btn}
          type={flipH ? 'primary' : 'default'}
          onClick={() => updateFlip({ flipH: !flipH })}
          icon={<Icon icon="ri:flip-horizontal-line" />}
        >
          水平翻转
        </Button>
      </div>
    </div>
  )
}
