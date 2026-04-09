// useActiveElementList.ts
import { useMemo } from 'react'
import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'
import { useShallow } from 'zustand/react/shallow'

// export const useActiveElementList = () => {

// }

export const useHandleElement = () => {

}

export const useActiveElementList = () => {
    const activeElementIdList = useMainStore(useShallow((s) => s.activeElementIdList))
    const { slides, slideIndex } = useSlidesStore(useShallow((s) => ({
        slides: s.slides,
        slideIndex: s.slideIndex,
    })))
    const currentSlide = useMemo(() => slides[slideIndex], [slides, slideIndex])

    const activeElementList = useMemo(() => {
        if (!currentSlide?.elements) return []
        return currentSlide.elements.filter(el => activeElementIdList.includes(el.id))
    }, [currentSlide, activeElementIdList])



    const handleElementId = useMainStore(useShallow((s) => s.handleElementId))
    

    const handleElement = useMemo(() => {
        if (!currentSlide?.elements) return null
        return currentSlide.elements.find(el => el.id === handleElementId) ?? null
    }, [currentSlide, handleElementId])

    return { activeElementList, handleElement }


}

