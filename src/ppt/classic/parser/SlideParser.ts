import { PPTSlide } from '@/ppt/core/entity/presentation/PPTSlide'
import { ElementParser } from './ElementParser'
import { generateId } from '@/ppt/core/utils/id-generator'

export class SlideParser {
    static parse(json: any): PPTSlide | undefined {
        if (!json || typeof json !== 'object') return undefined
        const slide = new PPTSlide()
        slide.id = typeof json.id === 'string' && json.id ? json.id : generateId('slide')
        // slide.layoutId = typeof json.layoutId === 'string' ? json.layoutId : undefined
        slide.background = json.background
        slide.type = typeof json.type === 'string' ? json.type : undefined
        slide.turningMode = typeof json.turningMode === 'string' ? json.turningMode : undefined
        slide.elements = ElementParser.parseList(json.elements)
        slide.animations = Array.isArray(json.animations) ? json.animations : []
        slide.transition = json.transition
        slide.remark = typeof json.remark === 'string' ? json.remark : undefined
        // slide.followMasterBackground =
        //     typeof json.followMasterBackground === 'boolean' ? json.followMasterBackground : undefined
        return slide
    }
}
