import clsx from 'clsx'
import type { CSSProperties, HTMLAttributes } from 'react'
import styles from './BorderLine.module.scss'
import type { OperateBorderLines } from '@/ppt/types/edit'

interface BorderLineProps extends HTMLAttributes<HTMLDivElement> {
  type: OperateBorderLines
  isWide?: boolean
  style?: CSSProperties
  className?: string
}

export default function BorderLine({
  type,
  isWide = false,
  style,
  className,
  ...rest
}: BorderLineProps) {
  return (
    <div
      {...rest}
      className={clsx(
        styles['border-line'],
        styles[type],       // top / bottom / left / right
        isWide && styles.wide,
        className,
      )}
      style={style}
    />
  )
}
