// useSectionHandler.ts
import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { nanoid } from 'nanoid'
import cloneDeep from 'lodash/cloneDeep'
import { useSlidesStore } from '@/ppt/store'        // 这里假设你已经用 zustand 建好了 slides 的 store
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import useSlideHandler from '@/ppt/hooks/useSlideHandler'

/**
 * React 版章节操作 Hook
 * 对应原来的 Pinia 版本：
 *   - createSection
 *   - removeSection
 *   - removeAllSection
 *   - removeSectionSlides
 *   - updateSectionTitle
 */
const useSectionHandler = () => {
  // 从 zustand 中取出 slides 和操作方法
  const {
    slides,
    updateSlide,
    removeSlideProps,
    setSlides,
  } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      updateSlide: state.updateSlide,
      removeSlideProps: state.removeSlideProps,
      setSlides: state.setSlides,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()
  const { deleteSlide } = useSlideHandler()

  /**
   * 创建一个新的 section（在当前页），和原逻辑一致
   */
  const createSection = useCallback(() => {
    updateSlide({
      // sectionTag: {
      //   id: nanoid(6),
      // },
    })
    addHistorySnapshot()
  }, [updateSlide, addHistorySnapshot])

  /**
   * 删除某个 section 标记（不删整段幻灯片）
   */
  const removeSection = useCallback(
    (sectionId: string) => {
      if (!sectionId) return

      const slide = slides.find((s) => s.sectionTag?.id === sectionId)
      if (!slide) return

      removeSlideProps({
        id: slide.id,
        propName: 'sectionTag',
      })
      addHistorySnapshot()
    },
    [slides, removeSlideProps, addHistorySnapshot],
  )

  /**
   * 删除所有 sectionTag（保留所有 slide）
   * 这里使用 lodash.cloneDeep 做深拷贝，避免直接改 zustand 里的引用
   */
  const removeAllSection = useCallback(() => {
    // 深拷贝 slides，再在副本上删 sectionTag
    const clonedSlides = cloneDeep(slides)

    const nextSlides = clonedSlides.map((slide: any) => {
      if (slide.sectionTag) {
        delete slide.sectionTag
      }
      return slide
    })

    setSlides(nextSlides)
    addHistorySnapshot()
  }, [slides, setSlides, addHistorySnapshot])

  /**
   * 删除某个 section 下的所有幻灯片（包括该 section 的起始页）
   * sectionId 不传时，从 0 开始删，直到遇到下一个 sectionTag
   */
  const removeSectionSlides = useCallback(
    (sectionId?: string) => {
      let startIndex = 0

      if (sectionId) {
        const sectionIndex = slides.findIndex(
          (slide) => slide.sectionTag?.id === sectionId,
        )
        if (sectionIndex !== -1) {
          startIndex = sectionIndex
        }
      }

      const ids: string[] = []

      for (let i = startIndex; i < slides.length; i++) {
        const slide = slides[i]
        // 一旦遇到下一个 section 的开始，就停
        if (i !== startIndex && slide.sectionTag) break

        ids.push(slide.id)
      }

      deleteSlide(ids)
    },
    [slides, deleteSlide],
  )

  /**
   * 更新 section 标题
   * - sectionId === 'default' 时，对第一张 slide 的 sectionTag 赋值
   * - 否则找到对应 sectionTag.id 的 slide 更新 title
   */
  const updateSectionTitle = useCallback(
    (sectionId: string, title: string) => {
      if (!title) return

      // 默认章节：给第一张 slide 设置一个新的 sectionTag
      if (sectionId === 'default') {
        if (!slides[0]) return

        updateSlide(
          {
            sectionTag: {
              id: nanoid(6),
              title,
            },
          },
          slides[0].id,
        )
      }
      else {
        const slide = slides.find((s) => s.sectionTag?.id === sectionId)
        if (!slide || !slide.sectionTag) return

        updateSlide(
          {
            sectionTag: {
              ...slide.sectionTag,
              title,
            },
          },
          slide.id,
        )
      }

      addHistorySnapshot()
    },
    [slides, updateSlide, addHistorySnapshot],
  )

  return {
    createSection,
    removeSection,
    removeAllSection,
    removeSectionSlides,
    updateSectionTitle,
  }
}

export default useSectionHandler
