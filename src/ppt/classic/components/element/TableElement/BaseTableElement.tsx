import React, { type FC } from 'react'
import type { PPTTableElement } from '@/ppt/core'
import StaticTable from './StaticTable'
import styles from './BaseTableElement.module.scss'

interface BaseTableElementProps {
  elementInfo: PPTTableElement
}

const BaseTableElement: FC<BaseTableElementProps> = ({ elementInfo }) => {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: elementInfo.top,
    left: elementInfo.left,
    width: elementInfo.width,
  }

  const rotateWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `rotate(${elementInfo.rotate}deg)`,
  }

  return (
    <div className={styles.baseElementTable} style={containerStyle}>
      <div className={styles.rotateWrapper} style={rotateWrapperStyle}>
        <div className={styles.elementContent}>
          <StaticTable
            data={elementInfo.data}
            width={elementInfo.width}
            cellMinHeight={elementInfo.cellMinHeight}
            colWidths={elementInfo.colWidths}
            outline={elementInfo.outline}
            theme={elementInfo.theme}
          />
        </div>
      </div>
    </div>
  )
}

export default BaseTableElement
