import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button, Input, Select, Tabs } from 'antd'
import type { HyperLinkInfo } from '@/ppt/core'
import type { PPTElementLink } from '@/ppt/core'
import { useSlidesStore, useMainStore } from '@/ppt/store'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import useElementLink from '@/ppt/hooks/useLink'
import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide'
import styles from './LinkDialog.module.scss'

interface LinkDialogProps {
  onClose: () => void
}

export default function LinkDialog({ onClose }: LinkDialogProps) {
  const handleElement = useActiveElementList().handleElement
  const setDisableHotkeys = useMainStore((state) => state.setDisableHotkeys)
  const { slides, slideIndex } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
    })),
  )
  const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])
  const { setLink } = useElementLink()

  const [type, setType] = useState<PPTElementLink['type']>('web')
  const [address, setAddress] = useState('')
  const [slideId, setSlideId] = useState('')

  const slideOptions = useMemo(
    () =>
      slides.map((item, index) => ({
        label: `幻灯片 ${index + 1}`,
        value: item.id,
        disabled: currentSlide?.id === item.id,
      })),
    [slides, currentSlide?.id],
  )

  const selectedSlide = useMemo(
    () => slides.find((item) => item.id === slideId) || null,
    [slides, slideId],
  )

  useEffect(() => {
    setDisableHotkeys(true)

    if (handleElement?.link) {
      if (handleElement.link.type === 'web') setAddress(handleElement.link.target)
      else if (handleElement.link.type === 'slide') setSlideId(handleElement.link.target)
      setType(handleElement.link.type)
    }

    if (!slideId) {
      const next = slides.find((item) => item.id !== currentSlide?.id)
      if (next) setSlideId(next.id)
    }

    return () => {
      setDisableHotkeys(false)
    }
  }, [currentSlide?.id, handleElement?.link, setDisableHotkeys, slideId, slides])

  const save = () => {
    const link: PPTElementLink = {
      type,
      target: type === 'web' ? address : slideId,
    }
    if (handleElement) {
      const success = setLink(handleElement as any, link)
      if (success) onClose()
      else setAddress('')
    }
  }

  return (
    <div className={styles['link-dialog']}>
      <Tabs
        activeKey={type}
        onChange={(key) => setType(key as PPTElementLink['type'])}
        items={[
          { key: 'web', label: '网页链接' },
          { key: 'slide', label: '幻灯片页面' },
        ]}
        style={{ marginBottom: 20 }}
      />

      {type === 'web' && (
        <Input
          className={styles.input}
          value={address}
          placeholder="请输入网页链接地址"
          onChange={(e) => setAddress(e.target.value)}
          onPressEnter={save}
          autoFocus
        />
      )}

      {type === 'slide' && (
        <Select
          className={styles.input}
          value={slideId}
          options={slideOptions}
          onChange={(value) => setSlideId(value)}
        />
      )}

      {type === 'slide' && selectedSlide && (
        <div className={styles.preview}>
          <div>预览：</div>
          <div className={styles.thumbnail}>
            <ThumbnailSlide slide={selectedSlide as any} size={500} />
          </div>
        </div>
      )}

      <div className={styles.btns}>
        <Button onClick={onClose} style={{ marginRight: 10 }}>
          取消
        </Button>
        <Button type="primary" onClick={save}>
          确认
        </Button>
      </div>
    </div>
  )
}
