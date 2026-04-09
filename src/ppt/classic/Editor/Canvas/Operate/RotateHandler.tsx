import clsx from 'clsx'
import type { HTMLAttributes } from 'react'
import styles from './RotateHandler.module.scss'

export default function RotateHandler({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={clsx(styles['rotate-handler'], className)}
    />
  )
}
