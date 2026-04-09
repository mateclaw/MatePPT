import React, { useEffect } from 'react';
import ContentWrapper from "./ContentWrapper";
import { Button, Col, Dropdown, Row, Space, Tooltip } from 'antd';
import { Icon } from 'umi';
import styles from "./FontPanel.scss";
import { useSlidesStore } from '@/ppt/store';
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList';
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot';
import { emitter, EmitterEvents } from '@/ppt/utils/emitter';
import { useMainStore } from '@/ppt/store/useMainStore';
import type { PPTElement } from '@/ppt/core';

interface AlignPanelProps {

    className?: string;
    style?: React.CSSProperties;
}


export const AlignPanel: React.FC<AlignPanelProps> = ({
    className = '',
    style,
}) => {
    const slidesStore = useSlidesStore();
    const { handleElement } = useActiveElementList();
    const { addHistorySnapshot } = useHistorySnapshot();
    const richTextAttrs = useMainStore((state) => state.richTextAttrs);

    useEffect(() => {
        if (!handleElement) return;
        emitter.emit(EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE);
    }, [handleElement]);

    const updateElementProps = (props: Partial<PPTElement>) => {
        if (!handleElement) return;
        slidesStore.updateElement({ id: handleElement.id, props });
        addHistorySnapshot();
    };

    const updateShapeTextProps = (props: Record<string, any>) => {
        if (!handleElement || handleElement.type !== 'shape') return;
        const latestElement = useSlidesStore.getState().slides[useSlidesStore.getState().slideIndex].elements.find(el => el.id === handleElement.id);
        const latestText = (latestElement as any)?.text || {};
        const nextText = { ...latestText, ...props };
        updateElementProps({ text: nextText } as any);
    };

    const emitRichTextCommand = (command: string, value?: string) => {
        emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action: { command, value } });
    };

    const isLocked = !!handleElement?.lock;
    const isDisabled = !handleElement || isLocked;
    const isTextElement = handleElement?.type === 'text';
    const currentAlign = handleElement?.type === 'shape'
        ? (handleElement as any).text?.alignH || 'left'
        : richTextAttrs.align;
    const currentVerticalAlign = handleElement?.type === 'shape'
        ? (handleElement as any).text?.alignV || 'middle'
        : (handleElement as any)?.alignV || 'top';
    const isFixedSize = isTextElement ? (handleElement as any).autoFit === 'none' : false;
    const textAutoFitValue = isFixedSize ? 'none' : 'resizeShapeToFitText';
    const textAutoFitIcon = textAutoFitValue === 'resizeShapeToFitText' ? (
        <Icon icon="ri:text-wrap" />
    ) : (
        <span
            style={{
                width: 12,
                height: 10,
                border: '1px solid currentColor',
                borderRadius: 2,
                display: 'inline-block',
            }}
        />
    );

    return (
        <ContentWrapper title={
            <Space>
                <div>排版</div>

            </Space>
        } className={className} style={style}>

            <div style={{ width: '250px' }} >

                <Row gutter={[8, 8]} >

                    <Col span={24}>
                        <div className={styles['font-setting-actions']}>

                            <Tooltip title="左对齐">
                                <Button size='small' type={currentAlign === 'left' ? 'primary' : 'text'} onClick={() => {
                                    emitRichTextCommand('align', 'left');
                                    if (handleElement?.type === 'shape') updateShapeTextProps({ alignH: 'left' });
                                    else updateElementProps({ align: 'left' } as any);
                                }} disabled={isDisabled}><Icon icon="ri:align-left" /></Button>
                            </Tooltip>
                            <Tooltip title="左右居中">
                                <Button size='small' type={currentAlign === 'center' ? 'primary' : 'text'} onClick={() => {
                                    emitRichTextCommand('align', 'center');
                                    if (handleElement?.type === 'shape') updateShapeTextProps({ alignH: 'center' });
                                    else updateElementProps({ align: 'center' } as any);
                                }} disabled={isDisabled}><Icon icon="ri:align-center" /></Button>
                            </Tooltip>
                            <Tooltip title="右对齐">
                                <Button size='small' type={currentAlign === 'right' ? 'primary' : 'text'} onClick={() => {
                                    emitRichTextCommand('align', 'right');
                                    if (handleElement?.type === 'shape') updateShapeTextProps({ alignH: 'right' });
                                    else updateElementProps({ align: 'right' } as any);
                                }} disabled={isDisabled}><Icon icon="ri:align-right" /></Button>
                            </Tooltip>
                            <Tooltip title="两端对齐">
                                <Button size='small' type={currentAlign === 'justify' ? 'primary' : 'text'} onClick={() => {
                                    emitRichTextCommand('align', 'justify');
                                    if (handleElement?.type === 'shape') updateShapeTextProps({ alignH: 'justify' });
                                    else updateElementProps({ align: 'justify' } as any);
                                }} disabled={isDisabled}><Icon icon="ri:align-justify" /></Button>
                            </Tooltip>
                            <Tooltip title="分散对齐">
                                <Button size='small' type={currentAlign === 'distributed' ? 'primary' : 'text'} onClick={() => {
                                    emitRichTextCommand('align', 'distributed');
                                    if (handleElement?.type === 'shape') updateShapeTextProps({ alignH: 'distributed' });
                                    else updateElementProps({ align: 'distributed' } as any);
                                }} disabled={isDisabled}><Icon icon="ri:expand-horizontal-line" /></Button>
                            </Tooltip>

                        </div>
                    </Col>
                    <Col span={18}>
                        <div className={styles['font-setting-actions']}>

                            <Tooltip title="顶部对齐">
                                <Button size='small' type={currentVerticalAlign === 'top' ? 'primary' : 'text'} onClick={() => {
                                    if (handleElement?.type === 'shape') updateShapeTextProps({ alignV: 'top' });
                                    else updateElementProps({ alignV: 'top' } as any);
                                }} disabled={isDisabled}><Icon icon="ri:align-top" /></Button>
                            </Tooltip>
                            <Tooltip title="上下居中">
                                <Button size='small' type={currentVerticalAlign === 'middle' ? 'primary' : 'text'} onClick={() => {
                                    if (handleElement?.type === 'shape') updateShapeTextProps({ alignV: 'middle' });
                                    else updateElementProps({ alignV: 'middle' } as any);
                                }} disabled={isDisabled}><Icon icon="ri:align-vertically" /></Button>
                            </Tooltip>
                            <Tooltip title="底部对齐">
                                <Button size='small' type={currentVerticalAlign === 'bottom' ? 'primary' : 'text'} onClick={() => {
                                    if (handleElement?.type === 'shape') updateShapeTextProps({ alignV: 'bottom' });
                                    else updateElementProps({ alignV: 'bottom' } as any);
                                }} disabled={isDisabled}><Icon icon="ri:align-bottom" /></Button>
                            </Tooltip>



                        </div>
                    </Col>
                    <Col span={6}>
                                {isTextElement && (
                                    <Dropdown
                                        trigger={['click']}
                                        disabled={isDisabled}
                                        menu={{
                                            items: [
                                                {
                                                    key: 'resizeShapeToFitText',
                                                    label: (
                                                        <Space size={6}>
                                                            <Icon icon="ri:text-wrap" />
                                                            自动高度
                                                        </Space>
                                                    ),
                                                },
                                                {
                                                    key: 'none',
                                                    label: (
                                                        <Space size={6}>
                                                            <span
                                                                style={{
                                                                    width: 12,
                                                                    height: 10,
                                                                    border: '1px solid currentColor',
                                                                    borderRadius: 2,
                                                                    display: 'inline-block',
                                                                }}
                                                            />
                                                            固定宽高
                                                        </Space>
                                                    ),
                                                },
                                            ],
                                            onClick: ({ key }) => {
                                                updateElementProps({ autoFit: key } as any);
                                            },
                                        }}
                                    >
                                        <Button size="middle" type="default" className='mt-[1px]' disabled={isDisabled}>
                                            {textAutoFitIcon}
                                        </Button>
                                    </Dropdown>
                                )}
                    </Col>



                </Row>
            </div>
        </ContentWrapper>
    );
};

export default AlignPanel;
