import { SHAPE_LIST } from './shapes'

export type ClipShapeType = 'rect' | 'ellipse' | 'polygon'
export type ClipShapeDefinition = {
  name: string
  type: ClipShapeType
  style: string
  radius?: string
  createPath?: (width: number, height: number) => string
  useSvgPathClip?: boolean
}

const RECT_CLIP: ClipShapeDefinition = {
  name: 'rect',
  type: 'rect',
  style: '',
  radius: '0',
}

function normalizeNumber(value: number): string {
  const rounded = Number(value.toFixed(4))
  if (Object.is(rounded, -0)) return '0'
  return String(rounded)
}

function scalePathData(pathData: string, scaleX: number, scaleY: number): string {
  const tokens = pathData.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g)
  if (!tokens || tokens.length === 0) return pathData

  const paramCountMap: Record<string, number> = {
    M: 2,
    L: 2,
    H: 1,
    V: 1,
    C: 6,
    S: 4,
    Q: 4,
    T: 2,
    A: 7,
    Z: 0,
  }

  function scaleParam(command: string, paramIndex: number, raw: number): number {
    const cmd = command.toUpperCase()
    if (cmd === 'H') return raw * scaleX
    if (cmd === 'V') return raw * scaleY
    if (cmd === 'A') {
      if (paramIndex === 0 || paramIndex === 5) return raw * scaleX
      if (paramIndex === 1 || paramIndex === 6) return raw * scaleY
      return raw
    }
    if (cmd === 'M' || cmd === 'L' || cmd === 'C' || cmd === 'S' || cmd === 'Q' || cmd === 'T') {
      return paramIndex % 2 === 0 ? raw * scaleX : raw * scaleY
    }
    return raw
  }

  const out: string[] = []
  let command = 'M'
  let commandParamCount = paramCountMap[command]
  let commandParamIndex = 0

  for (const token of tokens) {
    if (/^[a-zA-Z]$/.test(token)) {
      command = token
      commandParamCount = paramCountMap[command.toUpperCase()] ?? 0
      commandParamIndex = 0
      out.push(token)
      continue
    }

    const value = Number(token)
    if (!Number.isFinite(value)) {
      out.push(token)
      continue
    }

    const scaledValue = commandParamCount > 0
      ? scaleParam(command, commandParamIndex, value)
      : value
    out.push(normalizeNumber(scaledValue))

    if (commandParamCount > 0) {
      commandParamIndex = (commandParamIndex + 1) % commandParamCount
    }
  }
  return out.join(' ')
}

function buildPresetClipDefinitions(): Record<string, ClipShapeDefinition> {
  const presets: Record<string, ClipShapeDefinition> = {}

  for (const group of SHAPE_LIST) {
    for (const shape of group.children) {
      if (!shape.pptxShapeType || !shape.path || !shape.viewBox) continue
      if (presets[shape.pptxShapeType]) continue

      const [baseWidth, baseHeight] = shape.viewBox
      if (!baseWidth || !baseHeight) continue

      if (shape.pptxShapeType === 'rect') {
        presets[shape.pptxShapeType] = RECT_CLIP
        continue
      }

      presets[shape.pptxShapeType] = {
        name: shape.pptxShapeType,
        type: shape.pptxShapeType === 'ellipse' ? 'ellipse' : 'polygon',
        style: shape.pptxShapeType === 'ellipse' ? 'ellipse(50% 50% at 50% 50%)' : '',
        createPath: (width: number, height: number) => {
          return scalePathData(shape.path, width / baseWidth, height / baseHeight)
        },
        useSvgPathClip: shape.pptxShapeType !== 'ellipse',
      }
    }
  }
  return presets
}

const PRESET_CLIP_SHAPES = buildPresetClipDefinitions()

export function resolveClipShapeDefinition(shape?: string): ClipShapeDefinition {
  if (!shape) return RECT_CLIP
  const presetHit = PRESET_CLIP_SHAPES[shape]
  if (presetHit) return presetHit

  return RECT_CLIP
}
