import {PPTDocument} from '@/ppt/core/entity/PPTDocument'
import {PPTSlide} from '@/ppt/core/entity/presentation/PPTSlide'
import {PPTTheme} from '@/ppt/core/entity/presentation/PPTTheme'
import {PPTMaster} from '@/ppt/core/entity/presentation/PPTMaster'
import {PPTLayout} from '@/ppt/core/entity/presentation/PPTLayout'
import {SlideParser} from './SlideParser'
import {ElementParser} from './ElementParser'
import {generateId} from '@/ppt/core/utils/id-generator'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720

export class DocumentParser {
    static parse(json: any): PPTDocument {
        const doc = new PPTDocument()
        doc.title = typeof json?.title === 'string' ? json.title : ''
        doc.width = this.numberOr(json?.width ?? json?.size?.width, DEFAULT_WIDTH)
        doc.height = this.numberOr(json?.height ?? json?.size?.height, DEFAULT_HEIGHT)
        doc.theme = this.parseTheme(json?.theme)
        doc.masters = this.parseMasters(json?.masters)
        doc.slides = this.parseSlides(json?.slides)
        return doc
    }

    private static parseTheme(json: any): PPTTheme | undefined {
        if (!json || typeof json !== 'object') return undefined
        return Object.assign(new PPTTheme(), json)
    }

    private static parseMasters(json: any): PPTMaster[] {
        if (!Array.isArray(json)) return []
        return json.map(item => this.parseMaster(item)).filter(Boolean) as PPTMaster[]
    }

    private static parseMaster(json: any): PPTMaster | undefined {
        if (!json || typeof json !== 'object') return undefined
        const master = new PPTMaster()
        master.id = typeof json.id === 'string' && json.id ? json.id : generateId('master')
        master.name = typeof json.name === 'string' ? json.name : undefined
        master.background = json.background
        master.elements = ElementParser.parseList(json.elements)
        master.layouts = this.parseLayouts(json.layouts)
        return master
    }

    private static parseLayouts(json: any): PPTLayout[] {
        if (!Array.isArray(json)) return []
        return json.map(item => this.parseLayout(item)).filter(Boolean) as PPTLayout[]
    }

    private static parseLayout(json: any): PPTLayout | undefined {
        if (!json || typeof json !== 'object') return undefined
        const layout = new PPTLayout()
        layout.id = typeof json.id === 'string' && json.id ? json.id : generateId('layout')
        layout.name = typeof json.name === 'string' ? json.name : undefined
        layout.layoutType = typeof json.layoutType === 'string' ? json.layoutType : undefined
        layout.background = json.background
        layout.followMasterBackground =
            typeof json.followMasterBackground === 'boolean' ? json.followMasterBackground : undefined
        layout.hideMasterShapes = typeof json.hideMasterShapes === 'boolean' ? json.hideMasterShapes : undefined
        layout.elements = ElementParser.parseList(json.elements)
        return layout
    }

    private static parseSlides(json: any): PPTSlide[] {
        if (!Array.isArray(json)) return []
        return json.map(item => SlideParser.parse(item)).filter(Boolean) as PPTSlide[]
    }

    private static numberOr(value: any, fallback: number): number {
        const n = Number(value)
        return Number.isFinite(n) && n > 0 ? n : fallback
    }
}
