import React from 'react'
import { Button, Divider, Switch } from 'antd'
import { Icon } from 'umi'
import { PositionPanel } from './common/PositionPanel'
import ContentWrapper from './common/ContentWrapper'
import ElementOutline from './common/ElementOutline'
import ElementShadow from './common/ElementShadow'
import ElementOpacity from './common/ElementOpacity'
import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import type { PPTVideoElement } from '@/ppt/core'
import { getImageDataURL } from '@/ppt/utils/image'
import styles from './VideoElementPanel.module.scss'

interface VideoElementPanelProps {}

export const VideoElementPanel: React.FC<VideoElementPanelProps> = () => {
  const slidesStore = useSlidesStore()
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const handleVideoElement = handleElement as PPTVideoElement | null
  if (!handleVideoElement) return null

  const updateVideo = (props: Partial<PPTVideoElement>) => {
    slidesStore.updateElement({ id: handleVideoElement.id, props })
    addHistorySnapshot()
  }

  const setVideoPoster = (files: FileList | null) => {
    const imageFile = files?.[0]
    if (!imageFile) return
    getImageDataURL(imageFile).then((dataURL) => updateVideo({ poster: dataURL }))
  }

  const isLocked = !!handleVideoElement.lock

  return (
    <div>
      <PositionPanel />
      <Divider size="small" />
      <ContentWrapper title="视频设置">
        <div className={styles.title}>预览封面</div>
        <div className={styles['background-image-wrapper']}>
          <label>
            <div className={styles['background-image']}>
              <div
                className={styles.content}
                style={{ backgroundImage: handleVideoElement.poster ? `url(${handleVideoElement.poster})` : '' }}
              >
                <Icon icon="ri:add-line" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setVideoPoster(e.target.files)}
              disabled={isLocked}
            />
          </label>
        </div>
        <div className={styles.row}>
          <Button style={{ flex: 1 }} onClick={() => updateVideo({ poster: '' })} disabled={isLocked}>
            <Icon icon="ri:arrow-go-back-line" /> 重置封面
          </Button>
        </div>

        <div className={`${styles.row} ${styles['switch-row']}`}>
          <div style={{ width: '40%' }}>自动播放：</div>
          <div className={styles['switch-wrapper']}>
            <Switch
              checked={!!handleVideoElement.autoplay}
              onChange={(value) => updateVideo({ autoplay: value })}
              disabled={isLocked}
            />
          </div>
        </div>
      </ContentWrapper>
      {/* <Divider size="small" />
      <ContentWrapper>
        <ElementOutline />
      </ContentWrapper>
      <Divider size="small" />
      <ContentWrapper>
        <ElementShadow />
      </ContentWrapper>
      <Divider size="small" />
      <ContentWrapper>
        <ElementOpacity />
      </ContentWrapper> */}
    </div>
  )
}

export default VideoElementPanel
