import React from 'react';
import { Select } from 'antd';
import { SlideLabelType } from '@/ppt/core';

export interface SlideTypeSelectorProps {
  value?: SlideLabelType;
  onChange: (value: SlideLabelType) => void;
  disabled?: boolean;
}

const slideTypeOptions = [
  { value: '', label: '未标记类型' },
  { value: 'cover', label: '封面页 (cover)' },
  { value: 'catalog', label: '目录页 (catalog)' },
  { value: 'transition', label: '过渡页 (transition)' },
  { value: 'content', label: '内容页 (content)' },
  { value: 'end', label: '结束页 (end)' }
];

/**
 * 幻灯片类型选择器
 * 用于标注幻灯片页面的语义类型
 * 
 * 支持的幻灯片类型:
 * - cover: 封面页
 * - catalog: 目录页
 * - transition: 过渡页
 * - content: 内容页
 * - end: 结束页
 */
export const SlideTypeSelector: React.FC<SlideTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className='flex  gap-2 items-center'>
      <div
        className='flex-none w-[100px] text-textcolor-400'
      >
        当前页面类型
      </div>
      <Select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder="请选择页面类型"
        allowClear
        options={slideTypeOptions}
      />
    </div>
  );
};
