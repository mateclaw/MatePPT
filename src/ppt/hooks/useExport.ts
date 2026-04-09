import { useState } from 'react'
import { App } from 'antd'
import { useMemoizedFn } from 'ahooks'
import type { PPTSlide } from '@/ppt/core'

const useExport = () => {
  const { message } = App.useApp()
  const [exporting, setExporting] = useState(false)

  const warnNotReady = useMemoizedFn((label: string) => {
    message.warning(`${label} 导出功能暂未实现`)
  })

  const exportImage = useMemoizedFn(
    (
      _domRef: HTMLElement | null,
      _format: 'png' | 'jpeg',
      _quality: number,
      _ignoreWebfont = true,
    ) => {
      setExporting(false)
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
    (_slides: PPTSlide[], _masterOverwrite: boolean, _ignoreMedia: boolean) => {
      setExporting(false)
      warnNotReady('PPTX')
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
