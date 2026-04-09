import React, { useEffect, useState } from 'react';
import ContentWrapper from "./ContentWrapper";
import { Button, Col, InputNumber, Row, Space, Tooltip } from 'antd';
import { LockOutlined, RotateRightOutlined, UnlockOutlined } from '@ant-design/icons';
import { Icon } from 'umi';
import { useSlidesStore } from '@/ppt/store';
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot';
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList';
import useLockElement from '@/ppt/hooks/useLockElement';
import type { PPTElement } from '@/ppt/core';
import { useThrottleFn } from "ahooks";


interface PositionPanelProps {

    className?: string;
    style?: React.CSSProperties;
}

/**
 * 内容包装器组件
 * 用于展示标题和内容的通用容器
 * 
 * @example
 * ```tsx
 * <ContentWrapper title="基本信息">
 *   <div>这是内容区域</div>
 * </ContentWrapper>
 * ```
 */
export const PositionPanel: React.FC<PositionPanelProps> = ({
    className = '',
    style,
}) => {

    const slidesStore = useSlidesStore();
    const { handleElement } = useActiveElementList();
    const { addHistorySnapshot } = useHistorySnapshot();
    const { lockElement, unlockElement } = useLockElement();
    const [panelCollapsed, setPanelCollapsed] = useState(true);

    const [position, setPosition] = useState({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        rotate: 0,
    });
    const [flip, setFlip] = useState({ flipH: false, flipV: false });

    useEffect(() => {
        if (!handleElement) {
            setPosition({ left: 0, top: 0, width: 0, height: 0, rotate: 0 });
            setFlip({ flipH: false, flipV: false });
            return;
        }

        setPosition({
            left: handleElement.left ?? 0,
            top: handleElement.top ?? 0,
            width: handleElement.width ?? 0,
            height: handleElement.height ?? 0,
            rotate: handleElement.rotate ?? 0,
        });
        setFlip({ flipH: !!handleElement.flipH, flipV: !!handleElement.flipV });
    }, [handleElement]);

    const updateElementProps = (props: Partial<PPTElement>) => {
        if (!handleElement) return;
        slidesStore.updateElement({ id: handleElement.id, props });
        addHistorySnapshot();
    };

    const updatePosition = useThrottleFn((key: keyof typeof position, value: number | null) => {
        if (!handleElement) return;
        const nextValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
        setPosition((prev) => ({ ...prev, [key]: nextValue }));
        if (handleElement.type === 'text' && (key === 'width' || key === 'height')) {
            updateElementProps({ [key]: nextValue, autoFit: 'none' } as Partial<PPTElement>);
            return;
        }
        updateElementProps({ [key]: nextValue } as Partial<PPTElement>);
    }, { wait: 300 }).run;



    const toggleFlip = (key: 'flipH' | 'flipV') => {
        if (!handleElement) return;
        const nextValue = !flip[key];
        setFlip((prev) => ({ ...prev, [key]: nextValue }));
        updateElementProps({ [key]: nextValue } as Partial<PPTElement>);
    };

    const isLocked = !!handleElement?.lock;
    const isDisabled = !handleElement || isLocked;
    const hideFlip =
        handleElement?.type === 'video' ||
        handleElement?.type === 'audio' ||
        // handleElement?.type === 'text' ||
        handleElement?.type === 'chart' ||
        handleElement?.type === 'table';

    return (
        <ContentWrapper title={
            <Space>
                <div>大小和位置</div>
                <span
                    className="cursor-pointer"
                    onClick={() => {
                        if (!handleElement) return;
                        if (isLocked) {
                            unlockElement(handleElement as any);
                        } else {
                            lockElement();
                        }
                    }}
                >
                    {isLocked ? <LockOutlined /> : <UnlockOutlined />}
                </span>
                <span
                    className="cursor-pointer"
                    onClick={() => {
                        setPanelCollapsed((prev) => !prev);
                    }}
                >
                    <Icon icon={panelCollapsed ? 'ri:eye-off-line' : 'ri:eye-line'} />
                </span>
            </Space>
        } className={className} style={style}>

            {!panelCollapsed && (
                <Row gutter={[35, 8]} >
                    <Col span={12}>

                        <InputNumber className='w-full' prefix={
                            <div className='flex items-center justify-center w-5 pr-1'>
                                X
                            </div>
                        } min={0} precision={2} step={0.01} value={position.left} onChange={(value) => updatePosition('left', value)} disabled={isDisabled} />
                    </Col>
                    <Col span={12}>
                        <InputNumber className='w-full' prefix={
                            <div className='flex items-center justify-center w-5 pr-1'>
                                Y
                            </div>
                        } min={0} precision={2} step={0.01} value={position.top} onChange={(value) => updatePosition('top', value)} disabled={isDisabled} />
                    </Col>
                    <Col span={12}>
                        <InputNumber className='w-full' prefix={
                            <div className='flex items-center justify-center w-5 pr-1'>
                                W
                            </div>
                        } min={0} precision={2} step={0.01} value={position.width} onChange={(value) => updatePosition('width', value)} disabled={isDisabled} />
                    </Col>
                    <Col span={12}>
                        <InputNumber className='w-full' prefix={
                            <div className='flex items-center justify-center w-5 pr-1'>
                                H
                            </div>
                        } min={0} precision={2} step={0.01} value={position.height} onChange={(value) => updatePosition('height', value)} disabled={isDisabled} />
                    </Col>
                    <Col span={12}>
                        <Tooltip title="旋转角度">
                            <InputNumber className='w-full' prefix={
                                <div className='flex items-center justify-center w-5 pr-1'>
                                    <RotateRightOutlined />
                                </div>

                            }
                                formatter={(value) => `${value}°`}
                                precision={2}
                                step={0.01}
                                value={position.rotate}

                                parser={(value) => {
                                    const parsed = Number((value || '0').replace('°', ''));
                                    return Number.isNaN(parsed) ? 0 : parsed;
                                }}
                                onChange={(value) => updatePosition('rotate', value)}
                                disabled={isDisabled}
                            />
                        </Tooltip>
                    </Col>
                    {!hideFlip && (
                        <Col span={12}>
                            <Space>
                                {handleElement.type !== 'text' && <Tooltip title="水平翻转">
                                    <Button type={flip.flipH ? "primary" : "default"} onClick={() => toggleFlip('flipH')} disabled={isDisabled}>
                                        <Icon icon="ri:flip-horizontal-line" />
                                    </Button>
                                </Tooltip>}

                                <Tooltip title="垂直翻转">
                                    <Button type={flip.flipV ? "primary" : "default"} onClick={() => toggleFlip('flipV')} disabled={isDisabled}>
                                        <Icon icon="ri:flip-vertical-line" />
                                    </Button>
                                </Tooltip>

                            </Space>
                        </Col>
                    )}

                </Row>
            )}

        </ContentWrapper>
    );
};

export default PositionPanel;
