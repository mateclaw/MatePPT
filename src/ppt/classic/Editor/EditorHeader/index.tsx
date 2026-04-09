import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { InputRef } from 'antd'
import { Divider, Drawer, Input, Popover, Tooltip } from 'antd'
import { Icon } from 'umi'

import { useMainStore, useSlidesStore } from '@/ppt/store'
import useScreening from '@/ppt/hooks/useScreening'
import useImport from '@/ppt/hooks/useImport'
import useSlideHandler from '@/ppt/hooks/useSlideHandler'
import type { DialogForExportTypes } from '@/ppt/types/export'

import HotkeyDoc from './HotkeyDoc'
import FullscreenSpin from '@/components/FullscreenSpin'
import styles from './EditorHeader.module.scss'

export default function EditorHeader() {
  const { title, setTitle } = useSlidesStore(
    useShallow((state) => ({
      title: state.title,
      setTitle: state.setTitle,
    })),
  )
  const {
    setDialogForExport,
    setShowMarkupPanel,
    setShowAIPPTDialog,
  } = useMainStore(
    useShallow((state) => ({
      setDialogForExport: state.setDialogForExport,
      setShowMarkupPanel: state.setShowMarkupPanel,
      setShowAIPPTDialog: state.setShowAIPPTDialog,
    })),
  )

  const { enterScreening, enterScreeningFromStart } = useScreening()
  const { importSpecificFile, importPPTXFile, importJSON, exporting } = useImport()
  const { resetSlides } = useSlideHandler()

  const [mainMenuVisible, setMainMenuVisible] = useState(false)
  const [hotkeyDrawerVisible, setHotkeyDrawerVisible] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')

  const titleInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus()
    }
  }, [editingTitle])

  const startEditTitle = () => {
    setTitleValue(title)
    setEditingTitle(true)
  }

  const handleUpdateTitle = () => {
    setTitle(titleValue)
    setEditingTitle(false)
  }

  const goLink = (url: string) => {
    window.open(url, '_blank')
    setMainMenuVisible(false)
  }

  const openExportDialog = (type: DialogForExportTypes) => {
    setDialogForExport(type)
    setMainMenuVisible(false)
  }

  const openMarkupPanel = () => {
    setShowMarkupPanel(true)
    setMainMenuVisible(false)
  }

  const openAIPPTDialog = () => {
    setShowAIPPTDialog(true)
    setMainMenuVisible(false)
  }

  const handleImport = (handler: (files: FileList | null) => void) => (
    files: FileList | null,
  ) => {
    handler(files)
    setMainMenuVisible(false)
  }

  const mainMenu = (
    <div>
      <div className={styles['main-menu']}>
        <div className={styles['ai-menu']} onClick={openAIPPTDialog}>
          <div className={styles.icon}>
            <Icon icon="ri:magic-line" />
          </div>
          <div className={styles['aippt-content']}>
            <div className={styles.aippt}><span>AIPPT</span></div>
            <div className={styles['aippt-subtitle']}>输入一句话，智能生成演示文稿</div>
          </div>
        </div>
      </div>

      <Divider style={{ margin: '10px 0' }} />

      <div className={styles['import-section']}>
        <div className={styles['import-label']}>导入文件</div>
        <div className={styles['import-grid']}>
          <label className={styles['import-block']}>
            <span className={styles.icon}><Icon icon="ri:file-ppt-2-line" /></span>
            <span className={styles.label}>PPTX</span>
            <span className={styles['sub-label']}>（仅供测试）</span>
            <input
              className={styles['file-input']}
              type="file"
              accept="application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={(e) => handleImport(importPPTXFile)(e.target.files)}
            />
          </label>
          <label className={styles['import-block']}>
            <span className={styles.icon}><Icon icon="ri:file-code-line" /></span>
            <span className={styles.label}>JSON</span>
            <span className={styles['sub-label']}>（仅供测试）</span>
            <input
              className={styles['file-input']}
              type="file"
              accept=".json"
              onChange={(e) => handleImport(importJSON)(e.target.files)}
            />
          </label>
          <label className={styles['import-block']}>
            <span className={styles.icon}><Icon icon="ri:sticky-note-line" /></span>
            <span className={styles.label}>PPTIST</span>
            <span className={styles['sub-label']}>（专属格式）</span>
            <input
              className={styles['file-input']}
              type="file"
              accept=".pptist"
              onChange={(e) => handleImport(importSpecificFile)(e.target.files)}
            />
          </label>
        </div>
      </div>

      <Divider style={{ margin: '10px 0' }} />

      <div className={styles['popover-menu-item']} onClick={() => openExportDialog('pptx')}>
        <Icon className={styles.icon} icon="ri:download-2-line" />
        导出文件
      </div>
      <Divider style={{ margin: '10px 0' }} />
      <div
        className={styles['popover-menu-item']}
        onClick={() => {
          resetSlides()
          setMainMenuVisible(false)
        }}
      >
        <Icon className={styles.icon} icon="ri:refresh-line" />
        重置幻灯片
      </div>
      <div className={styles['popover-menu-item']} onClick={openMarkupPanel}>
        <Icon className={styles.icon} icon="ri:mark-pen-line" />
        幻灯片类型标注
      </div>
      <div
        className={styles['popover-menu-item']}
        onClick={() => {
          setMainMenuVisible(false)
          setHotkeyDrawerVisible(true)
        }}
      >
        <Icon className={styles.icon} icon="ri:command-line" />
        快捷操作
      </div>
      <div className={styles['popover-menu-item']} onClick={() => goLink('https://github.com/pipipi-pikachu/PPTist/issues')}>
        <Icon className={styles.icon} icon="ri:chat-1-line" />
        意见反馈
      </div>
      <div className={styles['popover-menu-item']} onClick={() => goLink('https://github.com/pipipi-pikachu/PPTist/blob/master/doc/Q&A.md')}>
        <Icon className={styles.icon} icon="ri:question-line" />
        常见问题
      </div>
    </div>
  )

  const screeningMenu = (
    <div>
      <div className={styles['popover-menu-item']} onClick={enterScreeningFromStart}>
        <Icon className={styles.icon} icon="ri:play-circle-line" />
        从头开始
      </div>
      <div className={styles['popover-menu-item']} onClick={enterScreening}>
        <Icon className={styles.icon} icon="ri:slideshow-3-line" />
        从当前页开始
      </div>
    </div>
  )

  return (
    <div className={styles['editor-header']}>
      <div className={styles.left}>
        <Popover
          trigger="click"
          placement="bottomLeft"
          open={mainMenuVisible}
          onOpenChange={setMainMenuVisible}
          content={mainMenu}
        >
          <div className={styles['menu-item']}>
            <Icon className={styles.icon} icon="ri:menu-line" />
          </div>
        </Popover>

        <div className={styles.title}>
          {editingTitle ? (
            <Input
              className={styles['title-input']}
              ref={titleInputRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleUpdateTitle}
            />
          ) : (
            <div
              className={styles['title-text']}
              title={title}
              onClick={startEditTitle}
            >
              {title}
            </div>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles['group-menu-item']}>
          <Tooltip title="幻灯片放映（F5）">
            <div className={styles['menu-item']} onClick={enterScreening}>
              <Icon className={styles.icon} icon="ri:slideshow-3-line" />
            </div>
          </Tooltip>
          <Popover trigger="click" placement="bottom" content={screeningMenu}>
            <div className={styles['arrow-btn']}>
              <Icon className={styles.arrow} icon="ri:arrow-down-s-line" />
            </div>
          </Popover>
        </div>

        <Tooltip title="AI生成PPT">
          <div className={styles['menu-item']} onClick={openAIPPTDialog}>
            <span className={`${styles.text} ${styles.ai}`}>AI</span>
          </div>
        </Tooltip>
        <Tooltip title="导出">
          <div className={styles['menu-item']} onClick={() => openExportDialog('pptx')}>
            <Icon className={styles.icon} icon="ri:download-2-line" />
          </div>
        </Tooltip>
        <a
          className={styles['github-link']}
          href="https://github.com/pipipi-pikachu/PPTist"
          target="_blank"
          rel="noreferrer"
        >
          <Tooltip title="Copyright © 2020-PRESENT pipipi-pikachu">
            <div className={styles['menu-item']}>
              <Icon className={styles.icon} icon="ri:github-fill" />
            </div>
          </Tooltip>
        </a>
      </div>

      {hotkeyDrawerVisible && (
        <Drawer
          open
          width={320}
          placement="right"
          onClose={() => setHotkeyDrawerVisible(false)}
          title="快捷操作"
          destroyOnHidden
        >
          <HotkeyDoc />
        </Drawer>
      )}

      <FullscreenSpin loading={exporting} tip="正在导入..." />
    </div>
  )
}
