import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from 'antd'
import { Icon } from 'umi'

import { useSlidesStore } from '@/ppt/store'
import useExport from '@/ppt/hooks/useExport'
import styles from './ExportJSON.module.scss'

interface ExportJSONProps {
  onClose: () => void
}

export default function ExportJSON({ onClose }: ExportJSONProps) {
  const { slides, viewportRatio, title, viewportSize, theme } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      viewportRatio: state.viewportRatio,
      title: state.title,
      viewportSize: state.viewportSize,
      theme: state.theme,
    })),
  )

  const { exportJSON } = useExport()

  const json = useMemo(() => ({
    title,
    width: viewportSize,
    height: viewportSize * viewportRatio,
    theme,
    slides,
  }), [slides, theme, title, viewportRatio, viewportSize])

  return (
    <div className={styles['export-json-dialog']}>
      <div className={styles.preview}>
        <pre>{JSON.stringify(json, null, 2)}</pre>
      </div>

      <div className={styles.btns}>
        <Button className={styles.export} type="primary" onClick={exportJSON}>
          <Icon icon="ri:download-2-line" /> 导出 JSON
        </Button>
        <Button className={styles.close} onClick={onClose}>关闭</Button>
      </div>
    </div>
  )
}
