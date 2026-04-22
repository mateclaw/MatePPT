import { Element } from '@/ppt/core/entity/element/Element'
import { PPTElement } from '@/ppt/core'
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
        return json.map((item) => this.parse(item)).filter(Boolean) as PPTElement[]
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
            case 'latex':
                return this.parseMath(json)
            case 'video':
                return this.parseVideo(json)
            case 'audio':
                return this.parseAudio(json)
            default:
                return this.parseShape(json)
        }
    }

    private static normalizeVerticalAlign(value: any): string | undefined {
        if (typeof value !== 'string') return undefined
        const normalized = value.toLowerCase()
        if (normalized === 'up' || normalized === 'top') return 'top'
        if (normalized === 'mid' || normalized === 'middle' || normalized === 'center') return 'middle'
        if (normalized === 'down' || normalized === 'bottom') return 'bottom'
        return value
    }

    private static parseText(json: any): TextElement {
        const element = this.parseBase(new TextElement(json), json)

        element.content = typeof json.content === 'string' ? json.content : element.content
        element.fontName = typeof json.fontName === 'string'
            ? json.fontName
            : (typeof json.defaultFontName === 'string' ? json.defaultFontName : element.fontName)
        element.fontColor = json.fontColor || json.defaultColor || element.fontColor
        element.fontGradient = json.fontGradient || element.fontGradient
        element.fontSize = this.numberOr(json.fontSize ?? json.defaultFontSize, element.fontSize)
        element.vertical = typeof json.vertical === 'boolean'
            ? json.vertical
            : ((!json.verticalType || json.verticalType === 'horizontal') ? false : true)
        element.verticalType = typeof json.verticalType === 'string'
            ? json.verticalType
            : (typeof json.textVerticalType === 'string' ? json.textVerticalType : element.verticalType)
        element.fill = json.fill || element.fill
        element.gradient = json.gradient || element.gradient
        element.wordSpace = this.numberOr(json.wordSpace, element.wordSpace)
        element.lineHeight = this.numberOr(json.lineHeight, element.lineHeight)
        element.paragraphSpace = this.numberOr(json.paragraphSpace, element.paragraphSpace)
        element.alignH = typeof json.alignH === 'string'
            ? json.alignH
            : (typeof json.align === 'string'
                ? json.align
                : (typeof json.textAlignment === 'string' ? json.textAlignment : element.alignH))
        element.alignV = this.normalizeVerticalAlign(
            typeof json.alignV === 'string'
                ? json.alignV
                : (typeof json.vAlign === 'string'
                    ? json.vAlign
                    : (typeof json.verticalAlign === 'string'
                        ? json.verticalAlign
                        : (typeof json.textAnchorType === 'string' ? json.textAnchorType : element.alignV)))
        ) || element.alignV
        element.autoFit = typeof json.autoFit === 'string'
            ? json.autoFit
            : (typeof json.textAutofitType === 'string' ? json.textAutofitType : element.autoFit)
        element.wrapText = typeof json.wrapText === 'boolean'
            ? json.wrapText
            : (typeof json.textAutofitType === 'string' ? json.textAutofitType !== 'none' : element.wrapText)
        element.labelType = typeof json.labelType === 'string'
            ? json.labelType
            : (typeof json.textType === 'string' ? json.textType : element.labelType)
        element.marginLeft = this.numberOr(json.marginLeft, element.marginLeft)
        element.marginRight = this.numberOr(json.marginRight, element.marginRight)
        element.marginTop = this.numberOr(json.marginTop, element.marginTop)
        element.marginBottom = this.numberOr(json.marginBottom, element.marginBottom)
        element.textRotation = this.numberOr(json.textRotation, element.textRotation)
        return element
    }

    private static parseShape(json: any): ShapeElement {
        const element = this.parseBase(new ShapeElement(json), json)
        element.viewBox = this.numberArray(json.viewBox)
        element.path = typeof json.path === 'string' ? json.path : element.path
        element.fill = json.fill || element.fill
        element.gradient = json.gradient || element.gradient
        element.picture = json.picture || element.picture
        element.pattern = json.pattern || element.pattern
        element.fixedRatio = typeof json.fixedRatio === 'boolean' ? json.fixedRatio : element.fixedRatio
        element.category = typeof json.category === 'string' ? json.category : element.category
        element.pathFormula = typeof json.pathFormula === 'string' ? json.pathFormula : element.pathFormula
        element.keypoints = this.numberArray(json.keypoints)
        if (json.text && typeof json.text === 'object') {
            const text = { ...json.text }
            if (typeof text.verticalType !== 'string' && typeof text.textVerticalType === 'string') {
                text.verticalType = text.textVerticalType
            }
            if (typeof text.alignH !== 'string' && typeof text.align === 'string') {
                text.alignH = text.align
            }
            if (typeof text.alignH !== 'string' && typeof text.textAlignment === 'string') {
                text.alignH = text.textAlignment
            }
            if (typeof text.alignV !== 'string' && typeof text.vAlign === 'string') {
                text.alignV = text.vAlign
            }
            if (typeof text.alignV !== 'string' && typeof text.verticalAlign === 'string') {
                text.alignV = text.verticalAlign
            }
            if (typeof text.alignV !== 'string' && typeof text.textAnchorType === 'string') {
                text.alignV = text.textAnchorType
            }
            if (typeof text.autoFit !== 'string' && typeof text.textAutofitType === 'string') {
                text.autoFit = text.textAutofitType
            }
            if (typeof text.wrapText !== 'boolean' && typeof text.textAutofitType === 'string') {
                text.wrapText = text.textAutofitType !== 'none'
            }
            element.text = text
        }
        else {
            element.text = element.text
        }
        element.labelType = typeof json.labelType === 'string'
            ? json.labelType
            : (typeof json.textType === 'string' ? json.textType : element.labelType)
        return element
    }

    private static parseImage(json: any): ImageElement {
        const element = this.parseBase(new ImageElement(json), json)
        element.src = typeof json.src === 'string' ? json.src : element.src
        element.fixedRatio = typeof json.fixedRatio === 'boolean' ? json.fixedRatio : element.fixedRatio
        element.clip = json.clip || element.clip
        element.radius = this.numberOr(json.radius, element.radius)
        element.colorMask = json.colorMask || element.colorMask
        element.colorMask2 = json.colorMask2 || element.colorMask2
        element.filters = json.filters || element.filters
        element.labelType = typeof json.labelType === 'string'
            ? json.labelType
            : (typeof json.textType === 'string' ? json.textType : element.labelType)
        return element
    }

    private static parseLine(json: any): LineElement {
        const element = this.parseBase(new LineElement(json), json)
        element.start = this.numberArray(json.start)
        element.end = this.numberArray(json.end)
        element.points = Array.isArray(json.points) ? json.points : element.points
        element.color = json.color || element.color
        element.style = typeof json.style === 'string' ? json.style : element.style
        element.gradient = json.gradient || element.gradient
        element.curve = this.numberArray(json.curve)
        element.broken = this.numberArray(json.broken)
        element.broken2 = this.numberArray(json.broken2)
        element.cubic = Array.isArray(json.cubic) ? json.cubic : element.cubic
        element.strokeWidth = this.numberOr(json.strokeWidth, element.strokeWidth)
        return element
    }

    private static parseChart(json: any): ChartElement {
        const element = this.parseBase(new ChartElement(json), json)
        element.chartType = typeof json.chartType === 'string' ? json.chartType : element.chartType
        element.title = typeof json.title === 'string' ? json.title : element.title
        element.themeColors = Array.isArray(json.themeColors) ? json.themeColors : element.themeColors
        element.themeFollowSlide = typeof json.themeFollowSlide === 'boolean' ? json.themeFollowSlide : element.themeFollowSlide
        element.data = json.data || element.data
        element.options = json.options || element.options
        element.fill = typeof json.fill === 'string' ? json.fill : element.fill
        element.lineColor = json.lineColor || element.lineColor
        element.lineWidth = this.numberOr(json.lineWidth, element.lineWidth)
        element.style = json.style || element.style
        return element
    }

    private static parseTable(json: any): TableElement {
        const element = this.parseBase(new TableElement(json), json)
        element.colWidths = this.numberArray(json.colWidths)
        element.rowHeights = this.numberArray(json.rowHeights)
        element.data = Array.isArray(json.data) ? json.data : element.data
        element.theme = json.theme || element.theme
        element.cellMinHeight = this.numberOr(json.cellMinHeight, element.cellMinHeight)
        return element
    }

    private static parseMath(json: any): MathElement {
        const element = this.parseBase(new MathElement(json), json)
        element.latex = typeof json.latex === 'string' ? json.latex : element.latex
        element.mathML = typeof json.mathML === 'string' ? json.mathML : element.mathML
        element.picBase64 = typeof json.picBase64 === 'string' ? json.picBase64 : element.picBase64
        element.text = typeof json.text === 'string' ? json.text : element.text
        element.fontName = typeof json.fontName === 'string' ? json.fontName : element.fontName
        element.fontSize = this.numberOr(json.fontSize, element.fontSize)
        element.path = typeof json.path === 'string' ? json.path : element.path
        element.color = json.color || element.color
        element.strokeWidth = this.numberOr(json.strokeWidth, element.strokeWidth)
        element.viewBox = this.numberArray(json.viewBox)
        element.fixedRatio = typeof json.fixedRatio === 'boolean' ? json.fixedRatio : element.fixedRatio
        return element
    }

    private static parseVideo(json: any): VideoElement {
        const element = this.parseBase(new VideoElement(json), json)
        element.src = typeof json.src === 'string' ? json.src : element.src
        element.autoplay = typeof json.autoplay === 'boolean' ? json.autoplay : element.autoplay
        element.poster = typeof json.poster === 'string' ? json.poster : element.poster
        element.ext = typeof json.ext === 'string' ? json.ext : element.ext
        return element
    }

    private static parseAudio(json: any): AudioElement {
        const element = this.parseBase(new AudioElement(json), json)
        element.fixedRatio = typeof json.fixedRatio === 'boolean' ? json.fixedRatio : element.fixedRatio
        element.color = json.color || element.color
        element.loop = typeof json.loop === 'boolean' ? json.loop : element.loop
        element.autoplay = typeof json.autoplay === 'boolean' ? json.autoplay : element.autoplay
        element.src = typeof json.src === 'string' ? json.src : element.src
        element.ext = typeof json.ext === 'string' ? json.ext : element.ext
        return element
    }

    private static parseBase<T extends PPTElement>(element: T, json: any): T {
        element.id = typeof json.id === 'string' && json.id ? json.id : generateId('el')
        return element
    }

    private static numberArray(value: any): number[] | undefined {
        if (!Array.isArray(value)) return undefined
        const result = value.map((v) => Number(v)).filter((num) => Number.isFinite(num))
        return result.length ? result : undefined
    }

    private static numberOr(value: any, fallback: number | undefined): number | undefined {
        if (typeof value === 'number' && Number.isFinite(value)) return value
        return fallback
    }
}
