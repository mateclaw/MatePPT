import React from 'react';
import { Divider } from 'antd';
import SystemLogo from '@/components/base/system-logo';
import { useTranslate } from '@/hooks/common-hooks';

const MateFooter: React.FC = () => {
    const { t } = useTranslate();

    const footerLinks = [
        {
            title: t('common.menus.home.product') || '产品',
            items: [
                { label: '特点', href: '#' },
                { label: '升级', href: '#' },
                { label: 'FAQ', href: '#' },
            ],
        },
        {
            title: t('common.menus.home.solution') || '方案',
            items: [
                { label: '企业方案', href: '#' },
                { label: '个人', href: '#' },
            ],
        },
        {
            title: t('common.menus.home.pricing') || '定价',
            items: [
                { label: '介绍', href: '#' },
                { label: '定价策略', href: '#' },
            ],
        },
        {
            title: t('common.menus.home.partnership') || '合作',
            items: [
                { label: '关于', href: '#' },
                { label: '反馈', href: '#' },
            ],
        },
    ];

    return (
        <footer className='bg-footer-dark-bg border-t border-border-primary'>
            <div className='px-36 py-16'>
                <div className='w-full flex justify-center'>
                    <div className='max-w-[1264px] w-full'>
                        <div className='flex items-start gap-20'>
                            {/* 左边：Logo */}
                            <div className='flex-1'>
                                <SystemLogo size={56} />

                                <div className='text-sm text-footer-link  transition-colors mt-2'>
                                    Effortlessly turn your ideas into a fully functional PPT
                                </div>
                            </div>

                            {/* 右边：4列链接 */}
                            <div className='flex-1 grid grid-cols-4 gap-16'>
                                {footerLinks.map((column, index) => (
                                    <div key={index}>
                                        <div className='text-sm font-bold text-text-primary mb-4 text-white'>
                                            {column.title}
                                        </div>
                                        <ul className='space-y-3'>
                                            {column.items.map((item, itemIndex) => (
                                                <li key={itemIndex}>
                                                    <a
                                                        href={item.href}
                                                        className='text-sm text-footer-link hover:text-white transition-colors'
                                                    >
                                                        {item.label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </footer>
    );
};

export default MateFooter;
