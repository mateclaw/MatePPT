import React, { useEffect, useMemo, useState } from 'react';
import ContentWrapper from "./ContentWrapper";
import { Button, Col, InputNumber, Row, Select, Space, Tooltip } from 'antd';
import { Icon } from 'umi';
import { FONTS, FONT_SIZE_OPTIONS, PRESET_STYLES, normalizeFontFamily } from '@/ppt/configs';
import ElementOpacity from './ElementOpacity';
import ColorButton from './ColorButton';
import styles from "./FontPanel.scss";
import { useCreation } from 'ahooks';
import { useSlidesStore } from '@/ppt/store';
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList';
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot';
import { emitter, EmitterEvents } from '@/ppt/utils/emitter';
import { useMainStore } from '@/ppt/store/useMainStore';
import type { PPTElement } from '@/ppt/core';
import { useShallow } from 'zustand/react/shallow';
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor';
import { PPTColor, Transform } from '@/ppt/core/entity/presentation/PPTColor';
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker';


interface FontPanelProps {

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
export const FontPanel: React.FC<FontPanelProps> = ({
    className = '',
    style,
}) => {
    const slidesStore = useSlidesStore();
    const { handleElement } = useActiveElementList();
    const { addHistorySnapshot } = useHistorySnapshot();
    const richTextAttrs = useMainStore(useShallow((state) => state.richTextAttrs));
    const theme = useSlidesStore((state) => state.theme);

    const fontOptions = useMemo(() => FONTS.map(font => ({ label: font.label, value: font.value })), []);
    const fontSizeOptions = useMemo(() => {
        return FONT_SIZE_OPTIONS.map(size => ({ label: size.toString(), value: size }));
    }, []);

    const currentFontSize = useMemo(() => {
        const raw = richTextAttrs.fontsize as unknown;
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string') {
            const parsed = Number.parseFloat(raw);
            if (!Number.isNaN(parsed)) return parsed;
        }
        return undefined;
    }, [richTextAttrs.fontsize]);

    const currentFontName = useMemo(() => {
        const raw = richTextAttrs.fontname as unknown;
        if (typeof raw === 'string') return normalizeFontFamily(raw);
        return undefined;
    }, [richTextAttrs.fontname]);


    const fontPresetList = useCreation(() => {
        return PRESET_STYLES.map(style => ({ label: style.label, value: style.label }))
    }, []);

    const presetStyleMap = useCreation(() => {
        return PRESET_STYLES.reduce((acc, item) => {
            acc[item.label] = item
            return acc
        }, {} as Record<string, (typeof PRESET_STYLES)[number]>)
    }, []);

    const [lineHeight, setLineHeight] = useState<number>(1.5);
    const [wordSpace, setWordSpace] = useState<number>(0);

    useEffect(() => {
        if (!handleElement) return;
        emitter.emit(EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE);

        if (handleElement.type === 'shape') {
            const text = (handleElement as any).text || {};
            setLineHeight(text.lineHeight ?? 1.2);
            setWordSpace(text.wordSpace ?? 0);
        } else {
            setLineHeight((handleElement as any).lineHeight ?? 1.5);
            setWordSpace((handleElement as any).wordSpace ?? 0);
        }
    }, [handleElement]);

    const updateElementProps = (props: Partial<PPTElement>) => {
        if (!handleElement) return;
        slidesStore.updateElement({ id: handleElement.id, props });
        addHistorySnapshot();
    };

    const updateElementPropsNoHistory = (props: Partial<PPTElement>) => {
        if (!handleElement) return;
        slidesStore.updateElement({ id: handleElement.id, props });
    };

    const updateShapeTextProps = (props: Record<string, any>) => {
        if (!handleElement || handleElement.type !== 'shape') return;
        const latestElement = useSlidesStore.getState().slides[useSlidesStore.getState().slideIndex].elements.find(el => el.id === handleElement.id);
        const latestText = (latestElement as any)?.text || {};
        const nextText = { ...latestText, ...props };
        updateElementProps({ text: nextText } as any);
    };

    const updateShapeTextPropsNoHistory = (props: Record<string, any>) => {
        if (!handleElement || handleElement.type !== 'shape') return;
        const latestElement = useSlidesStore.getState().slides[useSlidesStore.getState().slideIndex].elements.find(el => el.id === handleElement.id);
        const latestText = (latestElement as any)?.text || {};
        const nextText = { ...latestText, ...props };
        updateElementPropsNoHistory({ text: nextText } as any);
    };

    const emitRichTextCommand = (command: string, value?: string | { color: string; scheme?: string; transforms?: string }) => {
        console.log('emitRichTextCommand', command, value);
        emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action: { command, value } });
    };

    const serializeTransforms = (transforms?: PPTColor['transforms']) => {
        if (!transforms || !transforms.length) return undefined;
        return transforms.map((item) => `${item.type}:${item.value}`).join(';');
    };

    const isLocked = !!handleElement?.lock;
    const isDisabled = !handleElement || isLocked;

    return (
        <ContentWrapper title={
            <Space>
                <div>字体</div>

            </Space>
        } className={className} style={style}>

            <div style={{ width: '250px' }} >

                <Row gutter={[8, 8]} >
                    <Col span={24}>
                        <Select
                            style={{ width: '100%' }}
                            // showSearch
                            optionFilterProp="label"
                            value={currentFontName || richTextAttrs.fontname}
                            onChange={(value) => {
                            
                                emitRichTextCommand('fontname', value);
                                if (handleElement?.type === 'shape') {
                                    updateShapeTextProps({ fontName: value });
                                } else {
                                    updateElementProps({ fontName: value } as any);
                                }
                            }}
                            options={fontOptions}
                            disabled={isDisabled}
                        />
                    </Col>
                    <Col span={4}>
                        <PPTColorPicker
                            value={(() => {
                                if (richTextAttrs.colorScheme) {
                                    const transforms = richTextAttrs.colorTransforms
                                        ? richTextAttrs.colorTransforms.split(';').map((item) => {
                                            const [type, value] = item.split(':');
                                            return new Transform(type as any, Number.parseFloat(value));
                                        })
                                        : [];
                                    const resolved = resolvePPTColorValue(richTextAttrs.color, theme.themeColors);
                                    return PPTColor.ofSchemeWithTransforms(richTextAttrs.colorScheme, resolved || richTextAttrs.color, transforms);
                                }
                                return richTextAttrs.color || theme.themeColors?.dk1;
                            })()}
                            onChange={(color) => {
                                const resolved = resolvePPTColorValue(color, theme.themeColors);
                                const hasScheme = Boolean((color as any)?.scheme);
                                const hasTransforms = Array.isArray((color as any)?.transforms) && (color as any)?.transforms.length > 0;
                                if (hasScheme || hasTransforms) {
                                    emitRichTextCommand('color', color as any);
                                } else {
                                    const colorValue = resolved || (color as any)?.value || '';
                                    emitRichTextCommand('color', colorValue);
                                }
                                if (handleElement?.type === 'shape') {
                                    updateShapeTextProps({ fontColor: color });
                                } else {
                                    updateElementProps({ fontColor: color } as any);
                                }
                            }}
                            disabled={isDisabled}
                        >
                            <div>
                                <ColorButton color={resolvePPTColorValue(richTextAttrs.color || theme.themeColors?.dk1, theme.themeColors)} />
                            </div>
                        </PPTColorPicker>
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            // showSearch
                            optionFilterProp="label"
                            value={currentFontSize}
                            onChange={(value) => {
                                const parsedSize = typeof value === 'number' ? value : Number.parseFloat(value);
                                console.log(parsedSize);
                                if (Number.isNaN(parsedSize) || !handleElement) return;
                                emitRichTextCommand('fontsize', `${parsedSize}px`);
                                if (handleElement.type === 'shape') {
                                    const currentSize = (handleElement as any).text?.fontSize;
                                    if (currentSize === parsedSize) return;
                                    updateShapeTextPropsNoHistory({ fontSize: parsedSize });
                                } else {
                                    const currentSize = (handleElement as any).fontSize;
                                    if (currentSize === parsedSize) return;
                                    updateElementPropsNoHistory({ fontSize: parsedSize } as any);
                                }
                            }}
                            options={fontSizeOptions}
                            disabled={isDisabled}
                        />
                    </Col>
                    <Col span={12}>
                        <Select
                            style={{ width: '100%' }}
                            // showSearch
                            optionFilterProp="label"
                            placeholder="预设样式"
                            onChange={(value) => {
                                const target = presetStyleMap[value];
                                if (target?.cmd) {
                                    emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action: target.cmd });
                                }
                            }}
                            options={fontPresetList}
                            disabled={isDisabled}
                        />
                    </Col>
                    <Col span={24}>
                        <div className={styles['font-setting-actions']}>
                            
                                <Tooltip title="加粗">
                                    <Button size='small' type={richTextAttrs.bold ? 'primary' : 'text'} onClick={() => emitRichTextCommand('bold')} disabled={isDisabled}><Icon icon="ri:bold" /></Button>
                                </Tooltip>
                                <Tooltip title="斜体">
                                    <Button size='small' type={richTextAttrs.em ? 'primary' : 'text'} onClick={() => emitRichTextCommand('em')} disabled={isDisabled}><Icon icon="ri:italic" /></Button>
                                </Tooltip>
                                <Tooltip title="下划线">
                                    <Button size='small' type={richTextAttrs.underline ? 'primary' : 'text'} onClick={() => emitRichTextCommand('underline')} disabled={isDisabled}><Icon icon="ri:underline" /></Button>
                                </Tooltip>
                                <Tooltip title="删除线">
                                    <Button size='small' type={richTextAttrs.strikethrough ? 'primary' : 'text'} onClick={() => emitRichTextCommand('strikethrough')} disabled={isDisabled}><Icon icon="ri:strikethrough" /></Button>
                                </Tooltip>
                            
                        </div>
                    </Col>
                    <Col span={12}>
                        <Tooltip title="行高">
                            <InputNumber className='w-full' prefix={
                                <div className='flex items-center justify-center w-5 pr-1'>
                                    <Icon icon="ri:line-height-2" />
                                </div>

                            }
                                min={0.5}
                                step={0.1}
                                value={lineHeight}
                                onChange={(value) => {
                                    const nextValue = typeof value === 'number' ? value : 1.2;
                                    setLineHeight(nextValue);
                                    if (handleElement?.type === 'shape') {
                                        updateShapeTextProps({ lineHeight: nextValue });
                                    } else {
                                        updateElementProps({ lineHeight: nextValue } as any);
                                    }
                                }}
                                disabled={isDisabled}
                            />
                        </Tooltip>
                    </Col>
                    <Col span={12}>
                        <Tooltip title="字间距">
                            <InputNumber className='w-full' prefix={
                                <div className='flex items-center justify-center w-5 pr-1'>
                                    <Icon icon="ri:letter-spacing-2" />
                                </div>

                            }
                                min={0}
                                step={1}
                                value={wordSpace}
                                onChange={(value) => {
                                    const nextValue = typeof value === 'number' ? value : 0;
                                    setWordSpace(nextValue);
                                    if (handleElement?.type === 'shape') {
                                        updateShapeTextProps({ wordSpace: nextValue });
                                    } else {
                                        updateElementProps({ wordSpace: nextValue } as any);
                                    }
                                }}
                                disabled={isDisabled}
                            />
                        </Tooltip>
                    </Col>
            

                </Row>
            </div>
        </ContentWrapper>
    );
};

export default FontPanel;
