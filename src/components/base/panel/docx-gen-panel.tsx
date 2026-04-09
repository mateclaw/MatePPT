import React, { useState } from 'react';
import { CaretDownFilled, CheckOutlined } from "@ant-design/icons";
import cn from '@/utils/classnames';
import { Tag } from 'antd';

interface DocxGenPanelProps {
    title: React.ReactNode;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    level?: number
    collapsible?: boolean;
    status?: 'completed' | "processing" | "failed"
}

const DocxGenPanel: React.FC<DocxGenPanelProps> = ({
    title,
    children,
    defaultExpanded = false,
    className,
    level = 0,
    collapsible = true,
    status
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={cn('expandable-panel', className)}>
            <div
                className={cn("panel-header flex items-center w-full justify-between cursor-pointer  py-2 px-3   bg-fill-500  ", level === 0 ? "bg-fill-500 " : 'hover:bg-fill-500',expanded?'rounded-t-lg':'rounded-lg')}
                onClick={() => collapsible && setExpanded(!expanded)}
            >
                <div className=' flex items-center'>
                    <span className="expand-icon mr-2 transition-transform">
                        <CaretDownFilled rotate={expanded ? 0 : -90} />
                    </span>
                    <div className="panel-title">

                        {title}
                    </div>


                </div>

                <div className='flex-none w-28'>
                    {status === 'completed' ? <Tag color="green" className='w-20' bordered={false}>
                        <div className='flex items-center gap-1'>
                            <div className='w-4'>
                                <CheckOutlined />
                            </div>
                            已完成
                        </div>
                    </Tag> : <Tag color="blue" className='w-20' bordered={false}>

                        <div className='flex items-center gap-1'>
                            <div className='w-4'>
                                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>

                            </div>
                            进行中
                        </div>
                    </Tag>}
                </div>
            </div>

            {expanded && <div className={cn(
                'panel-content py-4 ',
                'transition-all duration-300 overflow-hidden border rounded-b-lg',
                
                expanded ? ' opacity-100' : 'max-h-0 opacity-0'
            )}>

                <div className="pl-4  ">
                    {children}
                </div>

            </div>}
        </div>
    );
};

export default DocxGenPanel;