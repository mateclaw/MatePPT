import { Spin } from 'antd'
import styles from './FullscreenSpin.module.scss'

interface FullscreenSpinProps {
  loading: boolean
  tip?: string
}

export default function FullscreenSpin({ loading, tip }: FullscreenSpinProps) {
  if (!loading) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <Spin size="large"  >
        </Spin>
          <div>{tip || '加载中...'}</div>
      </div>
    </div>
  )
}
