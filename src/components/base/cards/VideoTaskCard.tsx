import React, { useMemo } from 'react';
import { Image, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PptVideoTaskPo } from '@/models/pptVideoTaskPo';
import { formatRelativeTime } from '@/utils/date-util';
import { getImageUrl } from '@/utils/imageUrl';
import PptCard, { type PptCardMenuItem } from './PptCard';
import { useTranslate } from '@/hooks/common-hooks';
import { useEffect, useState } from 'react';
import useAuthStore from '@/stores/authStore';
import { cn } from '@/lib/utils';
import DefaultThumbnail from '../default-thumbnail';

interface VideoTaskCardProps {
    item: PptVideoTaskPo;
    onEdit?: (item: PptVideoTaskPo) => void;
    onDelete?: (item: PptVideoTaskPo) => void;
    onMenuClick?: (action: string, item: PptVideoTaskPo) => void;
    
}

const VideoTaskCard: React.FC<VideoTaskCardProps> = ({
    item,
    onEdit,
    onDelete,
    onMenuClick,
}) => {
    const { t } = useTranslate();
    const getMinioService = useAuthStore((state) => state.getMinioService);
    const [coverUrl, setCoverUrl] = useState<string>('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const processCover = async () => {

            const url = getImageUrl(item.pptCover);
            setCoverUrl(url);
        };
        processCover();
    }, [item.pptCover, getMinioService]);
    const menuItems: PptCardMenuItem[] = useMemo(() => {
        const items: PptCardMenuItem[] = [];
        if (onEdit) {
            items.push({
                key: 'edit',
                label: (
                    <Space>
                        <EditOutlined />
                        <span>{t('common.operation.edit')}</span>
                    </Space>
                ),
                onClick: (data: PptVideoTaskPo) => {
                    onEdit?.(data);
                },
            });
        }
        if (onDelete) {
            items.push({
                key: 'delete',
                label: (
                    <Space>
                        <DeleteOutlined />
                        <span>{t('common.operation.delete')}</span>
                    </Space>
                ),
                danger: true,
                onClick: (data: PptVideoTaskPo) => {
                    onDelete?.(data);
                },
            });
        }
        return items;
    }, [t, onEdit, onDelete]);

    return (
        <PptCard
            item={item}
            menuItems={menuItems}
            onMenuItemClick={onMenuClick}
            hoverable={true}
  
            cover={(
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* 图片加载失败或为空时使用 DefaultThumbnail (brand 类型) */}
                    {(imageError || !coverUrl) ? (
                        <DefaultThumbnail
                            sourceType="brand"
                            title={item.pptTitle}
                        />
                    ) : (
                        <Image
                            src={coverUrl}
                            preview={false}
                            alt={item.pptTitle}
                            className="w-full h-full "
                            onError={() => setImageError(true)}
                        />
                    )}
                </div>
            )}
            title={item.pptTitle}
            description={formatRelativeTime(item.createTime)}
        >



        </PptCard>
    );
};

export default VideoTaskCard;
