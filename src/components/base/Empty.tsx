import { useTranslate } from "@/hooks/common-hooks";
import { Empty } from "antd";
import React from "react";


interface EmptyComponentProps {
    description?: string;
    className?: string;
};

const EmptyComponent: React.FC<EmptyComponentProps> = (props) => {
    const { t } = useTranslate();

    return <div className={`flex justify-center items-center min-h-96 ${props.className || ""}`}>
        <Empty description={props.description || t?.('common.pagination.noData') || 'No Data'} image={Empty.PRESENTED_IMAGE_SIMPLE} />

    </div>


}



export default EmptyComponent