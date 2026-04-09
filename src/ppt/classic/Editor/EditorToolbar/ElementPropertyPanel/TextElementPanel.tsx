import React from 'react'
import { Divider } from 'antd'
import { FontPanel } from './common/FontPanel'
import { PositionPanel } from './common/PositionPanel'
import AlignPanel from './common/AlignPanel'
import ContentWrapper from './common/ContentWrapper'
import ElementOutline from './common/ElementOutline'
import ElementShadow from './common/ElementShadow'
import ElementOpacity from './common/ElementOpacity'

interface TextElementPanelProps { }

export const TextElementPanel: React.FC<TextElementPanelProps> = () => {
  return (
    <div>
      <PositionPanel />
      <Divider size="small" />
      <FontPanel />
      <Divider size="small" />
      <AlignPanel />
      <Divider size="small" />
      <ContentWrapper>

        <ElementOutline />

        <ElementShadow />

        <ElementOpacity />

      </ContentWrapper>
    </div>
  )
}

export default TextElementPanel
