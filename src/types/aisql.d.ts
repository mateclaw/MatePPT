import type { TableColumn } from "./tableColumn";

export interface AisqlMessage {
    id: string;
    // 直接显示的内容
    mdMsg: string;
    // 用于渲染的角色
    role: string;
    // 块id
    blockId: string;
    // 表格的列
    columns?: TableColumn[];
    // 表格数据
    data?: any;
    // 表格头(后台返回的)
    headerList?: any[];
    // 表格数据(后台返回的)
    dataList?: any[];
    // 图表类型
    chartType?: string;
    // 图标轴数据
    chartAxisList?: any;
    // 图表配置
    chartOptions?: any;
    // 分页信息
    pagination?: any;
    // 后台返回的原始消息
    originMsg?: string;
    // 额外信息
    extraMsg?: string;
    // 数据来源列表
    searchResult?: string;
    showProcess?: boolean;
    processStep?: string;
    processTab?: 'chart'|'table'|'sql';

    /**
     * 是否正在聊天
     */
    isChating?: boolean;

    // 图片列表
    fileUrlList?: string;

    // 是否显示应用按钮
    showApply?: boolean;
    // 状态
    status?: 'local' | 'success' | 'error' | 'loading';
}

export interface AisqlBlock {
    blockId: string;
    question?: string;
    sql?: string;
    excuteParams?: any;
    excuteResult?: any;
    isRight?: boolean;
    jscode?: string;
    trainData?: string;
    schema?: string;
    chartInstance?: any;
    // 地图相关
    mapQueryObject?: any;
    mapBufferObject?: any;
    mapPointObject?: any;
    mapRouteObject?: any;
}

export interface AisqlAxis {
    label: string;
    value: string;
    data: any;
    dataType?: string;
}