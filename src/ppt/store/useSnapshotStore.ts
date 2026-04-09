/**
 * 快照（历史记录）管理 Store (Zustand)
 * 撤销/重做功能
 */

import { create } from 'zustand'
import type { IndexableTypeArray } from 'dexie'
import { db, type Snapshot } from '../utils/database'
import { useSlidesStore } from './useSlidesStore'
import { useMainStore } from './useMainStore'
import { PPTColorCalculator } from '@/ppt/core/color/PPTColorCalculator'

const MEDIA_ELEMENT_TYPES = new Set(['image', 'video', 'audio'])

const mergeSlidesIgnoringMedia = (snapshotSlides: any[], currentSlides: any[]) => {
  const currentSlidesById = new Map<string, any>()
  currentSlides.forEach((slide) => {
    if (slide?.id) currentSlidesById.set(slide.id, slide)
  })

  return snapshotSlides.map((snapshotSlide) => {
    const currentSlide = snapshotSlide?.id ? currentSlidesById.get(snapshotSlide.id) : null
    if (!currentSlide?.elements) return snapshotSlide

    const currentMediaElements = (currentSlide.elements || []).filter((el: any) => MEDIA_ELEMENT_TYPES.has(el.type))
    const currentMediaById = new Map<string, any>()
    currentMediaElements.forEach((el: any) => {
      if (el?.id) currentMediaById.set(el.id, el)
    })

    const usedMediaIds = new Set<string>()
    const mergedElements: any[] = []

    for (const el of snapshotSlide.elements || []) {
      if (MEDIA_ELEMENT_TYPES.has(el?.type)) {
        const currentMedia = el?.id ? currentMediaById.get(el.id) : null
        if (currentMedia) {
          mergedElements.push(currentMedia)
          usedMediaIds.add(el.id)
        }
      } else {
        mergedElements.push(el)
      }
    }

    for (const mediaEl of currentMediaElements) {
      if (!mediaEl?.id || usedMediaIds.has(mediaEl.id)) continue
      mergedElements.push(mediaEl)
    }

    return {
      ...snapshotSlide,
      elements: mergedElements,
    }
  })
}

export interface SnapshotState {
  snapshotCursor: number
  snapshotLength: number

  // Getters
  canUndo: boolean
  canRedo: boolean

  // Actions
  setSnapshotCursor: (cursor: number) => void
  setSnapshotLength: (length: number) => void
  initSnapshotDatabase: () => Promise<void>
  resetSnapshotDatabase: () => Promise<void>
  addSnapshot: () => Promise<void>
  unDo: () => Promise<void>
  reDo: () => Promise<void>
}

export const useSnapshotStore = create<SnapshotState>((set, get) => ({
  snapshotCursor: -1,
  snapshotLength: 0,

  // Getters
  get canUndo() {
    return get().snapshotCursor > 0
  },

  get canRedo() {
    return get().snapshotCursor < get().snapshotLength - 1
  },

  setSnapshotCursor: (cursor: number) => set({ snapshotCursor: cursor }),
  setSnapshotLength: (length: number) => set({ snapshotLength: length }),

  resetSnapshotDatabase: async () => {
    await db.snapshots.clear()
    set({ snapshotCursor: -1, snapshotLength: 0 })
  },

  initSnapshotDatabase: async () => {
    const slidesStore = useSlidesStore.getState()

    const newFirstSnapshot = {
      index: slidesStore.slideIndex,
      slides: JSON.parse(JSON.stringify(slidesStore.slides)),
      theme: JSON.parse(JSON.stringify(slidesStore.theme)),
    }
    await db.snapshots.add(newFirstSnapshot)
    set({ snapshotCursor: 0, snapshotLength: 1 })
  },

  addSnapshot: async () => {
    const slidesStore = useSlidesStore.getState()
    const state = get()

    // 获取当前indexeddb中全部快照的ID
    const allKeys = await db.snapshots.orderBy('id').keys()

    let needDeleteKeys: IndexableTypeArray = []

    // 记录需要删除的快照ID
    if (state.snapshotCursor >= 0 && state.snapshotCursor < allKeys.length - 1) {
      needDeleteKeys = allKeys.slice(state.snapshotCursor + 1)
    }

    // 添加新快照
    const snapshot = {
      index: slidesStore.slideIndex,
      slides: JSON.parse(JSON.stringify(slidesStore.slides)),
      theme: JSON.parse(JSON.stringify(slidesStore.theme)),
    }
    await db.snapshots.add(snapshot)

    // 计算当前快照长度
    let newSnapshotLength = allKeys.length - needDeleteKeys.length + 1

    // 快照数量超过长度限制时，应该将头部多余的快照删除
    const snapshotLengthLimit = 20
    if (newSnapshotLength > snapshotLengthLimit) {
      needDeleteKeys.push(allKeys[0])
      newSnapshotLength--
    }

    // 快照数大于1时，需要保证撤回操作后维持页面焦点不变
    if (newSnapshotLength >= 2) {
      db.snapshots.update(allKeys[newSnapshotLength - 2] as number, { index: slidesStore.slideIndex })
    }

    await db.snapshots.bulkDelete(needDeleteKeys as number[])

    set({ snapshotCursor: newSnapshotLength - 1, snapshotLength: newSnapshotLength })
  },

  unDo: async () => {
    const state = get()
    if (state.snapshotCursor <= 0) return

    const slidesStore = useSlidesStore.getState()
    const mainStore = useMainStore.getState()

    const newSnapshotCursor = state.snapshotCursor - 1
    const snapshots: Snapshot[] = await db.snapshots.orderBy('id').toArray()
    const snapshot = snapshots[newSnapshotCursor]
    const { index, slides, theme } = snapshot
    const mergedSlides = mergeSlidesIgnoringMedia(slides, slidesStore.slides)

    const slideIndex = index > slides.length - 1 ? slides.length - 1 : index

    slidesStore.setSlides(mergedSlides)
    slidesStore.updateSlideIndex(slideIndex)
    if (theme) {
      useSlidesStore.setState({ theme: JSON.parse(JSON.stringify(theme)) })
      PPTColorCalculator.clearCache()
    }
    set({ snapshotCursor: newSnapshotCursor })
    mainStore.setActiveElementIdList([])
  },

  reDo: async () => {
    const state = get()
    if (state.snapshotCursor >= state.snapshotLength - 1) return

    const slidesStore = useSlidesStore.getState()
    const mainStore = useMainStore.getState()

    const newSnapshotCursor = state.snapshotCursor + 1
    const snapshots: Snapshot[] = await db.snapshots.orderBy('id').toArray()
    const snapshot = snapshots[newSnapshotCursor]
    const { index, slides, theme } = snapshot
    const mergedSlides = mergeSlidesIgnoringMedia(slides, slidesStore.slides)

    const slideIndex = index > slides.length - 1 ? slides.length - 1 : index

    slidesStore.setSlides(mergedSlides)
    slidesStore.updateSlideIndex(slideIndex)
    if (theme) {
      useSlidesStore.setState({ theme: JSON.parse(JSON.stringify(theme)) })
      PPTColorCalculator.clearCache()
    }
    set({ snapshotCursor: newSnapshotCursor })
    mainStore.setActiveElementIdList([])
  },
}))

export default useSnapshotStore
