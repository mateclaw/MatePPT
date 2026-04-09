import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button, Radio, Slider, Switch, Tooltip } from 'antd'
import { Icon } from 'umi'

import { useSlidesStore } from '@/ppt/store'
import useExport from '@/ppt/hooks/useExport'
import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide'
import FullscreenSpin from '@/components/FullscreenSpin'
import styles from './ExportImage.module.scss'

interface ExportImageProps {
  onClose: () => void
}

type RangeType = 'all' | 'current' | 'custom'

export default function ExportImage({ onClose }: ExportImageProps) {
  const { slides, currentSlide } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      currentSlide: state.getCurrentSlide(),
    })),
  )

  const [rangeType, setRangeType] = useState<RangeType>('all')
  const [range, setRange] = useState<[number, number]>([1, slides.length || 1])
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg')
  const [quality, setQuality] = useState(1)
  const [ignoreWebfont, setIgnoreWebfont] = useState(false)

  const thumbnailsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const max = slides.length || 1
    setRange(([start, end]) => [
      Math.min(start, max),
      Math.min(end, max),
    ])
  }, [slides.length])

  const renderSlides = useMemo(() => {
    if (rangeType === 'all') return slides
    if (rangeType === 'current') return currentSlide ? [currentSlide] : []
    const [min, max] = range
    return slides.filter((_, index) => index >= min - 1 && index <= max - 1)
  }, [currentSlide, range, rangeType, slides])

  const { exportImage, exporting } = useExport()

  const handleExport = () => {
    exportImage(thumbnailsRef.current, format, quality, ignoreWebfont)
  }

  return (
    <div className={styles['export-img-dialog']}>
      <div className={styles['thumbnails-view']}>
        <div className={styles.thumbnails} ref={thumbnailsRef}>
          {renderSlides.map((slide) => (
            <div className={styles.thumbnail} key={slide.id}>
              <ThumbnailSlide slide={slide as any} size={1600} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.configs}>
        <div className={styles.row}>
          <div className={styles.title}>导出格式：</div>
          <Radio.Group
            className={styles['config-item']}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <Radio.Button style={{ width: '50%' }} value="jpeg">JPEG</Radio.Button>
            <Radio.Button style={{ width: '50%' }} value="png">PNG</Radio.Button>
          </Radio.Group>
        </div>

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
          <div className={styles.title}>图片质量：</div>
          <Slider
            className={styles['config-item']}
            min={0}
            max={1}
            step={0.1}
            value={quality}
            onChange={(value) => setQuality(value as number)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.title}>忽略在线字体：</div>
          <div className={styles['config-item']}>
            <Tooltip title="导出时默认忽略在线字体，若您在幻灯片中使用了在线字体，且希望导出后保留相关样式，可选择关闭【忽略在线字体】选项，但要注意这将会增加导出用时。">
              <Switch checked={ignoreWebfont} onChange={setIgnoreWebfont} />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className={styles.btns}>
        <Button className={styles.export} type="primary" onClick={handleExport}>
          <Icon icon="ri:download-2-line" /> 导出图片
        </Button>
        <Button className={styles.close} onClick={onClose}>关闭</Button>
      </div>

      <FullscreenSpin loading={exporting} tip="正在导出..." />
    </div>
  )
}
