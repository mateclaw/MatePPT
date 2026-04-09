import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useSlidesStore } from '@/ppt/store'
import RemarkEditor, { type RemarkEditorRef } from './Editor'
import styles from './Remark.module.scss'

interface RemarkProps {
  height: number
  onHeightChange: (height: number) => void
}

export default function Remark({ height, onHeightChange }: RemarkProps) {
  const { currentSlide, updateSlide } = useSlidesStore(
    useShallow((state) => ({
      currentSlide: state.getCurrentSlide(),
      updateSlide: state.updateSlide,
    })),
  )

  const editorRef = useRef<RemarkEditorRef | null>(null)

  useEffect(() => {
    editorRef.current?.updateTextContent()
  }, [currentSlide?.id])

  const remark = currentSlide?.remark || ''

  const handleInput = (content: string) => {
    updateSlide({ remark: content })
  }

  const resize = (e: React.MouseEvent<HTMLDivElement>) => {
    let isMouseDown = true
    const startPageY = e.pageY
    const originHeight = height

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isMouseDown) return
      const currentPageY = moveEvent.pageY
      const moveY = currentPageY - startPageY
      let newHeight = -moveY + originHeight

      if (newHeight < 40) newHeight = 40
      if (newHeight > 360) newHeight = 360

      onHeightChange(newHeight)
    }

    const onMouseUp = () => {
      isMouseDown = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div className={styles.remark} style={{ height }}>
      <div className={styles['resize-handler']} onMouseDown={resize} />
      <RemarkEditor ref={editorRef} value={remark} onUpdate={handleInput} />
    </div>
  )
}
