import { useEffect, useMemo, useState } from 'react'
import { InputNumber, Select, Switch } from 'antd'

import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import type { LineStyleType, PPTElementOutline } from '@/ppt/core'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import SVGLine from './SVGLine'
import ColorButton from './ColorButton'
import styles from './ElementOutline.module.scss'
import { useThrottleFn } from 'ahooks'

interface ElementOutlineProps {
  fixed?: boolean
}

const lineStyleOptions: LineStyleType[] = ['solid', 'dashed', 'dotted']

export default function ElementOutline({ fixed = false }: ElementOutlineProps) {
  const slidesStore = useSlidesStore()
  const theme = useSlidesStore((state) => state.theme)
  const [outline, setOutline] = useState<PPTElementOutline | undefined>()
  const [hasOutline, setHasOutline] = useState(false)
  const { addHistorySnapshot } = useHistorySnapshot()

  const { handleElement: element } = useActiveElementList()

  useEffect(() => {
    if (!element) {
      setOutline(undefined)
      setHasOutline(false)
      return
    }
    const currentOutline = 'outline' in element ? element.outline : undefined
    setOutline(currentOutline)
    setHasOutline(!!currentOutline)
  }, [element])

  const updateOutline = (outlineProps: Partial<PPTElementOutline>) => {
    if (!element) return
    const next = { ...outline, ...outlineProps } as PPTElementOutline
    setOutline(next)
    setHasOutline(true)
    slidesStore.updateElement({ id: element.id, props: { outline: next } })
    addHistorySnapshot()
  }

  const toggleOutline = (checked: boolean) => {
    if (!element) return
    if (checked) {
      const nextOutline: PPTElementOutline = (theme as any).outline
        ? { ...(theme as any).outline }
        : { width: 2, color: PPTColor.ofFixed('#525252'), style: 'solid' }
      setOutline(nextOutline)
      setHasOutline(true)
      slidesStore.updateElement({ id: element.id, props: { outline: nextOutline } })
    } else {
      setOutline(undefined)
      setHasOutline(false)
      slidesStore.removeElementProps({ id: element.id, propName: 'outline' })
    }
    addHistorySnapshot()
  }

  const outlineStyle = outline?.style || 'solid'

  const selectOptions = useMemo(
    () =>
      lineStyleOptions.map((item) => ({
        value: item,
        label: <SVGLine type={item} />,
      })),
    [],
  )

  const handleColorChange = useThrottleFn((color: PPTColor) => {
    updateOutline({ color })
  }, { wait: 300 }).run

  return (
    <div>
      {!fixed && (
        <div className={styles.row}>
          <div className={styles.label}>启用边框：</div>
          <div className={styles['switch-wrapper']}>
            <Switch checked={hasOutline} onChange={toggleOutline} />
          </div>
        </div>
      )}
      {hasOutline && outline && (
        <>
          <div className={styles.row}>
            <div className={styles.label}>边框样式：</div>
            <Select
              className={styles.control}
              value={outlineStyle}
              onChange={(value) => updateOutline({ style: value as LineStyleType })}
              options={selectOptions}
              optionLabelProp="label"
            />
          </div>
          <div className={styles.row}>
            <div className={styles.label}>边框颜色：</div>
            <div className={styles.control}>
              <PPTColorPicker value={outline.color} onChange={handleColorChange}>
                <div>
                  <ColorButton color={resolvePPTColorValue(outline.color)} />
                </div>
              </PPTColorPicker>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>边框粗细：</div>
            <InputNumber
              className={styles.control}
              min={0}
              max={20}
              value={outline.width || 0}
              onChange={(value) => updateOutline({ width: Number(value || 0) })}
            />
          </div>
        </>
      )}
    </div>
  )
}
