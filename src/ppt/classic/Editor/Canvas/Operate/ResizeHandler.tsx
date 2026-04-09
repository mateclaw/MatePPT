import clsx from 'clsx'
import type { HTMLAttributes } from 'react'
import type { OperateResizeHandlers } from '@/ppt/types/edit'
import styles from './ResizeHandler.module.scss'

interface ResizeHandlerProps extends HTMLAttributes<HTMLDivElement> {
  type?: OperateResizeHandlers
  rotate?: number
}

const getRotateClassName = (rotate: number) => {
  const prefix = 'rotate-'
  if (rotate > -22.5 && rotate <= 22.5) return `${prefix}0`
  if (rotate > 22.5 && rotate <= 67.5) return `${prefix}45`
  if (rotate > 67.5 && rotate <= 112.5) return `${prefix}90`
  if (rotate > 112.5 && rotate <= 157.5) return `${prefix}135`
  if (rotate > 157.5 || rotate <= -157.5) return `${prefix}0`
  if (rotate > -157.5 && rotate <= -112.5) return `${prefix}45`
  if (rotate > -112.5 && rotate <= -67.5) return `${prefix}90`
  if (rotate > -67.5 && rotate <= -22.5) return `${prefix}135`
  return `${prefix}0`
}

export default function ResizeHandler({
  type,
  rotate = 0,
  className,
  ...rest
}: ResizeHandlerProps) {
  const rotateClassName = getRotateClassName(rotate)

  return (
    <div
      {...rest}
      className={clsx(
        styles['resize-handler'],
        styles[rotateClassName],
        type && styles[type],
        className,
      )}
    />
  )
}
