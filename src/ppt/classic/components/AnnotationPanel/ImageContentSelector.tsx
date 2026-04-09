import React, { useMemo } from 'react';
import { Input, Select } from 'antd';

import type { PPTElement } from '@/ppt/core';

export interface ImageContentSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string; element?: PPTElement }[];
  onOptionHover?: (element: PPTElement | null) => void;
  disabled?: boolean;
}



/**
 * 图片内容选择器
 * 用于标注图片元素的内容描述
 */
export const ImageContentSelector: React.FC<ImageContentSelectorProps> = ({
  value,
  onChange,
  options,
  onOptionHover,
  disabled = false
}) => {

  const memoizedOptions = useMemo(() => {

    const res = options || [];

    return [{ label: '未标记类型', value: '' }, ...res];

  }, [options]);

  return (
    <div className='flex items-center gap-2 w-full'>
      <div
        className='flex-none w-[100px] text-textcolor-400'

      >
        当前图片类型
      </div>
      <Select
        className=''
        value={value}
        onChange={onChange}
        onMouseEnter={() => {
          const selectedOption = memoizedOptions.find(opt => opt.value === value);
          onOptionHover?.(selectedOption?.element ?? null);
        }}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder="请选择图片类型"

      >

        {memoizedOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}
            onMouseEnter={() => onOptionHover?.(option.element ?? null)}
            onMouseLeave={() => onOptionHover?.(null)}
            >
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
