import type { CSSProperties } from 'react'
import type { TableCellStyle } from '@/ppt/core'
import type { ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

export const getHorizontalAlignStyle = (align?: string): CSSProperties => {
  if (align === 'distributed') {
    return {
      textAlign: 'justify',
      ['textJustify' as any]: 'distribute',
      ['textAlignLast' as any]: 'justify',
    }
  }
  return {
    textAlign: (align as CSSProperties['textAlign']) || 'left',
  }
}

export const getTextStyle = (
  style?: TableCellStyle,
  schemeMap?: ThemeColors | Record<string, string> | null,
): CSSProperties => {
  if (!style) return {}
  const {
    bold,
    em,
    underline,
    strikethrough,
    color,
    backColor,
    fontSize,
    fontName,
    alignH,
    alignV,
  } = style

  let textDecoration = `${underline ? 'underline' : ''} ${strikethrough ? 'line-through' : ''}`
  if (textDecoration === ' ') textDecoration = 'none'

  let alignItems = 'center';
  if (alignV === 'top') alignItems = 'flex-start'
  else if (alignV === 'bottom') alignItems = 'flex-end'

  return {
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: em ? 'italic' : 'normal',
    textDecoration,
    color: resolvePPTColorValue(color, schemeMap) || color?.value || '#000',
    backgroundColor: resolvePPTColorValue(backColor, schemeMap) || backColor?.value || '',
    fontSize: fontSize || '14px',
    fontFamily: fontName || '',
    ...getHorizontalAlignStyle(alignH),
    verticalAlign: alignV as CSSProperties['verticalAlign'] || 'middle',
    alignItems,
  }
}

export const formatText = (text: string) => {
  return text.replace(/\n/g, '</br>').replace(/ /g, '&nbsp;')
}
