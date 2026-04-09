import { useState } from 'react'
import { Button, InputNumber, message } from 'antd'
import styles from './TableGenerator.module.scss'

interface InsertData {
  row: number
  col: number
}

interface TableGeneratorProps {
  onInsert: (data: InsertData) => void
  onClose: () => void
}

export default function TableGenerator({ onInsert, onClose }: TableGeneratorProps) {
  const [endCell, setEndCell] = useState<number[]>([])
  const [customRow, setCustomRow] = useState(3)
  const [customCol, setCustomCol] = useState(3)
  const [isCustom, setIsCustom] = useState(false)

  const handleClickTable = () => {
    if (!endCell.length) return
    const [row, col] = endCell
    onInsert({ row, col })
  }

  const insertCustomTable = () => {
    if (customRow < 1 || customRow > 20) {
      message.warning('行数/列数必须在0~20之间！')
      return
    }
    if (customCol < 1 || customCol > 20) {
      message.warning('行数/列数必须在0~20之间！')
      return
    }
    onInsert({ row: customRow, col: customCol })
    setIsCustom(false)
  }

  const close = () => {
    onClose()
    setIsCustom(false)
  }

  return (
    <div className={styles['table-generator']}>
      <div className={styles.title}>
        <div className={styles.left}>
          表格 {endCell.length ? `${endCell[0]} x ${endCell[1]}` : ''}
        </div>
        <div className={styles.right} onClick={() => setIsCustom(!isCustom)}>
          {isCustom ? '返回' : '自定义'}
        </div>
      </div>

      {!isCustom && (
        <table
          onMouseLeave={() => setEndCell([])}
          onClick={handleClickTable}
        >
          <tbody>
            {Array.from({ length: 10 }, (_, rowIndex) => rowIndex + 1).map((row) => (
              <tr key={row}>
                {Array.from({ length: 10 }, (_, colIndex) => colIndex + 1).map((col) => (
                  <td
                    key={col}
                    onMouseEnter={() => setEndCell([row, col])}
                  >
                    <div
                      className={`${styles.cell} ${
                        endCell.length && row <= endCell[0] && col <= endCell[1]
                          ? styles.active
                          : ''
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isCustom && (
        <div className={styles.custom}>
          <div className={styles.row}>
            <div className={styles.label} style={{ width: '25%' }}>
              行数：
            </div>
            <InputNumber
              min={1}
              max={20}
              value={customRow}
              onChange={(value) => setCustomRow(Number(value || 1))}
              style={{ width: '75%' }}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.label} style={{ width: '25%' }}>
              列数：
            </div>
            <InputNumber
              min={1}
              max={20}
              value={customCol}
              onChange={(value) => setCustomCol(Number(value || 1))}
              style={{ width: '75%' }}
            />
          </div>
          <div className={styles.btns}>
            <Button className={styles.btn} onClick={close}>
              取消
            </Button>
            <Button className={styles.btn} type="primary" onClick={insertCustomTable}>
              确认
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
