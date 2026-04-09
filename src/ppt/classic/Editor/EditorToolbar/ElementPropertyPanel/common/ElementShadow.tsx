import { useEffect, useState } from 'react'
import { Slider, Switch } from 'antd'

import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import type { PPTElementShadow } from '@/ppt/core'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import ColorButton from './ColorButton'
import styles from './ElementShadow.module.scss'

export default function ElementShadow() {
  const slidesStore = useSlidesStore()
  const theme = useSlidesStore((state) => state.theme)
  const { handleElement } = useActiveElementList()

  const [shadow, setShadow] = useState<PPTElementShadow | undefined>()
  const [hasShadow, setHasShadow] = useState(false)
  const { addHistorySnapshot } = useHistorySnapshot()

  useEffect(() => {
    if (!handleElement) {
      setShadow(undefined)
      setHasShadow(false)
      return
    }
    const currentShadow = 'shadow' in handleElement ? handleElement.shadow : undefined
    setShadow(currentShadow)
    setHasShadow(!!currentShadow)
  }, [handleElement])

  const updateShadow = (shadowProps: Partial<PPTElementShadow>) => {
    if (!handleElement || !shadow) return
    const nextShadow = { ...shadow, ...shadowProps }
    slidesStore.updateElement({ id: handleElement.id, props: { shadow: nextShadow } })
    addHistorySnapshot()
  }

  const toggleShadow = (checked: boolean) => {
    if (!handleElement) return
    if (checked) {
      const nextShadow: PPTElementShadow = (theme as any).shadow || {
        color: PPTColor.ofFixed('#000000'),
        h: 2,
        v: 2,
        blur: 2,
      }
      slidesStore.updateElement({ id: handleElement.id, props: { shadow: nextShadow } })
    } else {
      slidesStore.removeElementProps({ id: handleElement.id, propName: 'shadow' })
    }
    addHistorySnapshot()
  }

  const handleColorChange = (color: PPTColor) => {
    updateShadow({ color })
  }

  return (
    <div>
      <div className={styles.row}>
        <div className={styles.label}>启用阴影：</div>
        <div className={styles['switch-wrapper']}>
          <Switch checked={hasShadow} onChange={toggleShadow} />
        </div>
      </div>
      {hasShadow && shadow && (
        <>
          <div className={styles.row}>
            <div className={styles.label}>水平阴影：</div>
            <Slider
              className={styles.control}
              min={-10}
              max={10}
              step={1}
              value={shadow.h}
              onChange={(value) => updateShadow({ h: value as number })}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>垂直阴影：</div>
            <Slider
              className={styles.control}
              min={-10}
              max={10}
              step={1}
              value={shadow.v}
              onChange={(value) => updateShadow({ v: value as number })}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>模糊距离：</div>
            <Slider
              className={styles.control}
              min={1}
              max={20}
              step={1}
              value={shadow.blur}
              onChange={(value) => updateShadow({ blur: value as number })}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>阴影颜色：</div>

            <div className={styles.control}>
              <PPTColorPicker value={shadow.color} onChange={handleColorChange}>
                <div>
                  <ColorButton color={resolvePPTColorValue(shadow.color)} />
                </div>
              </PPTColorPicker>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
