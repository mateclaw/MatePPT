import { useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button, Radio, Select, Switch } from 'antd'
import { Icon } from 'umi'

import { useSlidesStore } from '@/ppt/store'
import { print } from '@/ppt/utils/print'
import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide'
import styles from './ExportPDF.module.scss'

interface ExportPDFProps {
  onClose: () => void
}

type RangeType = 'all' | 'current'

export default function ExportPDF({ onClose }: ExportPDFProps) {
  const { slides, currentSlide, viewportRatio } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      currentSlide: state.getCurrentSlide(),
      viewportRatio: state.viewportRatio,
    })),
  )

  const [rangeType, setRangeType] = useState<RangeType>('all')
  const [count, setCount] = useState(1)
  const [padding, setPadding] = useState(true)

  const thumbnailsRef = useRef<HTMLDivElement | null>(null)

  const renderSlides = useMemo(() => {
    if (rangeType === 'current') {
      return currentSlide ? [currentSlide] : []
    }
    return slides
  }, [currentSlide, rangeType, slides])

  const handleExport = () => {
    if (!thumbnailsRef.current) return
    const pageSize = {
      width: 1600,
      height: rangeType === 'all'
        ? 1600 * viewportRatio * count
        : 1600 * viewportRatio,
      margin: padding ? 50 : 0,
    }
    print(thumbnailsRef.current, pageSize)
  }

  return (
    <div className={styles['export-pdf-dialog']}>
      <div className={styles['thumbnails-view']}>
        <div className={styles.thumbnails} ref={thumbnailsRef}>
          {renderSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.thumbnail} ${
                rangeType === 'all' && (index + 1) % count === 0 ? styles['break-page'] : ''
              }`}
            >
              <ThumbnailSlide slide={slide as any} size={1600} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.configs}>
        <div className={styles.row}>
          <div className={styles.title}>导出范围：</div>
          <Radio.Group
            className={styles['config-item']}
            value={rangeType}
            onChange={(e) => setRangeType(e.target.value)}
          >
            <Radio.Button style={{ width: '50%' }} value="all">全部</Radio.Button>
            <Radio.Button style={{ width: '50%' }} value="current">当前页</Radio.Button>
          </Radio.Group>
        </div>
        <div className={styles.row}>
          <div className={styles.title}>每页数量：</div>
          <Select
            className={styles['config-item']}
            value={count}
            onChange={(value) => setCount(value)}
            options={[1, 2, 3].map((value) => ({ label: String(value), value }))}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.title}>边缘留白：</div>
          <div className={styles['config-item']}>
            <Switch checked={padding} onChange={setPadding} />
          </div>
        </div>
        <div className={styles.tip}>
          提示：若打印预览与实际样式不一致，请在弹出的打印窗口中勾选【背景图形】选项。
        </div>
      </div>

      <div className={styles.btns}>
        <Button className={styles.export} type="primary" onClick={handleExport}>
          <Icon icon="ri:download-2-line" /> 打印 / 导出 PDF
        </Button>
        <Button className={styles.close} onClick={onClose}>关闭</Button>
      </div>
    </div>
  )
}
