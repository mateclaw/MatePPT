import { useEffect, useMemo, useState } from 'react'
import { Button } from 'antd'
import { Icon } from 'umi'

import type { PPTElement } from '@/ppt/core'
import { ELEMENT_TYPE_ZH } from '@/ppt/configs/element'
import { ElementOrderCommands } from '@/ppt/types/edit'
import { useMainStore, useSlidesStore } from '@/ppt/store'
import useOrderElement from '@/ppt/hooks/useOrderElement'
import useHideElement from '@/ppt/hooks/useHideElement'
import useSelectElement from '@/ppt/hooks/useSelectElement'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import MoveablePanel from '@/components/MoveablePanel'
import styles from './SelectPanel.module.scss'

interface GroupElements {
  type: 'group'
  id: string
  elements: PPTElement[]
}

type ElementItem = PPTElement | GroupElements

export default function SelectPanel() {
  const currentSlide = useSlidesStore((state) => state.getCurrentSlide())
  const updateElement = useSlidesStore((state) => state.updateElement)
  const handleElementId = useMainStore((state) => state.handleElementId)
  const activeElementIdList = useMainStore((state) => state.activeElementIdList)
  const activeGroupElementId = useMainStore((state) => state.activeGroupElementId)
  const hiddenElementIdList = useMainStore((state) => state.hiddenElementIdList)
  const setActiveElementIdList = useMainStore((state) => state.setActiveElementIdList)
  const setHandleElementId = useMainStore((state) => state.setHandleElementId)
  const setActiveGroupElementId = useMainStore((state) => state.setActiveGroupElementId)
  const setShowSelectPanel = useMainStore((state) => state.setShowSelectPanel)
  const { handleElement } = useActiveElementList()

  const { orderElement } = useOrderElement()
  const { selectElement } = useSelectElement()
  const { toggleHideElement, showAllElements, hideAllElements } = useHideElement()

  const [editingElId, setEditingElId] = useState('')

  const elements = useMemo<ElementItem[]>(() => {
    if (!currentSlide?.elements) return []
    const list: ElementItem[] = []

    for (const el of currentSlide.elements) {
      if (el.groupId) {
        const lastItem = list[list.length - 1]
        if (lastItem && lastItem.type === 'group' && lastItem.id === el.groupId) {
          lastItem.elements.push(el)
        } else {
          list.push({ type: 'group', id: el.groupId, elements: [el] })
        }
      } else {
        list.push(el)
      }
    }

    return list
  }, [currentSlide?.elements])

  useEffect(() => {
    if (!editingElId) return
    const input = document.querySelector<HTMLInputElement>(`#select-panel-input-${editingElId}`)
    input?.focus()
  }, [editingElId])

  const selectGroupEl = (item: GroupElements, id: string) => {
    if (handleElementId === id) return
    if (hiddenElementIdList.includes(id)) return

    const idList = item.elements.map((el) => el.id)
    setActiveElementIdList(idList)
    setHandleElementId(id)
    setTimeout(() => setActiveGroupElementId(id), 0)
  }

  const saveElementName = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>, id: string) => {
    const name = (e.target as HTMLInputElement).value
    updateElement({ id, props: { name } })
    setEditingElId('')
  }

  const enterEdit = (id: string) => {
    setEditingElId(id)
  }

  return (
    <MoveablePanel
      className={styles['select-panel']}
      width={200}
      height={360}
      title={`选择（${activeElementIdList.length}/${currentSlide?.elements.length || 0}）`}
      left={-270}
      top={90}
      onClose={() => setShowSelectPanel(false)}
    >
      {elements.length > 0 && (
        <div className={styles.handler}>
          <div className={styles.btns}>
            <Button size="small" style={{ marginRight: 5 }} onClick={showAllElements}>全部显示</Button>
            <Button size="small" onClick={hideAllElements}>全部隐藏</Button>
          </div>
          {handleElement && (
            <div className={styles['icon-btns']}>
              <Icon className={styles['icon-btn']} icon="ri:arrow-down-line" onClick={() => orderElement(handleElement, ElementOrderCommands.UP)} />
              <Icon className={styles['icon-btn']} icon="ri:arrow-up-line" onClick={() => orderElement(handleElement, ElementOrderCommands.DOWN)} />
            </div>
          )}
        </div>
      )}

      <div className={styles['element-list']}>
        {elements.map((item) => {
          if (item.type === 'group') {
            return (
              <div key={item.id} className={styles['group-els']}>
                <div className={styles['group-title']}>组合</div>
                {item.elements.map((groupItem) => (
                  <div
                    key={groupItem.id}
                    className={`${styles.item} ${
                      activeElementIdList.includes(groupItem.id) ? styles.active : ''
                    } ${
                      activeGroupElementId === groupItem.id ? styles['group-active'] : ''
                    }`}
                    onClick={() => selectGroupEl(item, groupItem.id)}
                    onDoubleClick={() => enterEdit(groupItem.id)}
                  >
                    {editingElId === groupItem.id ? (
                      <input
                        id={`select-panel-input-${groupItem.id}`}
                        defaultValue={groupItem.name || ELEMENT_TYPE_ZH[groupItem.type]}
                        className={styles.input}
                        type="text"
                        onBlur={(e) => saveElementName(e, groupItem.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveElementName(e, groupItem.id)
                        }}
                      />
                    ) : (
                      <div className={styles.name}>{groupItem.name || ELEMENT_TYPE_ZH[groupItem.type]}</div>
                    )}
                    <div className={styles.icons}>
                      {hiddenElementIdList.includes(groupItem.id) ? (
                        <Icon
                          icon="ri:eye-off-line"
                          onClick={(e) => { e.stopPropagation(); toggleHideElement(groupItem.id) }}
                        />
                      ) : (
                        <Icon
                          icon="ri:eye-line"
                          onClick={(e) => { e.stopPropagation(); toggleHideElement(groupItem.id) }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          }

          return (
            <div
              key={item.id}
              className={`${styles.item} ${activeElementIdList.includes(item.id) ? styles.active : ''}`}
              onClick={() => selectElement(item.id)}
              onDoubleClick={() => enterEdit(item.id)}
            >
              {editingElId === item.id ? (
                <input
                  id={`select-panel-input-${item.id}`}
                  defaultValue={item.name || ELEMENT_TYPE_ZH[item.type]}
                  className={styles.input}
                  type="text"
                  onBlur={(e) => saveElementName(e, item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveElementName(e, item.id)
                  }}
                />
              ) : (
                <div className={styles.name}>{item.name || ELEMENT_TYPE_ZH[item.type]}</div>
              )}
              <div className={styles.icons}>
                {hiddenElementIdList.includes(item.id) ? (
                  <Icon
                    icon="ri:eye-off-line"
                    onClick={(e) => { e.stopPropagation(); toggleHideElement(item.id) }}
                  />
                ) : (
                  <Icon
                    icon="ri:eye-line"
                    onClick={(e) => { e.stopPropagation(); toggleHideElement(item.id) }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </MoveablePanel>
  )
}
