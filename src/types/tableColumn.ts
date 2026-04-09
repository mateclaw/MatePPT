
import { TableColumnType } from "antd";
export class TableColumn implements TableColumnType<any> {
    // 标题
    public title: string;

    // 字段
    public key: string;
    public dataIndex?: string;
    // 可见性
    public visible? = false;

    public isSort? = false;

    // 附加属性
    public data?: any;

    // 回调函数

    // public fixed?: ;
    public width?: number | string;
    public customRender?: any;
    public customCell?: any;
    public ellipsis?: boolean;
    public filters?: any[];
    public filterMultiple?: boolean;
    public defaultFilteredValue?: string[];
    public render? ;
}
