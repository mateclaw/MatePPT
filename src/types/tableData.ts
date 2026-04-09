import {PageBean} from '@/models/common/pageBean';

export class TableData<T> extends PageBean {
    // 加载中
    public loading: boolean;

    // 显示详情
    public showDetail: boolean;

    // 分页数据
    public data: T[];

    // 构造函数
    constructor() {
        super();
        this.pageNum = 1;
        this.pageSize = 10;
        this.total = 0;
    }
}
