import { useMemo } from 'react'
import type { TableCell } from '@/ppt/core'

export const useHideCells = (cells: TableCell[][]) => {
  const hideCells = useMemo(() => {
    const hidden: string[] = []

    for (let i = 0; i < cells.length; i++) {
      const rowCells = cells[i]

      for (let j = 0; j < rowCells.length; j++) {
        const cell = rowCells[j]
        if (!cell) continue

        if (cell.colspan > 1 || cell.rowspan > 1) {
          for (let row = i; row < i + cell.rowspan; row++) {
            for (let col = row === i ? j + 1 : j; col < j + cell.colspan; col++) {
              hidden.push(`${row}_${col}`)
            }
          }
        }
      }
    }

    return hidden
  }, [cells])

  return {
    hideCells,
  }
}

export default useHideCells
