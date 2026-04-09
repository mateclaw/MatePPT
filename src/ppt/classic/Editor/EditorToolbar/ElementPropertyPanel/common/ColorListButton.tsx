import styles from './ColorListButton.module.scss'

interface ColorListButtonProps {
  colors: string[]
  className?: string
  onClick?: () => void
}

export default function ColorListButton({ colors, className, onClick }: ColorListButtonProps) {
  return (
    <button
      type="button"
      className={`${styles['color-list-button']} ${className || ''}`}
      onClick={onClick}
    >
      {colors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className={styles['color-block']}
          style={{ backgroundColor: color }}
        />
      ))}
    </button>
  )
}
