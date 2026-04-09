import React from 'react';
import { Select, SelectProps } from 'antd';
import { cn } from '@/utils/classnames';

interface LabeledSelectProps extends SelectProps {
  label?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}

const LabeledSelect = React.forwardRef<any, LabeledSelectProps>(
  ({ label, wrapperClassName, labelClassName, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center gap-1 rounded-lg border border-border-primary pl-4 bg-[#E6EAF5] text-sm',
          wrapperClassName,
        )}
      >
        {label && (
          <span className={cn('text-sm text-textcolor-400 whitespace-nowrap', labelClassName)}>
            {label}
          </span>
        )}
        <Select
          ref={ref}
          {...props}
          // size='large'
          variant='borderless'
          className={cn('flex-1 text-textcolor-400', className)}
          classNames={{
            
          }}
          popupMatchSelectWidth={false}
        />
      </div>
    );
  }
);

LabeledSelect.displayName = 'LabeledSelect';

export default LabeledSelect;
