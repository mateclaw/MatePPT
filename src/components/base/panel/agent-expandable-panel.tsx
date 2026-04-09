import React, { useState } from 'react';
import { CaretDownFilled, DownOutlined } from "@ant-design/icons";
import cn from '@/utils/classnames';
import panelStyles from "./panel.less";

interface AgentExpandablePanelProps {
    title: React.ReactNode;
    action?: React.ReactNode;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    level?: number
    collapsible?: boolean
}

const AgentExpandablePanel: React.FC<AgentExpandablePanelProps> = ({
    title,
    children,
    defaultExpanded = false,
    className,
    level = 0,
    collapsible = true,
    action
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={cn(panelStyles['agent-expandable-panel'], className)}>
            <div
                className={cn(panelStyles['agent-expandable-panel-header'], " flex items-center cursor-pointer  py-2 px-3  rounded-lg  ")}
                onClick={() => collapsible && setExpanded(!expanded)}
            >
                <div className={cn(panelStyles['agent-expandable-panel-title'], ' flex items-center')}>
                    <span className="expand-icon mr-2 transition-transform">
                        <DownOutlined rotate={expanded ? 0 : -90} />
                    </span>
                    <div className="panel-title">
                        {title}
                    </div>


                </div>
                <div className='flex-none'>
                    {action}
                </div>
            </div>

            {expanded && <div className={cn(
                'panel-content pb-4 ',
                'transition-all duration-300',
                expanded ? ' opacity-100' : 'max-h-0 opacity-0'
            )}>

                <div className="px-2">

                    {children ? children : <div className='py-2 px-4'>请添加</div>}
                </div>

            </div>}
        </div>
    );
};

export default AgentExpandablePanel;