import React, { useState, useEffect } from 'react';
import { Button, App } from 'antd';
import { ImageElement, ShapeElement, TextElement, type PPTElement, type PPTSlide } from '@/ppt/core';
import type { SlideLabelType, TextType } from '@/ppt/core';
import { TextTypeSelector } from './TextTypeSelector';
import { ImageContentSelector } from './ImageContentSelector';
import { SlideTypeSelector } from './SlideTypeSelector';
import { GroupOperations } from './GroupOperations';
import { WarningMessage } from './WarningMessage';
import {
  canAnnotateTextType,
  canAnnotateImageContent,
  canGroupElements,
  getAnnotationWarning
} from './rules';
import { nanoid } from 'nanoid';

export interface AnnotationPanelProps {
  selectedElements: PPTElement[];
  currentSlide?: PPTSlide;
  onElementAnnotationSave: (element: PPTElement) => void;
  onSlideLabelTypeChange: (SlideLabelType: SlideLabelType) => void;
  onClose: () => void;
  onSlideSave: () => void;
  onElementHover?: (element: PPTElement | null) => void;
  loadingSave?: boolean;
  lastSelectedElement?: PPTElement;
}

/**
 * 标注面板组件
 *
 * 功能:
 * - 幻灯片类型标注 (修改 slide.type)
 * - 文本类型标注 (仅文本元素)
 * - 图片内容标注 (仅图片元素)
 * - 元素分组 (同类型元素)
 * - 分组管理
 *
 * 业务规则: 参见 rules.ts
 */
export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  selectedElements,
  currentSlide,
  onElementAnnotationSave,
  onSlideLabelTypeChange,
  onClose,
  onSlideSave,
  onElementHover,
  loadingSave,
  lastSelectedElement
}) => {
  const [labelType, setLabelType] = useState<TextType | string>();

  const [SlideLabelType, setSlideLabelType] = useState<SlideLabelType>();
  
  const [imageOptionList, setImageOptionList] = useState<any[]>([]);
  const { message } = App.useApp();

  // 更新警告信息
  useEffect(() => {
    const warning = getAnnotationWarning(selectedElements);
    // setWarningMessage(warning);

    if(warning){
      message.warning(warning);
    }


  }, [selectedElements]);

  // 加载已有的幻灯片标注
  useEffect(() => {
    setImageOptionList([]);
    if (currentSlide) {
      setSlideLabelType(currentSlide.type as any);
      setImageOptionList(currentSlide.elements.filter((element) => {
        return (element.type === 'text' || (element.type === 'shape' && element.text));
      }).map((element) => {
        return {
          label: element.name || '',
          value: element.id || '',
          element: element,

        };
      }) || []);
    }
  }, [currentSlide]);

  // 加载已有的元素标注
  useEffect(() => {
    const targetElement = lastSelectedElement || (selectedElements.length === 1 ? selectedElements[0] : null);

    if (targetElement) {
      if (targetElement.type === 'image') {
        // 使用 imageType 或 annotation.imageContent
        const imageAnnotation = targetElement.labelType || '';
        setLabelType(imageAnnotation as string);
      } else if (targetElement.type === 'text' || targetElement.type === 'shape') {
        // 使用 textType 或 annotation.textType
        const textAnnotation = targetElement.labelType || '';
        setLabelType(textAnnotation as TextType);
      }
    } else {
      // 正数个元素被选中时，清除标注状态
      setLabelType(undefined);
      onElementHover?.(null);
    }
  }, [selectedElements, lastSelectedElement]);

  // 仅当没有幻灯片且没有选中元素时才不显示
  if (!currentSlide && selectedElements.length === 0) {
    return null;
  }

  const targetElement = lastSelectedElement || (selectedElements.length === 1 ? selectedElements[0] : undefined);
  const isTextElement = targetElement ? canAnnotateTextType(targetElement) : false;
  const isImageElement = targetElement ? canAnnotateImageContent(targetElement) : false;

  const { canGroup } = canGroupElements(selectedElements);

  // 当幻灯片类型改变时直接修改 slide.type
  const handleSlideLabelTypeChange = (type: SlideLabelType | undefined) => {
    setSlideLabelType(type);

    onSlideLabelTypeChange(type);

  };

  // 当文本类型改变时直接保存（用于 text 和 shape 元素）
  // 支持分组中的单个元素标注
  const handleTextTypeChange = (type: TextType | undefined) => {
    setLabelType(type as any);
    if (isTextElement && targetElement) {
      const updateElement = { ...targetElement } as TextElement | ShapeElement;
      updateElement.labelType = type || '' as TextType;
      onElementAnnotationSave(updateElement);
    }
  };

  // 当图片类型改变时直接保存（用于 image 元素）
  const handleImageTypeChange = (type: string | undefined) => {
    setLabelType(type);
    if (isImageElement && targetElement) {
      const updateElement = { ...targetElement } as ImageElement;
      updateElement.labelType = type || '' as string;
      onElementAnnotationSave(updateElement);
    }
  };

  // 清除文本类型标注
  const handleCancelTextType = () => {
    if (targetElement) {
      const updateElement = { ...targetElement } as TextElement | ShapeElement;
      updateElement.labelType = undefined;
      onElementAnnotationSave(updateElement);
      setLabelType(undefined);
    }
  };

  // 清除图片类型标注
  const handleCancelImageType = () => {
    if (targetElement) {
      const updateElement = { ...targetElement } as ImageElement;
      updateElement.labelType = undefined;
      onElementAnnotationSave(updateElement);
      setLabelType(undefined);
    }
  };

  // 创建分组：为所有选中元素设置相同的groupId
  const handleCreateGroup = () => {
    const groupId = nanoid();

    selectedElements.forEach(element => {
      const updateElement = { ...element } as PPTElement;
      updateElement.groupId = groupId;
      onElementAnnotationSave(updateElement);
    });
  };

  // 取消分组：清除该组合下所有元素的groupId
  const handleUngroup = () => {
    if (selectedElements.length === 0 || !selectedElements[0].groupId) {
      return;
    }

    // 获取要取消的组合ID
    const targetGroupId = selectedElements[0].groupId;

    // 找到当前幻灯片中所有属于该组合的元素
    const allGroupElements = currentSlide?.elements?.filter(
      (el: PPTElement) => el.groupId === targetGroupId
    ) || [];

    // 清空所有组合元素的groupId
    allGroupElements.forEach(element => {
      const updateElement = { ...element } as PPTElement;
      updateElement.groupId = "";
      onElementAnnotationSave(updateElement);
    });
  };

  // 检查是否所有选中元素都拥有相同的groupId（用于判断是否可以取消分组）
  // 标注模式下：只要选中的元素有groupId，就允许取消组合（即使只选中1个元素）
  const allHaveSameGroupId = selectedElements.length >= 1 &&
    selectedElements.every(el => el.groupId) &&
    selectedElements.every(el => el.groupId === selectedElements[0].groupId);

  // 是否有可标注的元素类型（text、shape、image）
  const hasSelectableElement = selectedElements.length > 0 &&
    selectedElements.some(el => { return (el.type === 'text' || el.type === 'image' || (el.type === 'shape' && el.text)) });

  return (

    <div className='absolute  bg-fill-layout  left-[0px] top-0 h-[100px] w-[calc(100%)] flex items-center justify-center'>
      <div
        className='bg-fill-container py-[10px] px-4 annotation-panel    top-5 z-[1000] flex items-start gap-2 relative '
      >
        {/* 标题：幻灯片类型标注 */}
        <div
          className='bg-primary px-4 rounded-md leading-8 flex-none'
        >

          <span className='text-white text-[14px] font-[500]'>
            幻灯片类型标注
          </span>
        </div>

        {/* 幻灯片标注功能：始终显示 */}
        {currentSlide && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingRight: '12px',
              paddingLeft: '12px',
              borderRight: hasSelectableElement ? '1px solid #e0e0e0' : 'none'
            }}
          >

            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <SlideTypeSelector
                value={SlideLabelType}
                onChange={handleSlideLabelTypeChange}
              />
            </div>
          </div>
        )}

        {/* 元素标注功能：仅在有可标注的元素时显示 */}
        {hasSelectableElement && (isTextElement || isImageElement) ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              paddingLeft: '12px',
              flex: 1
            }}
          >


            <div
              style={{
                display: 'flex',

                gap: '8px',
                flex: 1
              }}
            >
           

              {/* 文本类型标注 (仅单个文本元素) */}
              {isTextElement && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <TextTypeSelector
                    value={labelType as any}
                    onChange={handleTextTypeChange as any}
                  />

                </div>
              )}

              {/* 图片内容标注 (仅单个图片元素) */}
              {isImageElement && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ImageContentSelector
                    value={labelType as any}
                    options={imageOptionList}
                    onChange={handleImageTypeChange}
                    onOptionHover={(element) => {
                      onElementHover?.(element);
                    }}
                  />

                </div>
              )}

              {/* 分组操作 (多个元素或属于组合的单个元素) */}
              {(selectedElements.length >= 2 || allHaveSameGroupId) && (
                <div>
                  <GroupOperations
                    canGroup={canGroup}
                    canUngroup={allHaveSameGroupId}
                    onGroup={handleCreateGroup}
                    onUngroup={handleUngroup}
                  />
                </div>
              )}
            </div>
          </div>
        )
          : <div className='text-textcolor-400 leading-8 border border-dashed rounded-md px-4 truncate'>
            选中图片、文字、带文字的形状，进行类型标记
          </div>
        }

        <div className='absolute left-1/2 w-full text-center -bottom-7 transform -translate-x-1/2 text-textcolor-400'>
          按 Alt/Option + 1-3 快速标注标题、列表项标题和列表项
        </div>

        <div className='absolute -right-20'>

          <Button
            type='primary'
            loading={loadingSave}
            onClick={onSlideSave}
          >
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};
