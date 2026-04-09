import React, { type FC, useMemo } from 'react'
import type { PPTShapeElement, ShapeText } from '@/ppt/core'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { useElementOutline } from '@/ppt/hooks/useElementOutline'
import { useElementShadow } from '@/ppt/hooks/useElementShadow'
import { useElementFlip } from '@/ppt/hooks/useElementFlip'
import { useElementFill } from '@/ppt/hooks/useElementFill'
import { buildCssGradient } from '@/ppt/utils/gradient'
import GradientDefs from './GradientDefs'
import PatternDefs from './PatternDefs'
import ImageDefs from './ImageDefs'
import styles from './BaseShapeElement.module.scss'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

interface BaseShapeElementProps {
  elementInfo: PPTShapeElement
  target?: string
}

const BaseShapeElement: FC<BaseShapeElementProps> = ({ elementInfo, target }) => {
  const theme = useSlidesStore((state) => state.theme)

  const { fill } = useElementFill(elementInfo, 'base')
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(elementInfo.outline)
  const { shadowStyle } = useElementShadow(elementInfo.shadow)
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)
  const outlineGradient = elementInfo.outline?.gradient
  const hasOutlineGradient = !!outlineGradient?.colors?.length
  const outlineGradientId = `base-outline-gradient-${elementInfo.id}`
  const outlineStroke = hasOutlineGradient ? `url(#${outlineGradientId})` : resolvePPTColorValue(outlineColor)
  const viewBox = useMemo(() => {
    if (Array.isArray(elementInfo.viewBox) && elementInfo.viewBox.length >= 2) {
      return elementInfo.viewBox
    }
    return [100, 100]
  }, [elementInfo.viewBox])
  const shapePath = elementInfo.path || 'M 0 0 L 100 0 L 100 100 L 0 100 Z'

  const text = useMemo<ShapeText>(() => {
    const fontColor = new PPTColor();
    const resolved = theme.themeColors?.dk1 || '#000000'
    fontColor.value = resolved;
    const defaultText: ShapeText = {
      content: '',
      alignH: 'center',
      alignV: 'middle',
      fontName: theme.fontName,
      fontColor: fontColor,
    }
    if (!elementInfo.text) return defaultText
    return {
      ...defaultText,
      ...elementInfo.text,
      fontColor: elementInfo.text.fontColor ?? defaultText.fontColor,
    }
  }, [elementInfo.text, theme.fontName, theme.themeColors])

  const normalizedTextContent = useMemo(() => {
    if (target !== 'thumbnail' || !text.content) {
      return text.content
    }

    const hasFontGradient = Boolean(text.gradient)
    return text.content.replace(/style=(['"])(.*?)\1/g, (match, quote, style) => {
      let nextStyle = style

      if (hasFontGradient) {
        nextStyle = nextStyle
          .replace(/-webkit-text-fill-[^;"]*;?/gi, '')
          .replace(/background-image\s*:\s*[^;"]*;?/gi, '')
          .replace(/background\s*:\s*[^;"]*;?/gi, '')
          .trim()
      }

      if (!/text-fill-color:\s*transparent/i.test(nextStyle)) {
        return `style=${quote}${nextStyle}${quote}`
      }
      if (/background-clip:\s*text/i.test(nextStyle) || /-webkit-background-clip:\s*text/i.test(nextStyle)) {
        return `style=${quote}${nextStyle}${quote}`
      }
      return `style=${quote}${nextStyle}; -webkit-background-clip: text; background-clip: text;${quote}`
    })
  }, [target, text.content, text.gradient])

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: elementInfo.top,
    left: elementInfo.left,
    width: elementInfo.width,
    height: elementInfo.height,
  }

  const rotateWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `rotate(${elementInfo.rotate}deg)`,
  }

  const elementContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    opacity: elementInfo.opacity,
    filter: shadowStyle ? `drop-shadow(${shadowStyle})` : undefined,
    transform: flipStyle,
    color: resolvePPTColorValue(text.fontColor, theme.themeColors) ,
    fontFamily: text.fontName,
  }

  const shapeTextStyle: React.CSSProperties & Record<string, any> = {
    lineHeight: text.lineHeight ?? 1.2,
    letterSpacing: `${text.wordSpace ?? 0}px`,
    ['--paragraphSpace' as any]: `${text.paragraphSpace === undefined ? 5 : text.paragraphSpace
      }px`,
  }

  // 处理文字渐变色 - 渐变样式必须应用到包含文本的子元素上
  const fontGradient = buildCssGradient(text.gradient)
  const textContentStyle: React.CSSProperties & Record<string, any> = {}
  if (fontGradient) {
    textContentStyle.backgroundImage = fontGradient
    textContentStyle.backgroundClip = 'text'
    textContentStyle.WebkitBackgroundClip = 'text'
    textContentStyle.color = 'transparent'
    textContentStyle.WebkitTextFillColor = 'transparent'

    // 缩略图模式下添加渲染优化，改善文字清晰度
    if (target === 'thumbnail') {
      textContentStyle.WebkitFontSmoothing = 'antialiased'
      textContentStyle.MozOsxFontSmoothing = 'grayscale'
      textContentStyle.textRendering = 'optimizeLegibility'
      textContentStyle.transform = 'translateZ(0)'
      textContentStyle.backfaceVisibility = 'hidden'
      textContentStyle.willChange = 'transform'
    }
  }

  return (
    <div className={styles['base-element-shape']} style={containerStyle}>
      <div className={styles['rotate-wrapper']} style={rotateWrapperStyle}>
        <div className={styles['element-content']} style={elementContentStyle}>
          <svg overflow="visible" width={elementInfo.width} height={elementInfo.height}>
            <defs>
              {elementInfo.picture && (
                <ImageDefs
                  id={`base-picture-${elementInfo.id}`}
                  picture={elementInfo.picture}
                  width={elementInfo.width}
                  height={elementInfo.height}
                />
              )}
              {elementInfo.pattern && (
                <PatternDefs id={`base-pattern-${elementInfo.id}`} pattern={elementInfo.pattern} />
              )}
              {!elementInfo.pattern && elementInfo.gradient && (
                <GradientDefs
                  id={`base-gradient-${elementInfo.id}`}
                  type={elementInfo.gradient.type}
                  colors={elementInfo.gradient.colors}
                  rotate={elementInfo.gradient.rotate}
                />
              )}
              {hasOutlineGradient && (
                <GradientDefs
                  id={outlineGradientId}
                  type={outlineGradient.type}
                  colors={outlineGradient.colors}
                  rotate={outlineGradient.rotate}
                />
              )}
            </defs>
            <g
              transform={`scale(${elementInfo.width / (viewBox[0] || 1)}, ${elementInfo.height / (viewBox[1] || 1)
                }) translate(0,0) matrix(1,0,0,1,0,0)`}
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="butt"
                strokeMiterlimit={8}
                d={shapePath}
                fill={fill}
                stroke={outlineStroke}
                strokeWidth={outlineWidth}
                strokeDasharray={strokeDashArray}
              />
            </g>
          </svg>

          <div
            className={`${styles['shape-text']} ${styles[text.alignH] ?? ''}`}
            style={shapeTextStyle}
          >
            <div
              className="ProseMirror-static"
              style={textContentStyle}
              dangerouslySetInnerHTML={{ __html: normalizedTextContent }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseShapeElement
