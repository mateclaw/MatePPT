// useSearchAndReplace.ts
import { useCallback, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore';
import { useSlidesStore } from '../store/useSlidesStore';
import type { TableElement } from '../core'
import { useActiveElementList } from './useActiveElementList';
import { App } from 'antd';


interface SearchTextResult {
  elType: 'text' | 'shape'
  slideId: string
  elId: string
}

interface SearchTableResult {
  elType: 'table'
  slideId: string
  elId: string
  cellIndex: [number, number]
}

type SearchResult = SearchTextResult | SearchTableResult
type Modifiers = 'g' | 'gi'

type TextInfo = {
  text: string
  startIdx: number
  endIdx: number
}

export const useSearchAndReplace = () => {
  const {
    // handleElement,
    setActiveElementIdList,
  } = useMainStore(
    useShallow((state) => ({
      // handleElement: state.handleElement,
      setActiveElementIdList: state.setActiveElementIdList,
    })),
  )

  const { handleElement } = useActiveElementList()

  const { message } = App.useApp()  

  const {
    slides,
    slideIndex,
    currentSlide,
    updateSlideIndex,
    updateElement,
  } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      slideIndex: state.slideIndex,
      currentSlide: state.getCurrentSlide(),
      updateSlideIndex: state.updateSlideIndex,
      updateElement: state.updateElement,
    })),
  )

  const [searchWord, setSearchWord] = useState('')
  const [replaceWord, setReplaceWord] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchIndex, setSearchIndex] = useState(-1)
  const [modifiers, setModifiers] = useState<Modifiers>('g')

  /** 清除所有 mark 高亮 */
  const clearMarks = useCallback(() => {
    const markNodes = document.querySelectorAll('.editable-element mark')
    markNodes.forEach((mark) => {
      setTimeout(() => {
        const parentNode = mark.parentNode
        const text = mark.textContent
        if (parentNode && text != null) {
          parentNode.replaceChild(document.createTextNode(text), mark)
        }
      }, 0)
    })
  }, [])

  /** 收集 Text 节点 */
  const getTextNodeList = useCallback((dom: Node): Text[] => {
    const nodeList: Node[] = [...dom.childNodes]
    const textNodes: Text[] = []

    while (nodeList.length) {
      const node = nodeList.shift()!
      if (node.nodeType === node.TEXT_NODE) {
        const textNode = node as Text
        if (textNode.wholeText) textNodes.push(textNode)
      } else {
        nodeList.unshift(...Array.from(node.childNodes))
      }
    }

    return textNodes
  }, [])

  /** 每个 Text 节点的全局 start/end 索引 */
  const getTextInfoList = useCallback((textNodes: Text[]): TextInfo[] => {
    let length = 0
    return textNodes.map((node) => {
      const startIdx = length
      const endIdx = length + node.wholeText.length
      length = endIdx
      return {
        text: node.wholeText,
        startIdx,
        endIdx,
      }
    })
  }, [])

  /** 根据 keyword 取所有匹配结果（RegExp.exec 循环） */
  const getMatchList = useCallback(
    (content: string, keyword: string): RegExpExecArray[] => {
      const reg = new RegExp(keyword, modifiers)
      const matchList: RegExpExecArray[] = []
      let match = reg.exec(content)

      while (match) {
        matchList.push(match)
        match = reg.exec(content)
      }
      return matchList
    },
    [modifiers],
  )

  /** 对一个元素里的 textNodes 做 mark 包裹高亮 */
  const highlightChunks = useCallback(
    (
      textNodes: Text[],
      textList: TextInfo[],
      matchList: RegExpExecArray[],
      baseIndex: number,
    ) => {
      for (let i = matchList.length - 1; i >= 0; i--) {
        const match = matchList[i]
        const matchStart = match.index
        const matchEnd = matchStart + match[0].length

        for (let textIdx = 0; textIdx < textList.length; textIdx++) {
          const { text, startIdx, endIdx } = textList[textIdx]
          if (endIdx < matchStart) continue
          if (startIdx >= matchEnd) break

          let textNode = textNodes[textIdx]

          const nodeMatchStartIdx = Math.max(0, matchStart - startIdx)
          const nodeMatchLength =
            Math.min(endIdx, matchEnd) - startIdx - nodeMatchStartIdx

          if (nodeMatchStartIdx > 0) {
            textNode = textNode.splitText(nodeMatchStartIdx)
          }
          if (nodeMatchLength < textNode.wholeText.length) {
            textNode.splitText(nodeMatchLength)
          }

          const mark = document.createElement('mark')
          mark.dataset.index = String(baseIndex + i)
          mark.innerText = text.substring(
            nodeMatchStartIdx,
            nodeMatchStartIdx + nodeMatchLength,
          )

          const parent = textNode.parentNode
          if (parent) parent.replaceChild(mark, textNode)
        }
      }
    },
    [],
  )

  /** 高亮表格单元格文本 */
  const highlightTableText = useCallback(
    (nodes: NodeListOf<Element>, keyword: string, startIndex: number) => {
      let index = startIndex
      nodes.forEach((node) => {
        node.innerHTML = node.innerHTML.replace(
          new RegExp(keyword, modifiers),
          () => {
            const html = `<mark data-index=${index}>${keyword}</mark>`
            index += 1
            return html
          },
        )
      })
    },
    [modifiers],
  )

  /** 设置当前 active mark（根据 searchIndex） */
  const setActiveMarkForIndex = useCallback((activeIndex: number) => {
    const markNodes = document.querySelectorAll('mark[data-index]')
    markNodes.forEach((node) => {
      setTimeout(() => {
        const el = node as HTMLElement
        const indexAttr = el.dataset.index
        if (indexAttr !== undefined && +indexAttr === activeIndex) {
          el.classList.add('active')
        } else {
          el.classList.remove('active')
        }
      }, 0)
    })
  }, [])

  /** 计算所有匹配结果列表 */
  const buildSearchResults = useCallback(
    (keyword: string): SearchResult[] => {
      const textList: SearchResult[] = []
      if (!keyword) return textList

      const matchRegex = new RegExp(keyword, modifiers)
      const textRegex = /(<([^>]+)>)/g

      slides.forEach((slide) => {
        slide.elements.forEach((el) => {
          if (el.type === 'text') {
            const text = el.content.replace(textRegex, '')
            const rets = text.match(matchRegex)
            if (rets) {
              textList.push(
                ...new Array(rets.length).fill({
                  slideId: slide.id,
                  elId: el.id,
                  elType: el.type,
                } as SearchTextResult),
              )
            }
          } else if (el.type === 'shape' && el.text && el.text.content) {
            const text = el.text.content.replace(textRegex, '')
            const rets = text.match(matchRegex)
            if (rets) {
              textList.push(
                ...new Array(rets.length).fill({
                  slideId: slide.id,
                  elId: el.id,
                  elType: el.type,
                } as SearchTextResult),
              )
            }
          } else if (el.type === 'table') {
            for (let i = 0; i < el.data.length; i++) {
              const row = el.data[i]
              for (let j = 0; j < row.length; j++) {
                const cell = row[j]
                if (!cell.text) continue
                const text = cell.text.replace(textRegex, '')
                const rets = text.match(matchRegex)
                if (rets) {
                  textList.push(
                    ...new Array(rets.length).fill({
                      slideId: slide.id,
                      elId: el.id,
                      elType: el.type,
                      cellIndex: [i, j],
                    } as SearchTableResult),
                  )
                }
              }
            }
          }
        })
      })

      return textList
    },
    [slides, modifiers],
  )

  /** 根据当前 slide / searchResults 对当前页重新打 mark */
  const highlightCurrentSlide = useCallback(
    (results: SearchResult[], keyword: string) => {
      clearMarks()
      if (!keyword || !results.length) return

      // 模拟 Vue 的 nextTick
      setTimeout(() => {
        for (let i = 0; i < results.length; i++) {
          const target = results[i]
          const lastTarget = results[i - 1]
          if (target.slideId !== currentSlide.id) continue
          if (lastTarget && lastTarget.elId === target.elId) continue

          const node = document.querySelector(
            `#editable-element-${target.elId}`,
          )
          if (!node) continue

          if (target.elType === 'table') {
            const cells = node.querySelectorAll('.cell-text')
            highlightTableText(cells, keyword, i)
          } else {
            const textNodes = getTextNodeList(node)
            const textList = getTextInfoList(textNodes)
            const content = textList.map(({ text }) => text).join('')
            const matchList = getMatchList(content, keyword)
            highlightChunks(textNodes, textList, matchList, i)
          }
        }
      }, 0)
    },
    [
      clearMarks,
      currentSlide.id,
      getTextNodeList,
      getTextInfoList,
      getMatchList,
      highlightChunks,
      highlightTableText,
    ],
  )

  /** 导航到指定下标的目标（不依赖 state，直接用传入的 results） */
  const turnTargetAtIndex = useCallback(
    (results: SearchResult[], index: number) => {
      if (index < 0 || index >= results.length) return

      const target = results[index]

      if (target.slideId === currentSlide.id) {
        // 当前页：只需要激活 mark
        setTimeout(() => {
          setActiveMarkForIndex(index)
        }, 0)
      } else {
        // 切换到对应页
        const idx = slides.findIndex((slide) => slide.id === target.slideId)
        if (idx !== -1) {
          updateSlideIndex(idx)
        }
      }
    },
    [currentSlide.id, slides, updateSlideIndex, setActiveMarkForIndex],
  )

  /** 执行一次搜索（不做跳转），返回结果 */
  const runSearch = useCallback((): SearchResult[] | null => {
    const keyword = searchWord
    if (!keyword) {
      message.warning('请先输入查找内容')
      return null
    }

    const list = buildSearchResults(keyword)

    if (!list.length) {
      message.warning('未查找到匹配项')
      clearMarks()
      setSearchResults([])
      setSearchIndex(-1)
      return null
    }

    setSearchResults(list)
    setSearchIndex(0)
    return list
  }, [buildSearchResults, clearMarks, searchWord])

  /** 下一个匹配 */
  const searchNext = useCallback(() => {
    if (!searchWord) {
      message.warning('请先输入查找内容')
      return
    }

    setActiveElementIdList([])

    // 尚未搜索过：先搜索
    if (searchIndex === -1) {
      const list = runSearch()
      if (!list || !list.length) return
      turnTargetAtIndex(list, 0)
      return
    }

    if (!searchResults.length) return

    const nextIndex =
      searchIndex < searchResults.length - 1 ? searchIndex + 1 : 0
    setSearchIndex(nextIndex)
    turnTargetAtIndex(searchResults, nextIndex)
  }, [
    searchWord,
    searchIndex,
    searchResults,
    setActiveElementIdList,
    runSearch,
    turnTargetAtIndex,
  ])

  /** 上一个匹配 */
  const searchPrev = useCallback(() => {
    if (!searchWord) {
      message.warning('请先输入查找内容')
      return
    }

    setActiveElementIdList([])

    if (searchIndex === -1) {
      const list = runSearch()
      if (!list || !list.length) return
      // 第一次先到最后一个
      const lastIndex = list.length - 1
      setSearchIndex(lastIndex)
      turnTargetAtIndex(list, lastIndex)
      return
    }

    if (!searchResults.length) return

    const prevIndex =
      searchIndex > 0 ? searchIndex - 1 : searchResults.length - 1
    setSearchIndex(prevIndex)
    turnTargetAtIndex(searchResults, prevIndex)
  }, [
    searchWord,
    searchIndex,
    searchResults,
    setActiveElementIdList,
    runSearch,
    turnTargetAtIndex,
  ])

  /** 单次替换当前 active 匹配 */
  const replace = useCallback(() => {
    if (!searchWord) return
    if (searchIndex === -1) {
      // 先搜索 / 跳到第一个
      searchNext()
      return
    }

    const target = searchResults[searchIndex]
    if (!target) return

    let targetElement: Element | null = null

    if (target.elType === 'table') {
      const [i, j] = target.cellIndex
      targetElement = document.querySelector(
        `#editable-element-${target.elId} .cell[data-cell-index="${i}_${j}"] .cell-text`,
      )
    } else {
      targetElement = document.querySelector(
        `#editable-element-${target.elId} .ProseMirror`,
      )
    }

    if (!targetElement) return

    const fakeElement = document.createElement('div')
    fakeElement.innerHTML = targetElement.innerHTML

    let replaced = false
    const marks = fakeElement.querySelectorAll('mark[data-index]')

    marks.forEach((mark) => {
      const parentNode = mark.parentNode
      if (!parentNode) return

      if (mark.classList.contains('active')) {
        if (replaced) {
          parentNode.removeChild(mark)
        } else {
          parentNode.replaceChild(
            document.createTextNode(replaceWord),
            mark,
          )
          replaced = true
        }
      } else {
        const text = mark.textContent || ''
        parentNode.replaceChild(document.createTextNode(text), mark)
      }
    })

    // 更新 store 中对应元素内容
    if (target.elType === 'text') {
      const props = { content: fakeElement.innerHTML }
      updateElement({ id: target.elId, props })
    } else if (target.elType === 'shape') {
      const el = currentSlide.elements.find((item) => item.id === target.elId)
      if (el && el.type === 'shape' && el.text) {
        const props = { text: { ...el.text, content: fakeElement.innerHTML } }
        updateElement({ id: target.elId, props })
      }
    } else if (target.elType === 'table') {
      const el = currentSlide.elements.find((item) => item.id === target.elId)
      if (el && el.type === 'table') {
        const data = el.data.map((row, i) =>
          row.map((cell, j) => {
            if (
              i === target.cellIndex[0] &&
              j === target.cellIndex[1]
            ) {
              return {
                ...cell,
                text: fakeElement.innerHTML,
              }
            }
            return cell
          }),
        )
        const props = { data }
        updateElement({ id: target.elId, props })
      }
    }

    // 替换后，重新执行搜索，让结果与内容同步
    const list = buildSearchResults(searchWord)
    if (!list.length) {
      setSearchResults([])
      setSearchIndex(-1)
      clearMarks()
    } else {
      setSearchResults(list)
      // 找到“当前匹配”新的 index（简单处理：再从头开始）
      setSearchIndex(0)
      turnTargetAtIndex(list, 0)
    }
  }, [
    searchWord,
    replaceWord,
    searchIndex,
    searchResults,
    currentSlide.elements,
    buildSearchResults,
    clearMarks,
    updateElement,
    turnTargetAtIndex,
    searchNext,
  ])

  /** 替换所有匹配 */
  const replaceAll = useCallback(() => {
    if (!searchWord) return
    if (searchIndex === -1) {
      // 先做一次搜索
      const list = runSearch()
      if (!list || !list.length) return
    }

    const keyword = searchWord

    searchResults.forEach((target, i) => {
      const lastTarget = searchResults[i - 1]

      // 避免对同一元素重复处理
      if (lastTarget && lastTarget.elId === target.elId) return

      const targetSlide = slides.find(
        (item) => item.id === target.slideId,
      )
      if (!targetSlide) return
      const targetElement = targetSlide.elements.find(
        (item) => item.id === target.elId,
      )
      if (!targetElement) return

      // 表格：直接在每个 cell.text 上全局替换
      if (target.elType === 'table') {
        const tableEl = targetElement as TableElement
        const data = tableEl.data.map((row) =>
          row.map((cell) => {
            if (!cell.text) return cell
            return {
              ...cell,
              text: cell.text.replace(
                new RegExp(keyword, 'g'),
                replaceWord,
              ),
            }
          }),
        )
        const props = { data }
        updateElement({
          id: target.elId,
          slideId: target.slideId,
          props,
        })
      } else {
        // 普通文本 / 形状：使用同样的 mark 方案
        const fakeElement = document.createElement('div')
        if (targetElement.type === 'text') {
          fakeElement.innerHTML = targetElement.content
        } else if (targetElement.type === 'shape') {
          fakeElement.innerHTML = targetElement.text?.content || ''
        }

        const textNodes = getTextNodeList(fakeElement)
        const textList = getTextInfoList(textNodes)
        const content = textList.map(({ text }) => text).join('')
        const matchList = getMatchList(content, keyword)
        highlightChunks(textNodes, textList, matchList, i)

        const marks = fakeElement.querySelectorAll('mark[data-index]')
        let lastMarkIndex = -1
        marks.forEach((mark) => {
          const el = mark as HTMLElement
          const markIndex = +(el.dataset.index || '-1')
          const parentNode = mark.parentNode
          if (!parentNode) return

          if (markIndex === lastMarkIndex) {
            parentNode.removeChild(mark)
          } else {
            parentNode.replaceChild(
              document.createTextNode(replaceWord),
              mark,
            )
            lastMarkIndex = markIndex
          }
        })

        if (target.elType === 'text') {
          const props = { content: fakeElement.innerHTML }
          updateElement({
            id: target.elId,
            slideId: target.slideId,
            props,
          })
        } else if (target.elType === 'shape') {
          const el = targetSlide.elements.find(
            (item) => item.id === target.elId,
          )
          if (el && el.type === 'shape' && el.text) {
            const props = {
              text: { ...el.text, content: fakeElement.innerHTML },
            }
            updateElement({
              id: target.elId,
              slideId: target.slideId,
              props,
            })
          }
        }
      }
    })

    // 全部替换完：清空结果 & mark
    setSearchResults([])
    setSearchIndex(-1)
    clearMarks()
  }, [
    searchWord,
    replaceWord,
    searchIndex,
    searchResults,
    slides,
    clearMarks,
    runSearch,
    getTextNodeList,
    getTextInfoList,
    getMatchList,
    highlightChunks,
    updateElement,
  ])

  /** 重置搜索状态（不会清空 searchWord 本身） */
  const reset = useCallback(() => {
    setSearchIndex(-1)
    setSearchResults([])
    if (!searchWord) clearMarks()
  }, [searchWord, clearMarks])

  /** 切换 g / gi */
  const toggleModifiers = useCallback(() => {
    setModifiers((prev) => (prev === 'g' ? 'gi' : 'g'))
    reset()
  }, [reset])

  // —— 副作用：searchWord 改变时，重置结果 & 清除 mark ——
  useEffect(() => {
    reset()
  }, [searchWord, reset])

  // —— 副作用：slideIndex 或 searchResults / searchWord 改变时，重新打高亮 ——
  useEffect(() => {
    if (!searchWord || !searchResults.length) {
      clearMarks()
      return
    }
    highlightCurrentSlide(searchResults, searchWord)
    // active mark 单独在下面的 effect 里做
  }, [
    slideIndex,
    currentSlide.id,
    searchWord,
    searchResults,
    clearMarks,
    highlightCurrentSlide,
  ])

  // —— 副作用：searchIndex 改变时，激活对应 mark ——
  useEffect(() => {
    if (searchIndex === -1) return
    setActiveMarkForIndex(searchIndex)
  }, [searchIndex, setActiveMarkForIndex, slideIndex, currentSlide.id])

  // —— 副作用：当前“操作元素”改变时，清空搜索状态 ——
  useEffect(() => {
    if (!handleElement) return
    setSearchIndex(-1)
    setSearchResults([])
    clearMarks()
  }, [handleElement, clearMarks])

  // —— 卸载时清除 mark ——
  useEffect(
    () => () => {
      clearMarks()
    },
    [clearMarks],
  )

  return {
    // state
    searchWord,
    setSearchWord,
    replaceWord,
    setReplaceWord,
    searchResults,
    searchIndex,
    modifiers,

    // actions
    searchNext,
    searchPrev,
    replace,
    replaceAll,
    toggleModifiers,
  }
}

export default useSearchAndReplace
