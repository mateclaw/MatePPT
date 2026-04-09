import React from 'react'
import styles from './ColorButton.module.scss'

interface ColorButtonProps {
  color?: string,
  onClick?: () => void,
}

export default function ColorButton({ color, onClick }: ColorButtonProps) {
  return (
    <div
      onClick={onClick}
      className={styles['color-button']}
      aria-label="color"
    >
      <div className={styles['color-button__inner']} style={{ backgroundColor: color || '#000' }} />
    </div>
  )
}
