import React from 'react';
import { Alert } from 'antd';

export interface WarningMessageProps {
  message: string | null;
}

/**
 * 警告提示组件
 * 显示标注操作的警告信息
 */
export const WarningMessage: React.FC<WarningMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Alert
      message={message}
      type="warning"
      showIcon
      style={{ marginBottom: '16px' }}
    />
  );
};
