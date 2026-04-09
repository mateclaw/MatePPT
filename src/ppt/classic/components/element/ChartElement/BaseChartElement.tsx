import React, { type FC } from 'react'
import clsx from 'clsx'
import type { PPTChartElement } from '@/ppt/core'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { THEME_COLOR_KEYS, type ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors'
import ElementOutline from '../../ElementOutline'
import Chart from './Chart'
import styles from './BaseChartElement.module.scss'

interface BaseChartElementProps {
  elementInfo: PPTChartElement
  target?: string
}

const BaseChartElement: FC<BaseChartElementProps> = ({ elementInfo, target }) => {
  const themeColors = useSlidesStore((state) => state.theme?.themeColors)
  const resolveThemeMap = (raw: ThemeColors | Record<string, string> | string[] | null | undefined) => {
    if (!raw) return null
    if (Array.isArray(raw)) {
      const next: Record<string, string> = {}
      THEME_COLOR_KEYS.forEach((key, index) => {
        const value = raw[index]
        if (typeof value === 'string') next[key] = value
      })
      return Object.keys(next).length ? next : null
    }
    return raw as Record<string, string>
  }
  const resolvedThemeMap = resolveThemeMap(themeColors)
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
    backgroundColor: elementInfo.fill,
  }

  return (
    <div
      className={clsx(
        styles.baseElementChart,
        target === 'thumbnail' && styles.isThumbnail,
      )}
      style={containerStyle}
    >
      <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
        <div className={styles.elementContent} style={elementContentStyle}>
          <ElementOutline
            width={elementInfo.width}
            height={elementInfo.height}
            outline={elementInfo.outline}
          />
          <Chart
            width={elementInfo.width}
            height={elementInfo.height}
            type={elementInfo.chartType}
            data={elementInfo.data}
            themeColors={(elementInfo.themeColors || []).map((color) => resolvePPTColorValue(color, resolvedThemeMap || undefined) )}
            // textColor={elementInfo.textColor}
            lineColor={resolvePPTColorValue(elementInfo.lineColor, resolvedThemeMap || undefined)}
            options={elementInfo.options}
          />
        </div>
      </div>
    </div>
  )
}

export default BaseChartElement
