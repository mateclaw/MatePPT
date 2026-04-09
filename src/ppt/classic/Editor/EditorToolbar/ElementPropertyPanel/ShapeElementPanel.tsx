import React, { useEffect, useMemo, useState } from 'react';
import { Divider, Popover, Row, Col, Select, Slider, Space } from 'antd';
import { Icon } from 'umi';
import { ShapeCategory, type Gradient, type GradientType, type PPTShapeElement } from "@/ppt/core";
import { SHAPE_LIST, SHAPE_PATH_FORMULAS, type ShapePoolItem } from '@/ppt/configs/shapes';
import { getImageDataURL } from '@/ppt/utils/image';
import { useSlidesStore } from '@/ppt/store';
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot';
import { useActiveElementList } from '@/ppt/hooks/useActiveElementList';
import ShapeItemThumbnail from '@/ppt/classic/Editor/CanvasTool/ShapeItemThumbnail';
import { FontPanel } from './common/FontPanel';
import { PositionPanel } from "./common/PositionPanel";
import AlignPanel from './common/AlignPanel';
import ContentWrapper from './common/ContentWrapper';
import ElementOutline from './common/ElementOutline';
import ElementShadow from './common/ElementShadow';
import ElementOpacity from './common/ElementOpacity';
import ColorButton from './common/ColorButton';
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker';
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor';
import { normalizePPTColor, resolvePPTColorValue } from '@/ppt/core/utils/pptColor';
import styles from './ShapeElementPanel.module.scss';
import { ShapeFillType, SHAPE_FILL_TYPE_OPTIONS } from '@/ppt/core/types/element';


interface ShapeElementPanelProps {

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
export const ShapeElementPanel: React.FC<ShapeElementPanelProps> = ({

}) => {
    const slidesStore = useSlidesStore();
    const { handleElement } = useActiveElementList();
    const { addHistorySnapshot } = useHistorySnapshot();

    const handleShapeElement = handleElement as PPTShapeElement | null;

    const [fillType, setFillType] = useState<ShapeFillType>(ShapeFillType.FILL);
    const [fill, setFill] = useState<PPTColor | undefined>();
    const [gradient, setGradient] = useState<Gradient>({
        type: 'linear',
        rotate: 0,
        colors: [
            { pos: 0, color: PPTColor.ofFixed('#FFFFFF') },
            { pos: 100, color: PPTColor.ofFixed('#FFFFFF') },
        ],
    });
    const [shapePickerOpen, setShapePickerOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    // const [currentGradientIndex, setCurrentGradientIndex] = useState(0);

    useEffect(() => {
        if (!handleShapeElement || handleShapeElement.type !== 'shape') return;
        const fillColor = normalizePPTColor(handleShapeElement.fill) || PPTColor.ofFixed('#FFFFFF');
        const resolvedFill = resolvePPTColorValue(fillColor) || '';
        const isTransparentFill = resolvedFill === 'transparent' || resolvedFill === 'rgba(0,0,0,0)' || (resolvedFill.length === 9 && resolvedFill.endsWith('00'));
        setFill(fillColor);
        const defaultGradient = {
            type: 'linear' as GradientType,
            rotate: 0,
            colors: [
                { pos: 0, color: fillColor },
                { pos: 100, color: PPTColor.ofFixed('#FFFFFF') },
            ],
        };
        setGradient(handleShapeElement.gradient || defaultGradient);
        const pictureSrc = handleShapeElement.picture?.src || '';
        setImageUrl(pictureSrc);

        
        if (handleShapeElement.picture) {
            setFillType(handleShapeElement.picture.fillMode === 'repeat' ? ShapeFillType.PATTERN : ShapeFillType.IMAGE);
        } else if (handleShapeElement.gradient) {
            setFillType(ShapeFillType.GRADIENT);
        } else if (handleShapeElement.pattern) {
            setFillType(ShapeFillType.PATTERN);
        } else if (!handleShapeElement.fill || isTransparentFill) {
            console.log('handleShapeElement.fill', handleShapeElement.fill);
            setFillType(ShapeFillType.NONE);
        } else {
            setFillType(ShapeFillType.FILL);
        }
        // setCurrentGradientIndex(0);
    }, [handleShapeElement?.id]);

    if (!handleShapeElement) return null;
    const hasShapeText = !!handleShapeElement.text;

    const updateElement = (props: Partial<PPTShapeElement>) => {
        slidesStore.updateElement({ id: handleShapeElement.id, props });
        addHistorySnapshot();
    };

    const removeElementProps = (propName: string | string[]) => {
        slidesStore.removeElementProps({ id: handleShapeElement.id, propName });
        addHistorySnapshot();
    };

    const changeShape = (shape: ShapePoolItem) => {
        const { width, height } = handleShapeElement;
        const props: Partial<PPTShapeElement> = {
            viewBox: shape.viewBox,
            path: shape.path,
            category: ShapeCategory.PRESET,
            pathFormula: shape.pathFormula
        };
        if (shape.pathFormula) {
            props.pathFormula = shape.pathFormula;
            props.viewBox = [width, height];
            const pathFormula = SHAPE_PATH_FORMULAS[shape.pathFormula];
            if ('editable' in pathFormula && pathFormula.editable) {
                props.path = pathFormula.formula(width, height, pathFormula.defaultValue);
                props.keypoints = pathFormula.defaultValue;
            } else {
                props.path = pathFormula.formula(width, height);
            }
        } else {
            props.pathFormula = undefined;
            props.keypoints = undefined;
        }
        updateElement(props);
    };

    const updateFill = (value: PPTColor) => {
        setFill(value);
        updateElement({ fill: value });
    };

    const updateFillType = (type: ShapeFillType) => {
        setFillType(type);
        if (type === ShapeFillType.FILL) {
            removeElementProps(['gradient', 'pattern', 'picture']);
            updateElement({ fill });
            return;
        }
        if (type === ShapeFillType.GRADIENT) {
            removeElementProps(['pattern', 'picture']);
            updateElement({ gradient });
            return;
        }
        if (type === ShapeFillType.NONE) {
            removeElementProps(['fill', 'gradient', 'pattern', 'picture']);
            return;
        }
        if (!imageUrl) {
            return;
        }

        removeElementProps(['gradient', 'pattern']);
        const fillMode = type === ShapeFillType.PATTERN ? 'repeat' : 'cover';
        updateElement({ picture: { src: imageUrl, fillMode } as any });
    };

    const updateGradient = (gradientProps: Partial<Gradient>) => {
        const next = { ...gradient, ...gradientProps };
        setGradient(next);
        updateElement({ gradient: next });
    };

    const updateGradientColors = (currentGradientIndex: number, color: PPTColor) => {
        const colors = gradient.colors.map((item, index) => {
            if (index === currentGradientIndex) return { ...item, color };
            return item;
        });
        updateGradient({ colors });
    };

    const uploadFillImage = (files: FileList | null) => {
        const imageFile = files?.[0];
        if (!imageFile) return;
        getImageDataURL(imageFile).then((dataURL) => {
            setImageUrl(dataURL);
            if (fillType === ShapeFillType.PATTERN) {
                updateElement({ picture: { src: dataURL, fillMode: 'repeat' } as any });
            } else if (fillType === ShapeFillType.IMAGE) {
                updateElement({ picture: { src: dataURL, fillMode: 'cover' } as any });
            }
        });
    };

    const gradientOptions = useMemo(
        () => gradient.colors.map((item, index) => ({ key: `gradient-${index}`, color: item.color, index })),
        [gradient.colors],
    );
    const currentShape = useMemo(() => {
        if (!handleShapeElement) return null;
        const allShapes = SHAPE_LIST.flatMap((item) => item.children);
        if (handleShapeElement.pathFormula) {
            const matchedByFormula = allShapes.find((shape) => shape.pathFormula === handleShapeElement.pathFormula);
            if (matchedByFormula) return matchedByFormula;
        }
        if (handleShapeElement.path) {
            const matchedByPath = allShapes.find((shape) => shape.path === handleShapeElement.path);
            if (matchedByPath) return matchedByPath;
        }
        if (handleShapeElement.path && handleShapeElement.viewBox) {
            return {
                path: handleShapeElement.path,
                viewBox: handleShapeElement.viewBox as [number, number],
            } as ShapePoolItem;
        }
        return null;
    }, [handleShapeElement?.pathFormula, handleShapeElement?.path, handleShapeElement?.viewBox]);

    return (
        <div>
            <PositionPanel />
            <Divider size="small" />
            <ContentWrapper title="形状">

                <div className={styles.shapeActions}>
                    <div className={styles.currentShape}>
                        {currentShape ? (
                            <ShapeItemThumbnail
                                className={styles.shapePickerThumb}
                                shape={currentShape}
                                disableHover
                            />
                        )
                            : <span className={styles.shapePickerLabel}>
                                {'无'}
                            </span>
                        }


                    </div>
                    <Popover
                        placement="rightTop"
                        trigger="click"
                        open={shapePickerOpen}
                        onOpenChange={setShapePickerOpen}
                        content={
                            <div className={styles.shapePool}>
                                {SHAPE_LIST.map((item) => (
                                    <div className={styles.category} key={item.type}>
                                        <div className={styles.categoryTitle}>{item.type}</div>
                                        <div className={styles.shapeList}>
                                            {item.children.map((shape, index) => (
                                                <ShapeItemThumbnail
                                                    key={`${item.type}-${index}`}
                                                    className={styles.shapeItem}
                                                    shape={shape}
                                                    onClick={() => {
                                                        changeShape(shape);
                                                        setShapePickerOpen(false);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        <div className={styles.shapePickerGroup}>

                            <button
                                type="button"
                                className={styles.shapePickerButton}
                            >
                                选择形状
                            </button>
                        </div>
                    </Popover>
                </div>
            </ContentWrapper>
            <Divider size="small" />
            <ContentWrapper title="填充">
                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <Select
                            style={{ width: '100%' }}
                            value={fillType}
                            onChange={(value) => updateFillType(value as ShapeFillType)}
                            options={SHAPE_FILL_TYPE_OPTIONS}
                        />
                    </Col>
                    {fillType === ShapeFillType.FILL && (
                        <Col span={12}>

                            <PPTColorPicker
                                value={fill}
                                onChange={(color) => updateFill(color)}
                            >
                                <div>
                                    <ColorButton color={resolvePPTColorValue(fill)} />
                                </div>
                            </PPTColorPicker>

                        </Col>
                    )}
                    {fillType === ShapeFillType.GRADIENT && (
                        <>
                            <Col span={12}>
                                <Select
                                    style={{ width: '100%' }}
                                    value={gradient.type}
                                    onChange={(value) => updateGradient({ type: value as GradientType })}
                                    options={[
                                        { label: '线性渐变', value: 'linear' },
                                        { label: '径向渐变', value: 'radial' },
                                    ]}
                                />
                            </Col>

                            <>
                                {gradientOptions.map((item) => (
                                    // <button
                                    //     key={item.key}
                                    //     type="button"
                                    //     className={`${styles.gradientItem} ${item.index === currentGradientIndex ? styles.active : ''}`}
                                    //     style={{ backgroundColor: item.color }}
                                    //     onClick={() => setCurrentGradientIndex(item.index)}
                                    // />
                                    <Col span={12} key={item.key}>
                                        <PPTColorPicker
                                            value={gradient.colors[item.index]?.color}
                                            onChange={(color) => updateGradientColors(item.index, color)}
                                        >
                                            <div>
                                                <ColorButton color={resolvePPTColorValue(gradient.colors[item.index]?.color)} />
                                            </div>
                                        </PPTColorPicker>
                                    </Col>

                                ))}
                            </>

                            {gradient.type === 'linear' && (
                                <Col span={24}>
                                    <Row align="middle" gutter={8}>
                                        <Col span={8}>渐变角度</Col>
                                        <Col span={16}>
                                            <Slider
                                                min={0}
                                                max={360}
                                                step={15}
                                                value={gradient.rotate}
                                                onChange={(value) => updateGradient({ rotate: value as number })}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            )}
                        </>
                    )}
                    {(fillType === ShapeFillType.PATTERN || fillType === ShapeFillType.IMAGE) && (
                        <Col span={24}>
                            <label className={styles.imageUpload}>
                                <div className={styles.imagePreview}>
                                    <div
                                        className={styles.imagePreviewContent}
                                        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
                                    >
                                        <Icon icon="ri:add-line" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => uploadFillImage(e.target.files)}
                                />
                            </label>
                        </Col>
                    )}
                </Row>
            </ContentWrapper>
            {hasShapeText && (
                <>
                    <Divider size="small" />
                    <FontPanel />
                    <Divider size="small" />
                    <AlignPanel />
                </>
            )}

            <Divider size="small" />
            <ContentWrapper>

                <ElementOutline />

                <ElementShadow />


                <ElementOpacity />

            </ContentWrapper>
        </div>
    );
};

export default ShapeElementPanel;
