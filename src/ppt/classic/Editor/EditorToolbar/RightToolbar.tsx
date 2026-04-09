import React, { useMemo } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { useMainStore } from '@/ppt/store';
import { useShallow } from "zustand/react/shallow";
import { useMemoizedFn } from 'ahooks';
import { cn } from '@/lib/utils';
import styles from './RightToolbar.module.scss';

import { useActiveElementList } from '@/ppt/hooks/useActiveElementList';
import ShapeElementPanel from "./ElementPropertyPanel/ShapeElementPanel";
import TextElementPanel from './ElementPropertyPanel/TextElementPanel';
import ImageElementPanel from './ElementPropertyPanel/ImageElementPanel';
import LineElementPanel from './ElementPropertyPanel/LineElementPanel';
import ChartElementPanel from './ElementPropertyPanel/ChartElementPanel';
import TableElementPanel from './ElementPropertyPanel/TableElementPanel';
import VideoElementPanel from './ElementPropertyPanel/VideoElementPanel';
import AudioElementPanel from './ElementPropertyPanel/AudioElementPanel';
import MathElementPanel from './ElementPropertyPanel/MathElementPanel';


export interface RightToolbarProps {

}

/**
 * 底部工具栏组件
 */
export const RightToolbar: React.FC<RightToolbarProps> = ({

}) => {
    //   const [showPlayOptions, setShowPlayOptions] = useState(false);

    const { activeElementIdList, activeGroupElementId, setActiveElementIdList } = useMainStore(
        useShallow((state) => ({
            activeElementIdList: state.activeElementIdList,
            activeGroupElementId: state.activeGroupElementId,
            setActiveElementIdList: state.setActiveElementIdList
        })),
    )
    const { handleElement } = useActiveElementList()

    const onCancel = useMemoizedFn(() => {
        setActiveElementIdList([])
    });

    const modalVisible = useMemo(() => {
        if (!activeElementIdList.length) return false
        return true
    }, [activeElementIdList.length, activeGroupElementId]);

    const title = useMemo(() => {
        if (!handleElement) return '元素'
        const map: Record<string, string> = {
            text: '文本',
            shape: '形状',
            image: '图片',
            line: '线条',
            chart: '图表',
            table: '表格',
            latex: '公式',
            math: '公式',
            video: '视频',
            audio: '音频',
        }
        return map[handleElement.type] || '元素'
    }, [handleElement]);

    const panel = useMemo(() => {
        if (!handleElement) return null
        switch (handleElement.type) {
            case 'text':
                return <TextElementPanel />
            case 'shape':
                return <ShapeElementPanel />
            case 'image':
                return <ImageElementPanel />
            case 'line':
                return <LineElementPanel />
            case 'chart':
                return <ChartElementPanel />
            case 'table':
                return <TableElementPanel />
            case 'video':
                return <VideoElementPanel />
            case 'audio':
                return <AudioElementPanel />
            // case 'latex':
            case 'math':
                return <MathElementPanel />
            default:
                return <TextElementPanel />
        }
    }, [handleElement]);

    return (
        <div className='h-full relative flex-none '
        >
            {modalVisible && <div style={{
          
            }} className={cn("",
                styles.modalPanel
            )}>
                <div className={styles.modalTitle}>
                    {title}
                </div>

                <div className={styles.closeIcon}>
                    <CloseOutlined onClick={onCancel} />
                </div>

                <div className={styles.modalContent}>
                    {panel}
                </div>

            </div>}


        </div>
    );
};
