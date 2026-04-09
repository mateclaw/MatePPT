import React from 'react';
import { Select } from 'antd';
import { ElementTextType, textTypeOptions } from '@/ppt/types/annotation';

export interface TextTypeSelectorProps {
  value?: ElementTextType;
  onChange: (value: ElementTextType) => void;
  disabled?: boolean;
}



/**
 * 文本类型选择器
 * 用于标注文本元素的类型
 * 
 * 支持的文本类型:
 * - title: 标题
 * - subtitle: 副标题
 * - partNumber: 节编号
 * - itemTitle: 列表项标题
 * - item: 列表项
 */
export const TextTypeSelector: React.FC<TextTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className='flex items-center gap-2 w-full'>
      <div 
        className='flex-none w-[100px] text-textcolor-400'
      >
        当前文本类型
      </div>
      <Select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder="请选择文本类型"
        allowClear
        options={textTypeOptions}
      />
    </div>
  );
};
