import { uniq } from 'lodash'
import { useMemoizedFn } from 'ahooks'
import { useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore, useKeyboardStore } from '@/ppt/store'
import { EditorMode, type PPTElement } from '@/ppt/core'

function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
  return !('pageX' in e)
}
function getPageXY(e: MouseEvent | TouchEvent) {
  if (!isTouchEvent(e)) return { x: e.pageX, y: e.pageY }
  const t = e.changedTouches?.[0]
  return t ? { x: t.pageX, y: t.pageY } : null
}

export default function useSelectElement(params: {
  elementList: PPTElement[]
  moveElement: (e: MouseEvent | TouchEvent, element: PPTElement) => void
}) {
  const { elementList, moveElement } = params

  const {
    activeElementIdList,
    activeGroupElementId,
    handleElementId,
    editorAreaFocus,
    mode,
    setEditorAreaFocus,
    setActiveElementIdList,
    setHandleElementId,
    setActiveGroupElementId,
  } = useMainStore(
    useShallow((s) => ({
      activeElementIdList: s.activeElementIdList,
      activeGroupElementId: s.activeGroupElementId,
      handleElementId: s.handleElementId,
      editorAreaFocus: s.editorAreaFocus,
      mode: s.mode,
      setEditorAreaFocus: s.setEditorAreaFocus,
      setActiveElementIdList: s.setActiveElementIdList,
      setHandleElementId: s.setHandleElementId,
      setActiveGroupElementId: s.setActiveGroupElementId,
    })),
  )

  const { ctrlOrShiftKeyActive } = useKeyboardStore(
    useShallow((s) => ({ ctrlOrShiftKeyActive: s.ctrlKeyState || s.shiftKeyState })),
  )

  // 用 ref 保存“按下坐标 + 目标元素 id”，mouse up 时判断是否是 click（未移动）
  const pendingActiveGroupRef = useRef<null | { startX: number; startY: number; elementId: string }>(null)

  const selectElement = useMemoizedFn((e: MouseEvent | TouchEvent, element: PPTElement, startMove = true) => {
    
    if ((element as any).inherited) {
      // inherited的元素不能被选中
      setActiveElementIdList([])
      return ;
    }
    if (!editorAreaFocus) setEditorAreaFocus(true)

    const isSelected = activeElementIdList.includes(element.id)
    

    // 1) 未选中：设置选中（支持 ctrl/shift 多选 + 组成员联动）
    if (!isSelected) {
      let newActiveIdList: string[] = []

      if (ctrlOrShiftKeyActive) newActiveIdList = [...activeElementIdList, element.id]
      else newActiveIdList = [element.id]


      if (element.groupId && mode === EditorMode.ANNOTATE) {
        const groupMembersId: string[] = []
        elementList.forEach((el) => {
          if (el.groupId === element.groupId && !(el as any).inherited) groupMembersId.push(el.id)
        })
        newActiveIdList = [...newActiveIdList, ...groupMembersId]
      }

      setActiveElementIdList(uniq(newActiveIdList))
      setHandleElementId(element.id)
    }

    // 2) 已选中 + ctrl/shift：取消选中（组成员联动）；但不能取消到空（与原逻辑一致）
    else if (ctrlOrShiftKeyActive) {
      let newActiveIdList: string[] = []

      if (element.groupId && mode === EditorMode.ANNOTATE) {
        const groupMembersId: string[] = []
        elementList.forEach((el) => {
          if (el.groupId === element.groupId && !(el as any).inherited) groupMembersId.push(el.id)
        })
        newActiveIdList = activeElementIdList.filter((id) => !groupMembersId.includes(id))
      } else {
        newActiveIdList = activeElementIdList.filter((id) => id !== element.id)
      }

      if (newActiveIdList.length > 0) setActiveElementIdList(newActiveIdList)
    }

    // 3) 已选中，但不是当前操作元素：设为 handle
    else if (handleElementId !== element.id) {
      setHandleElementId(element.id)
    }

    // 4) 已选中 + 是 handle + 当前未作为 activeGroupElement：再次点击（未移动）则设置 activeGroupElementId
    else if (activeGroupElementId !== element.id) {
      const start = getPageXY(e)
      if (start) {
        pendingActiveGroupRef.current = { startX: start.x, startY: start.y, elementId: element.id }

        const onUp = (ev: MouseEvent | TouchEvent) => {
          const end = getPageXY(ev)
          const pending = pendingActiveGroupRef.current

          // 清理
          pendingActiveGroupRef.current = null
          window.removeEventListener('mouseup', onUp as any)
          window.removeEventListener('touchend', onUp as any)

          if (!end || !pending) return
          if (pending.elementId !== element.id) return

          // 与 Vue 一致：按下抬起坐标相同，判定为 click
          if (pending.startX === end.x && pending.startY === end.y) {
            setActiveGroupElementId(element.id)
          }
        }

        // 用 window 监听，不依赖 target，且不会覆盖别人的 handler
        if (isTouchEvent(e)) window.addEventListener('touchend', onUp as any)
        else window.addEventListener('mouseup', onUp as any)
      }
    }

    const allowMoveInPreview = Boolean((element as any).digitbotRole)
    if (startMove && (mode === EditorMode.EDIT || allowMoveInPreview)) moveElement(e, element)
  })

  return { selectElement }
}
