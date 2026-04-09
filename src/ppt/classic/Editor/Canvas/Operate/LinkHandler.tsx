import { useMemo } from 'react'
import { Divider } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import { useMainStore, useSlidesStore } from '@/ppt/store'
import type { PPTElement, PPTElementLink } from '@/ppt/core'
import useElementLink from '@/ppt/hooks/useLink'
import styles from './LinkHandler.module.scss'

interface LinkHandlerProps {
  elementInfo: PPTElement
  link: PPTElementLink
  openLinkDialog: () => void
}

export default function LinkHandler({
  elementInfo,
  link,
  openLinkDialog,
}: LinkHandlerProps) {
  const { canvasScale, setActiveElementIdList } = useMainStore(
    useShallow((state) => ({
      canvasScale: state.canvasScale,
      setActiveElementIdList: state.setActiveElementIdList,
    })),
  )
  const { slides, updateSlideIndex } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      updateSlideIndex: state.updateSlideIndex,
    })),
  )
  const { removeLink } = useElementLink()

  const height = useMemo(() => {
    if (elementInfo.type === 'line') return 0
    return elementInfo.height || 0
  }, [elementInfo])

  const turnTarget = (slideId: string) => {
    const targetIndex = slides.findIndex((item) => item.id === slideId)
    if (targetIndex !== -1) {
      setActiveElementIdList([])
      updateSlideIndex(targetIndex)
    }
  }

  return (
    <div
      className={styles['link-handler']}
      style={{ top: `${height * canvasScale + 10}px` }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {link.type === 'web' ? (
        <a className={styles.link} href={link.target} target="_blank" rel="noreferrer">
          {link.target}
        </a>
      ) : (
        <a
          className={styles.link}
          onClick={() => turnTarget(link.target)}
        >
          幻灯片页面 {link.target}
        </a>
      )}
        <div className={styles.btns}>
        <div className={styles.btn} onClick={openLinkDialog}>
          更换
        </div>
        <Divider type="vertical" />
        <div className={styles.btn} onClick={() => removeLink(elementInfo as any)}>
          移除
        </div>
      </div>
    </div>
  )
}
