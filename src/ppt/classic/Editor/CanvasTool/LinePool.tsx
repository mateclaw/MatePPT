import LinePointMarker from '@/ppt/classic/components/element/LineElement/LinePointMarker'
import { LINE_LIST, type LinePoolItem } from '@/ppt/configs/lines'
import styles from './LinePool.module.scss'

interface LinePoolProps {
  onSelect: (line: LinePoolItem) => void
}

export default function LinePool({ onSelect }: LinePoolProps) {
  return (
    <div className={styles['line-pool']}>
      {LINE_LIST.map((item, i) => (
        <div className={styles.category} key={item.type}>
          <div className={styles['category-name']}>{item.type}</div>
          <div className={styles['line-list']}>
            {item.children.map((line, j) => (
              <div className={styles['line-item']} key={j}>
                <div
                  className={styles['line-content']}
                  onClick={() => onSelect(line)}
                >
                  <svg overflow="visible" width="20" height="20">
                    <defs>
                      {line.points[0] && (
                        <LinePointMarker
                          className={styles['line-marker']}
                          id={`preset-line-${i}-${j}`}
                          position="start"
                          type={line.points[0] as any}
                          color="currentColor"
                          baseSize={2}
                        />
                      )}
                      {line.points[1] && (
                        <LinePointMarker
                          className={styles['line-marker']}
                          id={`preset-line-${i}-${j}`}
                          position="end"
                          type={line.points[1] as any}
                          color="currentColor"
                          baseSize={2}
                        />
                      )}
                    </defs>
                    <path
                      className={styles['line-path']}
                      d={line.path}
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                      strokeDasharray={line.style === 'solid' ? '0, 0' : '4, 1'}
                      markerStart={
                        line.points[0]
                          ? `url(#preset-line-${i}-${j}-${line.points[0]}-start)`
                          : undefined
                      }
                      markerEnd={
                        line.points[1]
                          ? `url(#preset-line-${i}-${j}-${line.points[1]}-end)`
                          : undefined
                      }
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
