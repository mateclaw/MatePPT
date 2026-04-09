/**
 * 键盘状态管理 Store (Zustand)
 * Ctrl、Shift、Space 按键状态
 */

import { create } from 'zustand'

export interface KeyboardState {
  ctrlKeyState: boolean
  shiftKeyState: boolean
  spaceKeyState: boolean
  
  // Actions
  setCtrlKeyState: (active: boolean) => void
  setShiftKeyState: (active: boolean) => void
  setSpaceKeyState: (active: boolean) => void
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
  ctrlKeyState: false,
  shiftKeyState: false,
  spaceKeyState: false,

  setCtrlKeyState: (active: boolean) => set({ ctrlKeyState: active }),
  setShiftKeyState: (active: boolean) => set({ shiftKeyState: active }),
  setSpaceKeyState: (active: boolean) => set({ spaceKeyState: active }),
}))

// Getter
export const useCtrlOrShiftActive = () => {
  return useKeyboardStore((state) => state.ctrlKeyState || state.shiftKeyState)
}

export default useKeyboardStore
