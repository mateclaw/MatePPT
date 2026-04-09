import { useMemo, useState } from 'react'
import { Tabs } from 'antd'
import { Icon } from 'umi'

import { useMainStore } from '@/ppt/store'
import { SYMBOL_LIST } from '@/ppt/configs/symbol'
import emitter, { EmitterEvents } from '@/ppt/utils/emitter'
import useCreateElement from '@/ppt/hooks/useCreateElement'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import MoveablePanel from '@/components/MoveablePanel'
import styles from './SymbolPanel.module.scss'

export default function SymbolPanel() {
  const setShowSymbolPanel = useMainStore((state) => state.setShowSymbolPanel)
  const { handleElement } = useActiveElementList()
  const { createTextElement } = useCreateElement()

  const [selectedSymbolKey, setSelectedSymbolKey] = useState(SYMBOL_LIST[0].key)
  const [selectedEmojiTypeIndex, setSelectedEmojiTypeIndex] = useState(0)
  const emojiTypeList = ['表情', '动作', '动植物', '食物', '旅行', '活动', '物品', '符号']

  const symbolPool = useMemo(() => {
    const selectedSymbol = SYMBOL_LIST.find((item) => item.key === selectedSymbolKey)
    if (!selectedSymbol) return []
    if (selectedSymbol.key === 'emoji') {
      const emojiList = selectedSymbol.children[selectedEmojiTypeIndex]
      return [emojiList]
    }
    return selectedSymbol.children
  }, [selectedEmojiTypeIndex, selectedSymbolKey])

  const tabs = SYMBOL_LIST.map((item) => ({ key: item.key, label: item.label }))

  const selectSymbol = (value: string) => {
    if (handleElement?.type === 'text') {
      emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action: { command: 'insert', value } })
      return
    }
    if (handleElement?.type === 'shape') {
      const editableElRef = document.querySelector(`#editable-element-${handleElement.id} .ProseMirror`)
      if (editableElRef) {
        emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action: { command: 'insert', value } })
        return
      }
    }
    if (handleElement?.type === 'table') {
      const editableElRef = document.querySelector(`#editable-element-${handleElement.id} .cell.active .cell-text`)
      if (editableElRef) {
        document.execCommand('insertText', false, value)
        return
      }
    }

    createTextElement(
      {
        left: 0,
        top: 0,
        width: 200,
        height: 50,
      },
      { content: value },
    )
  }

  return (
    <MoveablePanel
      className={styles['symbol-panel']}
      width={350}
      height={560}
      left={-270}
      top={90}
      contentStyle={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className={styles['close-btn']} onClick={() => setShowSymbolPanel(false)} onMouseDown={(e) => e.stopPropagation()}>
        <Icon icon="ri:close-line" />
      </div>

      <Tabs
        activeKey={selectedSymbolKey}
        onChange={setSelectedSymbolKey}
        items={tabs}
        tabBarStyle={{ marginBottom: 8 }}
      />

      {selectedSymbolKey === 'emoji' && (
        <div className={styles['emoji-types']}>
          {emojiTypeList.map((item, index) => (
            <div
              key={item}
              className={`${styles['emoji-type']} ${selectedEmojiTypeIndex === index ? styles['emoji-type-active'] : ''}`}
              onClick={() => setSelectedEmojiTypeIndex(index)}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      <div className={styles.pool}>
        {symbolPool.map((group, groupIndex) => (
          <div key={groupIndex} className={styles['symbol-group']}>
            {group.map((item: string, index: number) => (
              <div key={`${item}-${index}`} className={styles['symbol-item']} onClick={() => selectSymbol(item)}>
                <div className={styles.symbol}>{item}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </MoveablePanel>
  )
}
