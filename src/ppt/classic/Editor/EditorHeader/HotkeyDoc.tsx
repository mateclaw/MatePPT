import { HOTKEY_DOC } from '@/ppt/configs/hotkey'
import styles from './HotkeyDoc.module.scss'

export default function HotkeyDoc() {
  return (
    <div className={styles['hotkey-doc']}>
      {HOTKEY_DOC.map((item) => (
        <div key={item.type}>
          <div className={styles.title}>{item.type}</div>
          {item.children.map((hotkey) => (
            <div className={styles['hotkey-item']} key={`${item.type}-${hotkey.label}`}>
              {hotkey.value ? (
                <>
                  <div className={styles.label}>{hotkey.label}</div>
                  <div className={styles.value}>{hotkey.value}</div>
                </>
              ) : (
                <div className={styles.row}>{hotkey.label}</div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
