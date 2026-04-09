import React, { useEffect, useState, useMemo } from 'react';
import { Space ,Image} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PptTemplatePo } from '@/models/pptTemplatePo';
import { formatRelativeTime } from '@/utils/date-util';
import PptCard, { type PptCardMenuItem } from './PptCard';
import { useTranslate } from '@/hooks/common-hooks';
import useAuthStore from '@/stores/authStore';
import { getImageUrl } from '@/utils/imageUrl';
import { cn } from '@/utils/classnames';
import { config } from '@/config';

interface TemplateCardProps {
    item: PptTemplatePo;
    onEdit?: (item: PptTemplatePo) => void;
    onDelete?: (item: PptTemplatePo) => void;
    onMenuClick?: (action: string, item: PptTemplatePo) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
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
            
            const url = getImageUrl(item.coverImage);
            setCoverUrl(url);
        };
        processCover();
    }, [item.coverImage, getMinioService]);
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
                onClick: (data: PptTemplatePo) => {
                    onEdit(data);
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
                onClick: (data: PptTemplatePo) => {
                    onDelete(data);
                },
            });
        }

        return items;
    }, [onEdit, onDelete, t]);

    return (
        <PptCard
            item={item}
            menuItems={menuItems}
            onMenuItemClick={onMenuClick}
            hoverable={true}
            cover={(
                <div className="relative w-full h-full">
                    {(imageError || !coverUrl) ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <img
                                src={config.resolvePublicAsset('imgs/fallback-image.svg')}
                                alt="fallback"
                                className="w-12 h-12 "
                            />
                        </div>
                    ) : (
                        <Image
                            src={coverUrl}
                            preview={false}
                            alt={item.templateName}
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
            title={item.templateName}
            description={formatRelativeTime(item.createTime)}
        >
        </PptCard>
    );
};

export default TemplateCard;
