/**
 * 放映状态管理 Store (Zustand)
 */

import { create } from 'zustand'

export interface ScreenState {
  screening: boolean
  setScreening: (screening: boolean) => void
}

export const useScreenStore = create<ScreenState>((set) => ({
  screening: false,
  setScreening: (screening: boolean) => set({ screening }),
}))

export default useScreenStore
