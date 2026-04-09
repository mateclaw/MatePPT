import React from 'react'
import type { PPTElement } from '@/ppt/core'
import { DEFAULT_ANNOTATION_COLOR, resolveAnnotationColor, textTypeOptions } from '@/ppt/types/annotation'
import styles from './AnnotationHighlight.module.scss'

interface AnnotationHighlightProps {
  label: string
  color: string
}

const stripParens = (input: string) => {
  return input.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

const TEXT_TYPE_LABEL_MAP = textTypeOptions.reduce<Record<string, string>>((map, option) => {
  map[option.value] = stripParens(option.label)
  return map
}, {})

export interface ElementAnnotationMeta {
  label: string
  color: string
}

export function getElementAnnotationMeta(element: PPTElement, allElements: PPTElement[] = []): ElementAnnotationMeta {
  const rawLabelType = String((element as any).labelType || '').trim()
  if (!rawLabelType) return { label: '', color: DEFAULT_ANNOTATION_COLOR }

  if (element.type === 'image') {
    const linkedElement = allElements.find(item => item.id === rawLabelType)
    const linkedName = linkedElement?.name?.trim()
    return {
      label: linkedName ? `${linkedName}` : `${rawLabelType}`,
      color: DEFAULT_ANNOTATION_COLOR,
    }
  }

  if (element.type === 'text' || (element.type === 'shape' && (element as any).text)) {
    return {
      label: `${TEXT_TYPE_LABEL_MAP[rawLabelType] || rawLabelType}`,
      color: resolveAnnotationColor(rawLabelType),
    }
  }

  return {
    label: rawLabelType,
    color: resolveAnnotationColor(rawLabelType),
  }
}

export default function AnnotationHighlight({ label, color }: AnnotationHighlightProps) {
  return (
    <div className={styles.highlight} style={{ ['--annotation-color' as any]: color }}>
      <div className={styles.tag}>{label}</div>
    </div>
  )
}
