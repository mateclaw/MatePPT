import { useEffect, useRef, useState } from 'react'
import type { InputRef } from 'antd'
import { Button, Divider, Input, Tabs, Tooltip } from 'antd'
import { Icon } from 'umi'

import { useMainStore } from '@/ppt/store'
import useSearch from '@/ppt/hooks/useSearch'
import MoveablePanel from '@/components/MoveablePanel'
import styles from './SearchPanel.module.scss'

type TypeKey = 'search' | 'replace'

export default function SearchPanel() {
  const setShowSearchPanel = useMainStore((state) => state.setShowSearchPanel)

  const {
    searchWord,
    setSearchWord,
    replaceWord,
    setReplaceWord,
    searchResults,
    searchIndex,
    modifiers,
    searchNext,
    searchPrev,
    replace,
    replaceAll,
    toggleModifiers,
  } = useSearch()

  const [type, setType] = useState<TypeKey>('search')
  const searchInputRef = useRef<InputRef | null>(null)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [type])

  const close = () => setShowSearchPanel(false)
  const activeIndex = searchResults.length ? searchIndex + 1 : 0

  const suffix = (
    <div className={styles.suffix}>
      <span className={styles.count}>{activeIndex}/{searchResults.length}</span>
      <Divider type="vertical" />
      <Tooltip title="忽略大小写">
        <span
          className={`${styles['ignore-case']} ${modifiers === 'g' ? styles.active : ''}`}
          onClick={toggleModifiers}
        >
          Aa
        </span>
      </Tooltip>
      <Divider type="vertical" />
      <Tooltip title="上一个">
        <Icon className={`${styles['next-btn']} ${styles.left}`} icon="ri:arrow-left-s-line" onClick={searchPrev} />
      </Tooltip>
      <Tooltip title="下一个">
        <Icon className={`${styles['next-btn']} ${styles.right}`} icon="ri:arrow-right-s-line" onClick={searchNext} />
      </Tooltip>
    </div>
  )

  return (
    <MoveablePanel
      className={styles['search-panel']}
      width={330}
      height={0}
      left={-270}
      top={90}
    >
      <div className={styles['close-btn']} onClick={close} onMouseDown={(e) => e.stopPropagation()}>
        <Icon icon="ri:close-line" />
      </div>

      <Tabs
        activeKey={type}
        onChange={(key) => setType(key as TypeKey)}
        items={[
          { key: 'search', label: '查找' },
          { key: 'replace', label: '替换' },
        ]}
      />

      <div className={`${styles.content} ${styles[type]}`} onMouseDown={(e) => e.stopPropagation()}>
        <Input
          className={styles.input}
          ref={searchInputRef}
          value={searchWord}
          placeholder="输入查找内容"
          suffix={suffix}
          onChange={(e) => setSearchWord(e.target.value)}
          onPressEnter={searchNext}
        />
        {type === 'replace' && (
          <>
            <Input
              className={styles.input}
              value={replaceWord}
              placeholder="输入替换内容"
              onChange={(e) => setReplaceWord(e.target.value)}
              onPressEnter={replace}
            />
            <div className={styles.footer}>
              <Button disabled={!searchWord} style={{ marginLeft: 5 }} onClick={replace}>
                替换
              </Button>
              <Button disabled={!searchWord} type="primary" style={{ marginLeft: 5 }} onClick={replaceAll}>
                全部替换
              </Button>
            </div>
          </>
        )}
      </div>
    </MoveablePanel>
  )
}
