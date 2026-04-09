import React from 'react'
import { Divider, Switch } from 'antd'
import { PositionPanel } from './common/PositionPanel'
import ContentWrapper from './common/ContentWrapper'
import ElementOutline from './common/ElementOutline'
import ElementShadow from './common/ElementShadow'
import ElementOpacity from './common/ElementOpacity'
import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import type { PPTAudioElement } from '@/ppt/core'
import styles from './AudioElementPanel.module.scss'
import ColorButton from './common/ColorButton'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

interface AudioElementPanelProps {}

export const AudioElementPanel: React.FC<AudioElementPanelProps> = () => {
  const slidesStore = useSlidesStore()
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const handleAudioElement = handleElement as PPTAudioElement | null
  if (!handleAudioElement) return null

  const updateAudio = (props: Partial<PPTAudioElement>) => {
    slidesStore.updateElement({ id: handleAudioElement.id, props })
    addHistorySnapshot()
  }

  const isLocked = !!handleAudioElement.lock

  return (
    <div>
      <PositionPanel />
      <Divider size="small" />
      <ContentWrapper title="音频设置">
        <div className={styles.row}>
          <div className={styles.label}>图标颜色：</div>
          <div className={styles.control}>
            <PPTColorPicker
              value={handleAudioElement.color}
              onChange={(color: PPTColor) => updateAudio({ color })}
              disabled={isLocked}
            >
              <div>
                <ColorButton color={resolvePPTColorValue(handleAudioElement.color) || '#000'} />
              </div>
            </PPTColorPicker>
          </div>
        </div>
        <div className={`${styles.row} ${styles['switch-row']}`}>
          <div className={styles.label}>自动播放：</div>
          <div className={styles['switch-wrapper']}>
            <Switch
              checked={!!handleAudioElement.autoplay}
              onChange={(value) => updateAudio({ autoplay: value })}
              disabled={isLocked}
            />
          </div>
        </div>
        <div className={`${styles.row} ${styles['switch-row']}`}>
          <div className={styles.label}>循环播放：</div>
          <div className={styles['switch-wrapper']}>
            <Switch
              checked={!!handleAudioElement.loop}
              onChange={(value) => updateAudio({ loop: value })}
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

export default AudioElementPanel
