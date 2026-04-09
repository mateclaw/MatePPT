'use client'
import type { FC } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
// import Slider from '@/components/base/slider'
import { Slider, InputNumber } from "antd";
import { cn } from '@/lib/utils';

type Props = {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  readonly?: boolean
  step?: number
  onChange?: (value: number) => void
  className?: string
  reverse?: boolean
}

const InputNumberWithSlider: FC<Props> = ({
  value,
  defaultValue = 0,
  min = 0,
  max = 100 ,
  readonly,
  step,
  onChange,
  className,
  reverse,
}) => {

  const [inputValue, setInputValue] = useState(value ?? defaultValue);

  useEffect(() => {
  if (value !== undefined && value !== inputValue)
    setInputValue(value)
}, [value]) 
  const handleBlur = () => {
    const newValue = parseInt(inputValue.toString(), 10);
    let validatedValue = newValue

    if (max !== undefined && newValue > max)
      validatedValue = max
    else if (min !== undefined && newValue < min)
      validatedValue = min
    setInputValue(validatedValue)
    onChange?.(validatedValue)
  }
  // 替换handleChange为更稳健的实现
  const handleNumberChange = (newValue: number | null) => {
    if (newValue === null) return
    let validatedValue = newValue

    if (max !== undefined && newValue > max)
      validatedValue = max
    else if (min !== undefined && newValue < min)
      validatedValue = min
    setInputValue(validatedValue)
    onChange?.(validatedValue)
  }

  return (
    <div className={cn('flex justify-between items-center h-8 space-x-2 gap-4', className, reverse && 'flex-row-reverse')}>
      <InputNumber
        value={inputValue}
        className='shrink-0 block  w-12 h-8  outline-none rounded-lg text-[13px] '
        type='number'
        min={min}
        max={max}
        step={step}
        onChange={handleNumberChange}
        onBlur={handleBlur}
        disabled={readonly}
        controls={false}
      />
      <Slider
        className='grow'
        value={inputValue}
        min={min}
        max={max}
        step={step}
        onChange={handleNumberChange}
        disabled={readonly}
      />
    </div>
  )
}
export default React.memo(InputNumberWithSlider)
