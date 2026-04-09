// src/hooks/useHistorySnapshot.ts
import { debounce, throttle } from 'lodash'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useSnapshotStore } from '../store/useSnapshotStore'

const useHistorySnapshot = () => {
  // 仅提取需要的 action，避免无关状态导致重渲染
  const { addSnapshot, reDo, unDo } = useSnapshotStore(
    useShallow((state) => ({
      addSnapshot: state.addSnapshot,
      reDo: state.reDo,
      unDo: state.unDo,
    })),
  )

  /**
   * 添加历史快照（300ms debounce）
   * 和 Vue 原逻辑完全一致
   */
  const addHistorySnapshot = useMemoizedFn(
    debounce(() => {
      addSnapshot()
    }, 300, { trailing: true }),
  )

  /**
   * redo（100ms throttle）
   * leading: true, trailing: false — 与 Vue 完全一致
   */
  const redo = useMemoizedFn(
    throttle(() => {
      reDo()
    }, 100, { leading: true, trailing: false }),
  )

  /**
   * undo（100ms throttle）
   * leading-only
   */
  const undo = useMemoizedFn(
    throttle(() => {
      unDo()
    }, 100, { leading: true, trailing: false }),
  )

  return {
    addHistorySnapshot,
    redo,
    undo,
  }
}

export default useHistorySnapshot
