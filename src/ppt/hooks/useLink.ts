// useElementLink.ts

import { useShallow } from 'zustand/react/shallow'
import { useSlidesStore } from '../store/useSlidesStore'
import type { PPTElement, PPTElementLink } from '../core'
import useHistorySnapshot from '../hooks/useHistorySnapshot'
import { App } from 'antd'


export const useElementLink = () => {

  const { message } = App.useApp();

  // 只从 store 里取用到的 action，避免无关字段导致重渲染
  const { updateElement, removeElementProps } = useSlidesStore(
    useShallow((state) => ({
      updateElement: state.updateElement,
      removeElementProps: state.removeElementProps,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * 为当前元素设置链接
   * @returns boolean 表示是否设置成功（用于外部根据校验结果做后续操作）
   */
  const setLink = (handleElement: PPTElement, link: PPTElementLink): boolean => {
    const linkRegExp =
      /^(https?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/

    if (link.type === 'web' && !linkRegExp.test(link.target)) {
      message.error('不是正确的网页链接地址')
      return false
    }

    if (link.type === 'slide' && !link.target) {
      message.error('请先选择链接目标')
      return false
    }

    const props = { link }
    updateElement({ id: handleElement.id, props })
    addHistorySnapshot()

    return true
  }

  /**
   * 删除当前元素的链接
   */
  const removeLink = (handleElement: PPTElement) => {
    removeElementProps({ id: handleElement.id, propName: 'link' })
    addHistorySnapshot()
  }

  return {
    setLink,
    removeLink,
  }
}

export default useElementLink
