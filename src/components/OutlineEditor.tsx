import { useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { nanoid } from 'nanoid'

import type { ContextmenuItem, Axis } from '@/ppt/classic/components/Contextmenu/types'
import { Contextmenu } from '@/ppt/classic/components/Contextmenu'
import styles from './OutlineEditor.module.scss'

interface OutlineEditorProps {
  value: string
  onChange: (value: string) => void
}

interface OutlineItem {
  id: string
  content: string
  lv: number
  title?: boolean
}

export default function OutlineEditor({ value, onChange }: OutlineEditorProps) {
  const [data, setData] = useState<OutlineItem[]>([])
  const [activeItemId, setActiveItemId] = useState('')
  const [contextmenuAxis, setContextmenuAxis] = useState<Axis | null>(null)
  const [contextmenuMenus, setContextmenuMenus] = useState<ContextmenuItem[]>([])
  const [contextmenuEl, setContextmenuEl] = useState<HTMLElement | null>(null)
  const [contextmenuActiveId, setContextmenuActiveId] = useState('')
  const lastEmittedRef = useRef<string | null>(null)

  const parseValue = (raw: string) => {
    const lines = raw.split('\n')
    const result: OutlineItem[] = []

    for (const line of lines) {
      if (!line.trim()) continue

      const headerMatch = line.match(/^(#+)\s*(.*)/)
      const listMatch = line.match(/^-\s*(.*)/)

      if (headerMatch) {
        const lv = headerMatch[1].length
        const content = headerMatch[2]
        result.push({
          id: nanoid(),
          content,
          title: true,
          lv,
        })
      } else if (listMatch) {
        const content = listMatch[1]
        result.push({
          id: nanoid(),
          content,
          lv: 4,
        })
      } else {
        result.push({
          id: nanoid(),
          content: line.trim(),
          lv: 4,
        })
      }
    }
    setData(result)
  }

  useEffect(() => {
    if (!lastEmittedRef.current || value !== lastEmittedRef.current) {
      parseValue(value)
    }
  }, [value])

  useEffect(() => {
    const prefixTitle = '#'
    const prefixItem = '-'
    let markdown = ''

    data.forEach((item) => {
      if (item.lv !== 1) markdown += '\n'
      if (item.title) markdown += `${prefixTitle.repeat(item.lv)} ${item.content}`
      else markdown += `${prefixItem} ${item.content}`
    })

    lastEmittedRef.current = markdown
    onChange(markdown)
  }, [data, onChange])

  useEffect(() => {
    if (!activeItemId) return
    const input = document.querySelector<HTMLInputElement>(`.${styles['editable-input']}`)
    input?.focus()
  }, [activeItemId])

  const handleFocus = (id: string) => {
    setActiveItemId(id)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, item: OutlineItem) => {
    setActiveItemId('')
    const nextValue = e.target.value
    setData((prev) => prev.map((_item) => (_item.id === item.id ? { ..._item, content: nextValue } : _item)))
  }

  const handleEnter = (value: string, item: OutlineItem) => {
    if (!value || item.title) return

    const index = data.findIndex((_item) => _item.id === item.id)
    const newItemId = nanoid()
    const nextData = [...data]
    nextData.splice(index + 1, 0, { id: newItemId, content: '', lv: 4 })
    setData(nextData)
    setActiveItemId(newItemId)
  }

  const handleBackspace = (value: string, item: OutlineItem) => {
    if (item.title || value) return
    deleteItem(item.id)
  }

  const addItem = (itemId: string, pos: 'next' | 'prev', content: string) => {
    const index = data.findIndex((_item) => _item.id === itemId)
    const item = data[index]
    if (!item) return

    const id = nanoid()
    let lv = 4
    let insertIndex = pos === 'prev' ? index : index + 1
    let title = false

    if (item.lv === 1) lv = 2
    else if (item.lv === 2) {
      lv = pos === 'prev' ? 2 : 3
    } else if (item.lv === 3) {
      lv = pos === 'prev' ? 3 : 4
    } else {
      lv = 4
    }

    if (lv < 4) title = true

    const nextData = [...data]
    nextData.splice(insertIndex, 0, { id, content, lv, title })
    setData(nextData)
  }

  const deleteItem = (itemId: string, isTitle?: boolean) => {
    if (!isTitle) {
      setData((prev) => prev.filter((item) => item.id !== itemId))
      return
    }

    const index = data.findIndex((item) => item.id === itemId)
    const item = data[index]
    if (!item) return

    const targetIds = [itemId]
    for (let i = index + 1; i < data.length; i++) {
      const afterItem = data[i]
      if (afterItem && afterItem.lv > item.lv) {
        targetIds.push(afterItem.id)
      } else {
        break
      }
    }
    setData((prev) => prev.filter((item) => !targetIds.includes(item.id)))
  }

  const contextmenus = useMemo(
    () => (item: OutlineItem): ContextmenuItem[] => {
      const { lv, id } = item

      if (lv === 1) {
        return [
          {
            text: '添加子级大纲（章）',
            handler: () => addItem(id, 'next', '新的一章'),
          },
        ]
      }
      if (lv === 2) {
        return [
          {
            text: '上方添加同级大纲（章）',
            handler: () => addItem(id, 'prev', '新的一章'),
          },
          {
            text: '添加子级大纲（节）',
            handler: () => addItem(id, 'next', '新的一节'),
          },
          {
            text: '删除此章',
            handler: () => deleteItem(id, true),
          },
        ]
      }
      if (lv === 3) {
        return [
          {
            text: '上方添加同级大纲（节）',
            handler: () => addItem(id, 'prev', '新的一节'),
          },
          {
            text: '添加子级大纲（项）',
            handler: () => addItem(id, 'next', '新的一项'),
          },
          {
            text: '删除此节',
            handler: () => deleteItem(id, true),
          },
        ]
      }
      return [
        {
          text: '上方添加同级大纲（项）',
          handler: () => addItem(id, 'prev', '新的一项'),
        },
        {
          text: '下方添加同级大纲（项）',
          handler: () => addItem(id, 'next', '新的一项'),
        },
        {
          text: '删除此项',
          handler: () => deleteItem(id),
        },
      ]
    },
    [data],
  )

  const openContextmenu = (e: React.MouseEvent, item: OutlineItem) => {
    e.preventDefault()
    setContextmenuAxis({ x: e.clientX, y: e.clientY })
    setContextmenuMenus(contextmenus(item))
    setContextmenuEl(e.currentTarget as HTMLElement)
    setContextmenuActiveId(item.id)
  }

  const removeContextmenu = () => {
    setContextmenuAxis(null)
    setContextmenuMenus([])
    setContextmenuEl(null)
    setContextmenuActiveId('')
  }

  return (
    <div className={styles['outline-editor']}>
      {data.map((item) => (
        <div
          key={item.id}
          className={classNames(
            styles.item,
            item.title && styles.title,
            styles[`lv-${item.lv}`],
            contextmenuActiveId === item.id && styles['contextmenu-active'],
          )}
          data-lv={item.lv}
          data-id={item.id}
          onContextMenu={(e) => openContextmenu(e, item)}
        >
          {activeItemId === item.id ? (
            <input
              className={styles['editable-input']}
              value={item.content}
              onBlur={(e) => handleBlur(e, item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleEnter((e.target as HTMLInputElement).value, item)
                }
                if (e.key === 'Backspace') {
                  handleBackspace((e.target as HTMLInputElement).value, item)
                }
              }}
              onChange={(e) => {
                const nextValue = e.target.value
                setData((prev) =>
                  prev.map((_item) => (_item.id === item.id ? { ..._item, content: nextValue } : _item)),
                )
              }}
            />
          ) : (
            <div className={styles.text} onClick={() => handleFocus(item.id)}>
              {item.content}
            </div>
          )}
          <div className={styles.flag} />
        </div>
      ))}

      {contextmenuAxis && (
        <Contextmenu
          axis={contextmenuAxis}
          el={contextmenuEl || document.body}
          menus={contextmenuMenus}
          removeContextmenu={removeContextmenu}
        />
      )}
    </div>
  )
}
