import {Element} from '@/ppt/core/entity/element/Element'
import {TextElement} from '@/ppt/core/entity/element/TextElement'
import {ShapeElement} from '@/ppt/core/entity/element/ShapeElement'
import {ImageElement} from '@/ppt/core/entity/element/ImageElement'
import {LineElement} from '@/ppt/core/entity/element/LineElement'
import {ChartElement} from '@/ppt/core/entity/element/ChartElement'
import {TableElement} from '@/ppt/core/entity/element/TableElement'
import {MathElement} from '@/ppt/core/entity/element/MathElement'
import {VideoElement} from '@/ppt/core/entity/element/VideoElement'
import {AudioElement} from '@/ppt/core/entity/element/AudioElement'

export class ElementSerializer {
    static serializeList(elements: Element[] = []): any[] {
        return elements.map(el => this.serialize(el))
    }

    static serialize(element: Element): Record<string, any> {
        const base = this.serializeBase(element)

        switch (element.type) {
            case 'text':
                return {...base, ...this.serializeText(element as TextElement)}
            case 'shape':
                return {...base, ...this.serializeShape(element as ShapeElement)}
            case 'image':
                return {...base, ...this.serializeImage(element as ImageElement)}
            case 'line':
                return {...base, ...this.serializeLine(element as LineElement)}
            case 'chart':
                return {...base, ...this.serializeChart(element as ChartElement)}
            case 'table':
                return {...base, ...this.serializeTable(element as TableElement)}
            case 'math':
                return {...base, ...this.serializeMath(element as MathElement)}
            case 'video':
                return {...base, ...this.serializeVideo(element as VideoElement)}
            case 'audio':
                return {...base, ...this.serializeAudio(element as AudioElement)}
            // 下面两个类型前端没有
            // case 'group':
            //   return { ...base, elements: this.serializeList((element as GroupElement).elements) }
            // case 'smartart':
            //   return { ...base, ...this.serializeShape(element as SmartArtElement) }
            default:
                return base
        }
    }

    private static serializeBase(element: Element) {
        return {
            id: element.id,
            type: element.type,
            left: element.left,
            top: element.top,
            width: element.width,
            height: element.height,
            rotate: element.rotate,
            outline: element.outline,
            shadow: element.shadow,
            link: element.link,
            opacity: element.opacity,
            flipH: element.flipH,
            flipV: element.flipV,
            lock: element.lock,
            name: element.name,
            groupId: element.groupId,
            order: element.order,
            inherited: element.inherited,
        }
    }

    private static serializeText(element: TextElement) {
        const fontGradient = element.fontGradient
        return {
            content: element.content,
            fontName: element.fontName,
            fontColor: element.fontColor,
            fontSize: element.fontSize,
            ...(fontGradient ? { fontGradient } : {}),
            vertical: element.vertical,
            verticalType: element.verticalType,
            fill: element.fill,
            gradient: element.gradient,
            wordSpace: element.wordSpace,
            lineHeight: element.lineHeight,
            paragraphSpace: element.paragraphSpace,
            alignH: element.alignH,
            alignV: element.alignV,
            autoFit: element.autoFit,
            wrapText: element.wrapText,
            labelType: element.labelType,
            marginLeft: element.marginLeft,
            marginRight: element.marginRight,
            marginTop: element.marginTop,
            marginBottom: element.marginBottom,
            textRotation: element.textRotation,
        }
    }

    private static serializeShape(element: ShapeElement) {
        return {
            viewBox: element.viewBox,
            path: element.path,
            fill: element.fill,
            gradient: element.gradient,
            picture: element.picture,
            pattern: element.pattern,
            fixedRatio: element.fixedRatio,
            category: element.category,
            pathFormula: element.pathFormula,
            keypoints: element.keypoints,
            text: element.text,
            labelType: element.labelType,
        }
    }

    private static serializeImage(element: ImageElement) {
        return {
            src: element.src,
            fixedRatio: element.fixedRatio,
            clip: element.clip,
            radius: element.radius,
            colorMask: element.colorMask,
            colorMask2: element.colorMask2,
            filters: element.filters,
            labelType: element.labelType,
        }
    }

    private static serializeLine(element: LineElement) {
        return {
            start: element.start,
            end: element.end,
            points: element.points,
            color: element.color,
            style: element.style,
            gradient: element.gradient,
            curve: element.curve,
            broken: element.broken,
            broken2: element.broken2,
            cubic: element.cubic,
            strokeWidth: element.strokeWidth,
            // shapeType: element.shapeType,
        }
    }

    private static serializeChart(element: ChartElement) {
        return {
            chartType: element.chartType,
            title: element.title,
            themeColors: element.themeColors,
            // textColor: element.textColor,
            data: element.data,
            options: element.options,
            fill: element.fill,
            lineColor: element.lineColor,
            lineWidth: element.lineWidth,
            style: element.style,
        }
    }

    private static serializeTable(element: TableElement) {
        return {
            colWidths: element.colWidths,
            rowHeights: element.rowHeights,
            data: element.data,
            theme: element.theme,
            cellMinHeight: element.cellMinHeight,
        }
    }

    private static serializeMath(element: MathElement) {
        return {
            latex: element.latex,
            mathML: element.mathML,
            picBase64: element.picBase64,
            text: element.text,
            fontName: element.fontName,
            fontSize: element.fontSize,
            path: element.path,
            color: element.color,
            strokeWidth: element.strokeWidth,
            viewBox: element.viewBox,
            fixedRatio: element.fixedRatio,
        }
    }

    private static serializeVideo(element: VideoElement) {
        return {
            src: element.src,
            autoplay: element.autoplay,
            poster: element.poster,
            ext: element.ext,
        }
    }

    private static serializeAudio(element: AudioElement) {
        return {
            fixedRatio: element.fixedRatio,
            color: element.color,
            loop: element.loop,
            autoplay: element.autoplay,
            src: element.src,
            ext: element.ext,
        }
    }
}
