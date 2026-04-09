import { useState } from 'react'
import { App } from 'antd'
import { useMemoizedFn } from 'ahooks'

const useImport = () => {
  const { message } = App.useApp()
  const [exporting, setExporting] = useState(false)

  const warnNotReady = useMemoizedFn((label: string) => {
    message.warning(`${label} 导入功能暂未实现`)
  })

  const importSpecificFile = useMemoizedFn((files: FileList | null) => {
    if (!files?.length) return
    warnNotReady('PPTIST')
  })

  const importPPTXFile = useMemoizedFn((files: FileList | null) => {
    if (!files?.length) return
    setExporting(false)
    warnNotReady('PPTX')
  })

  const importJSON = useMemoizedFn((files: FileList | null) => {
    if (!files?.length) return
    warnNotReady('JSON')
  })

  return {
    importSpecificFile,
    importPPTXFile,
    importJSON,
    exporting,
  }
}

export default useImport
