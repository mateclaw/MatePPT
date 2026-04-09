import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button, Radio, Slider } from 'antd'
import { Icon } from 'umi'

import { useSlidesStore } from '@/ppt/store'
import useExport from '@/ppt/hooks/useExport'
import styles from './ExportSpecificFile.module.scss'

interface ExportSpecificFileProps {
  onClose: () => void
}

type RangeType = 'all' | 'current' | 'custom'

export default function ExportSpecificFile({ onClose }: ExportSpecificFileProps) {
  const { slides, currentSlide } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      currentSlide: state.getCurrentSlide(),
    })),
  )

  const [rangeType, setRangeType] = useState<RangeType>('all')
  const [range, setRange] = useState<[number, number]>([1, slides.length || 1])

  useEffect(() => {
    const max = slides.length || 1
    setRange(([start, end]) => [
      Math.min(start, max),
      Math.min(end, max),
    ])
  }, [slides.length])

  const selectedSlides = useMemo(() => {
    if (rangeType === 'all') return slides
    if (rangeType === 'current') return currentSlide ? [currentSlide] : []
    const [min, max] = range
    return slides.filter((_, index) => index >= min - 1 && index <= max - 1)
  }, [currentSlide, range, rangeType, slides])

  const { exportSpecificFile } = useExport()

  return (
    <div className={styles['export-pptist-dialog']}>
      <div className={styles.configs}>
        <div className={styles.row}>
          <div className={styles.title}>导出范围：</div>
          <Radio.Group
            className={styles['config-item']}
            value={rangeType}
            onChange={(e) => setRangeType(e.target.value)}
          >
            <Radio.Button style={{ width: '33.33%' }} value="all">全部</Radio.Button>
            <Radio.Button style={{ width: '33.33%' }} value="current">当前页</Radio.Button>
            <Radio.Button style={{ width: '33.33%' }} value="custom">自定义</Radio.Button>
          </Radio.Group>
        </div>
        {rangeType === 'custom' && (
          <div className={styles.row}>
            <div className={styles.title} data-range={`（${range[0]} ~ ${range[1]}）`}>
              自定义范围：
            </div>
            <Slider
              className={styles['config-item']}
              range
              min={1}
              max={slides.length || 1}
              step={1}
              value={range}
              onChange={(value) => setRange(value as [number, number])}
            />
          </div>
        )}
        <div className={styles.tip}>
          提示：.pptist 是本应用的特有文件后缀，支持将该类型的文件导入回应用中。
        </div>
      </div>
      <div className={styles.btns}>
        <Button
          className={styles.export}
          type="primary"
          onClick={() => exportSpecificFile(selectedSlides as any)}
        >
          <Icon icon="ri:download-2-line" /> 导出 PPTIST 文件
        </Button>
        <Button className={styles.close} onClick={onClose}>关闭</Button>
      </div>
    </div>
  )
}
