// useElementSelection.ts
import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMainStore, useSlidesStore } from '@/ppt/store'

/**
 * 元素选择相关的操作：
 * - selectAllElements：将当前页所有未锁定且未隐藏的元素设置为选中
 * - selectElement：将指定元素设置为选中（排除锁定/隐藏/当前 handle 元素）
 */
const useElementSelection = () => {
  // slides 相关
  const currentSlide = useSlidesStore(useShallow((state) => state.getCurrentSlide()))

  // main 相关：隐藏元素列表、当前操作元素 id、以及设置选中元素方法
  const {
    hiddenElementIdList,
    handleElementId,
    setActiveElementIdList,
  } = useMainStore(
    useShallow((state) => ({
      hiddenElementIdList: state.hiddenElementIdList,
      handleElementId: state.handleElementId,
      setActiveElementIdList: state.setActiveElementIdList,
    })),
  )

  /**
   * 将当前页面全部元素设置为被选择状态
   * 规则：
   *  - 未锁定 (!el.lock)
   *  - 不在隐藏元素列表中 (!hiddenElementIdList.includes(el.id))
   */
  const selectAllElements = useCallback(() => {
    if (!currentSlide || !currentSlide.elements) return

    const unlockedElements = currentSlide.elements.filter(
      (el: any) =>
        !el.lock && !hiddenElementIdList.includes(el.id),
    )
    const newActiveElementIdList = unlockedElements.map((el: any) => el.id)

    setActiveElementIdList(newActiveElementIdList)
  }, [currentSlide, hiddenElementIdList, setActiveElementIdList])

  /**
   * 将指定元素设置为被选择状态
   * 规则：
   *  - 如果当前 handleElementId 就是该 id，则不处理
   *  - 如果元素在隐藏列表中，则不处理
   *  - 如果元素被锁定，则不处理
   */
  const selectElement = useCallback(
    (id: string) => {
      if (!currentSlide || !currentSlide.elements) return

      if (handleElementId === id) return
      if (hiddenElementIdList.includes(id)) return

      const lockedElements = currentSlide.elements.filter((el: any) => el.lock)
      if (lockedElements.some((el: any) => el.id === id)) return

      setActiveElementIdList([id])
    },
    [
      currentSlide,
      handleElementId,
      hiddenElementIdList,
      setActiveElementIdList,
    ],
  )

  return {
    selectAllElements,
    selectElement,
  }
}

export default useElementSelection
