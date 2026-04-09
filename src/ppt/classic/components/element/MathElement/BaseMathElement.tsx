import React, { type FC } from 'react'
import type { PPTMathElement } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { useElementFlip } from '@/ppt/hooks/useElementFlip'
import MathLiveRenderer from './MathLiveRenderer'
import styles from './BaseMathElement.module.scss'
interface BaseMathElementProps {
  elementInfo: PPTMathElement
}
const BaseMathElement: FC<BaseMathElementProps> = ({ elementInfo }) => {
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: elementInfo.top,
    left: elementInfo.left,
    width: elementInfo.width,
    height: elementInfo.height,
    opacity: elementInfo.opacity,
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
    transform: flipStyle,
  }
  return (
    <div className={styles.baseElementLatex} style={containerStyle}>
      <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
        <div className={styles.elementContent} style={elementContentStyle}>
          <MathLiveRenderer
            latex={elementInfo.latex}
            mathML={elementInfo.mathML}
            width={elementInfo.width}
            height={elementInfo.height}
            color={resolvePPTColorValue(elementInfo.color)}
            fontName={elementInfo.fontName}
            fontSize={elementInfo.fontSize}
            strokeWidth={elementInfo.strokeWidth}
          />
        </div>
      </div>
    </div>
  )
}
export default BaseMathElement
