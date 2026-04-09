// usePasteListener.ts
import { useEffect } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore'
import { getImageDataURL } from '../utils/image'
import usePasteTextClipboardData from './usePasteTextClipboardData'
import useCreateElement from './useCreateElement'

/**
 * 在文档级别监听粘贴事件：
 * - 有图片：优先粘贴为图片元素
 * - 没有图片但有 text/plain：尝试按自定义协议解析（元素 / 文本等）
 */
export const usePasteListener = () => {
  const { editorAreaFocus, thumbnailsFocus, disableHotkeys } = useMainStore(
    useShallow((state) => ({
      editorAreaFocus: state.editorAreaFocus,
      thumbnailsFocus: state.thumbnailsFocus,
      disableHotkeys: state.disableHotkeys,
    })),
  )

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { createImageElement } = useCreateElement()

  // 粘贴图片到幻灯片元素
  const pasteImageFile = useMemoizedFn((imageFile: File) => {
    getImageDataURL(imageFile).then((dataURL) => {
      createImageElement(dataURL)
    })
  })

  // 粘贴事件监听
  const pasteListener = useMemoizedFn((e: ClipboardEvent) => {
    // 只有编辑区或缩略图区域聚焦时才响应粘贴
    if (!editorAreaFocus && !thumbnailsFocus) return
    if (disableHotkeys) return

    if (!e.clipboardData) return

    const clipboardDataItems = e.clipboardData.items
    const clipboardDataFirstItem = clipboardDataItems[0]

    if (!clipboardDataFirstItem) return

    // 如果剪贴板内有图片，优先尝试读取图片
    let isImage = false
    for (const item of clipboardDataItems) {
      if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
        const imageFile = item.getAsFile()
        if (imageFile) {
          pasteImageFile(imageFile)
          isImage = true
        }
      }
    }

    if (isImage) return

    // 如果剪贴板内没有图片，但有文字内容，尝试解析文字内容
    if (
      clipboardDataFirstItem.kind === 'string' &&
      clipboardDataFirstItem.type === 'text/plain'
    ) {
      clipboardDataFirstItem.getAsString((text) => {
        pasteTextClipboardData(text)
      })
    }
  })

  useEffect(() => {
    // 这里用 document 监听，和 Vue 版本保持一致
    document.addEventListener('paste', pasteListener)

    return () => {
      document.removeEventListener('paste', pasteListener)
    }
  }, [pasteListener])
}

export default usePasteListener
