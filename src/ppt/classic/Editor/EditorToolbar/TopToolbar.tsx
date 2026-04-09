import React from 'react';
import { Button, Dropdown, MenuProps, Space, Tooltip } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, SaveOutlined, DownloadOutlined, LeftOutlined, HomeOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { Icon } from 'umi';

export interface TopToolbarProps {
  title?: string;
  lastSavedTime?: string;
  onBack?: () => void;
  onPreview?: (fromCurrent: boolean) => void;
  onSave?: () => void;
  onExport?: (exportFormat: string) => void;
  centerSlot?: React.ReactNode;
  isCompleted?: boolean;
  onRelease?: () => void;
  isExporting?: boolean;
  buttonText?: Record<string, string>;


}

export const defaultButtonText = {
  save: '保存', preview: '放映', export: '导出', release: '发布',
}

/**
 * 顶部工具栏组件
 * 左边：返回按钮、PPT标题、保存时间
 * 中间：自定义插槽
 * 右边：预览、保存、导出3个按钮
 */
export const TopToolbar: React.FC<TopToolbarProps> = ({
  title = 'Untitled PPT',

  lastSavedTime,
  onBack,
  onPreview,
  onSave,
  onExport,
  centerSlot,
  isCompleted,
  onRelease,
  isExporting,
  buttonText,

}) => {
  // 格式化保存时间

  if (!buttonText) {
    buttonText = defaultButtonText

  } else {
    buttonText = { ...defaultButtonText, ...buttonText };
  }

  ;

  const formatTime = (time?: string) => {
    if (!time) return '未保存';
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
      return '未保存';
    }
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    onExport(e.key);
  };

  const items: MenuProps['items'] = [
    {
      label: '导出PPTX',
      key: 'pptx',
      icon: <Icon icon="local:ppt/icon-ppt1" />,
    },
    {
      label: '导出PDF',
      key: 'pdf',
      icon: <Icon icon="local:ppt/icon-pdf" />,
    },
    // {
    //   label: '导出HTML',
    //   key: 'html',
    //   icon: <Icon icon="local:ppt/icon-html" width='20' height='20' />,
    // },

  ];

  return (
    <div className="flex items-center justify-between px-3 md:px-6 h-12 md:h-16 border-b border-gray-200 bg-gray-100">
      {/* 左边：返回按钮、标题、保存时间 */}
      <div className="flex items-center gap-1 min-w-0">
        {onBack && (
          isCompleted ? <>
            <Button
              type="text"
              size="small"
              icon={<HomeOutlined />}
              onClick={onBack}
              className="shrink-0"
            />

            <RightOutlined />

          </> :
            <Button
              type="text"
              size="small"
              icon={<LeftOutlined />}
              onClick={onBack}
              className="shrink-0"
            />
        )}
        <div className="flex min-w-0 items-center gap-5">
          <Tooltip title={title}>
            <div className="font-bold text-sm md:text-lg truncate max-md:max-w-[120px]" style={{ width: '200px' }}>{title}</div>
          </Tooltip>
          {lastSavedTime && <div className="text-xs text-textcolor-300 hidden md:block">创建于 {formatTime(lastSavedTime)}</div>}
        </div>



        {onSave && (
          <Tooltip title={buttonText.save}>
            <Button
              type="text"


              onClick={onSave}
            >

              <Icon icon='ri:upload-cloud-2-line' width='16' height='16' />

            </Button>
          </Tooltip>
        )}
      </div>

      {/* 中间：自定义插槽（移动端隐藏） */}
      <div className="hidden md:flex flex-1 justify-center items-center px-8">
        {centerSlot}
      </div>

      {/* 右边：预览、保存、导出按钮 */}
      <div className="flex items-center gap-2 shrink-0">
        <Space size="small">
          {/* {onPreview && (
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={onPreview}
            >
              {buttonText.preview}
            </Button>
          )} */}
          {onPreview && (

            <Dropdown trigger={['click']} menu={{ items: [{ label: '从当前页开始放映', key: 'current' }, { label: '从头开始放映', key: 'start' }], onClick: (e) => onPreview(e.key === 'current') }}>


              <Button
                variant="outlined"
                color='default'
                loading={isExporting}
                className='border-0'
              >

                <Icon icon='ri:play-circle-line' width='16' height='16' />
                {buttonText.preview}
              </Button>

            </Dropdown>
          )}
          {onExport && (


            <Dropdown trigger={['click']} menu={{ items, onClick: handleMenuClick }}>
              <Button
                variant="outlined"
                color='default'
                loading={isExporting}
                className='border-0'
                icon={<DownloadOutlined />}

              >
                {buttonText.export}
              </Button>
            </Dropdown>
          )}

          {onRelease && (
            <Button
              variant="solid"
              color='primary'
              onClick={onRelease}
              className='rounded-full text-sm w-32'
            >
              {buttonText.release}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};
