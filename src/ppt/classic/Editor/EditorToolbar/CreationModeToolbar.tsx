import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import {
  FileImageOutlined,
  CodeOutlined,
  SplitCellsOutlined,
  EditOutlined,
} from '@ant-design/icons';

export type ViewMode = 'ppt' | 'code' | 'dual' | 'visual';

export interface CreationModeToolbarProps {
  currentMode?: ViewMode;
  onModeChange?: (mode: ViewMode) => void;
  disabledModes?: ViewMode[];
}

/**
 * 创意模式顶部工具栏中间部分
 * 提供四种视图模式切换：PPT模式、代码模式、双栏模式、编辑模式
 */
export const CreationModeToolbar: React.FC<CreationModeToolbarProps> = ({
  currentMode = 'ppt',
  onModeChange,
  disabledModes = [],
}) => {
  const modes: Array<{
    key: ViewMode;
    label: string;
    icon: React.ReactNode;
    tooltip: string;
  }> = [
    {
      key: 'ppt',
      label: '预览模式',
      icon: <FileImageOutlined />,
      tooltip: '展示预览效果',
    },
    {
      key: 'code',
      label: '代码模式',
      icon: <CodeOutlined />,
      tooltip: '查看HTML代码',
    },
    // {
    //   key: 'dual',
    //   label: '双栏模式',
    //   icon: <SplitCellsOutlined />,
    //   tooltip: '左侧代码，右侧预览效果',
    // },
    {
      key: 'visual',
      label: '编辑模式',
      icon: <EditOutlined />,
      tooltip: '可视化编辑，实时预览',
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {modes.map((mode) => (
        <Tooltip key={mode.key} title={mode.tooltip}>
          <Button
            type={currentMode === mode.key ? 'primary' : 'text'}
          
            icon={mode.icon}
            onClick={() => onModeChange?.(mode.key)}
            disabled={disabledModes.includes(mode.key)}
          >
            {mode.label}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
};
