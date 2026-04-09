import React, { useMemo } from 'react';
import { Image, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PptProjectPo } from '@/models/pptProjectPo';
import { formatRelativeTime } from '@/utils/date-util';
import { getImageUrl } from '@/utils/imageUrl';
import PptCard, { type PptCardMenuItem } from './PptCard';
import { useTranslate } from '@/hooks/common-hooks';
import { useEffect, useState } from 'react';
import useAuthStore from '@/stores/authStore';
import { cn } from '@/lib/utils';
import DefaultThumbnail, { type SourceType } from '../default-thumbnail';
import { Keyboard, FileUp, Link, Play } from 'lucide-react';
import { RiBilibiliFill } from '@remixicon/react';

/** 获取 sourceType 对应的配置 */
const getSourceConfig = (sourceType?: string) => {
    switch (sourceType) {
        case 'bilibili':
            return { label: 'Bilibili', icon: RiBilibiliFill, color: 'text-[#fb7299]' };
        case 'user_upload':
            return { label: '文档上传', icon: FileUp, color: 'text-slate-500' };
        case 'local_media':
            return { label: '本地媒体', icon: Play, color: 'text-red-500' };
        case 'link':
            return { label: '网络链接', icon: Link, color: 'text-emerald-500' };
        case 'user_input':
        default:
            return { label: '智能输入', icon: Keyboard, color: 'text-indigo-500' };
    }
};

interface ProjectCardProps {
    item: PptProjectPo;
    onEdit?: (item: PptProjectPo) => void;
    onDelete?: (item: PptProjectPo) => void;
    onMenuClick?: (action: string, item: PptProjectPo) => void;
    
}

const ProjectCard: React.FC<ProjectCardProps> = ({
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

            const url = getImageUrl(item.cover);
            setCoverUrl(url);
        };
        processCover();
    }, [item.cover, getMinioService]);

    // 生成 sourceType 标签
    const sourceConfig = getSourceConfig(item.sourceType);
    const SourceIcon = sourceConfig.icon;
    const sourceTag = (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100/60 text-[10px] font-semibold text-slate-500 border border-slate-200/30">
            <SourceIcon className={cn("w-3 h-3 opacity-70", sourceConfig.color)} />
            <span className="tracking-tight">{sourceConfig.label}</span>
        </div>
    );

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
                onClick: (data: PptProjectPo) => {
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
                onClick: (data: PptProjectPo) => {
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
            tag={sourceTag}
            cover={(
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* 图片加载失败或为空时使用 DefaultThumbnail */}
                    {(imageError || !coverUrl) ? (
                        <DefaultThumbnail
                            sourceType={(item.sourceType as SourceType) || 'user_input'}
                            title={item.projectName}
                        />
                    ) : (
                        <Image
                            src={coverUrl}
                            preview={false}
                            alt={item.projectName}
                            className="w-full h-full "
                            onError={() => setImageError(true)}
                        />
                    )}
                    <div className={cn("absolute top-0 right-0 flex items-center gap-1  backdrop-blur px-2 py-1 rounded shadow-sm", 'bg-primary-gradient')}>
                        <span className="text-xs font-semibold text-white">
                            {t('ppt.mode.classic')}
                        </span>
                    </div>
                </div>
            )}
            title={item.projectName}
            description={formatRelativeTime(item.createTime)}
        >



        </PptCard>
    );
};

export default ProjectCard;
