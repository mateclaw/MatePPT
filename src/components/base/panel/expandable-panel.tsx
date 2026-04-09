import React, { useState } from 'react';
import { CaretDownFilled } from "@ant-design/icons";
import cn from '@/utils/classnames';

interface ExpandablePanelProps {
    title: React.ReactNode;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    level?: number
    collapsible?: boolean
}

const ExpandablePanel: React.FC<ExpandablePanelProps> = ({
    title,
    children,
    defaultExpanded = false,
    className,
    level = 0,
    collapsible = true
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={cn('expandable-panel', className)}>
            <div
                className={cn("panel-header flex items-center cursor-pointer  py-2 px-3  rounded-lg  ", level === 0 ? "bg-fill-500 mb-1" : 'hover:bg-fill-500')}
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
            </div>

            {expanded && <div className={cn(
                'panel-content p-4',
                'transition-all duration-300 overflow-hidden',
                expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            )}>

                <div className="px-4 border-l ">
                    {children}
                </div>

            </div>}
        </div>
    );
};

export default ExpandablePanel;