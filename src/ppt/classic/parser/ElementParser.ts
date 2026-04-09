import { Element } from '@/ppt/core/entity/element/Element'
import { PPTElement } from "@/ppt/core";
import { TextElement } from '@/ppt/core/entity/element/TextElement'
import { ShapeElement } from '@/ppt/core/entity/element/ShapeElement'
import { ImageElement } from '@/ppt/core/entity/element/ImageElement'
import { LineElement } from '@/ppt/core/entity/element/LineElement'
import { ChartElement } from '@/ppt/core/entity/element/ChartElement'
import { TableElement } from '@/ppt/core/entity/element/TableElement'
import { MathElement } from '@/ppt/core/entity/element/MathElement'
import { VideoElement } from '@/ppt/core/entity/element/VideoElement'
import { AudioElement } from '@/ppt/core/entity/element/AudioElement'
import { generateId } from '@/ppt/core/utils/id-generator'



export class ElementParser {
    static parseList(json: any): PPTElement[] {
        if (!Array.isArray(json)) return []
        return json.map(item => this.parse(item)).filter(Boolean) as PPTElement[]
    }

    static parse(json: any): PPTElement | undefined {
        if (!json || typeof json !== 'object') return undefined


        switch (json.type) {
            case 'text':
                return this.parseText(json)
            case 'shape':
                return this.parseShape(json)
            case 'image':
                return this.parseImage(json)
            case 'line':
                return this.parseLine(json)
            case 'chart':
                return this.parseChart(json)
            case 'table':
                return this.parseTable(json)
            case 'math':
                return this.parseMath(json)
            case 'video':
                return this.parseVideo(json)
            case 'audio':
                return this.parseAudio(json)
            // 下面两个类型前端没有
            // case 'group':
            //   return this.parseGroup(json)
            // case 'smartart':
            //   return this.parseSmartArt(json)
            default:
                return this.parseShape(json)
        }
    }

    private static parseText(json: any): TextElement {
        const element = this.parseBase(new TextElement(json), json)

        element.vertical = (!json.verticalType || json.verticalType === 'horizontal') ? false : true;
        // element.content = typeof json.content === 'string' ? json.content : ''
        // element.fontName = json.defaultFontName
        // element.fontColor = json.defaultColor
        // element.fontGradient = json.fontGradient
        // element.fontSize = this.numberOr(json.defaultFontSize, undefined)
        // element.vertical = typeof json.vertical === 'boolean' ? json.vertical : undefined
        // element.verticalType = json.verticalType
        // element.fill = json.fill
        // element.gradient = json.gradient
        // element.wordSpace = this.numberOr(json.wordSpace, undefined)
        // element.lineHeight = this.numberOr(json.lineHeight, undefined)
        // element.paragraphSpace = this.numberOr(json.paragraphSpace, undefined)
        // element.alignH = json.align
        // element.alignV = json.verticalAlign
        // element.autoFit = json.autoFit
        // element.wrapText = typeof json.wrapText === 'boolean' ? json.wrapText : undefined
        // element.labelType = json.labelType
        // element.marginLeft = this.numberOr(json.marginLeft, undefined)
        // element.marginRight = this.numberOr(json.marginRight, undefined)
        // element.marginTop = this.numberOr(json.marginTop, undefined)
        // element.marginBottom = this.numberOr(json.marginBottom, undefined)
        // element.textRotation = this.numberOr(json.textRotation, undefined)
        return element
    }

    private static parseShape(json: any): ShapeElement {
        const element = this.parseBase(new ShapeElement(json), json)
        // 现在形状没有竖排
        // if (element.text) {
        //     element.text.vertical = (!json.verticalType || json.verticalType === 'horizontal') ? true : true;
        // }
        // element.viewBox = this.numberArray(json.viewBox)
        // element.path = json.path
        // element.fill = json.fill
        // element.gradient = json.gradient
        // element.picture = json.picture
        // element.pattern = json.pattern
        // element.fixedRatio = typeof json.fixedRatio === 'boolean' ? json.fixedRatio : undefined
        // element.category = json.category
        // element.pathFormula = json.pathFormula
        // element.keypoints = this.numberArray(json.keypoints)
        // element.text = json.text
        // element.labelType = json.labelType
        return element
    }

    private static parseImage(json: any): ImageElement {
        const element = this.parseBase(new ImageElement(json), json)
        // element.src = json.src
        // element.fixedRatio = typeof json.fixedRatio === 'boolean' ? json.fixedRatio : undefined
        // element.clip = json.clip
        // element.radius = this.numberOr(json.radius, undefined)
        // element.colorMask = json.colorMask
        // element.colorMask2 = json.colorMask2
        // element.filters = json.filters
        // element.labelType = json.labelType
        return element
    }

    private static parseLine(json: any): LineElement {
        const element = this.parseBase(new LineElement(json), json)
        // element.start = this.numberArray(json.start)
        // element.end = this.numberArray(json.end)
        // element.points = Array.isArray(json.points) ? json.points : undefined
        // element.color = json.color
        // element.style = json.style
        // element.gradient = json.gradient
        // element.curve = this.numberArray(json.curve)
        // element.broken = this.numberArray(json.broken)
        // element.broken2 = this.numberArray(json.broken2)
        // element.cubic = Array.isArray(json.cubic) ? json.cubic : undefined
        // element.strokeWidth = this.numberOr(json.strokeWidth, undefined)

        return element
    }

    private static parseChart(json: any): ChartElement {
        const element = this.parseBase(new ChartElement(json), json)
        // element.chartType = json.chartType
        // element.title = json.title
        // element.themeColors = Array.isArray(json.themeColors) ? json.themeColors : undefined

        // element.data = json.data
        // element.options = json.options
        // element.fill = json.fill
        // element.lineColor = json.lineColor
        // element.lineWidth = this.numberOr(json.lineWidth, undefined)
        // element.style = json.style
        return element
    }

    private static parseTable(json: any): TableElement {
        const element = this.parseBase(new TableElement(json), json)
        // element.colWidths = this.numberArray(json.colWidths)
        // element.rowHeights = this.numberArray(json.rowHeights)
        // element.data = Array.isArray(json.data) ? json.data : []
        // element.theme = json.theme
        // element.cellMinHeight = this.numberOr(json.cellMinHeight, undefined)
        return element
    }

    private static parseMath(json: any): MathElement {
        const element = this.parseBase(new MathElement(json), json)
        return element
    }

    private static parseVideo(json: any): VideoElement {
        const element = this.parseBase(new VideoElement(json), json)
        // element.src = json.src
        // element.autoplay = typeof json.autoplay === 'boolean' ? json.autoplay : undefined
        // element.poster = json.poster
        // element.ext = json.ext
        return element
    }

    private static parseAudio(json: any): AudioElement {
        const element = this.parseBase(new AudioElement(json), json)
        // element.fixedRatio = typeof json.fixedRatio === 'boolean' ? json.fixedRatio : undefined
        // element.color = json.color
        // element.loop = typeof json.loop === 'boolean' ? json.loop : undefined
        // element.autoplay = typeof json.autoplay === 'boolean' ? json.autoplay : undefined
        // element.src = json.src
        // element.ext = json.ext
        return element
    }

    // private static parseGroup(json: any): GroupElement {
    //     const element = this.parseBase(new GroupElement(), json)
    //     element.elements = this.parseList(json.elements)
    //     return element
    // }

    // private static parseSmartArt(json: any): SmartArtElement {
    //     const element = this.parseBase(new SmartArtElement(), json)
    //     element.viewBox = this.numberArray(json.viewBox)
    //     element.path = json.path
    //     element.fill = json.fill
    //     element.gradient = json.gradient
    //     element.picture = json.picture
    //     element.pattern = json.pattern
    //     element.fixedRatio = typeof json.fixedRatio === 'boolean' ? json.fixedRatio : undefined
    //     element.category = json.category
    //     element.pathFormula = json.pathFormula
    //     element.keypoints = this.numberArray(json.keypoints)
    //     element.text = json.text
    //     element.labelType = json.labelType
    //     return element
    // }

    private static parseBase<T extends PPTElement>(element: T, json: any): T {
        element.id = typeof json.id === 'string' && json.id ? json.id : generateId('el')
        // element.left = this.numberOr(json.left, 0)
        // element.top = this.numberOr(json.top, 0)
        // element.width = this.numberOr(json.width, 1)
        // element.height = this.numberOr(json.height, 1)
        // element.rotate = this.numberOr(json.rotate, undefined)
        // element.outline = json.outline
        // element.shadow = json.shadow
        // element.link = json.link
        // element.opacity = this.numberOr(json.opacity, undefined)
        // element.flipH = typeof json.flipH === 'boolean' ? json.flipH : undefined
        // element.flipV = typeof json.flipV === 'boolean' ? json.flipV : undefined
        // element.lock = typeof json.lock === 'boolean' ? json.lock : undefined
        // element.name = typeof json.name === 'string' ? json.name : undefined
        // element.groupId = typeof json.groupId === 'string' ? json.groupId : undefined
        // element.order = this.numberOr(json.order, undefined)
        // element.inherited = typeof json.inherited === 'boolean' ? json.inherited : undefined
        return element
    }

    private static numberArray(value: any): number[] | undefined {
        if (!Array.isArray(value)) return undefined
        const result = value.map(v => Number(v)).filter(num => Number.isFinite(num))
        return result.length ? result : undefined
    }

    private static numberOr(value: any, fallback: number | undefined): number | undefined {
        if (typeof value === 'number' && Number.isFinite(value)) return value
        if (fallback === undefined) return undefined
        return fallback
    }

}
