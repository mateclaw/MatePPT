import React from 'react';
import { Card as AntCard, Button, Dropdown, Tooltip } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

export interface PptCardMenuItem {
  key: string;
  label: React.ReactNode;
  danger?: boolean;
  onClick: (item: any) => void;
}

export interface PptCardProps<T = any> {
  item: T;
  children?: React.ReactNode;
  menuItems?: PptCardMenuItem[];
  cover?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** 左下角标签 */
  tag?: React.ReactNode;

  onMenuItemClick?: (key: string, item: T) => void;
  style?: React.CSSProperties;
  hoverable?: boolean;
}

const PptCard = React.forwardRef<HTMLDivElement, PptCardProps>(
  (
    {
      item,
      children,
      menuItems = [],
      onMenuItemClick,
      style = {},
      hoverable = true,
      description,
      title,
      cover,
      tag,
    },
    ref
  ) => {
    const defaultStyle = {
      padding: 15,
      borderRadius: 20,
      boxShadow: '0px 18px 40px 0px rgba(212, 217, 232, 1)',
      ...style,
    };

    const dropdownItems = menuItems.map((menu) => ({
      key: menu.key,
      label: menu.label,
      danger: menu.danger || false,
      onClick: (e: any) => {
        e.domEvent?.stopPropagation?.();
        menu.onClick?.(item);
        onMenuItemClick?.(menu.key, item);
      },

    }));

    return (
      <div className="transition-transform duration-300 hover:scale-105">
        <AntCard
          ref={ref}
          hoverable={hoverable}
          style={defaultStyle}
          styles={{ body: { padding: 0 } }}
        >
          <div className="flex flex-col h-full">
            {/* Placeholder Image Area */}
            <div className="h-[152px] overflow-hidden rounded " >
              {cover ? (
                <div className="w-full h-full">
                  {cover}
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 rounded" />
              )}
            </div>

            {/* Card Content */}
            {tag ? (
              /* 有 tag 时的布局（我的作品） */
              <div className="flex flex-col flex-1 pt-1">
                <Tooltip placement='topLeft' title={title || 'Untitled'}>
                  <div className="font-bold text-sm text-slate-800 leading-6 truncate">
                    {title || 'Untitled'}
                  </div>
                </Tooltip>
                <div className="flex items-center justify-between -mb-2">
                  <div className="flex-shrink-0">{tag}</div>
                  <div className="flex items-center gap-2">
                    {description && (
                      <span className="text-xs text-slate-400 font-medium">{description}</span>
                    )}
                    {dropdownItems.length > 0 && (
                      <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
                        <Button
                          type="text"
                          size="small"
                          className="text-slate-300 hover:text-indigo-600 transition-colors !p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EllipsisOutlined className="text-xs" />
                        </Button>
                      </Dropdown>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* 无 tag 时的原始布局（自定义模版、模版广场、数字人宣讲等） */
              <div className="flex">
                <div className="flex-1 overflow-hidden">
                  <Tooltip placement='topLeft' title={title || 'Untitled'}>
                    <div className="font-bold text-base leading-8 truncate">
                      {title || 'Untitled'}
                    </div>
                  </Tooltip>
                  <Tooltip placement='topLeft' title={description || ''}>
                    <div className="text-xs font-medium text-textcolor-400 leading-none truncate">
                      {description}
                    </div>
                  </Tooltip>
                </div>
                {dropdownItems.length > 0 && (
                  <div className="flex-none flex items-center justify-end pt-3">
                    <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
                      <Button
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EllipsisOutlined />
                      </Button>
                    </Dropdown>
                  </div>
                )}
              </div>
            )}

          </div>
        </AntCard>
      </div>
    );
  }
);

PptCard.displayName = 'PptCard';

export default PptCard;
