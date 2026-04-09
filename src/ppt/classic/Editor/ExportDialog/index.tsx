import { Tabs } from 'antd'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '@/ppt/store'
import type { DialogForExportTypes } from '@/ppt/types/export'

import ExportImage from './ExportImage'
import ExportJSON from './ExportJSON'
import ExportPDF from './ExportPDF'
import ExportPPTX from './ExportPPTX'
import ExportSpecificFile from './ExportSpecificFile'
import styles from './ExportDialog.module.scss'

interface TabItem {
  key: DialogForExportTypes
  label: string
}

const tabs: TabItem[] = [
  { key: 'pptist', label: '导出 PPTIST 文件' },
  { key: 'pptx', label: '导出 PPTX' },
  { key: 'image', label: '导出图片' },
  { key: 'json', label: '导出 JSON' },
  { key: 'pdf', label: '打印 / 导出 PDF' },
]

export default function ExportDialog() {
  const { dialogForExport, setDialogForExport } = useMainStore(
    useShallow((state) => ({
      dialogForExport: state.dialogForExport,
      setDialogForExport: state.setDialogForExport,
    })),
  )

  const activeKey = (dialogForExport || 'pptist') as DialogForExportTypes

  const dialogMap: Record<DialogForExportTypes, JSX.Element | null> = {
    image: <ExportImage onClose={() => setDialogForExport('')} />,
    json: <ExportJSON onClose={() => setDialogForExport('')} />,
    pdf: <ExportPDF onClose={() => setDialogForExport('')} />,
    pptx: <ExportPPTX onClose={() => setDialogForExport('')} />,
    pptist: <ExportSpecificFile onClose={() => setDialogForExport('')} />,
    html: null,
    '': null,
  }

  return (
    <div className={styles['export-dialog']}>
      <Tabs
        type="card"
        activeKey={activeKey}
        items={tabs.map((item) => ({ key: item.key, label: item.label }))}
        onChange={(key) => setDialogForExport(key as DialogForExportTypes)}
      />
      <div className={styles.content}>
        {dialogMap[activeKey]}
      </div>
    </div>
  )
}
