import { useState } from 'react'
import { Button, Input, Tabs, message } from 'antd'
import styles from './MediaInput.module.scss'

type TypeKey = 'video' | 'audio'

interface MediaInputProps {
  onInsertVideo: (src: string) => void
  onInsertAudio: (src: string) => void
  onClose: () => void
}

export default function MediaInput({
  onInsertVideo,
  onInsertAudio,
  onClose,
}: MediaInputProps) {
  const [type, setType] = useState<TypeKey>('video')
  const [videoSrc, setVideoSrc] = useState('')
  const [audioSrc, setAudioSrc] = useState('')

  const insertVideo = () => {
    if (!videoSrc) {
      message.error('请先输入正确的视频地址')
      return
    }
    onInsertVideo(videoSrc)
  }

  const insertAudio = () => {
    if (!audioSrc) {
      message.error('请先输入正确的音频地址')
      return
    }
    onInsertAudio(audioSrc)
  }

  return (
    <div className={styles['media-input']}>
      <Tabs
        activeKey={type}
        onChange={(key) => setType(key as TypeKey)}
        items={[
          { key: 'video', label: '视频' },
          { key: 'audio', label: '音频' },
        ]}
        style={{ marginBottom: 15 }}
      />

      {type === 'video' && (
        <>
          <Input
            value={videoSrc}
            placeholder="请输入视频地址，e.g. https://xxx.mp4"
            onChange={(e) => setVideoSrc(e.target.value)}
          />
          <div className={styles.btns}>
            <Button onClick={onClose} style={{ marginRight: 10 }}>
              取消
            </Button>
            <Button type="primary" onClick={insertVideo}>
              确认
            </Button>
          </div>
        </>
      )}

      {type === 'audio' && (
        <>
          <Input
            value={audioSrc}
            placeholder="请输入音频地址，e.g. https://xxx.mp3"
            onChange={(e) => setAudioSrc(e.target.value)}
          />
          <div className={styles.btns}>
            <Button onClick={onClose} style={{ marginRight: 10 }}>
              取消
            </Button>
            <Button type="primary" onClick={insertAudio}>
              确认
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
