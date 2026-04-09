import React from 'react'
import { Divider } from 'antd'
import { PositionPanel } from './common/PositionPanel'
import ContentWrapper from './common/ContentWrapper'
import ElementOpacity from './common/ElementOpacity'
import ChartStylePanel from './ChartStylePanel/ChartStylePanel'

interface ChartElementPanelProps { }

export const ChartElementPanel: React.FC<ChartElementPanelProps> = () => {
  return (
    <div>
      <PositionPanel />
      <Divider size="small" />
      <ContentWrapper>
        <ChartStylePanel />
      </ContentWrapper>

    </div>
  )
}

export default ChartElementPanel
