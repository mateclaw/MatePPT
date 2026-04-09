import React, { useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { GroupOutlined, DeleteOutlined } from '@ant-design/icons';

export interface GroupOperationsProps {
  canGroup: boolean;
  canUngroup: boolean;
  onGroup: () => void;
  onUngroup: () => void;
  disabled?: boolean;
}

/**
 * 分组操作按钮组
 * 提供创建分组和取消分组功能
 * 规则：
 * - 当所有选中元素都拥有相同的groupId时，显示取消分组按钮
 * - 否则，显示组合按钮
 */
export const GroupOperations: React.FC<GroupOperationsProps> = ({
  canGroup,
  canUngroup,
  onGroup,
  onUngroup,
  disabled = false
}) => {
  // 当canUngroup为true时，说明可以取消分组
  // 反之则可以组合
  const showUngroup = canUngroup;
  const showGroup = !canUngroup;

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
    
        <Button
          icon={<GroupOutlined />}
          onClick={onGroup}
          disabled={disabled || !canGroup || canUngroup}
          block
        >
          组合
        </Button>
     
     
        <Button
          icon={<DeleteOutlined />}
          onClick={onUngroup}
          disabled={disabled || !canUngroup}
          danger
          block
        >
          取消分组
        </Button>
     
    </div>
  );
};
