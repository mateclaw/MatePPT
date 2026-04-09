// useDropToCanvas.ts (React)

import { useEffect } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '@/ppt/store'
import { getImageDataURL } from '@/ppt/utils/image'
import { parseText2Paragraphs } from '@/ppt/utils/textParser'
import useCreateElement from '@/ppt/hooks/useCreateElement'

export default function useDropToCanvas(elementRef: React.RefObject<HTMLElement | null>) {
  const { disableHotkeys } = useMainStore(useShallow((s) => ({ disableHotkeys: s.disableHotkeys })))
  const { createImageElement, createTextElement } = useCreateElement()

  // 拖拽元素到画布中
  const handleDrop = useMemoizedFn((e: DragEvent) => {
    if (!e.dataTransfer || e.dataTransfer.items.length === 0) return

    const dataItems = e.dataTransfer.items
    const firstItem = dataItems[0]

    // 检查是否包含图片：包含则插入图片并提前结束
    let isImage = false
    for (const item of Array.from(dataItems)) {
      if (item.kind === 'file' && item.type.includes('image')) {
        const imageFile = item.getAsFile()
        if (imageFile) {
          getImageDataURL(imageFile).then((dataURL) => {
            // 这里和原逻辑一致：异步拿到 dataURL 后创建图片元素
            createImageElement(dataURL)
          })
        }
        isImage = true
      }
    }
    if (isImage) return

    // 否则检查是否是纯文本
    if (firstItem.kind === 'string' && firstItem.type === 'text/plain') {
      firstItem.getAsString((text) => {
        if (disableHotkeys) return
        const content = parseText2Paragraphs(text)
        createTextElement(
          { left: 0, top: 0, width: 600, height: 50 },
          { content },
        )
      })
    }
  })

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    // 只给画布容器绑定 drop（保持你原来的行为）
    el.addEventListener('drop', handleDrop)

    // 全局阻止默认拖拽行为（保持你原来的行为）
    const prevent = (e: DragEvent) => e.preventDefault()

    document.addEventListener('dragleave', prevent)
    document.addEventListener('drop', prevent)
    document.addEventListener('dragenter', prevent)
    document.addEventListener('dragover', prevent)

    return () => {
      el.removeEventListener('drop', handleDrop)

      document.removeEventListener('dragleave', prevent)
      document.removeEventListener('drop', prevent)
      document.removeEventListener('dragenter', prevent)
      document.removeEventListener('dragover', prevent)
    }
  }, [elementRef, handleDrop])

  // 如果你希望 hook 返回一些东西（比如暴露 handleDrop 给 React onDrop），也可以 return
  // return { handleDrop }
}
