import React, { useState } from 'react';
import { CaretDownFilled, DownOutlined, DeleteOutlined } from "@ant-design/icons";
import cn from '@/utils/classnames';
import panelStyles from "./panel.less";
import { Button } from 'antd';
import TableDeleteButton from '../button/table-delete-button';


interface AgentItemPanelProps {
    title: React.ReactNode;
    className?: string;
    description?: React.ReactNode;
    onDelete?: () => void;
    deleteButton?: React.ReactNode;
}

const AgentItemPanel: React.FC<AgentItemPanelProps> = ({
    title,
    description,
    onDelete,
    className,
    deleteButton
}) => {


    return (
        <div className={cn(panelStyles['agent-item-panel'], className)}>
            <div className={panelStyles['agent-item-panel-info']}>
                <div className={panelStyles['agent-item-panel-title']}>
                    {title}
                </div>
                <div className={panelStyles['agent-item-panel-desc']}>
                    {description}
                </div>
            </div>
            <div className='flex-0'>
                {
                    deleteButton ?
                        (<div onClick={() => { onDelete && onDelete() }}>
                            {deleteButton}

                        </div>) :
                        <TableDeleteButton onClick={() => {
                            onDelete && onDelete()

                        }} >
                            <span></span>
                        </TableDeleteButton>

                    // <Button type='text' className='rounded-md p-1 h-auto text-primary hover:!text-primary' onClick={
                    //     () => { onDelete && onDelete() }
                    // }>
                    //     <DeleteOutlined />
                    // </Button>

                }

            </div>
        </div>
    );
};

export default AgentItemPanel;