import React, { type FC } from 'react'
import clsx from 'clsx'
import type { PPTTextElement } from '@/ppt/core'
import ElementOutline from '../../ElementOutline'
import { useElementShadow } from '@/ppt/hooks/useElementShadow'
import { buildCssGradient } from '@/ppt/utils/gradient'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import styles from './BaseTextElement.module.scss'

interface BaseTextElementProps {
  elementInfo: PPTTextElement
  target?: string
}

const BaseTextElement: FC<BaseTextElementProps> = ({ elementInfo, target }) => {
  const { shadowStyle } = useElementShadow(elementInfo.shadow)
  const normalizedContent = React.useMemo(() => {
    if (target !== 'thumbnail' || !elementInfo.content) {
      return elementInfo.content
    }

    const hasFontGradient = Boolean(elementInfo.fontGradient)
    return elementInfo.content.replace(/style=(['"])(.*?)\1/g, (match, quote, style) => {
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
  }, [elementInfo.content, elementInfo.fontGradient, target])

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

  const elementContentStyle: React.CSSProperties & Record<string, any> = {
    width: elementInfo.vertical ? 'auto' : `${elementInfo.width}px`,
    height: `${elementInfo.height}px`,
    backgroundColor: resolvePPTColorValue(elementInfo.fill),
    opacity: elementInfo.opacity,
    textShadow: shadowStyle,
    lineHeight: elementInfo.lineHeight,
    display: 'flex',
    flexDirection: 'column',
    letterSpacing: `${elementInfo.wordSpace || 0}px`,
    color: resolvePPTColorValue(elementInfo.fontColor),
    fontFamily: elementInfo.fontName,
    writingMode: elementInfo.vertical ? 'vertical-rl' : 'horizontal-tb',
  }
  const verticalAlign = elementInfo.alignV || 'top'
  if (verticalAlign === 'top') {
    elementContentStyle.justifyContent = 'flex-start'
  } else if (verticalAlign === 'middle') {
    elementContentStyle.justifyContent = 'center'
  } else if (verticalAlign === 'bottom') {
    elementContentStyle.justifyContent = 'flex-end'
  }

  const textStyle: React.CSSProperties & Record<string, any> = {
    ['--paragraphSpace' as any]: `${
      elementInfo.paragraphSpace === undefined ? 5 : elementInfo.paragraphSpace
    }px`,
  }
  const fontGradient = buildCssGradient(elementInfo.fontGradient)
  if (fontGradient) {
    textStyle.backgroundImage = fontGradient
    textStyle.backgroundClip = 'text'
    textStyle.WebkitBackgroundClip = 'text'
    textStyle.color = 'transparent'
    textStyle.WebkitTextFillColor = 'transparent'

    // 缩略图模式下添加渲染优化，改善文字清晰度
    if (target === 'thumbnail') {
      textStyle.WebkitFontSmoothing = 'antialiased'
      textStyle.MozOsxFontSmoothing = 'grayscale'
      textStyle.textRendering = 'optimizeLegibility'
      textStyle.transform = 'translateZ(0)'
      textStyle.backfaceVisibility = 'hidden'
      textStyle.willChange = 'transform'
    }
  }

  return (
    <div className={styles.baseElementText} style={containerStyle}>
      <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
        <div className={styles.elementContent} style={elementContentStyle}>
          <ElementOutline
            width={elementInfo.width}
            height={elementInfo.height}
            outline={elementInfo.outline}
          />
          <div
            className={clsx(
              styles.text,
              'ProseMirror-static',
              target === 'thumbnail' && styles.thumbnail,
            )}
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: normalizedContent }}
          />
        </div>
      </div>
    </div>
  )
}

export default BaseTextElement
