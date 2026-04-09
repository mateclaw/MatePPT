import { useEffect, useMemo, useState } from 'react'
import { Switch } from 'antd'
import tinycolor from 'tinycolor2'

import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import ColorButton from './ColorButton'
import styles from './ElementColorMask.module.scss'

export default function ElementColorMask() {
  const slidesStore = useSlidesStore()
  const theme = useSlidesStore((state) => state.theme)
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const defaultColorMask = useMemo(() => {
    const themeColor = (theme?.themeColors as any)?.accent1 || (theme?.themeColors as any)?.dk1 || '#000000'
    const hex = tinycolor(themeColor).setAlpha(0.5).toHex8String()
    return PPTColor.ofFixed(hex)
  }, [theme?.themeColors])

  const [colorMask, setColorMask] = useState<PPTColor | undefined>()
  const [hasColorMask, setHasColorMask] = useState(false)

  useEffect(() => {
    if (!handleElement || handleElement.type !== 'image') {
      setHasColorMask(false)
      return
    }
    if ((handleElement as any).colorMask) {
      setColorMask((handleElement as any).colorMask)
      setHasColorMask(true)
    } else {
      setHasColorMask(false)
    }
  }, [handleElement])

  const toggleColorMask = (checked: boolean) => {
    if (!handleElement) return
    if (checked) {
      slidesStore.updateElement({ id: handleElement.id, props: { colorMask: defaultColorMask } })
    } else {
      slidesStore.removeElementProps({ id: handleElement.id, propName: 'colorMask' })
    }
    addHistorySnapshot()
  }

  const updateColorMask = (color: PPTColor) => {
    if (!handleElement) return
    setColorMask(color)
    slidesStore.updateElement({ id: handleElement.id, props: { colorMask: color } })
    addHistorySnapshot()
  }

  return (
    <div>
      <div className={styles.row} style={{ marginBottom: 0 }}>
        <div className={styles.label}>着色（蒙版）：</div>
        <div className={styles['switch-wrapper']} style={{ width: '60%' }}>
          <Switch checked={hasColorMask} onChange={toggleColorMask} />
        </div>
      </div>
      {hasColorMask && (
        <div className={styles.row} style={{ marginTop: 15, marginBottom: 0 }}>
          <div className={styles.label} style={{ width: '40%' }}>蒙版颜色：</div>
          <div className={styles.control} style={{ width: '60%' }}>
            <PPTColorPicker value={colorMask} onChange={updateColorMask}>
              <ColorButton color={resolvePPTColorValue(colorMask) } />
            </PPTColorPicker>
          </div>

        </div>
      )}
    </div>
  )
}
