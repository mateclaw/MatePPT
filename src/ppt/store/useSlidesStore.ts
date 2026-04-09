/**
 * 幻灯片管理 Store (Zustand)
 * 页面、元素、主题、动画等数据管理
 */

import { create } from 'zustand'
import { omit } from 'lodash'
import { lastValueFrom } from 'rxjs'
import { PPTSlide, PPTTheme, PPTElement, Animation } from '../core'
import { usePptProjectStore } from '@/stores/pptProjectStore'
import { S3Service } from '@/services/s3.service'

interface RemovePropData {
  id: string
  propName: string | string[]
}

interface UpdateElementData {
  id: string | string[]
  props: Partial<PPTElement>
  slideId?: string
}

interface FormatedAnimation {
  animations: Animation[]
  autoNext: boolean
}

export interface SlidesState {
  // 状态
  title: string
  theme: PPTTheme
  slides: PPTSlide[]
  slideIndex: number
  viewportSize: number
  viewportRatio: number
  highlightAnnotatedElements: boolean
  // templates: SlideTemplate[]

  // Getters (作为方法返回)
  getCurrentSlide: () => PPTSlide | undefined
  getCurrentSlideAnimations: () => Animation[]
  getFormatedAnimations: () => FormatedAnimation[]

  // Actions
  setTitle: (title: string) => void
  setTheme: (themeProps: Partial<PPTTheme>) => void
  setViewportSize: (size: number) => void
  setViewportRatio: (viewportRatio: number) => void
  setHighlightAnnotatedElements: (value: boolean) => void
  setSlides: (slides: PPTSlide[]) => void
  // setTemplates: (templates: SlideTemplate[]) => void
  addSlide: (slide: PPTSlide | PPTSlide[]) => void
  updateSlide: (props: Partial<PPTSlide>, slideId?: string) => void
  removeSlideProps: (data: RemovePropData) => void
  deleteSlide: (slideId: string | string[]) => void
  updateSlideIndex: (index: number) => void
  addElement: (element: PPTElement | PPTElement[]) => void
  deleteElement: (elementId: string | string[]) => void
  updateElement: (data: UpdateElementData) => void
  removeElementProps: (data: RemovePropData) => void
}

const defaultTheme: PPTTheme = {
  // themeColors: {['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47']},
  // fontColor: '#333',
  // fontName: '',
  // backgroundColor: '#fff',
  // shadow: {
  //   h: 3,
  //   v: 3,
  //   blur: 2,
  //   color: '#808080',
  // },
  // outline: {
  //   width: 2,
  //   color: '#525252',
  //   style: 'solid',
  // },
} as PPTTheme

const s3service = S3Service.getInstance();

const shouldSkipMediaCleanup = () => {
  const { createMode, classicSlidesAllLoaded, creationSlidesAllLoaded } = usePptProjectStore.getState()
  if (createMode === 'classic' && !classicSlidesAllLoaded) return true
  if (createMode === 'creative' && !creationSlidesAllLoaded) return true
  return false
}

const collectAllMediaSrc = (slides: PPTSlide[]) => {
  const srcSet = new Set<string>()
  slides.forEach((slide) => {
    const elements = slide?.elements || []
    elements.forEach((el: any) => {
      if (['image', 'video', 'audio'].includes(el?.type) && el?.src) {
        srcSet.add(el.src)
      }
      if (el?.type === 'shape' && el?.picture?.src) {
        srcSet.add(el.picture.src)
      }
    })
    const bgSrc = (slide as any)?.background?.image?.src
    if (bgSrc) srcSet.add(bgSrc)
  })
  return srcSet
}

const tryDeleteMediaIfUnused = async (src: string, slideId?: number) => {
  if (!src || !slideId) return
  if (shouldSkipMediaCleanup()) return
  const { projectId } = usePptProjectStore.getState()
  if (!projectId) return
  try {
    await lastValueFrom(
      s3service.deletePptSlideElement({
        projectId,
        slideId,
        fileUrl: src,
      } as any),
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[media-cleanup] delete failed', { src, error })
  }
}

export const useSlidesStore = create<SlidesState>((set, get) => ({
  title: '未命名演示文稿',
  theme: defaultTheme,
  slides: [],
  slideIndex: 0,
  viewportSize: 1280,
  viewportRatio: 0.5625,
  highlightAnnotatedElements: false,
  templates: [
    // { name: '红色通用', id: 'template_1', cover: 'https://asset.pptist.cn/img/template_1.jpg' },
    // { name: '蓝色通用', id: 'template_2', cover: 'https://asset.pptist.cn/img/template_2.jpg' },
    // { name: '紫色通用', id: 'template_3', cover: 'https://asset.pptist.cn/img/template_3.jpg' },
    // { name: '莫兰迪配色', id: 'template_4', cover: 'https://asset.pptist.cn/img/template_4.jpg' },
  ],

  // Getters
  getCurrentSlide: () => {
    const { slides, slideIndex } = get()
    return slides[slideIndex]
  },

  getCurrentSlideAnimations: () => {
    const currentSlide = get().getCurrentSlide()
    if (!currentSlide?.animations) return []
    const els = currentSlide.elements
    const elIds = els.map(el => el.id)
    return currentSlide.animations.filter(animation => elIds.includes(animation.elId))
  },

  getFormatedAnimations: () => {
    const currentSlide = get().getCurrentSlide()
    if (!currentSlide?.animations) return []
    const els = currentSlide.elements
    const elIds = els.map(el => el.id)
    const animations = currentSlide.animations.filter(animation => elIds.includes(animation.elId))

    const formatted: FormatedAnimation[] = []
    for (const animation of animations) {
      if (animation.trigger === 'click' || !formatted.length) {
        formatted.push({ animations: [animation], autoNext: false })
      }
      else if (animation.trigger === 'meantime') {
        const last = formatted[formatted.length - 1]
        last.animations = last.animations.filter(item => item.elId !== animation.elId)
        last.animations.push(animation)
        formatted[formatted.length - 1] = last
      }
      else if (animation.trigger === 'auto') {
        const last = formatted[formatted.length - 1]
        last.autoNext = true
        formatted[formatted.length - 1] = last
        formatted.push({ animations: [animation], autoNext: false })
      }
    }
    return formatted
  },

  // Actions
  setTitle: (title: string) => set({
    title: title || '未命名演示文稿',
  }),

  setTheme: (themeProps: Partial<PPTTheme>) => set((state) => {
    const nextTheme = { ...state.theme, ...themeProps } as PPTTheme
    return { theme: nextTheme }
  }),

  setViewportSize: (size: number) => set({ viewportSize: size }),

  setViewportRatio: (viewportRatio: number) => set({ viewportRatio }),

  setHighlightAnnotatedElements: (value: boolean) => set({ highlightAnnotatedElements: value }),

  setSlides: (slides: PPTSlide[]) => set({ slides }),

  // setTemplates: (templates: SlideTemplate[]) => set({ templates }),

  addSlide: (slide: PPTSlide | PPTSlide[]) => set((state) => {
    const slidesToAdd = Array.isArray(slide) ? slide : [slide]
    const cleanSlides = slidesToAdd.map(s => {

      const { ...rest } = s
      return { ...rest, dirty: true } as PPTSlide
    })


    const addIndex = state.slideIndex + 1
    const newSlides = [...state.slides]
    newSlides.splice(addIndex, 0, ...cleanSlides)

    set({ slides: newSlides, slideIndex: addIndex })
    return { slides: newSlides, slideIndex: addIndex }
  }),

  updateSlide: (props: Partial<PPTSlide>, slideId?: string) => set((state) => {
    const targetSlideIndex = slideId
      ? state.slides.findIndex(item => item.id === slideId)
      : state.slideIndex
    const newSlides = [...state.slides]
    const previousSlide = newSlides[targetSlideIndex]
    const previousBgSrc = (previousSlide as any)?.background?.image?.src
    const nextSlide = new PPTSlide({ ...previousSlide, ...props, dirty: true })
    newSlides[targetSlideIndex] = nextSlide

    const nextBgSrc = (nextSlide as any)?.background?.image?.src
    if (previousBgSrc && previousBgSrc !== nextBgSrc) {
      const remaining = collectAllMediaSrc(newSlides)
      if (!remaining.has(previousBgSrc)) {
        const numericSlideId = (nextSlide as any)?.slideId as number | undefined
        queueMicrotask(() => {
          tryDeleteMediaIfUnused(previousBgSrc, numericSlideId)
        })
      }
    }

    return { slides: newSlides }
  }),

  removeSlideProps: (data: RemovePropData) => set((state) => {
    const { id, propName } = data
    return {
      slides: state.slides.map(slide => {
        return slide.id === id ? ({ ...omit(slide, propName), dirty: true } as PPTSlide) : slide
      }) as PPTSlide[],
    }
  }),

  deleteSlide: (slideId: string | string[]) => set((state) => {
    const slidesId = Array.isArray(slideId) ? slideId : [slideId]
    const newSlides: PPTSlide[] = JSON.parse(JSON.stringify(state.slides))
    const deleteSlidesIndex: number[] = []

    for (const deletedId of slidesId) {
      const index = newSlides.findIndex(item => item.id === deletedId)
      deleteSlidesIndex.push(index)

      // const deletedSlideSection = newSlides[index].sectionTag
      // if (deletedSlideSection) {
      //   const handleSlideNext = newSlides[index + 1]
      //   if (handleSlideNext && !handleSlideNext.sectionTag) {
      //     delete newSlides[index].sectionTag
      //     newSlides[index + 1].sectionTag = deletedSlideSection
      //   }
      // }

      newSlides.splice(index, 1)
    }

    let newIndex = Math.min(...deleteSlidesIndex)
    const maxIndex = newSlides.length - 1
    if (newIndex > maxIndex) newIndex = maxIndex

    return { slides: newSlides, slideIndex: newIndex }
  }),

  updateSlideIndex: (index: number) => set({ slideIndex: index }),

  addElement: (element: PPTElement | PPTElement[]) => set((state) => {
    const elements = Array.isArray(element) ? element : [element]
    const newSlides = [...state.slides]
    const targetSlide = newSlides[state.slideIndex]
    if (!targetSlide) return {}
    const currentSlideEls = targetSlide.elements || []
    newSlides[state.slideIndex] = new PPTSlide({
      ...targetSlide,
      elements: [...currentSlideEls, ...elements],
      dirty: true,
    })
    return { slides: newSlides }
  }),

  deleteElement: (elementId: string | string[]) => set((state) => {
    const elementIdList = Array.isArray(elementId) ? elementId : [elementId]
    const newSlides = [...state.slides]
    const targetSlide = newSlides[state.slideIndex]
    if (!targetSlide) return {}
    const currentSlideEls = targetSlide.elements || []
    newSlides[state.slideIndex] = new PPTSlide({
      ...targetSlide,
      elements: currentSlideEls.filter(item => !elementIdList.includes(item.id)),
      dirty: true,
    })
    return { slides: newSlides }
  }),

  updateElement: (data: UpdateElementData) => set((state) => {
    const { id, props, slideId } = data

    const elIdList = typeof id === 'string' ? [id] : id
    const newSlides = [...state.slides]
    const targetSlideIndex = slideId
      ? newSlides.findIndex(item => item.id === slideId)
      : state.slideIndex
    const slide = newSlides[targetSlideIndex]
    if (!slide) return {}
    let shouldAutoSaveMedia = false
    const hasSrcUpdate = Object.prototype.hasOwnProperty.call(props, 'src')
    const hasPictureUpdate = Object.prototype.hasOwnProperty.call(props, 'picture')
    const oldSrcMap = new Map<string, { src: string; type: string }>()
    const elements = (slide.elements || []).map(el => {
      if (!elIdList.includes(el.id)) return el
      if (
        hasSrcUpdate
        && (el as any).src !== (props as any).src
        && (el as any).type
        && ['image', 'video', 'audio'].includes((el as any).type)
      ) {
        shouldAutoSaveMedia = true
        if ((el as any).src) {
          oldSrcMap.set(el.id, { src: (el as any).src, type: (el as any).type })
        }
      }
      if (
        hasPictureUpdate
        && (el as any).type === 'shape'
        && (el as any).picture?.src
        && (props as any)?.picture?.src !== (el as any).picture?.src
      ) {
        oldSrcMap.set(`${el.id}:picture`, { src: (el as any).picture.src, type: 'shape-picture' })
      }
      return { ...el, ...props }
    })
    newSlides[targetSlideIndex] = new PPTSlide({
      ...slide,
      elements: elements as PPTElement[],
      dirty: true,
    })

    if (hasSrcUpdate && oldSrcMap.size) {
      const remaining = collectAllMediaSrc(newSlides)
      const numericSlideId = (slide as any)?.slideId as number | undefined
      oldSrcMap.forEach((entry) => {
        if (!remaining.has(entry.src)) {
          queueMicrotask(() => {
            tryDeleteMediaIfUnused(entry.src, numericSlideId)
          })
        }
      })
    }

    if (shouldAutoSaveMedia) {
      queueMicrotask(async () => {
        const { projectId, saveClassicSlidesToBackend } = usePptProjectStore.getState()
        if (!projectId) return
        const { slides, setSlides } = get()
        const currentSlide = slides.find(s => s.id === slide.id)
        if (!currentSlide) return
        try {
          await saveClassicSlidesToBackend(projectId, [currentSlide])
          const nextSlides = slides.map((s) =>
            s.id === slide.id ? ({ ...s, dirty: false } as PPTSlide) : s
          )
          setSlides(nextSlides)
        } catch (error) {
          console.error('[classic] auto save media slide failed:', error)
        }
      })
    }

    return { slides: newSlides }
  }),

  removeElementProps: (data: RemovePropData) => set((state) => {
    const { id, propName } = data
    const propsNames = typeof propName === 'string' ? [propName] : propName
    const newSlides = [...state.slides]
    const slide = newSlides[state.slideIndex]
    if (!slide) return {}
    const targetElement = (slide.elements || []).find(el => el.id === id) as any
    const previousPictureSrc =
      propsNames.includes('picture') && targetElement?.picture?.src
        ? targetElement.picture.src
        : undefined
    const elements = (slide.elements || []).map(el => {
      return el.id === id ? omit(el, propsNames) : el
    })
    newSlides[state.slideIndex] = new PPTSlide({
      ...slide,
      elements: elements as PPTElement[],
      dirty: true,
    })

    if (previousPictureSrc) {
      const remaining = collectAllMediaSrc(newSlides)
      if (!remaining.has(previousPictureSrc)) {
        const numericSlideId = (slide as any)?.slideId as number | undefined
        queueMicrotask(() => {
          tryDeleteMediaIfUnused(previousPictureSrc, numericSlideId)
        })
      }
    }
    return { slides: newSlides }
  }),
}))

export default useSlidesStore
