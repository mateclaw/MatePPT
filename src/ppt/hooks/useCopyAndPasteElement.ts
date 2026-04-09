/**
 * 元素剪贴板操作 Hook (React + Zustand + ahooks)
 * - copyElement: 将选中元素数据加密后复制到剪贴板
 * - cutElement: 复制后删除（剪切）
 * - pasteElement: 尝试从剪贴板读取并粘贴元素数据
 * - quickCopyElement: 复制后立刻粘贴
 */

import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore'
import { copyText, readClipboard } from '../utils/clipboard'
import { encrypt } from '../utils/crypto'
// import message from '../utils/message'
import usePasteTextClipboardData from '../hooks/usePasteTextClipboardData'
import useDeleteElement from './useDeleteElement'
import { useActiveElementList } from './useActiveElementList'
import { App } from 'antd'

const useElementClipboard = () => {

  const { message } = App.useApp();

  const { activeElementList } = useActiveElementList()
  const {
    activeElementIdList,
    setEditorAreaFocus,
  } = useMainStore(
    useShallow((state) => ({
      activeElementIdList: state.activeElementIdList,

      setEditorAreaFocus: state.setEditorAreaFocus,
    })),
  )

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { deleteElement } = useDeleteElement()

  /**
   * 将选中元素数据加密后复制到剪贴板
   */
  const copyElement = useMemoizedFn(() => {
    
    if (!activeElementIdList || activeElementIdList.length === 0) return


    const text = encrypt(
      JSON.stringify({
        type: 'elements',
        data: activeElementList,
      }),
    )

    copyText(text).then(() => {
      setEditorAreaFocus(true)
    })
  })

  /**
   * 将选中元素复制后删除（剪切）
   */
  const cutElement = useMemoizedFn(() => {
    copyElement()
    deleteElement()
  })

  /**
   * 尝试将剪贴板元素数据解密后进行粘贴
   */
  const pasteElement = useMemoizedFn(() => {
    readClipboard()
      .then((text) => {
        pasteTextClipboardData(text)
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : String(err)
        message.warning(errorMessage)
      })
  })

  /**
   * 将选中元素复制后立刻粘贴
   */
  const quickCopyElement = useMemoizedFn(() => {
    copyElement()
    pasteElement()
  })

  return {
    copyElement,
    cutElement,
    pasteElement,
    quickCopyElement,
  }
}

export default useElementClipboard
