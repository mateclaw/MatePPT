import React from 'react';
import { Button, Dropdown, type MenuProps } from 'antd';
import {
  UndoOutlined,
  RedoOutlined,
  CommentOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  CaretRightOutlined,
  DownOutlined,
} from '@ant-design/icons';

export interface BottomToolbarProps {
  currentIndex: number;
  totalSlides: number;
  scale: number;
  canUndo: boolean;
  canRedo: boolean;
  showNotes: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onScaleChange: (scale: number) => void;
  onFitToScreen: () => void;
  onToggleNotes: () => void;
  onPlay?: (fromCurrent: boolean) => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  currentIndex,
  totalSlides,
  scale,
  canUndo,
  canRedo,
  showNotes,
  onUndo,
  onRedo,
  onScaleChange,
  onFitToScreen,
  onToggleNotes,
  onPlay,
}) => {
  const playMenuItems: MenuProps['items'] = [
    {
      key: 'current',
      label: '从当前页放映',
      onClick: () => onPlay?.(true),
    },
    {
      key: 'start',
      label: '从第一页放映',
      onClick: () => onPlay?.(false),
    },
  ];

  return (
    <div
      className="ppt-footer"
      style={{
        height: '50px',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 15px',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>第 {totalSlides > 0 ? currentIndex + 1 : 0} 页 / 共 {totalSlides} 页</span>
        <Button type="text" className="p-0 hidden md:inline-flex" icon={<UndoOutlined />} onClick={onUndo} disabled={!canUndo}>
          撤销
        </Button>
        <Button type="text" className="p-0 hidden md:inline-flex" icon={<RedoOutlined />} onClick={onRedo} disabled={!canRedo}>
          重做
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {onPlay && (
          <Dropdown menu={{ items: playMenuItems }} trigger={['click']} placement="topRight">
            <Button type="text" icon={<CaretRightOutlined />}>
              放映 <DownOutlined />
            </Button>
          </Dropdown>
        )}
        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={onToggleNotes}
          className="hidden md:inline-flex"
        >
          备注
        </Button>

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '5px' }}>
          <Button
            type="text"
            icon={<ZoomOutOutlined />}
            onClick={() => onScaleChange(scale - 0.25)}
            disabled={scale <= 0.5}
          />
          <span>{Math.round(scale * 100)}%</span>
          <Button
            type="text"
            icon={<ZoomInOutlined />}
            onClick={() => onScaleChange(scale + 0.25)}
            disabled={scale >= 2}
          />
          <Button type="text" icon={<FullscreenOutlined />} onClick={onFitToScreen}>
            适应屏幕
          </Button>
        </div>
      </div>
    </div>
  );
};
