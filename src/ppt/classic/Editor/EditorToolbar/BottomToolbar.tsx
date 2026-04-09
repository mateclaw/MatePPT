import React from 'react';
import { Button, Dropdown, Popover } from 'antd';
import {
  UndoOutlined,
  RedoOutlined,
  CommentOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  PlayCircleOutlined,
  FullscreenOutlined,
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
  onPlay: (fromCurrent: boolean) => void;
}

/**
 * 底部工具栏组件
 */
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
  const [showPlayOptions, setShowPlayOptions] = React.useState(false);

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
        zIndex: 100
      }}
    >
      {/* 左侧工具栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>第 {totalSlides > 0 ? currentIndex + 1 : 0} 页 / 共 {totalSlides} 页</span>
        <Button
          type="text"
          className='p-0 hidden md:inline-flex'
          icon={<UndoOutlined />}
          onClick={onUndo}
          disabled={!canUndo}
        >
          撤销
        </Button>
        <Button
          type="text"
          className='p-0 hidden md:inline-flex'
          icon={<RedoOutlined />}
          onClick={onRedo}
          disabled={!canRedo}
        >
          重做
        </Button>
      </div>

      {/* 右侧工具栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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

        {/* <Popover
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                type="text"
                block
                onClick={() => {
                  onPlay(false);
                  setShowPlayOptions(false);
                }}
              >
                从头开始放映
              </Button>
              <Button
                type="text"
                block
                onClick={() => {
                  onPlay(true);
                  setShowPlayOptions(false);
                }}
              >
                从当前幻灯片开始放映
              </Button>
            </div>
          }
          title="放映选项"
          trigger="click"
          open={showPlayOptions}
          onOpenChange={setShowPlayOptions}
        >
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
          >
            放映
          </Button>
        </Popover> */}

        <Dropdown trigger={['click']} menu={{ items: [{ label: '从当前页开始放映', key: 'current' }, { label: '从头开始放映', key: 'start' }], onClick: (e) => onPlay(e.key === 'current') }}>


          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
          >
            放映
          </Button>

        </Dropdown>
      </div>
    </div>
  );
};
