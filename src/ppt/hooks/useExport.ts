import { useState } from 'react'
import { App } from 'antd'
import { useMemoizedFn } from 'ahooks'
import type { PPTSlide } from '@/ppt/core'
import { exportSlidesToPptx } from '@/ppt/utils/pptx-export'

const useExport = () => {
  const { message } = App.useApp()
  const [exporting, setExporting] = useState(false)

  const warnNotReady = useMemoizedFn((label: string) => {
    message.warning(`${label} 导出暂未接入`)
  })

  const exportImage = useMemoizedFn(
    (
      _domRef: HTMLElement | null,
      _format: 'png' | 'jpeg',
      _quality: number,
      _ignoreWebfont = true,
    ) => {
      warnNotReady('图片')
    },
  )

  const exportSpecificFile = useMemoizedFn((_slides: PPTSlide[]) => {
    warnNotReady('PPTIST')
  })

  const exportJSON = useMemoizedFn(() => {
    warnNotReady('JSON')
  })

  const exportPPTX = useMemoizedFn(
    async (
      slides: PPTSlide[],
      masterOverwrite: boolean,
      ignoreMedia: boolean,
      meta?: { title?: string; width?: number; height?: number },
    ) => {
      if (!slides.length) {
        message.warning('当前没有可导出的幻灯片')
        return
      }

      setExporting(true)
      try {
        await exportSlidesToPptx(slides, {
          title: meta?.title || 'export',
          width: meta?.width,
          height: meta?.height,
          masterOverwrite,
          ignoreMedia,
        })
        message.success('导出完成')
      } catch (error: any) {
        console.error('[export] PPTX failed:', error)
        message.error(error?.message || '导出失败')
      } finally {
        setExporting(false)
      }
    },
  )

  return {
    exporting,
    exportImage,
    exportJSON,
    exportSpecificFile,
    exportPPTX,
  }
}

export default useExport
