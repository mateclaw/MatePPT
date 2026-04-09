import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, CopyOutlined, DownloadOutlined, DownOutlined, RightOutlined, UserOutlined } from "@ant-design/icons";
import { Attachments, Bubble, Prompts } from "@ant-design/x";
import { Flex, GetProp, Alert, Modal, Table, Space, Select, Button, App } from "antd";
import MateMarkdown from "@/components/base/mate-markdown";
import SimpleCodeEditor from "@/components/base/code-editor/simple-sqlchat-editor";
import { CodeEditor } from "@/components/base/code-editor/dataline-code-editor";
import { useSetModalState } from "@/hooks/common-hooks";
import { DataQService } from "@/services/dataQ.service";
import React, { useCallback, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { AisqlBlock, AisqlMessage } from "@/types/aisql";
import { registerDictionary, useDictionary } from "@/utils/dictionary";
import { chartType } from "@/constants/dict-datasource";
import { useCopyToClipboard } from "react-use";
import { useEventStore } from "@/stores/eventStore";
import { Icon } from "umi";
import { isArray } from "lodash";
import useAuthStore from "@/stores/authStore";
import { useIsDarkTheme } from "../theme-provider";
import SystemLogo from "@/components/base/system-logo";
import { dbPoint, dbRoute } from "../amap/amap-index";
import ImageList from "@/components/base/list/image-list";
const AIAvatar = () => (
    <SystemLogo size={40} />
);

const UserAvatar = () => (
    {
        icon: <UserOutlined />, style: { background: 'var(--ant-color-primary)' }, size: 40
    }
);


const dataqService = DataQService.getInstance();
type RolesType = GetProp<typeof Bubble.List, 'roles'>
type chatRoleOption = {
    role: keyof RolesType;
    onItemClick?: (item) => void
    [key: string]: any;
}


const processStepMap = {
    'sql': 'sql生成完毕...',
    'result': 'sql执行完毕...',
    'chart': '图表生成完毕...',
    'error': '出错了...',
    'loading': '加载中...',
    'success': '成功...',
    'done': '操作已完成',
    'local': '本地...',
    'wait': '等待...',
    'waiting': '等待...',
    'waiting_sql': '等待sql生成...',
    'waiting_result': '等待sql执行...',
    'waiting_chart': '等待图表生成...',
}

export const useChatRoles = (chatMode?: string) => {

    registerDictionary(chartType.name, chartType);
    const chartTypeDict = useDictionary(chartType.name);

    const eventStore = useEventStore();
    const authStore = useAuthStore();
    const { message } = App.useApp();
    const [copyed, copy] = useCopyToClipboard();
    const isDark = useIsDarkTheme();
    const [, setShowProcess] = useState(false);

    const getAnswerSource = (item) => {

        let res = [];
        // const target = item as EntKbChatRecordPo;
        if (!item) {
            return res;
        }
        const target = item as any;
        if (target.sourceA) {
            const sourceAMap = {
                1: "QA检索",
                2: "KG召回",
                3: "API召回",
                4: "数据库召回",
            }
            res = [{ fileName: sourceAMap[target.sourceA] || '' }];
        }
        else if (target.fileList) {
            try {
                const files = JSON.parse(target.fileList) as { fileId: string, fileName: string, fileUrl: string }[];
                if (isArray(files)) {
                    res = files.map((v, i, arr) => {
                        return { fileName: v.fileName, fileUrl: v.fileUrl }
                    });

                }
                else {
                    return [{ fileName: files }];
                }
            } catch (error) {
                console.error(error)
            }
        }
        else if (target.fileName) {
            res = [{ fileName: target.fileName, fileUrl: target.fileUrl }];
        }
        return res;
    }

    const previewFile = (fileUrl) => {
        const minioService = authStore.getMinioService('');
        minioService.then(minio => {
            minio.previewFile({ path: fileUrl })
        });
    }



    const chatRoles = (options: chatRoleOption, bubbleIndex, getMessages: () => any[]): RolesType | Partial<RolesType[keyof RolesType]> => {

        const tableData = options['data-msg'] as AisqlMessage;
        const blockData = options['data-block'] as AisqlBlock;

        const chartAxisList: any[] = tableData.chartAxisList || [];

        const originData = tableData.data || {};

        const getChartOptions = () => {
            const opts = tableData.chartOptions || {};
            return {
                ...opts,
                showLegend: opts.showLegend !== false,
            };
        };

        const fileList = getAnswerSource(originData);


        const roles: RolesType = {
            ai: {
                placement: 'start',
                typing: false,
                avatar: AIAvatar(),
                variant: "borderless",
                style: { marginInlineEnd: 48, },
                classNames: { content: 'w-full' },
                // onClick: () => {
                //     if (options?.onItemClick) {
                //         options?.onItemClick(options)
                //     }
                // },

                // header: (<div className="think-button " onClick={() => { console.log('header click') } }>
                //     header
                // </div>),
                messageRender(content) {
                    const onClickSourceButton = (event) => {
                        eventStore.emit('Chatboard/SourceButtonClick', {
                            event: event, data: {
                                item: options,

                            }
                        })

                    };
                    const searchResult = tableData.searchResult ? JSON.parse(tableData.searchResult) : [];


                    if (typeof content === 'string') {
                        return (
                            <div style={{ position: 'relative' }} className="group/chat-message">
                                {searchResult && searchResult.length > 0 && <div className="chat-message-content-source-header"
                                >
                                    <div className="source-button" onClick={onClickSourceButton}>
                                        <span>
                                            已搜索到{searchResult.length}条相关资源
                                        </span>
                                        <RightOutlined style={{ transform: 'rotate(0deg)' }} />
                                    </div>
                                </div>}
                                <MateMarkdown className=" mate-markdown-chat w-full" isChat={true} isPreview={true} value={content} options={{
                                    themeSettings: {
                                        toolbarTheme: isDark ? 'dark' : 'light',
                                        codeBlockTheme: isDark ? 'vs-dark' : 'one-light'
                                    } as any
                                }} />
                                {
                                    (chatMode == 'kb' || chatMode == 'bot' || chatMode == 'agent') && <Flex justify="space-between" style={{ width: '100%' }} gap="small" className="invisible group-hover/chat-message:visible">
                                        <Flex flex={1}>
                                            <Space wrap>
                                                {fileList && fileList.length > 0 && fileList.map((file, index) => {
                                                    return <Button type="link" style={{ padding: 0 }} key={index} onClick={() => {

                                                        if (file.fileUrl) {
                                                            previewFile(file.fileUrl)
                                                        }
                                                    }}>来自：{file.fileName}</Button>
                                                })}
                                            </Space>
                                        </Flex>
                                        {!tableData.isChating && <Flex flex='0 0 200' gap={8} >
                                            <Button variant="link" color="blue" className="!text-textcolor-300 hover:!text-primary" icon={<Icon icon="local:knowledge/copy" width="20" height="20" />} onClick={() => {
                                                copy(content)
                                                if (copyed) {
                                                    message.success('复制成功')
                                                }
                                            }}></Button>

                                            <Button variant="link" color="blue" className="!text-textcolor-300 hover:!text-primary" icon={<Icon icon="local:knowledge/recall" width="20" height="20" />} onClick={(event) => {
                                                eventStore.emit('BubbleList/RecallList', {
                                                    event: event as any,
                                                    item: options,

                                                })
                                            }}></Button>

                                            <Button variant="link" color="blue" className="!text-textcolor-300 hover:!text-primary" icon={<Icon icon="local:knowledge/qa" width="20" height="20" />} onClick={(event) => {
                                                eventStore.emit('BubbleList/QaButtonClick', {
                                                    event: event as any,
                                                    item: options,

                                                })
                                            }}></Button>
                                        </Flex>}
                                    </Flex>
                                }
                                {
                                    (chatMode == 'docx' && tableData.showApply) && <Flex justify="space-between" style={{ width: '100%' }} gap="small" className="">
                                        <Flex flex={1} gap={20}>


                                            <Button variant="filled" color="green" size="small" className="!text-sm" onClick={(event) => {
                                                eventStore.emit('BubbleList/ApplyMessage', {
                                                    event: event as any,
                                                    item: options,
                                                    isOk: true
                                                })
                                            }}>
                                                <CheckCircleOutlined />
                                                <span className="text-xs ">
                                                    接受更改

                                                </span>
                                            </Button>

                                            <Button variant="filled" color="default" size="small" className="!text-sm" onClick={(event) => {
                                                eventStore.emit('BubbleList/ApplyMessage', {
                                                    event: event as any,
                                                    item: options,
                                                    isOk: false
                                                })
                                            }}>

                                                <CloseCircleOutlined />
                                                <span className="text-xs ">
                                                    拒绝更改

                                                </span>
                                            </Button>
                                        </Flex>
                                    </Flex>
                                }

                            </div >
                            // <div>{content}</div>

                        )
                    }
                    else {
                        return (
                            <Alert type="error" description={content}>

                            </Alert>
                        )
                    }
                },
            },
            suggestion: {
                placement: 'start',
                avatar: { icon: <UserOutlined />, style: { visibility: 'hidden' } },
                variant: 'borderless',
                style: { marginInlineEnd: 48, },
                messageRender: (content: any) => <Prompts vertical onItemClick={(item) => options.onItemClick(item)} items={content as any} />,
            },
            file: {
                placement: 'start',
                avatar: { icon: <UserOutlined />, style: { visibility: 'hidden' } },
                variant: 'borderless',
                style: { marginInlineEnd: 48, },
                messageRender: (content: any) => (
                    <Flex vertical gap="middle">
                        {(content as any[]).map((item) => (
                            <Attachments.FileCard key={item.uid} item={item} />
                        ))}
                    </Flex>
                ),
            },
            error: {
                avatar: AIAvatar(),
                placement: 'start',
                variant: "borderless",
                style: { marginInlineEnd: 48, },
                messageRender(content) {
                    return (
                        <Alert message={content} type="error" />
                    )
                },
            },
            user: {
                avatar: UserAvatar(),
                placement: 'end',
                style: { marginInlineStart: 58, },
                messageRender(content) {
                    return (
                        <div>
                            {content}
                            {
                                (chatMode == 'gpt' && tableData.fileUrlList) &&
                                <div className="mt-2">
                                    <ImageList images={tableData.fileUrlList} />
                                </div>
                            }
                        </div>
                    )
                },

            },
            sql: {
                avatar: AIAvatar(),
                placement: 'start',
                typing: false,
                variant: "borderless",
                style: { marginInlineEnd: 48, },
                classNames: { content: 'w-full', },

                messageRender(content) {



                    return (
                        // <div className="border border-bordercolor-500 border-solid rounded-2xl">
                        <div className=" border-bordercolor-500 border-0 rounded-2xl  ">
                            {/* <SimpleCodeEditor value={content} item={options}>


                            </SimpleCodeEditor> */}
                            <CodeEditor language="sql" value={content} item={options} resultId={tableData.id}>

                            </CodeEditor>

                        </div>
                    )
                }
            },
            table: {
                avatar: AIAvatar(),
                placement: 'start',
                variant: "borderless",
                style: { marginInlineEnd: 48, },
                classNames: { content: 'w-full' },
                messageRender(content) {


                    // const temp = JSON.parse(content);
                    // const tablehead = temp.headerList;
                    // const tablebody = temp.dataList;
                    // const tableColumns = tablehead.map((item) => {
                    //     return {
                    //         title: item.name,
                    //         key: item.name,
                    //         dataIndex: item.name,
                    //         width: item.name.length * 15
                    //     }
                    // });
                    // const tableData = tablebody.map((col) => {

                    //     const obj = {};
                    //     col.forEach((item, index) => {
                    //         obj[tableColumns[index].key] = item;
                    //     })
                    //     return obj;
                    // })
                    const showTable = tableData && tableData.columns && tableData.columns.length > 0;
                    const downloadCsv = (event) => {
                        eventStore.emit('Chatboard/downloadCsv', {
                            event: event, data: {
                                item: options,

                            }
                        })

                    };
                    return (
                        <div>
                            {/* {showTable && < Table columns={tableData.columns} dataSource={tableData.data} rowKey={'_index'} />} */}

                            <Flex justify="end">
                                <Button className="mate-primary-ghost-button" title="下载CSV" onClick={
                                    downloadCsv
                                }> <DownloadOutlined />下载CSV</Button>
                            </Flex>
                        </div>
                    )
                }
            },
            echarts: {
                avatar: AIAvatar(),
                placement: 'start',
                variant: "borderless",
                style: { marginInlineEnd: 48, },
                classNames: { content: 'w-full' },
                messageRender(content) {


                    let chartInst = null;

                    const getChartType = (item: any) => {
                    };


                    const onSelectChartType = (item: any) => {

                        eventStore.emit('Chatboard/onSelectChartType', {
                            event: null,
                            data: {
                                value: item,
                                item: options,
                            }
                        })
                    };

                    const onAxisChange = (axis, value) => {

                        eventStore.emit('Chatboard/onAxisChange', {
                            event: null,
                            data: {
                                // value: item,
                                item: options,
                                axis: axis,
                                value: value
                            }
                        })
                    };

                    const saveChart = (item) => {
                        var img = new Image();
                        img.src = chartInst.getDataURL({
                            type: 'png',
                            pixelRatio: 1,
                            backgroundColor: '#fff'
                        });


                        const a = document.createElement("a");

                        // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
                        a.download = "chart.png";
                        // 将生成的URL设置为a.href属性
                        a.href = img.src;
                        a.click()
                    }
                    const copyChart = (item) => {

                    }
                    return (
                        <div className="chat-message-content-block relative" style={{ height: 'auto', paddingBottom: '10px', paddingTop: '60px' }}>
                            <Flex justify="space-between" align="center" className="absolute top-2 w-full px-3 " gap={10}>
                                <Space >
                                    <div className="mate-search-bar-item-wrapper ">
                                        <div className="mate-search-bar-item-label small">
                                            图表类型
                                        </div>
                                        <div className="mate-search-bar-item small ">
                                            <Select className="mate-search-bar-item-inside " value={tableData.chartType} options={chartTypeDict.data} onChange={onSelectChartType}>

                                            </Select>

                                        </div>
                                    </div>

                                    {
                                        chartAxisList && chartAxisList.length > 0 && chartAxisList.map((axis, index) => {

                                            return (<div className="mate-search-bar-item-wrapper " key={index}>
                                                <div className="mate-search-bar-item-label small">
                                                    {axis.label}
                                                </div>
                                                <div className="mate-search-bar-item small">
                                                    <Select className="mate-search-bar-item-inside "
                                                        value={axis.data}
                                                        fieldNames={{ value: 'name', label: 'name' }}
                                                        options={axis.dataType ? tableData.headerList.filter(x => axis.dataType.indexOf(x.dataType) >= 0) : tableData.headerList}
                                                        onChange={(value) => onAxisChange(axis, value)}>

                                                    </Select>

                                                </div>
                                            </div>)
                                        })
                                    }

                                    <div className="mate-search-bar-item-wrapper mr-0" >

                                    </div>
                                </Space>
                                <Space>
                                    <Button className="mate-primary-ghost-button" onClick={() => saveChart(tableData)}>
                                        <DownloadOutlined />
                                        下载
                                    </Button>
                                    {/* <Button className="mate-primary-ghost-button" onClick={() => copyChart(tableData)}>
                                        <CopyOutlined />
                                        复制
                                    </Button> */}

                                </Space>
                            </Flex>
                            <ReactECharts
                                key={Date.now()}
                                option={getChartOptions()}
                                // 修改这两个参数确保配置合并
                                notMerge={true}
                                lazyUpdate={false}
                                onChartReady={(chartInstance) => {
                                    chartInst = chartInstance;
                                }}
                            // notMerge={true}
                            // lazyUpdate={true}

                            />
                        </div>
                    )
                }
            },
            executiveProcess: {
                avatar: AIAvatar(),
                placement: 'start',
                variant: "borderless",
                style: { marginInlineEnd: 48, },
                classNames: { content: 'w-full' },
                messageRender(content: any) {

                    // 表格相关代码
                    const showTable = tableData && tableData.columns && tableData.columns.length > 0;
                    const showChart = chartAxisList && chartAxisList.length > 0 && tableData.dataList && tableData.dataList.length > 0;


                    const activeTab = tableData.processTab;
                    const downloadCsv = (event) => {
                        eventStore.emit('Chatboard/downloadCsv', {
                            event: event, data: {
                                item: options,

                            }
                        })

                    };


                    // 图表相关代码

                    let chartInst = null;

                    const onSelectChartType = (item: any) => {

                        eventStore.emit('Chatboard/onSelectChartType', {
                            event: null,
                            data: {
                                value: item,
                                item: options,
                            }
                        })
                    };

                    const onAxisChange = (axis, value) => {

                        eventStore.emit('Chatboard/onAxisChange', {
                            event: null,
                            data: {
                                // value: item,
                                item: options,
                                axis: axis,
                                value: value
                            }
                        })
                    };

                    const saveChart = (item) => {
                        var img = new Image();
                        img.src = chartInst.getDataURL({
                            type: 'png',
                            pixelRatio: 1,
                            backgroundColor: '#fff'
                        });


                        const a = document.createElement("a");

                        // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
                        a.download = "chart.png";
                        // 将生成的URL设置为a.href属性
                        a.href = img.src;
                        a.click()
                    }


                    const onClickSourceButton = (event) => {
                        eventStore.emit('Chatboard/SourceButtonClick', {
                            event: event, data: {
                                item: options,

                            }
                        })

                    };

                    // 新增状态管理：用于切换显示内容
                    // const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'sql'>('chart');

                    const onDbProcessTabChange = (key: string) => {
                        eventStore.emit('Chatboard/onDbProcessTabChange', {
                            event: null,
                            data: {

                                item: options,
                                key: key
                            }
                        })
                    };

                    const searchResult = tableData.searchResult ? JSON.parse(tableData.searchResult) : [];
                    // let showProcess = tableData.showProcess ? true : false;
                    let showProcess = true;

                    return (
                        <div>

                            {/* <div className="chat-message-content-source-header"
                            >
                                <div className="source-button" onClick={(event) => {
                                    showProcess = !showProcess;
                                    eventStore.emit('Chatboard/ProcessButtonClick', {
                                        event: event as any, data: {
                                            item: options,
                                            showProcess: showProcess

                                        }
                                    })
                                }}>
                                    {tableData.processStep === 'done' ? <span>
                                        {showProcess ? '隐藏执行过程' : '显示执行过程'}
                                    </span> : <span>
                                        {processStepMap[tableData.processStep] || processStepMap['error']}
                                    </span>

                                    }
                                    <RightOutlined style={{ transform: showProcess ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                                </div>
                            </div> */}

                            <div style={{ position: 'relative' }} className="group/chat-message  ">
                                {searchResult && searchResult.length > 0 && <div className="chat-message-content-source-header"
                                >
                                    <div className="source-button" onClick={onClickSourceButton}>
                                        <span>
                                            已搜索到{searchResult.length}条相关资源
                                        </span>
                                        <RightOutlined style={{ transform: 'rotate(0deg)' }} />
                                    </div>
                                </div>}
                                <MateMarkdown className=" mate-markdown-chat w-full" isChat={true} isPreview={true} value={content}

                                    thinkLabel={['显示执行过程', '隐藏执行过程']}
                                    options={{
                                        themeSettings: {
                                            toolbarTheme: isDark ? 'dark' : 'light',
                                            codeBlockTheme: isDark ? 'vs-dark' : 'one-light'
                                        } as any
                                    }} />
                                {
                                    chatMode == 'kb' && <Flex justify="space-between" style={{ width: '100%' }} gap="small" className="invisible group-hover/chat-message:visible">
                                        <Flex flex={1}>
                                            <Space>
                                                {fileList && fileList.length > 0 && fileList.map((file, index) => {
                                                    return <Button type="link" style={{ padding: 0 }} key={index} onClick={() => {

                                                        if (file.fileUrl) {
                                                            previewFile(file.fileUrl)
                                                        }
                                                    }}>来自：{file.fileName}</Button>
                                                })}
                                            </Space>
                                        </Flex>
                                        <Flex flex='0 0 200' gap={8} >
                                            <Button variant="link" color="blue" className="!text-textcolor-300 hover:!text-primary" icon={<Icon icon="local:knowledge/copy" width="20" height="20" />} onClick={() => {
                                                copy(content)
                                                if (copyed) {
                                                    message.success('复制成功')
                                                }
                                            }}></Button>

                                            <Button variant="link" color="blue" className="!text-textcolor-300 hover:!text-primary" icon={<Icon icon="local:knowledge/recall" width="20" height="20" />} onClick={(event) => {
                                                eventStore.emit('BubbleList/RecallList', {
                                                    event: event as any,
                                                    item: options,

                                                })
                                            }}></Button>

                                            <Button variant="link" color="blue" className="!text-textcolor-300 hover:!text-primary" icon={<Icon icon="local:knowledge/qa" width="20" height="20" />} onClick={(event) => {
                                                eventStore.emit('BubbleList/QaButtonClick', {
                                                    event: event as any,
                                                    item: options,

                                                })
                                            }}></Button>
                                        </Flex>
                                    </Flex>
                                }
                            </div >
                            {showProcess && showChart && <div className="relative  border-gray-300 rounded-2xl bg-fill-container border mt-3 p-2">
                                {/* <div className=" border-bordercolor-500 border-0 rounded-2xl bg-fill-container ">
                                    <div className="">

                                    </div>
                                    <CodeEditor language="sql" value={tableData.extraMsg} item={options} resultId={tableData.id}>

                                    </CodeEditor>

                                </div>
                                <div className=" mt-3">
                                    {showTable && < Table columns={tableData.columns} dataSource={tableData.data} rowKey={'_index'} />}

                                    <Flex justify="end">
                                        <Button className="mate-primary-ghost-button" title="下载CSV" onClick={
                                            downloadCsv
                                        }> <DownloadOutlined />下载CSV</Button>
                                    </Flex>
                                </div>
                                {showChart && <div className="chat-message-content-block relative  mt-3 bg-fill-container  " style={{ height: 'auto', paddingBottom: '10px', paddingTop: '60px' }}>
                                    <Flex justify="space-between" align="center" className="absolute top-2 w-full px-3 " gap={10}>
                                        <Space >
                                            <div className="mate-search-bar-item-wrapper ">
                                                <div className="mate-search-bar-item-label small">
                                                    图表类型
                                                </div>
                                                <div className="mate-search-bar-item small ">
                                                    <Select className="mate-search-bar-item-inside " value={tableData.chartType} options={chartTypeDict.data} onChange={onSelectChartType}>

                                                    </Select>

                                                </div>
                                            </div>

                                            {
                                                chartAxisList && chartAxisList.length > 0 && chartAxisList.map((axis, index) => {

                                                    return (<div className="mate-search-bar-item-wrapper " key={index}>
                                                        <div className="mate-search-bar-item-label small">
                                                            {axis.label}
                                                        </div>
                                                        <div className="mate-search-bar-item small">
                                                            <Select className="mate-search-bar-item-inside "
                                                                value={axis.data}
                                                                fieldNames={{ value: 'name', label: 'name' }}
                                                                options={axis.dataType ? tableData.headerList.filter(x => axis.dataType.indexOf(x.dataType) >= 0) : tableData.headerList}
                                                                onChange={(value) => onAxisChange(axis, value)}>

                                                            </Select>

                                                        </div>
                                                    </div>)
                                                })
                                            }

                                            <div className="mate-search-bar-item-wrapper mr-0" >

                                            </div>
                                        </Space>
                                        <Space>
                                            <Button className="mate-primary-ghost-button" onClick={() => saveChart(tableData)}>
                                                <DownloadOutlined />
                                                下载
                                            </Button>
                                            

                                        </Space>
                                    </Flex>
                                    <ReactECharts
                                        key={Date.now()}
                                        option={getChartOptions()}
                                        
                                        notMerge={false}
                                        lazyUpdate={false}
                                        onChartReady={(chartInstance) => {
                                            chartInst = chartInstance;
                                        }}
                                 

                                    />
                                </div>
                                
                                
                                } */}

                                <div className="flex justify-between items-center">
                                    <div>

                                    </div>

                                    <div className="flex gap-5 mr-3 mb-3">
                                        {showChart && <Button variant={'link'} className="p-0 gap-1" color={activeTab === 'chart' ? "primary" : "default"}
                                            onClick={() => onDbProcessTabChange('chart')}
                                        >
                                            <Icon icon="local:icon-chart" width='14' height='14' />
                                            图表
                                        </Button>}
                                        {showTable && <Button variant={'link'} className="p-0 gap-1" color={activeTab === 'table' ? "primary" : "default"}
                                            onClick={() => onDbProcessTabChange('table')}
                                        >
                                            <Icon icon="local:datasource/db-table" width='14' height='14' />
                                            数据
                                        </Button>}
                                        <Button variant={'link'} className="p-0 gap-1" color={activeTab === 'sql' ? "primary" : "default"}
                                            onClick={() => onDbProcessTabChange('sql')}
                                        >
                                            <Icon icon="local:icon-sql" width='14' height='14' />
                                            SQL
                                        </Button>
                                    </div>
                                </div>

                                <div className=" overflow-auto">
                                    {activeTab === 'chart' && showChart && <div className="chat-message-content-block  bg-fill-container   " >


                                        <Flex justify="space-between" align="center" className="absolute top-2 left-2 right-[230px]  px-3 border-r " gap={10}>
                                            <Space className="overflow-x-auto " size={10}>
                                                <div className="mate-search-bar-item-wrapper  flex gap-2 items-center">
                                                    {/* <div className="mate-search-bar-item-label small">
                                                        类型
                                                    </div> */}
                                                    <div className="mate-search-bar-item small ">
                                                        <Select className="mate-search-bar-item-inside " value={tableData.chartType} options={chartTypeDict.data} onChange={onSelectChartType}>

                                                        </Select>

                                                    </div>
                                                </div>

                                                {
                                                    chartAxisList && chartAxisList.length > 0 && chartAxisList.map((axis, index) => {

                                                        return (<div className="mate-search-bar-item-wrapper flex gap-2 items-center" key={index}>
                                                            <div className="mate-search-bar-item-label small">
                                                                {axis.label}
                                                            </div>
                                                            <div className="mate-search-bar-item small">
                                                                <Select className="mate-search-bar-item-inside "
                                                                    value={axis.data}
                                                                    fieldNames={{ value: 'name', label: 'name' }}
                                                                    options={axis.dataType ? tableData.headerList.filter(x => axis.dataType.indexOf(x.dataType) >= 0) : tableData.headerList}
                                                                    onChange={(value) => onAxisChange(axis, value)}>

                                                                </Select>

                                                            </div>
                                                        </div>)
                                                    })
                                                }

                                                <div className="mate-search-bar-item-wrapper mr-0" >

                                                </div>
                                            </Space>
                                            <Space>
                                                <Button type="text" className="mate-primary-ghost-button" onClick={() => saveChart(tableData)}>
                                                    <DownloadOutlined />
                                                    下载
                                                </Button>


                                            </Space>
                                        </Flex>


                                        <ReactECharts
                                            key={tableData.id}
                                            option={getChartOptions()}
                                            style={{ height: '312px', width: '100%' }}
                                            notMerge={true}
                                            lazyUpdate={false}
                                            onChartReady={(chartInstance) => {
                                                chartInst = chartInstance;
                                            }}


                                        />


                                    </div>
                                    }
                                    {activeTab === 'table' && <div className="chat-message-content-block   mt-3 bg-fill-container  " >
                                        <Flex justify="space-between" align="center" className="absolute top-2 left-2 right-[230px]  px-3 border-r" gap={10}>
                                            <div className="text-base font-semibold">
                                                查询结果
                                            </div>
                                            <Button type="text" className="mate-primary-ghost-button" title="下载CSV" onClick={
                                                downloadCsv
                                            }> <DownloadOutlined />下载</Button>
                                        </Flex>
                                        {showTable &&
                                            <div >
                                                < Table columns={tableData.columns} scroll={{ y: 280, x: 'fix-content' }} dataSource={tableData.data} rowKey={'_index'} />
                                            </div>
                                        }




                                    </div>
                                    }
                                    {activeTab === 'sql' && <div className="chat-message-content-block   mt-3 bg-fill-container  h-[300px]">
                                        <CodeEditor language="sql" value={tableData.extraMsg} height={300} item={options} resultId={tableData.id}>

                                        </CodeEditor>

                                    </div>


                                    }
                                </div>

                            </div>}



                        </div>
                    )
                }
            },

            code: {
                avatar: AIAvatar(),
                placement: 'start',
                classNames: { content: 'w-full' },
                style: { marginInlineEnd: 48, },
                messageRender(content) {
                    return (
                        <iframe srcDoc={content} height={300} width={'100%'}>

                        </iframe>
                    )
                }
            },

            route: {
                placement: 'start',
                typing: { interval: 50, step: 20 },
                variant: "borderless",
                style: { marginInlineEnd: 48, },
                classNames: { content: 'w-full' },
                messageRender: (message) => {

                    const resJson: dbRoute = JSON.parse(message)
                    const focusPoint = (event, lon, lat, name) => {
                        event.stopPropagation();
                        eventStore.emit('Chatboard/onMapRouteClick', {
                            event: event,
                            data: {
                                lon: lon,
                                lat: lat,
                                name: name,
                                message,
                                block: blockData
                            }
                        })
                    }

                    return (
                        <div className="mate-map-route-wrapper" onClick={(event) => {
                            // eventStore.emit("Chatboard/onMapRoute", { event: event, data: message })
                        }}>
                            {resJson.sourceLat && <div className="mate-map-route-item" onClick={(event) => {
                                focusPoint(event, resJson.sourceLon, resJson.sourceLat, resJson.sourceName)
                            }}>
                                <div className="mate-map-route-item-title">起点</div>
                                {/* <div className="mate-map-route-item-content"> {resJson.sourceName || ''} （{resJson.sourceLon},{resJson.sourceLat}）</div> */}
                            </div>}
                            {resJson.stopPoints && resJson.stopPoints.length > 0 && resJson.stopPoints.map((item, index) => (
                                <div className="mate-map-route-item" key={index} onClick={(event) => {
                                    focusPoint(event, item.lon, item.lat, item.name)
                                }}>
                                    <div className="mate-map-route-item-title">途经点</div>
                                    {/* <div className="mate-map-route-item-content"> {item.name || ''} （{item.lon},{item.lat}）</div> */}
                                </div>))
                            }

                            {resJson.targetLat && <div className="mate-map-route-item" onClick={(event) => {
                                focusPoint(event, resJson.targetLon, resJson.targetLat, resJson.targetName)
                            }}>
                                <div className="mate-map-route-item-title">终点</div>
                                {/* <div className="mate-map-route-item-content"> {resJson.targetName || ''} （{resJson.targetLon},{resJson.targetLat}）</div> */}
                            </div>}
                        </div>
                    )
                }
            },
            point: {
                placement: 'start',
                typing: { interval: 50, step: 20 },
                variant: "borderless",
                style: { marginInlineEnd: 48, },
                classNames: { content: 'w-full' },
                messageRender: (message) => {

                    const resJson: dbPoint[][] = JSON.parse(message)
                    const focusPoint = (event, points: dbPoint[]) => {
                        event.stopPropagation();
                        eventStore.emit('Chatboard/onMapPointClick', {
                            event: event,
                            data: {
                                lon: points[0].geometry.coordinates[0],
                                lat: points[0].geometry.coordinates[1],
                                name: points[0].properties.name,
                                extData: points[0],
                                message,
                                block: blockData
                            }
                        })
                    }

                    return (
                        <div className="mate-map-route-wrapper" onClick={(event) => {
                            // eventStore.emit("Chatboard/onMapPoint", { event: event, data: message })
                        }}>


                            {resJson.length > 0 && resJson.map((point, index) => {
                                return <div className="mate-map-point-item" onClick={(event) => {
                                    focusPoint(event, point)
                                }} key={point[0].properties.id} >
                                    <div className="mate-map-point-item-title">{point[0].properties.name}</div>
                                </div>
                            })
                            }


                        </div>
                    )
                }
            }

        }
        // 校验 options.role 是否为合法键
        if (options && options.role) {
            const res = roles[options.role] as Partial<RolesType[keyof RolesType]>;

            return res
        }
        // return roles;

        // return roles



    };

    return {
        chatRoles
    }
}
