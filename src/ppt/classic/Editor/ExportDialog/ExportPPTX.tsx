import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button, Radio, Slider, Switch, Tooltip } from 'antd'
import { Icon } from 'umi'

import { useSlidesStore } from '@/ppt/store'
import useExport from '@/ppt/hooks/useExport'
import FullscreenSpin from '@/components/FullscreenSpin'
import styles from './ExportPPTX.module.scss'

interface ExportPPTXProps {
  onClose: () => void
}

type RangeType = 'all' | 'current' | 'custom'

export default function ExportPPTX({ onClose }: ExportPPTXProps) {
  const { slides, currentSlide } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      currentSlide: state.getCurrentSlide(),
    })),
  )

  const [rangeType, setRangeType] = useState<RangeType>('all')
  const [range, setRange] = useState<[number, number]>([1, slides.length || 1])
  const [masterOverwrite, setMasterOverwrite] = useState(true)
  const [ignoreMedia, setIgnoreMedia] = useState(true)

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

  const { exportPPTX, exporting } = useExport()

  return (
    <div className={styles['export-pptx-dialog']}>
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
        <div className={styles.row}>
          <div className={styles.title}>忽略音频/视频：</div>
          <div className={styles['config-item']}>
            <Tooltip title="导出时默认忽略音视频，若您的幻灯片中存在音视频元素，且希望将其导出到PPTX文件中，可选择关闭【忽略音视频】选项，但要注意这将会大幅增加导出用时。">
              <Switch checked={ignoreMedia} onChange={setIgnoreMedia} />
            </Tooltip>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.title}>覆盖默认母版：</div>
          <div className={styles['config-item']}>
            <Switch checked={masterOverwrite} onChange={setMasterOverwrite} />
          </div>
        </div>

        {!ignoreMedia && (
          <div className={styles.tip}>
            提示：1. 支持导出格式：avi、mp4、mov、wmv、mp3、wav；2. 跨域资源无法导出。
          </div>
        )}
      </div>

      <div className={styles.btns}>
        <Button
          className={styles.export}
          type="primary"
          onClick={() => exportPPTX(selectedSlides as any, masterOverwrite, ignoreMedia)}
        >
          <Icon icon="ri:download-2-line" /> 导出 PPTX
        </Button>
        <Button className={styles.close} onClick={onClose}>关闭</Button>
      </div>

      <FullscreenSpin loading={exporting} tip="正在导出..." />
    </div>
  )
}
