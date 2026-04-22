import type { PPTSlide, PPTElement, ChartType } from '@/ppt/core'
import type { Background } from '@/ppt/core/entity/attribute/Background'
import type { Gradient } from '@/ppt/core/entity/attribute/Gradient'
import { ShapeCategory } from '@/ppt/core/entity/attribute/ShapeCategory'
import type { TextElement } from '@/ppt/core/entity/element/TextElement'
import type { ShapeElement } from '@/ppt/core/entity/element/ShapeElement'
import type { ImageElement } from '@/ppt/core/entity/element/ImageElement'
import type { LineElement } from '@/ppt/core/entity/element/LineElement'
import type { TableElement } from '@/ppt/core/entity/element/TableElement'
import type { ChartElement } from '@/ppt/core/entity/element/ChartElement'
import type { MathElement } from '@/ppt/core/entity/element/MathElement'
import type { VideoElement } from '@/ppt/core/entity/element/VideoElement'
import type { AudioElement } from '@/ppt/core/entity/element/AudioElement'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { SHAPE_PATH_FORMULAS } from '@/ppt/configs/shapes'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import tinycolor from 'tinycolor2'

declare global {
  interface Window {
    PptxGenJS?: any
  }
}

type ExportOptions = {
  title: string
  width?: number
  height?: number
  masterOverwrite: boolean
  ignoreMedia: boolean
}

const PX_PER_IN = 96

const toIn = (value: number) => value / PX_PER_IN

const toNumber = (value: unknown, fallback = 0) => {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

const normalizeHex = (value?: string) => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const normalized = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed
  if (/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(normalized)) {
    return normalized.toUpperCase()
  }
  return undefined
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const colorWithTransparency = (value?: unknown) => {
  const resolved = resolvePPTColorValue(value as any, useSlidesStore.getState().theme?.themeColors)
  const normalized = normalizeHex(resolved)
  if (!normalized) return undefined
  if (normalized.length === 8) {
    return {
      color: normalized.slice(0, 6),
      transparency: Math.max(0, Math.min(100, Math.round((1 - parseInt(normalized.slice(6, 8), 16) / 255) * 100))),
    }
  }
  return { color: normalized.slice(0, 6) }
}

const colorToSvg = (value?: unknown) => {
  const resolved = colorWithTransparency(value)
  if (!resolved) {
    return { color: 'none', opacity: 1 }
  }
  return {
    color: `#${resolved.color}`,
    opacity: resolved.transparency !== undefined ? Math.max(0, Math.min(1, 1 - resolved.transparency / 100)) : 1,
  }
}

const getTextFromHtml = (html?: string) => {
  if (!html) return ''
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, ' ')
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.innerText || div.textContent || '').replace(/\u00a0/g, ' ').trim()
}

type PptxTextRun = {
  text: string
  options?: Record<string, any>
}

const blockTags = new Set([
  'p',
  'div',
  'section',
  'article',
  'header',
  'footer',
  'blockquote',
  'li',
  'ul',
  'ol',
])

const normalizeCssColor = (value?: string) => {
  if (!value) return undefined
  const parsed = tinycolor(value)
  if (!parsed.isValid()) return undefined
  const hex = parsed.toHex().toUpperCase()
  const alpha = Math.round(parsed.getAlpha() * 255)
  if (alpha >= 255) return hex
  return `${hex}${alpha.toString(16).padStart(2, '0').toUpperCase()}`
}

const parseCssFontSize = (value?: string) => {
  if (!value) return undefined
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return undefined
  const num = Number.parseFloat(trimmed)
  if (!Number.isFinite(num)) return undefined
  if (trimmed.endsWith('pt')) return num
  if (trimmed.endsWith('px')) return num * 0.75
  if (trimmed.endsWith('em') || trimmed.endsWith('rem')) return num * 12
  return num > 0 ? num : undefined
}

const cloneTextOptions = (options: Record<string, any>) => ({ ...options })

const applyHtmlStyle = (element: HTMLElement, options: Record<string, any>) => {
  const style = element.style
  const next = cloneTextOptions(options)
  const fontWeight = style.fontWeight?.toLowerCase()
  const textDecoration = style.textDecoration?.toLowerCase() || ''
  const fontStyle = style.fontStyle?.toLowerCase()

  if (fontWeight === 'bold' || Number.parseInt(fontWeight, 10) >= 600) next.bold = true
  if (fontStyle === 'italic') next.italic = true
  if (textDecoration.includes('underline')) next.underline = 'sng'
  if (textDecoration.includes('line-through')) next.strike = 'sngStrike'

  const color = normalizeCssColor(style.color)
  if (color) next.color = color

  const fontFace = style.fontFamily?.split(',')?.[0]?.replace(/["']/g, '').trim()
  if (fontFace) next.fontFace = fontFace

  const fontSize = parseCssFontSize(style.fontSize)
  if (fontSize) next.fontSize = fontSize

  const textAlign = style.textAlign?.toLowerCase()
  if (textAlign === 'left' || textAlign === 'center' || textAlign === 'right' || textAlign === 'justify') {
    next.align = textAlign
  }

  const lineHeight = style.lineHeight?.trim?.()
  if (lineHeight) {
    const parsedLineHeight = Number.parseFloat(lineHeight)
    if (Number.isFinite(parsedLineHeight) && parsedLineHeight > 0) {
      next.lineSpacingMultiple = parsedLineHeight
    }
  }

  if (element.tagName.toLowerCase() === 'sup') {
    next.superscript = true
  }
  if (element.tagName.toLowerCase() === 'sub') {
    next.subscript = true
  }

  const href = element.getAttribute('href')
  if (href) {
    next.hyperlink = { url: href }
  }

  return next
}

const collectHtmlRuns = (node: ChildNode, inherited: Record<string, any>, runs: PptxTextRun[]) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.replace(/\u00a0/g, ' ') ?? ''
    if (!text) return
    runs.push({ text, options: cloneTextOptions(inherited) })
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return

  const element = node as HTMLElement
  const tag = element.tagName.toLowerCase()

  if (tag === 'br') {
    runs.push({ text: '', options: { ...cloneTextOptions(inherited), breakLine: true } })
    return
  }

  const nextInherited = applyHtmlStyle(element, inherited)
  const before = runs.length

  if (tag === 'li') {
    runs.push({ text: '• ', options: cloneTextOptions(nextInherited) })
  }

  Array.from(element.childNodes).forEach((child) => collectHtmlRuns(child, nextInherited, runs))

  if (blockTags.has(tag) && runs.length > before) {
    const lastRun = runs[runs.length - 1]
    lastRun.options = { ...(lastRun.options || {}), breakLine: true }
  } else if (blockTags.has(tag) && runs.length === before) {
    runs.push({ text: '', options: { ...cloneTextOptions(nextInherited), breakLine: true } })
  }
}

const htmlToPptxRuns = (html: string, defaults: Record<string, any>) => {
  const text = html?.trim?.() ? html : ''
  if (!text) return []

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return [{ text: getTextFromHtml(html), options: cloneTextOptions(defaults) }]
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div id="__pptx_text_root__">${html}</div>`, 'text/html')
  const root = doc.getElementById('__pptx_text_root__')
  if (!root) {
    return [{ text: getTextFromHtml(html), options: cloneTextOptions(defaults) }]
  }

  const runs: PptxTextRun[] = []
  Array.from(root.childNodes).forEach((child) => collectHtmlRuns(child, cloneTextOptions(defaults), runs))
  return runs.filter((run, index) => {
    if (run.text) return true
    return Boolean(run.options?.breakLine) || index === 0
  })
}

const svgDataUrlFromShape = async (element: ShapeElement) => {
  const width = Math.max(1, Number(element.viewBox?.[0] || element.width || 1))
  const height = Math.max(1, Number(element.viewBox?.[1] || element.height || 1))
  const rotate = element.rotate || 0
  const fill = colorToSvg(element.fill)
  const outline = element.outline ? colorToSvg(element.outline.color) : undefined
  const outlineWidth = element.outline?.width ? Math.max(0.1, element.outline.width) : 0
  const shapeFormula =
    element.path ||
    (element.pathFormula && SHAPE_PATH_FORMULAS[element.pathFormula]
      ? SHAPE_PATH_FORMULAS[element.pathFormula].formula(width, height, element.keypoints)
      : '')

  if (!shapeFormula) return ''

  const gradientId = `shape-gradient-${Math.random().toString(36).slice(2)}`
  const outlineGradientId = `shape-outline-gradient-${Math.random().toString(36).slice(2)}`
  const defs: string[] = []
  let fillAttr = `fill="${fill.color}"`
  let strokeAttr = outlineWidth > 0 ? `stroke="${outline?.color || 'none'}" stroke-width="${outlineWidth}"` : 'stroke="none"'

  if (element.pattern?.foreColor || element.pattern?.backColor) {
    const fore = colorToSvg(element.pattern.foreColor)
    const back = colorToSvg(element.pattern.backColor)
    const patternId = `shape-pattern-${Math.random().toString(36).slice(2)}`
    const style = element.pattern.patternStyle || 0
    const patternMarkup =
      style % 3 === 0
        ? `
          <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="12" height="12">
            <rect width="12" height="12" fill="${back.color}" />
            <path d="M -3 12 L 12 -3 M 0 15 L 15 0 M -6 6 L 6 -6 M 6 18 L 18 6" stroke="${fore.color}" stroke-width="2" opacity="${fore.opacity}" />
          </pattern>
        `
        : style % 3 === 1
          ? `
            <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="10" height="10">
              <rect width="10" height="10" fill="${back.color}" />
              <path d="M 0 0 L 10 10 M -5 5 L 5 15 M 5 -5 L 15 5" stroke="${fore.color}" stroke-width="1.5" opacity="${fore.opacity}" />
            </pattern>
          `
          : `
            <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="8" height="8">
              <rect width="8" height="8" fill="${back.color}" />
              <circle cx="4" cy="4" r="1.25" fill="${fore.color}" opacity="${fore.opacity}" />
            </pattern>
          `
    defs.push(patternMarkup)
    fillAttr = `fill="url(#${patternId})"`
  } else if (element.gradient?.colors?.length) {
    const gradient = element.gradient
    defs.push(`
      ${
        gradient.type === 'radial'
          ? `<radialGradient id="${gradientId}">`
          : `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${gradient.rotate || 0},0.5,0.5)">`
      }
      ${gradient.colors
        .map((item) => {
          const stopColor = colorToSvg(item.color)
          return `<stop offset="${item.pos ?? 0}%" stop-color="${stopColor.color}" stop-opacity="${stopColor.opacity}" />`
        })
        .join('')}
      ${gradient.type === 'radial' ? `</radialGradient>` : `</linearGradient>`}
    `)
    fillAttr = `fill="url(#${gradientId})"`
  } else if (fill.color !== 'none') {
    fillAttr = `fill="${fill.color}" fill-opacity="${fill.opacity}"`
  } else {
    fillAttr = 'fill="none"'
  }

  if (element.outline?.gradient?.colors?.length) {
    const outlineGradient = element.outline.gradient
    defs.push(`
      ${
        outlineGradient.type === 'radial'
          ? `<radialGradient id="${outlineGradientId}">`
          : `<linearGradient id="${outlineGradientId}" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${outlineGradient.rotate || 0},0.5,0.5)">`
      }
      ${outlineGradient.colors
        .map((item) => {
          const stopColor = colorToSvg(item.color)
          return `<stop offset="${item.pos ?? 0}%" stop-color="${stopColor.color}" stop-opacity="${stopColor.opacity}" />`
        })
        .join('')}
      ${outlineGradient.type === 'radial' ? `</radialGradient>` : `</linearGradient>`}
    `)
    strokeAttr = `stroke="url(#${outlineGradientId})" stroke-width="${outlineWidth || 1}"`
  } else if (outlineWidth <= 0) {
    strokeAttr = 'stroke="none"'
  } else {
    strokeAttr = `${strokeAttr} stroke-opacity="${outline?.opacity ?? 1}"`
  }

  let pictureMarkup = ''
  if (element.picture?.src) {
    const pictureDataUrl = await fetchAsDataUrl(element.picture.src)
    if (pictureDataUrl) {
      const clipId = `shape-clip-${Math.random().toString(36).slice(2)}`
      defs.push(`
        <clipPath id="${clipId}">
          <path d="${escapeXml(shapeFormula)}" />
        </clipPath>
      `)
      pictureMarkup = `
        <image
          href="${pictureDataUrl}"
          x="0"
          y="0"
          width="${width}"
          height="${height}"
          preserveAspectRatio="none"
          clip-path="url(#${clipId})"
        />
      `
      fillAttr = 'fill="none"'
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${defs.length ? `<defs>${defs.join('')}</defs>` : ''}
      <g transform="rotate(${rotate} ${width / 2} ${height / 2})">
        ${pictureMarkup}
        <path d="${escapeXml(shapeFormula)}" ${fillAttr} ${strokeAttr} fill-rule="evenodd" stroke-linejoin="round" stroke-linecap="round" />
      </g>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg))) }`
}

const shadowToPptx = (shadow?: { h?: number; v?: number; blur?: number; color?: any }) => {
  if (!shadow) return undefined
  const color = colorWithTransparency(shadow.color)
  const distance = Math.sqrt((shadow.h || 0) ** 2 + (shadow.v || 0) ** 2)
  const angle = Math.round((Math.atan2(-(shadow.v || 0), shadow.h || 0) * 180) / Math.PI)
  return {
    type: 'outer',
    color: color?.color || '000000',
    opacity: color?.transparency !== undefined ? Math.max(0, Math.min(1, 1 - color.transparency / 100)) : 0.35,
    blur: Math.max(0, ((shadow.blur || 0) * 0.75) / 2),
    angle: Number.isFinite(angle) ? angle : 45,
    distance: Math.max(0, distance * 0.75),
  }
}

const gradientToSvgDataUrl = (gradient: Gradient, width: number, height: number) => {
  if (!gradient?.colors?.length) return ''
  const gradientId = `bg-gradient-${Math.random().toString(36).slice(2)}`
  const defs =
    gradient.type === 'radial'
      ? `
        <radialGradient id="${gradientId}">
          ${gradient.colors
            .map((item) => {
              const stopColor = colorToSvg(item.color)
              return `<stop offset="${item.pos ?? 0}%" stop-color="${stopColor.color}" stop-opacity="${stopColor.opacity}" />`
            })
            .join('')}
        </radialGradient>
      `
      : `
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${gradient.rotate || 0},0.5,0.5)">
          ${gradient.colors
            .map((item) => {
              const stopColor = colorToSvg(item.color)
              return `<stop offset="${item.pos ?? 0}%" stop-color="${stopColor.color}" stop-opacity="${stopColor.opacity}" />`
            })
            .join('')}
        </linearGradient>
      `
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>${defs}</defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#${gradientId})" />
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg))) }`
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('图片读取失败'))
    reader.readAsDataURL(blob)
  })

const fetchAsDataUrl = async (src?: string) => {
  if (!src) return ''
  if (src.startsWith('data:')) return src
  try {
    const response = await fetch(src)
    if (!response.ok) return ''
    const blob = await response.blob()
    return await blobToDataUrl(blob)
  } catch (error) {
    console.warn('[export] 无法读取资源:', src, error)
    return ''
  }
}

const toMargin = (value?: number) => (typeof value === 'number' ? toIn(value) : 0)

const lineStyleMap: Record<string, 'solid' | 'dash' | 'dot'> = {
  solid: 'solid',
  dashed: 'dash',
  dotted: 'dot',
}

const chartTypeMap: Record<string, string> = {
  bar: 'bar',
  column: 'bar',
  line: 'line',
  area: 'area',
  pie: 'pie',
  ring: 'doughnut',
  radar: 'radar',
  scatter: 'scatter',
  bubble: 'bubble',
}

const createTableRows = (table: TableElement) => {
  return (table.data || []).map((row) =>
    (row || []).map((cell) => ({
      text: getTextFromHtml(cell?.text || ''),
    })),
  )
}

const addTextBox = (slide: any, element: Partial<TextElement> & { content?: string }) => {
  const fontColor = colorWithTransparency(element.fontColor) || { color: '000000' }
  const fill = colorWithTransparency(element.fill)
  const gradient = element.gradient?.colors?.[0]?.color ? colorWithTransparency(element.gradient.colors[0].color) : undefined
  const runs = htmlToPptxRuns(element.content || '', {
    fontFace: element.fontName || 'Arial',
    fontSize: element.fontSize ? Math.max(1, element.fontSize * 0.75) : 16,
    color: fontColor.color,
    align: (element.alignH as any) || 'left',
    valign: (element.alignV as any) || 'top',
    fit: 'shrink',
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  })
  const text = runs.length ? runs : [{ text: getTextFromHtml(element.content), options: { fontFace: element.fontName || 'Arial', fontSize: element.fontSize ? Math.max(1, element.fontSize * 0.75) : 16, color: fontColor.color } }]
  if (!text.length || !text.some((item) => String(item.text || '').trim().length)) return

  slide.addText(text, {
    x: toIn(element.left || 0),
    y: toIn(element.top || 0),
    w: Math.max(0.01, toIn(element.width || 0)),
    h: Math.max(0.01, toIn(element.height || 0)),
    fontFace: element.fontName || 'Arial',
    fontSize: element.fontSize ? Math.max(1, element.fontSize * 0.75) : 16,
    color: fontColor.color,
    margin: [
      toMargin(element.marginTop),
      toMargin(element.marginRight),
      toMargin(element.marginBottom),
      toMargin(element.marginLeft),
    ],
    align: (element.alignH as any) || 'left',
    valign: (element.alignV as any) || 'top',
    fit: 'shrink',
    fill: fill ? { color: fill.color, transparency: fill.transparency ?? 100 } : undefined,
    bold: false,
    italic: false,
    underline: false,
    paraSpaceAfterPt: element.paragraphSpace ? Math.max(0, element.paragraphSpace * 0.75) : 0,
    charSpace: element.wordSpace ? Math.max(0, element.wordSpace * 0.75) : 0,
    rotate: element.textRotation || 0,
    shadow: shadowToPptx((element as any).shadow),
  })
}

const addShapeTextOverlay = (slide: any, element: ShapeElement) => {
  const runs = htmlToPptxRuns(element.text?.content || '', {
    fontFace: element.text?.fontName || 'Arial',
    fontSize: element.text?.fontSize ? Math.max(1, element.text.fontSize * 0.75) : 16,
    color: colorWithTransparency(element.text?.fontColor)?.color || '000000',
    align: (element.text?.alignH as any) || 'left',
    valign: (element.text?.alignV as any) || 'top',
    fit: 'shrink',
  })
  const text = runs.length ? runs : [{ text: getTextFromHtml(element.text?.content || ''), options: { fontFace: element.text?.fontName || 'Arial', fontSize: element.text?.fontSize ? Math.max(1, element.text.fontSize * 0.75) : 16, color: colorWithTransparency(element.text?.fontColor)?.color || '000000' } }]
  if (!text.length || !text.some((item) => String(item.text || '').trim().length)) return
  const fontColor = colorWithTransparency(element.text?.fontColor) || { color: '000000' }
  slide.addText(text, {
    x: toIn(element.left || 0),
    y: toIn(element.top || 0),
    w: Math.max(0.01, toIn(element.width || 0)),
    h: Math.max(0.01, toIn(element.height || 0)),
    fontFace: element.text?.fontName || 'Arial',
    fontSize: element.text?.fontSize ? Math.max(1, element.text.fontSize * 0.75) : 16,
    color: fontColor.color,
    margin: [
      toMargin(element.text?.marginTop),
      toMargin(element.text?.marginRight),
      toMargin(element.text?.marginBottom),
      toMargin(element.text?.marginLeft),
    ],
    align: (element.text?.alignH as any) || 'left',
    valign: (element.text?.alignV as any) || 'top',
    fit: 'shrink',
    fill: { color: 'FFFFFF', transparency: 100 },
    rotate: element.rotate || 0,
    shadow: shadowToPptx((element as any).shadow),
  })
}

const addShapeElement = async (slide: any, element: ShapeElement) => {
  const fill = colorWithTransparency(element.fill)
  const outline = element.outline ? colorWithTransparency(element.outline.color) : undefined
  const shapeType = (element as any).pptxShapeType || 'rect'
  const x = toIn(element.left || 0)
  const y = toIn(element.top || 0)
  const w = Math.max(0.01, toIn(element.width || 0))
  const h = Math.max(0.01, toIn(element.height || 0))

  const shadow = shadowToPptx((element as any).shadow)
  const useSvg =
    Boolean(element.path || element.pathFormula || element.gradient || element.pattern || element.picture?.src || element.outline?.gradient)

  if (useSvg) {
    const dataUrl = await svgDataUrlFromShape(element)
    if (dataUrl) {
      slide.addImage({
        data: dataUrl,
        x,
        y,
        w,
        h,
        transparency: element.opacity ? Math.round((1 - element.opacity) * 100) : 0,
        rotate: element.rotate || 0,
        shadow,
      })
      addShapeTextOverlay(slide, element)
      return
    }
  }

  slide.addShape(shapeType, {
    x,
    y,
    w,
    h,
    fill: fill ? { color: fill.color, transparency: fill.transparency ?? 0 } : { color: 'FFFFFF', transparency: 100 },
    line: outline
      ? {
          color: outline.color,
          transparency: outline.transparency ?? 0,
          pt: element.outline?.width ? Math.max(0.1, element.outline.width * 0.75) : 1,
          dashType: lineStyleMap[element.outline?.style || 'solid'] || 'solid',
          beginArrowType: element.outline?.beginArrow === 'arrow' ? 'arrow' : element.outline?.beginArrow === 'dot' ? 'oval' : 'none',
          endArrowType: element.outline?.endArrow === 'arrow' ? 'arrow' : element.outline?.endArrow === 'dot' ? 'oval' : 'none',
        }
      : { color: fill?.color || 'FFFFFF', transparency: 100, pt: 0.5 },
    rotate: element.rotate || 0,
    transparency: element.opacity ? Math.round((1 - element.opacity) * 100) : 0,
    shadow,
  })

  addShapeTextOverlay(slide, element)
}

const addImageElement = async (slide: any, element: ImageElement) => {
  const dataUrl = await fetchAsDataUrl(element.src)
  if (!dataUrl) return
  slide.addImage({
    data: dataUrl,
    x: toIn(element.left || 0),
    y: toIn(element.top || 0),
    w: Math.max(0.01, toIn(element.width || 0)),
    h: Math.max(0.01, toIn(element.height || 0)),
    transparency: element.opacity ? Math.round((1 - element.opacity) * 100) : 0,
    rotate: element.rotate || 0,
  })
}

const addLineElement = (slide: any, element: LineElement) => {
  const start = element.start || [element.left || 0, element.top || 0]
  const end = element.end || [element.left + element.width, element.top + element.height]
  const left = Math.min(start[0], end[0])
  const top = Math.min(start[1], end[1])
  const width = Math.max(1, Math.abs(end[0] - start[0]))
  const height = Math.max(1, Math.abs(end[1] - start[1]))
  const lineColor = colorWithTransparency(element.color) || { color: '000000' }
  slide.addShape('line', {
    x: toIn(left),
    y: toIn(top),
    w: toIn(width),
    h: toIn(height),
    line: {
      color: lineColor.color,
      transparency: lineColor.transparency ?? 0,
      pt: element.strokeWidth ? Math.max(0.1, element.strokeWidth * 0.75) : 1,
      dashType: lineStyleMap[element.style || 'solid'] || 'solid',
      beginArrowType: element.points?.[0] === 'arrow' ? 'arrow' : element.points?.[0] === 'dot' ? 'oval' : 'none',
      endArrowType: element.points?.[1] === 'arrow' ? 'arrow' : element.points?.[1] === 'dot' ? 'oval' : 'none',
    },
    fill: { color: 'FFFFFF', transparency: 100 },
  })
}

const addTableElement = (slide: any, element: TableElement) => {
  const rows = createTableRows(element)
  if (!rows.length) return
  slide.addTable(rows, {
    x: toIn(element.left || 0),
    y: toIn(element.top || 0),
    w: Math.max(0.01, toIn(element.width || 0)),
    h: Math.max(0.01, toIn(element.height || 0)),
    fontFace: 'Arial',
    fontSize: 12,
    border: { type: 'solid', color: 'BFBFBF', pt: 1 },
    autoFit: false,
    margin: 0.03,
  })
}

const addChartElement = (slide: any, element: ChartElement) => {
  const chartType = chartTypeMap[element.chartType] || 'bar'
  const labels = element.data?.labels || []
  const legends = element.data?.legends || []
  const series = element.data?.series || []
  const data = series.map((values, index) => ({
    name: legends[index] || `Series ${index + 1}`,
    labels,
    values: values || [],
  }))
  if (!data.length) {
    return
  }

  const chartOpts: any = {
    x: toIn(element.left || 0),
    y: toIn(element.top || 0),
    w: Math.max(0.01, toIn(element.width || 0)),
    h: Math.max(0.01, toIn(element.height || 0)),
    catAxisLabelRotate: 0,
    showLegend: element.options?.showLegend !== false,
    showTitle: !!element.title,
    showValue: element.options?.showDataLabel,
    showPercent: element.options?.showPercentage,
    showSerName: element.options?.showSeriesName,
    showCatName: element.options?.showCategoryName,
    chartColors: (element.themeColors || []).map((item) => resolvePPTColorValue(item as any, useSlidesStore.getState().theme?.themeColors) || 'FFFFFF'),
  }

  if (element.title) chartOpts.title = element.title
  if (element.options?.stack) chartOpts.barGrouping = 'stacked'
  if (element.chartType === 'column') chartOpts.barDir = 'col'
  if (element.chartType === 'bar') chartOpts.barDir = 'bar'
  if (element.chartType === 'ring') chartOpts.holeSize = element.options?.holeSize || 50
  if (element.chartType === 'line') chartOpts.lineSize = 2

  try {
  slide.addChart(chartType as any, data, chartOpts)
  } catch (error) {
    console.warn('[export] 图表导出失败，改为文本占位', error)
    slide.addText(element.title || '图表', {
      x: toIn(element.left || 0),
      y: toIn(element.top || 0),
      w: Math.max(0.01, toIn(element.width || 0)),
      h: Math.max(0.01, toIn(element.height || 0)),
      fontFace: 'Arial',
      fontSize: 14,
      color: '666666',
      align: 'center',
      valign: 'mid',
      fill: { color: 'FFFFFF', transparency: 100 },
      line: { color: 'CCCCCC', pt: 1, transparency: 0 },
    })
  }
}

const addMathElement = async (slide: any, element: MathElement) => {
  const dataUrl = await fetchAsDataUrl(element.picBase64 || element.path)
  if (dataUrl) {
    slide.addImage({
      data: dataUrl,
      x: toIn(element.left || 0),
      y: toIn(element.top || 0),
      w: Math.max(0.01, toIn(element.width || 0)),
      h: Math.max(0.01, toIn(element.height || 0)),
      transparency: element.opacity ? Math.round((1 - element.opacity) * 100) : 0,
    })
    return
  }
  slide.addText(element.latex || element.text || '公式', {
    x: toIn(element.left || 0),
    y: toIn(element.top || 0),
    w: Math.max(0.01, toIn(element.width || 0)),
    h: Math.max(0.01, toIn(element.height || 0)),
    fontFace: element.fontName || 'Arial',
    fontSize: element.fontSize ? Math.max(1, element.fontSize * 0.75) : 16,
    color: colorWithTransparency(element.color)?.color || '000000',
    fit: 'shrink',
    margin: 0,
  })
}

const addVideoOrAudioPlaceholder = (slide: any, element: VideoElement | AudioElement, label: string) => {
  slide.addText(label, {
    x: toIn(element.left || 0),
    y: toIn(element.top || 0),
    w: Math.max(0.01, toIn(element.width || 0)),
    h: Math.max(0.01, toIn(element.height || 0)),
    fontFace: 'Arial',
    fontSize: 14,
    color: '666666',
    align: 'center',
    valign: 'mid',
    fill: { color: 'F5F5F5' },
    line: { color: 'CCCCCC', pt: 1 },
  })
}

const addMediaElement = async (
  slide: any,
  element: VideoElement | AudioElement,
  type: 'video' | 'audio',
  fallbackLabel: string,
) => {
  const mediaDataUrl = await fetchAsDataUrl(element.src)
  if (!mediaDataUrl) {
    addVideoOrAudioPlaceholder(slide, element, fallbackLabel)
    return
  }

  const coverDataUrl =
    type === 'video' && 'poster' in element ? await fetchAsDataUrl((element as VideoElement).poster) : ''

  try {
    slide.addMedia({
      type,
      data: mediaDataUrl,
      x: toIn(element.left || 0),
      y: toIn(element.top || 0),
      w: Math.max(0.01, toIn(element.width || 0)),
      h: Math.max(0.01, toIn(element.height || 0)),
      ...(coverDataUrl ? { cover: coverDataUrl } : {}),
    })
  } catch (error) {
    console.warn(`[export] ${fallbackLabel}导出失败，已回退为占位元素`, error)
    addVideoOrAudioPlaceholder(slide, element, fallbackLabel)
  }
}

let pptxGenLoaderPromise: Promise<any> | null = null

const loadPptxGenJS = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PptxGenJS 只能在浏览器环境中使用')
  }

  if (window.PptxGenJS) {
    return window.PptxGenJS
  }

  if (!pptxGenLoaderPromise) {
    pptxGenLoaderPromise = fetch('/pptxgen.bundle.js')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`PptxGenJS 加载失败: ${response.status}`)
        }
        const source = await response.text()
        const exported = (0, eval)(source)
        const loaded = window.PptxGenJS || exported
        if (!loaded) {
          throw new Error('PptxGenJS 未能正确初始化')
        }
        window.PptxGenJS = loaded
        return loaded
      })
      .finally(() => {
        pptxGenLoaderPromise = null
      })
  }

  return pptxGenLoaderPromise
}

const applyBackground = async (slide: any, background?: Background, slideWidthIn = 13.333, slideHeightIn = 7.5) => {
  if (!background) return
  const solid = colorWithTransparency(background.color)
  if (background.type === 'image' && background.image?.src) {
    const dataUrl = await fetchAsDataUrl(background.image.src)
    if (dataUrl) {
      slide.addImage({
        data: dataUrl,
        x: 0,
        y: 0,
        w: slideWidthIn,
        h: slideHeightIn,
      })
      return
    }
  }
  if (background.type === 'gradient' && background.gradient?.colors?.length) {
    const dataUrl = gradientToSvgDataUrl(background.gradient, Math.max(1, Math.round(slideWidthIn * PX_PER_IN)), Math.max(1, Math.round(slideHeightIn * PX_PER_IN)))
    if (dataUrl) {
      slide.addImage({
        data: dataUrl,
        x: 0,
        y: 0,
        w: slideWidthIn,
        h: slideHeightIn,
      })
      return
    }
  }
  if (solid) {
    slide.background = { color: solid.color } as any
    return
  }
  slide.background = { color: 'FFFFFF' } as any
}

const addElement = async (slide: any, element: PPTElement, ignoreMedia: boolean) => {
  switch (element.type) {
    case 'text':
      addTextBox(slide, element as TextElement)
      return
    case 'shape':
      await addShapeElement(slide, element as ShapeElement)
      return
    case 'image':
      await addImageElement(slide, element as ImageElement)
      return
    case 'line':
      addLineElement(slide, element as LineElement)
      return
    case 'chart':
      addChartElement(slide, element as ChartElement)
      return
    case 'table':
      addTableElement(slide, element as TableElement)
      return
    case 'math':
      await addMathElement(slide, element as MathElement)
      return
    case 'video':
      if (!ignoreMedia) {
        await addMediaElement(slide, element as VideoElement, 'video', '视频')
      }
      return
    case 'audio':
      if (!ignoreMedia) {
        await addMediaElement(slide, element as AudioElement, 'audio', '音频')
      }
      return
    default:
      return
  }
}

export const exportSlidesToPptx = async (slides: PPTSlide[], options: ExportOptions) => {
  const PptxGenJS = await loadPptxGenJS()
  const pptx = new PptxGenJS()
  const width = options.width || 1280
  const height = options.height || 720
  const slideWidthIn = toIn(width)
  const slideHeightIn = toIn(height)

  pptx.defineLayout({ name: 'MATEPPT_CUSTOM', width: slideWidthIn, height: slideHeightIn })
  pptx.layout = 'MATEPPT_CUSTOM'
  pptx.author = 'MatePPT'
  pptx.company = 'MatePPT'
  pptx.subject = options.title
  pptx.title = options.title
  pptx.lang = 'zh-CN'

  for (const slideData of slides) {
    const slide = pptx.addSlide()
    await applyBackground(slide, slideData.background, slideWidthIn, slideHeightIn)

    for (const element of slideData.elements || []) {
      await addElement(slide, element as PPTElement, options.ignoreMedia)
    }
  }

  const blob = (await pptx.write({ outputType: 'blob' })) as Blob
  const fileName = `${options.title || 'export'}.pptx`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.endsWith('.pptx') ? fileName : `${fileName}.pptx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
