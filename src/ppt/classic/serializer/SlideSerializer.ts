import {PPTSlide} from '@/ppt/core/entity/presentation/PPTSlide'
import {ElementSerializer} from './ElementSerializer'

export class SlideSerializer {
    static serialize(slide: PPTSlide): Record<string, any> {

        return {
            id: slide.id,
            // layoutId: (slide as any).layoutId,
            background: slide.background,
            type: slide.type,
            turningMode: slide.turningMode,
            elements: ElementSerializer.serializeList(slide.elements),
            animations: slide.animations,
            transition: slide.transition,
            remark: slide.remark,
            // followMasterBackground: (slide as any).followMasterBackground,
        }
    }
}
