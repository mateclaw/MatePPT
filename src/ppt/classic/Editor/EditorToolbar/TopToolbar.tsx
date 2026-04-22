import React from 'react';
import { Button, Dropdown, Space, Tooltip, type MenuProps } from 'antd';
import {
  DownloadOutlined,
  LeftOutlined,
  HomeOutlined,
  RightOutlined,
  CaretRightOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Icon } from 'umi';

export interface TopToolbarProps {
  title?: string;
  lastSavedTime?: string;
  onBack?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onPreview?: (fromCurrent: boolean) => void;
  centerSlot?: React.ReactNode;
  isCompleted?: boolean;
  isExporting?: boolean;
  buttonText?: Record<string, string>;
}

export const defaultButtonText = {
  save: '保存',
  preview: '放映',
  export: '导出',
};

export const TopToolbar: React.FC<TopToolbarProps> = ({
  title = '未命名演示文稿',
  lastSavedTime,
  onBack,
  onSave,
  onExport,
  onPreview,
  centerSlot,
  isCompleted,
  isExporting,
  buttonText,
}) => {
  const mergedButtonText = { ...defaultButtonText, ...buttonText };

  const previewMenuItems: MenuProps['items'] = [
    {
      key: 'current',
      label: '从当前页放映',
      onClick: () => onPreview?.(true),
    },
    {
      key: 'start',
      label: '从第一页放映',
      onClick: () => onPreview?.(false),
    },
  ];

  const formatTime = (time?: string) => {
    if (!time) return '暂无';
    try {
      const date = new Date(time);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 30) return `${days}天前`;
      return date.toLocaleDateString('zh-CN');
    } catch {
      return '暂无';
    }
  };

  return (
    <div className="flex items-center justify-between px-3 md:px-6 h-12 md:h-16 border-b border-gray-200 bg-gray-100">
      <div className="flex items-center gap-1 min-w-0">
        {onBack &&
          (isCompleted ? (
            <>
              <Button
                type="text"
                size="small"
                icon={<HomeOutlined />}
                onClick={onBack}
                className="shrink-0"
              />
              <RightOutlined />
            </>
          ) : (
            <Button
              type="text"
              size="small"
              icon={<LeftOutlined />}
              onClick={onBack}
              className="shrink-0"
            />
          ))}

        <div className="flex min-w-0 items-center gap-5">
          <Tooltip title={title}>
            <div className="font-bold text-sm md:text-lg truncate max-md:max-w-[120px]" style={{ width: '200px' }}>
              {title}
            </div>
          </Tooltip>
          {lastSavedTime && (
            <div className="text-xs text-textcolor-300 hidden md:block">
              最近保存：{formatTime(lastSavedTime)}
            </div>
          )}
        </div>

        {onSave && (
          <Tooltip title={mergedButtonText.save}>
            <Button type="text" onClick={onSave}>
              <Icon icon="ri:upload-cloud-2-line" width="16" height="16" />
            </Button>
          </Tooltip>
        )}
      </div>

      <div className="hidden md:flex flex-1 justify-center items-center px-8">
        {centerSlot}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Space size="small">
          {onPreview && (
            <Dropdown menu={{ items: previewMenuItems }} trigger={['click']} placement="bottomRight">
              <Button variant="outlined" color="default" className="border-0" icon={<CaretRightOutlined />}>
                {mergedButtonText.preview}
                <DownOutlined />
              </Button>
            </Dropdown>
          )}
          {onExport && (
            <Button
              variant="outlined"
              color="default"
              loading={isExporting}
              className="border-0"
              icon={<DownloadOutlined />}
              onClick={onExport}
            >
              {mergedButtonText.export}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};
