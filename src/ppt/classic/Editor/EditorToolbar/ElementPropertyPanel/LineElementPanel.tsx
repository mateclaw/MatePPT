import React, { useMemo } from 'react'
import { Button, Col, Divider, InputNumber, Row, Select, Space } from 'antd'
import { Icon } from 'umi'
import type { LinePoint, LineStyleType, PPTLineElement } from '@/ppt/core'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker'
import { useSlidesStore } from '@/ppt/store'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList'
import { PositionPanel } from './common/PositionPanel'
import ElementOpacity from './common/ElementOpacity'
import ElementShadow from './common/ElementShadow'
import SVGLine from './common/SVGLine'
import ColorButton from './common/ColorButton'
import ContentWrapper from './common/ContentWrapper'
import fontStyles from './common/FontPanel.scss'
import ElementOutline from './common/ElementOutline'

interface LineElementPanelProps { }

export const LineElementPanel: React.FC<LineElementPanelProps> = () => {
  const slidesStore = useSlidesStore()
  const { handleElement } = useActiveElementList()
  const { addHistorySnapshot } = useHistorySnapshot()

  const handleLineElement = handleElement as PPTLineElement | null
  if (!handleLineElement) return null

  const updateLine = (props: Partial<PPTLineElement>) => {
    slidesStore.updateElement({ id: handleLineElement.id, props })
    addHistorySnapshot()
  }

  const lineStyleOptions: LineStyleType[] = ['solid', 'dashed', 'dotted']
  const lineMarkerOptions: LinePoint[] = ['', 'arrow', 'dot']

  const lineStyleSelectOptions = useMemo(
    () =>
      lineStyleOptions.map((item) => ({
        value: item,
        label: <SVGLine type={item} />,
      })),
    [],
  )

  const startMarkerOptions = useMemo(
    () =>
      lineMarkerOptions.map((item) => ({
        value: item,
        label: <SVGLine padding={5} markers={[item, '']} />,
      })),
    [],
  )

  const endMarkerOptions = useMemo(
    () =>
      lineMarkerOptions.map((item) => ({
        value: item,
        label: <SVGLine padding={5} markers={['', item]} />,
      })),
    [],
  )

  return (
    <div>
      <PositionPanel />
      <Divider size="small" />
      <ContentWrapper
        title={
          <Space>
            <div>线条</div>
          </Space>
        }
      >
        <div style={{ width: '250px' }}>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Row align="middle" gutter={8}>
                <Col span={8}>线条样式</Col>
                <Col span={16}>
                  <Select
                    style={{ width: '100%' }}
                    value={handleLineElement.style}
                    onChange={(value) => updateLine({ style: value as LineStyleType })}
                    options={lineStyleSelectOptions}
                    optionLabelProp="label"
                  />
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row align="middle" gutter={8}>
                <Col span={8}>线条颜色</Col>
                <Col span={16}>
                  <PPTColorPicker value={handleLineElement.color} onChange={(color: PPTColor) => updateLine({ color })}>
                    <div>
                      <ColorButton color={resolvePPTColorValue(handleLineElement.color) } />
                    </div>
                  </PPTColorPicker>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row align="middle" gutter={8}>
                <Col span={8}>线条宽度</Col>
                <Col span={16}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={20}
                    value={handleLineElement.strokeWidth}
                    onChange={(value) => {
                      const nextWidth = Number(value || 0)
                      updateLine({ strokeWidth: nextWidth, width: nextWidth })
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row align="middle" gutter={8}>
                <Col span={8}>起点样式</Col>
                <Col span={16}>
                  <Select
                    style={{ width: '100%' }}
                    value={handleLineElement.points[0]}
                    onChange={(value) => updateLine({ points: [value as LinePoint, handleLineElement.points[1]] })}
                    options={startMarkerOptions}
                    optionLabelProp="label"
                  />
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row align="middle" gutter={8}>
                <Col span={8}>终点样式</Col>
                <Col span={16}>
                  <Select
                    style={{ width: '100%' }}
                    value={handleLineElement.points[1]}
                    onChange={(value) => updateLine({ points: [handleLineElement.points[0], value as LinePoint] })}
                    options={endMarkerOptions}
                    optionLabelProp="label"
                  />
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <div className={fontStyles['font-setting-actions']}>
                <Button
                  size="small"
                  type="text"
                  onClick={() => updateLine({ start: handleLineElement.end, end: handleLineElement.start })}
                >
                  <Icon icon="ri:arrow-left-right-line" /> 交换方向
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </ContentWrapper>
      <Divider />
      <ContentWrapper

      >
        <ElementShadow />

        {/* <ElementOpacity /> */}

      </ContentWrapper>
    </div>
  )
}

export default LineElementPanel
