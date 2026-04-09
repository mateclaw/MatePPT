import { Pagination, type PaginationProps } from "antd";

import { FC, useMemo, useState, useEffect } from "react";
import { useSetState } from "ahooks";

interface Props extends PaginationProps {
    // onPageChange: (pageNum, pageSize) => void

}
const pager: FC<Props> = (props) => {
    const defaultConfig = {
        showSizeChanger: true,
        showQuickJumper: false,
        showTotal: (total) => `共${total}条数据`,
        pageSizeOptions: ['10', '20', '30', '40'],

        ...props
    } as PaginationProps;


    const [config, setConfig] = useSetState(defaultConfig);

    // const { onPageChange } = props;

    // setConfig(props);
    useEffect(() => {
        setConfig(props)
    }, [props])
    return (
        <Pagination
            {...config}
        />
    )
}

export default pager;