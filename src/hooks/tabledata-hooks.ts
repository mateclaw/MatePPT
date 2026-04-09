// import { useState, useEffect, useRef, useCallback } from 'react';
// import axios from 'axios';

// import useUserStore from '@/stores/userStore';
// import { config } from "@/config";
// import { message, TableProps } from 'antd';
// import type { TablePaginationConfig } from 'antd/es/table';
// import { BaseService } from "@/services/base.service";
// import { HttpClientService } from "@/services/httpClient.service";
// import { Observable, Subscription, lastValueFrom } from "rxjs";
// import type { TableColumn } from '@/types/tableColumn';
// import { TableData } from '@/types/tableData';
// import type { PageBean } from '@/models/common/pageBean';
// import type { RSResult } from '@/models/common/rSResult';
// import { useLocation, useNavigate } from "umi";
// import { cloneDeep } from 'lodash';

import { useCallback, useEffect, useLayoutEffect } from 'react';

import { Observable, Subscription, lastValueFrom } from 'rxjs';
// import { HttpClientService } from "@/services/httpClient.service";
import type { RSResult } from '@/models/common/rSResult';
import type { PageBean } from '@/models/common/pageBean';
import { BaseService } from '@/services/base.service';
// import { useSetModalState } from "@/hooks/common-hooks";
import { useSafeState, useAntdTable, useBoolean, useSetState, useCreation, useDeepCompareEffect } from "ahooks";
import { TableProps, Table, TablePaginationConfig, Form, Modal, ModalProps } from 'antd';
import { createFunctionController } from "@/utils/function-util";
import { useShowDeleteConfirm } from "@/hooks/common-hooks";
import { cloneDeep, min } from "lodash";
import { App } from "antd";

interface TableAciton<T> {
    init?: (param: any) => any;
    onPageChange?: (pageNum: number, pageSize: number) => any;
    onPageSizeChange?: (pageSize: number) => any;
    advSearch?: () => void;
    clearSearch?: () => void;
    doLoadTableData?: () => Observable<RSResult<T | T[]>>;
    onTableDataLoaded?: (result: RSResult<T>) => void;
    buildQueryParams?: (params: AhookParams,
        formData: Record<string, any>) => T;
    afterBuildQueryParams?: (queryParams: T) => T;
    loadTableData?: () => void;
    deleteRecord?: (params: T) => any;
    beforeDeleteRecord?: (params: T) => any;
    doDeleteRecord?: (params: T) => any;
    afterDeleteRecord?: (result: RSResult<T>) => any;
    selectRecord?: (record: T) => any;
    addRecord?: () => any;
    editRecord?: (item: T) => any;
    saveRecord?: () => any;
    openUpdate?: (id: string, query?: any) => any;
    setDefaultData?: () => any;
    doSaveRecord?: (params: any, isAdd: boolean) => any;
    handleTableChange?: (pagination: TablePaginationConfig, filters: Record<string, any>, sorter: any) => void;
}

// Ahook 表格请求响应格式
interface AhookResult<T> {
    total: number;
    list: T[];
}

// Ahook 表格请求参数
interface AhookParams<T = any> {
    current: number;
    pageSize: number;
    sorter?: {
        field?: string;
        order?: 'ascend' | 'descend';
    };
    filters?: Record<string, any>;
    extra?: Record<string, any>;
}

interface TableDataOption<T> {
    dataService: BaseService<T>;
    defaultQueryParam?: Partial<T>;
    defaultModalData?: Partial<T>;
    modelName?: string;
    manual?: boolean;
    defaultModalProps?: ModalProps;
    dependencies?: any[];
    defaultPageSize?: number;
}
type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

// export function createFunctionController(originalFn: Function) {
//     let currentFn = originalFn;
//     const middleware = {
//         pre: [],
//         post: []
//     };

//     return {
//         // 执行当前函数（带中间件）
//         execute(...args) {
//             // 执行前置中间件
//             middleware.pre.forEach(fn => fn.apply(this, args));

//             // 执行核心逻辑
//             const result = currentFn.apply(this, args);

//             // 执行后置中间件（可处理返回值）
//             const finalResult = middleware.post.reduce(
//                 (acc, fn) => fn(acc),
//                 result
//             );

//             return finalResult;
//         },

//         // 覆盖原始函数
//         override(newFn) {
//             currentFn = newFn;
//             return this; // 支持链式调用
//         },

//         // 恢复原始函数
//         restore() {
//             currentFn = originalFn;
//             return this;
//         },

//         // 添加前置中间件
//         before(fn) {
//             middleware.pre.push(fn);
//             return this;
//         },

//         // 添加后置中间件
//         after(fn) {
//             middleware.post.push(fn);
//             return this;
//         },

//         // 移除中间件
//         removeMiddleware(type, fn) {
//             const index = middleware[type].indexOf(fn);
//             if (index > -1) {
//                 middleware[type].splice(index, 1);
//             }
//             return this;
//         }
//     };
// }


export const useRowSelection = () => {

    const [selectedRowKeys, setSelectedRowKeys] = useSafeState<React.Key[]>([]);
    const cbs = [];
    const onSelectChange = (cb: (selectedRowKeys: React.Key[]) => void) => {

        cbs.push(cb);
    };

    const rowSelection: TableRowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
            if (cbs.length) {
                cbs.forEach(cb => cb(newSelectedRowKeys));
            }
        },
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            // {
            //     key: 'odd',
            //     text: 'Select Odd Row',
            //     onSelect: (changeableRowKeys) => {
            //         let newSelectedRowKeys = [];
            //         newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            //             if (index % 2 !== 0) {
            //                 return false;
            //             }
            //             return true;
            //         });
            //         setSelectedRowKeys(newSelectedRowKeys);
            //     },
            // },
            // {
            //     key: 'even',
            //     text: 'Select Even Row',
            //     onSelect: (changeableRowKeys) => {
            //         let newSelectedRowKeys = [];
            //         newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            //             if (index % 2 !== 0) {
            //                 return true;
            //             }
            //             return false;
            //         });
            //         setSelectedRowKeys(newSelectedRowKeys);
            //     },
            // },
        ],
    };
    return {
        selectedRowKeys, setSelectedRowKeys, onSelectChange, rowSelection
    }
}
export function useTableData<T extends PageBean>(dataOption: TableDataOption<T>) {
    const cbs = {} as TableAciton<T>;
    const { dataService, defaultQueryParam = {}, defaultModalData = {}, modelName = '数据', manual, defaultModalProps = {}, defaultPageSize = 10 } = dataOption;
    const [queryForm] = Form.useForm();
    const [modalForm] = Form.useForm();
    const [modalTitle, setModalTitle] = useSafeState('');
    const [isAdd, { set: setIsAdd }] = useBoolean(false);
    const [editing, { set: setEditing }] = useBoolean(false);
    const [modalVisible, { set: setModalVisible, toggle: toggleModalVisible }] = useBoolean(false);
    const [queryParams, setQueryParams] = useSetState(defaultQueryParam);
    const { message, modal } = App.useApp();
    const showDeleteConfirm = useShowDeleteConfirm();

    // const [modal, contextHolder] = Modal.useModal();
    /**
     * 生成 Ahook Table 请求适配器
     * @param queryFunc 查询执行函数
     * @returns 符合 Ahook 要求的请求方法
     */
    const createQuery = useCallback(
        (service: BaseService<T>, queryFunctionName: string) => {

            return async (
                params: AhookParams,
                formData: Record<string, any> = {}
            ): Promise<AhookResult<T>> => {
                // 构建请求参数
                const { current, pageSize, sorter, filters, extra } = params;

                const requestParams = {
                    // ...httpClient.normalizeSorter(params.sorter),
                    // ...params.filters,
                    // ...params.extra,
                    // ...formData,
                    pageNum: params.current,
                    pageSize: params.pageSize,
                } as T;
                Object.entries(formData).forEach(([key, value]) => {
                    if (value) {
                        requestParams[key] = value;
                    }
                });
                try {

                    const result = await lastValueFrom((service[queryFunctionName] as (params: T) => Observable<RSResult<T>>)(requestParams));
                    return {
                        total: result.total || 0,
                        list: (Array.isArray(result.data) ? result.data : [result.data]) as T[],
                    };
                } catch (error) {
                    console.error('Table query failed:', error);
                    return { total: 0, list: [] };
                }
            };
        },
        []
    );

    const doQuery = () => {

        return async (
            params: AhookParams,
            formData: Record<string, any> = {}
        ): Promise<AhookResult<T>> => {
            // 构建请求参数

            try {

                const requestParams = buildQueryParams.execute(params, formData) as T;

                const result = await lastValueFrom(getLoadTableDataFunction.execute(requestParams));
                return onTableDataLoaded.execute(result);
            } catch (error) {
                console.error('Table query failed:', error);
                return { total: 0, list: [] };
            }
        };
    }

    const { tableProps, search, params, pagination, mutate, data: tableData } = useAntdTable(doQuery(), {
        form: queryForm,
        manual,
        defaultPageSize
        // refreshDeps: dependencies || []
    })



    const getLoadTableDataFunction = createFunctionController((queryParam): Observable<RSResult<T | T[]>> => {
        try {

            const res = dataService.list(queryParam);
            return res;
        } catch (error) {
            console.error(error);
        }
    })

    const buildQueryParams = createFunctionController((
        params: AhookParams,
        formData: Record<string, any> = {}) => {
        // if (cbs.buildQueryParams) {
        //     return cbs.buildQueryParams(params, formData);
        // }

        const { current, pageSize, sorter, filters, extra } = params;
        // TODO 添加默认排序规则
        const requestParams = {
            // ...httpClient.normalizeSorter(params.sorter),
            // ...params.filters,
            // ...params.extra,
            // ...formData,
            pageNum: params.current,
            pageSize: params.pageSize,
        } as T;
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined) {
                requestParams[key] = value;
            }
        });
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined) {
                requestParams[key] = value;
            }
        });
        return requestParams;
    })


    const onTableDataLoaded = createFunctionController((
        res: RSResult<T | T[]>
    ) => {
        // return res;
        return {
            total: res.total || 0,
            list: (Array.isArray(res.data) ? res.data : [res.data]) as T[],
        };

    })

    const getDefaultData = createFunctionController((

    ) => {
        const initialValues = {} as T;
        Object.assign(initialValues, defaultModalData);
        return initialValues;
    })

    const addRecord = createFunctionController((

    ) => {

        setIsAdd(true);
        setModalVisible(true);
        setEditing(true);
        setModalTitle('新增' + modelName);
        setTimeout(() => {
            const defaultData = getDefaultData.execute();
            modalForm.resetFields();
            modalForm.setFieldsValue(defaultData);

        }, 100);

    })


    const editRecord = createFunctionController((
        record: T
    ) => {
        setIsAdd(false);
        setModalVisible(true);
        setEditing(true);
        setModalTitle('编辑' + modelName);
        setTimeout(() => {
            const formData = cloneDeep(record);
            modalForm.setFieldsValue(formData);
        }, 100);
    });

    const afterModalOpen = createFunctionController((

    ) => {
        setModalVisible(true);
        if (isAdd) {

        }
        else if (editing) {

        }
    })

    const getSaveRecordFunction = createFunctionController((params): Observable<RSResult<T | T[]>> => {

        try {
            const res = dataService.addOrUpdate(params, isAdd);
            return res;
        } catch (error) {
            console.error('getSaveRecordFunction', error)
        }
    })

    const afterSaveRecord = createFunctionController((
        res: RSResult<T | T[]>
    ) => {
        queryForm.resetFields();
        setModalVisible(false);
        setEditing(false);
        setIsAdd(false);
        search.submit();
        message.success('保存成功');
        return res;
    })

    const saveRecord = createFunctionController((

    ) => {

        modalForm.validateFields().then((values: T) => {

            const req = getSaveRecordFunction.execute(values);

            req.subscribe(res => {

                afterSaveRecord.execute(res)
            })
        }).catch((err) => {
            console.error(err)
        })
    });

    const getDeleteRecordFunction = createFunctionController((params: T): Observable<RSResult<T | T[]>> => {
        try {
            const res = dataService.delete(params);
            return res;
        } catch (error) {
            console.error('getDeleteRecordFunction', error)
        }
    });
    const getDeleteSelectedRecordFunction = createFunctionController((params: any): Observable<RSResult<T | T[]>> => {
        try {
            const res = dataService.delete(params);
            return res;
        } catch (error) {
            console.error('getDeleteRecordFunction', error)
        }
    });

    const beforeDeleteRecord = createFunctionController((
        record: T
    ) => {
        return new Observable<T>((observer) => {

            // modal.confirm({
            //     okText: '确定',
            //     cancelText: '取消',
            //     content: '确定要删除该数据吗？',
            //     maskClosable: true,
            //     getContainer: () => document.body,

            // }).then((confirmed) => {

            //     if (confirmed) {
            //         observer.next(record);
            //         observer.complete();
            //     }
            // }, () => {
            //     observer.error('reject');
            // }
            // ).catch(() => { observer.error('reject'); })

            showDeleteConfirm({
                title: '确定要删除该记录吗？',
                onOk: () => {
                    observer.next(record);
                    observer.complete();
                },
                onCancel() {
                    observer.error('reject');
                    observer.complete();
                }
            })

        })
    })
    const beforeDeleteSelectedRecords = createFunctionController((
        ids: any[]
    ) => {
        return new Observable<Array<any>>((observer) => {

            if (!ids || ids.length === 0) {
                observer.error('没有选中数据');
                return;
            }
            // modal.confirm({
            //     okText: '确定',
            //     cancelText: '取消',
            //     content: '确定要删除选中数据吗？',
            //     maskClosable: true,
            //     getContainer: () => document.body,

            // }).then((confirmed) => {

            //     if (confirmed) {
            //         observer.next(ids);
            //         observer.complete();
            //     }
            // }, () => {
            //     observer.error('reject');
            // }
            // ).catch(() => { observer.error('reject'); })
            showDeleteConfirm({
                title: '确定要删除该记录吗？',
                onOk: () => {
                    observer.next(ids);
                    observer.complete();
                },
                onCancel() {
                    observer.error('reject');
                    observer.complete();
                }
            })
        })
    })

    const deleteRecord = createFunctionController((
        record: T
    ) => {
        beforeDeleteRecord.execute(record).subscribe({
            next: (beforeDeleteRes) => {
                getDeleteRecordFunction.execute(beforeDeleteRes).subscribe(res => {
                    if (res.code === 0) {
                        afterDeleteRecord.execute(res);
                    }
                })
            },
            error: (err) => {
                console.error('beforeDeleteRecord', err)
            }
        })
    });
    const deleteSelectedRecords = createFunctionController((

    ) => {
        const selectedRowKeys = rowSelection.selectedRowKeys;

        beforeDeleteSelectedRecords.execute(selectedRowKeys).subscribe({
            next: (beforeDeleteRes) => {
                getDeleteSelectedRecordFunction.execute(beforeDeleteRes).subscribe(res => {
                    if (res.code === 0) {
                        afterDeleteRecord.execute(res);
                    }
                })
            },
            error: (err) => {
                console.error('beforeDeleteRecord', err)
            }
        })
    });


    const afterDeleteRecord = createFunctionController((
        res: RSResult<T | T[]>
    ) => {
        // queryForm.resetFields();
        message.success('删除成功');
        setSelectedRowKeys([]);
        search.submit();
        return res;
    })





    // const modalState = useSetModalState();
    const { onSelectChange, rowSelection, setSelectedRowKeys } = useRowSelection();



    const getModalProps = () => {
        const modalProps = {
            title: modalTitle,
            open: modalVisible,
            afterOpenChange: () => {

            },
            onCancel: () => {
                setEditing(false);
                setIsAdd(false);
                setModalVisible(false);
            },
            onOk: (e) => {
                saveRecord.execute();
            },
            // footer: null,
            maskClosable: false,
            destroyOnClose: true,
            getContainer: () => document.body,
            width: 690,
            ...defaultModalProps
        }
        return modalProps;
    }

    return {
        tableProps: {
            ...tableProps,
            tableLayout: 'fixed' as any,
            scroll: { x: 1300 },

        },
        tableData,
        search,
        params,
        mutate,
        pagination,
        createQuery,
        onSelectChange,
        rowSelection,
        queryForm,
        modalForm, setIsAdd,
        isAdd,
        defaultModalData,
        queryParams,
        setQueryParams,
        modalTitle,
        setModalTitle,
        setModalVisible,
        toggleModalVisible,
        modalVisible,
        setEditing,
        editing,
        buildQueryParams,
        onTableDataLoaded,
        getLoadTableDataFunction,
        addRecord,
        editRecord,
        saveRecord,
        deleteRecord,
        getDefaultData,
        getSaveRecordFunction,
        getDeleteRecordFunction,
        getDeleteSelectedRecordFunction,
        deleteSelectedRecords,
        afterSaveRecord,
        getModalProps
    };
}


