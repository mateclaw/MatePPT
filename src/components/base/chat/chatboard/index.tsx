import { CoffeeOutlined, CopyOutlined, EllipsisOutlined, FireOutlined, LinkOutlined, OpenAIOutlined, SendOutlined, ShareAltOutlined, SmileOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import {
    Attachments,
    Bubble,
    Conversations,
    Prompts,
    Sender,
    Suggestion,
    ThoughtChain,
    useXAgent,
    useXChat,
    Welcome,
    XProvider,
    XRequest
} from '@ant-design/x';
import { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList';
import { Button, Divider, Flex, GetProp, Skeleton, Space, Spin, Popover, Typography, App, Modal, Form, Input, Row, Col } from 'antd';
import { FC, memo, useCallback, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle, } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import MateMarkdown from "@/components/base/mate-markdown";
import { useChatRoles } from "../roles";
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { lastValueFrom, Observable } from 'rxjs';
import PlaceholderNode from "./placeholder";
import PrefixNode from "./prefix";
import styles from "./chatboard.less";
import cn from "@/utils/classnames";
import React from 'react';
import { useBoolean, useLocalStorageState } from 'ahooks';
import { Icon } from 'umi';
import { MateAIService } from "@/services/mateAI.service";
import { useMateChat } from '../../../../hooks/useMateChat';
import { ChatMessage } from '../type';
import { useClickChatItem } from '../hooks/useClickChatItem';
import { nanoid } from 'nanoid';
import InfiniteScroll from 'react-infinite-scroll-component';
import { RSResult } from '@/models/common/rSResult';
import { GptChatRecordPo } from '@/models/gptChatRecordPo';
import { AisqlMessage } from '@/types/aisql';
import { useEventStore } from "@/stores/eventStore";
import { KbChatService } from '@/services/kbChat.service';
import { KbQaService } from '@/services/kbQa.service';
import { KbChatRecordPo } from '@/models/kbChatRecordPo';
import { useSetModalState } from '@/hooks/common-hooks';
import { KbQaPo } from '@/models/kbQaPo';
import { ChatCleanTimeService } from "@/services/chatCleanTime.service";
import { AgentChatCleanTimeService } from "@/services/agentChatCleanTime.service";
import { CleanTimeVo } from '@/models/cleanTimeVo';
import { registerDictionary, useDictionary } from '@/utils/dictionary';
import { FileCategoryService } from "@/services/fileCategory.service";
import ToggleButton from '../../button/toggle-button';
import { useSpeech } from '@/hooks/speech-hooks';
import { useSqlFeatures } from '../hooks/useSqlFeatures';
import { AgentChatRecordPo } from '@/models/agentChatRecordPo';
import { SenderHeader, SenderHeaderRef } from "./sender-head";
import { DbChatRecordPo } from '@/models/dbChatRecordPo';
import { ButtonConfig as PrefixButtonConfig } from "./prefix";
import { throttle } from 'lodash';
// const cherryInstance = new Cherry({
//     id: 'markdown-container',
//     value: '# welcome to cherry editor!',
//   });
const ND_JSON_SEPARATOR = '\n';

const agentChatCleanTimeServise = AgentChatCleanTimeService.getInstance();


interface ChatboardProps {
    className?: string;
    apiUrl: string;
    getQueryData?: (nextContent: string) => Record<string, any>;
    historyDataSource?: any;
    getHistoryParams?: () => Record<string, any>;
    chatMode: string;
    guideWords?: string;
    loadingText?: string;
    ref?: React.RefObject<ChatboardRef>;
    onSend?: (nextContent: string, extData?: any) => void;
    onMessage?: (resJSON, aiMsg) => void;
    onClose?: () => void;
    onError?: (err: any) => void;
    categoryList?: any[];
    showThink?: boolean | PrefixButtonConfig;
    showSearch?: boolean | PrefixButtonConfig;
    showVoice?: boolean;
    showGraph?: boolean;
    showReference?: boolean;
    showCleanButton?: boolean;
    uploadConfig?: Record<string, any>;
    questions?: string[];
    deepSearchType?: string;
}
export interface ChatboardRef {
    initData: () => void;
    doQuery: (nextContent: string) => void;
}
//   console.log(cherryInstance)
const Chatboard = forwardRef<ChatboardRef, ChatboardProps>((props, ref) => {
    const { showVoice = true, showThink = true, showSearch = true, showGraph = true, showReference = true, showCleanButton = true, deepSearchType } = props;
    const loadingHistory = useRef(false);
    const [historyData, setHistoryData] = React.useState<any[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isThink, setIsThink] = useLocalStorageState('MateAI:isThink', {
        defaultValue: false,
    });
    const [isSearch, setIsSearch] = useLocalStorageState<number>('MateAI:isSearch', {
        defaultValue: 0,
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const { chatRoles } = useChatRoles(props.chatMode);
    const eventStore = useEventStore();
    const { message: antdMessage } = App.useApp();
    // const initText = "您好，我是您的智能答疑助教，您有什么问题需要问我的吗？";
    // const roles = memo(chatRoles({
    //     isThink,
    //     onItemClick: (item) => {
    //         console.log(item)
    //     }
    // }));

    // const roles = useMemo(() => {
    //     return chatRoles({
    //         isThink,
    //         onItemClick: (item) => {
    //             console.log(item)
    //         }
    //     });
    // }, [chatRoles]);

    const chatService = MateAIService.getInstance();
    const kbChatService = KbChatService.getInstance();
    const kbQaService = KbQaService.getInstance();
    const chatCleanTimeService = ChatCleanTimeService.getInstance();
    const categoryService = FileCategoryService.getInstance();

    const [headerOpen, setHeaderOpen] = React.useState(false);
    const senderRef = useRef(null);
    const { Title, Text, Paragraph } = Typography;



    const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>(
        [],
    );
    const mateChat = useMateChat(props.apiUrl, {

        // token: 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NDg2MDExNjEsInVzZXJJZCI6MSwidXNlck5hbWUiOiLkvIHkuJrotoXnuqfnlKjmiLciLCJtYXhUaW1lcyI6LTEsInJvbGVJZHMiOiIxIn0.J-nlOUc7syEiKbCOxb_AXMZMAjmmX01xOvLgKT4MgSY'
    });
    const {
        onMessage, onClose, onError, sendData, isRequesting, controller, setIsRequesting,
        messageManager
    } = mateChat;

    const loadingText = props.loadingText || '正在思考...';
    const {
        dealSingleProcess,
        afterExecuteSql,
        afterGenerateChart,


    } = useSqlFeatures({
        mateChat,
        loadingText,
        getQueryData: props.getQueryData
    });
    const scrollRef = useRef(null);
    const senderHeaderRef = useRef<SenderHeaderRef>(null);

    const { onChatItemClick } = useClickChatItem();
    const [hasMore, setHasMore] = useState(true);
    const [pageNum, setPageNum] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;




    const loadMoreData = async () => {
        if (!hasMore || loadingHistory.current || !props.historyDataSource || !props.getHistoryParams) {
            return;
        }

        loadingHistory.current = true;
        try {
            const queryParam = props.getHistoryParams?.();
            if (!queryParam) {
                loadingHistory.current = false;
                return;
            }

            const res = await lastValueFrom(props.historyDataSource({
                ...queryParam,
                pageNum,
                pageSize
            })) as RSResult<any>;

            const newData = res.data || [];
            setTotal(res.total);
            setHasMore(newData.length >= pageSize);

            if (newData.length > 0) {
                setHistoryData(prev => [...newData, ...prev]); // 将新数据放在前面
                const newParsedData = parseData(newData);
                messageManager.setMessages(prev => [...newParsedData, ...prev]);
            }

            setPageNum(prev => prev + 1);

        } catch (error) {
            console.error(error);
        } finally {
            loadingHistory.current = false;
        }
    };


    useEffect(() => {
        setHistoryData([]);
        setPageNum(1); // 重置页码
        setHasMore(true); // 重置hasMore状态
        setIsInitialized(false);

        if (!props.historyDataSource || !props.getHistoryParams || !props.getHistoryParams()) {
            setIsInitialized(true);
            return;
        }

        // 只加载第一页数据
        const loadInitialData = async () => {
            loadingHistory.current = true;
            try {
                const queryParam = props.getHistoryParams();
                if (!queryParam) {
                    setIsInitialized(true);
                    return;
                }

                const res = await lastValueFrom(props.historyDataSource({
                    ...queryParam,
                    pageNum: 1, // 明确指定加载第一页
                    pageSize
                })) as RSResult<any>;

                const newData = res.data || [];
                setTotal(res.total);
                setHasMore(newData.length >= pageSize);
                setHistoryData(newData);

                if (newData.length > 0) {
                    const newParsedData = parseData(newData);
                    messageManager.setMessages(newParsedData);
                }

                setPageNum(2); // 下一次加载应该加载第2页
                setIsInitialized(true);

                // 初始化后滚动到底部
                setTimeout(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTo({
                            top: scrollRef.current.scrollHeight,
                        });
                    }
                }, 500);

            } catch (error) {
                console.error(error);
                setIsInitialized(true);
            } finally {
                loadingHistory.current = false;
            }
        };

        loadInitialData();
    }, [props.historyDataSource, props.getHistoryParams]);

    const parseData = (toParseData: any) => {
        const res = [] as AisqlMessage[];
        const data = [...toParseData];
        data.reverse();
        for (let index = 0; index < data.length; index++) {
            // const block = messageManager.getCurrentBlock();
            const block = messageManager.createBlock();
            const element = data[index] as AgentChatRecordPo & DbChatRecordPo;
            messageManager.updateBlock({ ...block, question: element.question });
            const fileUrlList = (element as any).fileUrlList;
            res.push({
                id: nanoid(),
                mdMsg: element.question,
                role: 'user',
                blockId: block?.blockId,
                status: 'local',
                data: element,
                fileUrlList: fileUrlList ? fileUrlList : undefined,

            } as AisqlMessage);

            // res.push({
            //     id: nanoid(),
            //     mdMsg: element.answer,
            //     role: 'ai',
            //     blockId: block?.blockId,
            //     status: 'local',
            //     data: element,
            //     searchResult: element.searchResult
            // });
            if (props.chatMode === 'db') {

                element as DbChatRecordPo;
                const record = {
                    id: nanoid(),
                    mdMsg: element.answer,
                    role: 'executiveProcess',
                    blockId: block?.blockId,
                    status: 'local',
                    extraMsg: '',
                    showProcess: false,
                    processStep: 'done'
                    // data: element
                } as AisqlMessage;
                if (element.sql) {

                    record.extraMsg = element.sql;
                    const currBlock = messageManager.getBlockById(block.blockId);
                    messageManager.updateBlock({
                        ...currBlock, sql: element.sql, excuteParams: {
                            sql: element.sql,
                            question: element.question,
                            sourceType: element.sourceType,
                            // host: element.dbHost,
                            // port: element.dbPort,
                            dbName: element.dbName,
                            // userName: element.dbUserName,
                            // password: element.dbPassword
                        }
                    });
                    let executeResult = null;
                    if (element.result) {
                        executeResult = JSON.parse(element.result);
                        afterExecuteSql(executeResult, record, true);
                        record.processTab = 'table'
                    }

                    if (element.chart && executeResult && executeResult.dataList && executeResult.dataList.length > 0) {

                        afterGenerateChart(element.chart, record, true);
                        record.processTab = 'chart';
                    }

                    res.push(record);
                }
                else{
                    res.push(record);
                }
            }
            else {
                const searchResult = (element as any).searchResult;

                res.push({
                    id: nanoid(),
                    mdMsg: element.answer,
                    role: 'ai',
                    blockId: block?.blockId,
                    status: 'local',
                    searchResult: searchResult ? searchResult : undefined,

                    data: element,
                    // searchResult: element.searchResult
                });

            }
        }
        return res;

    };

    useEffect(() => {
        // setMessages(historyData);

        if (!isInitialized) {
            return;
        }

        if (historyData.length) {
            const res = parseData(historyData);
            if (res.length) {
                messageManager.setMessages(res);
            }

        }
    }, [isInitialized]);




    const scrollToBottomAuto = throttle(() => {

        if (scrollRef.current) {
            (scrollRef.current as HTMLDivElement).scrollTo({
                top: (scrollRef.current as HTMLDivElement).scrollHeight,
                behavior: 'smooth'
            });
        }
    }, 200);




    const items: GetProp<typeof Bubble.List, 'items'> = []


    // 消息列表转换逻辑
    // const bubbleItems: GetProp<typeof Bubble.List, 'items'> =
    //     messageManager.messages.map(msg => ({
    //         key: msg.id,
    //         role: msg.role,
    //         content: msg.mdMsg,
    //         loading: msg.status === 'loading',
    //         typing: msg.status === 'local' ? false : true,
    //         'data-msg': msg,
    //         'data-block': messageManager.getBlockById(msg.blockId)
    //     }));
    const bubbleItems: GetProp<typeof Bubble.List, 'items'> = useMemo(() => {
        return messageManager.messages.map((msg, index) => {

            // if (!showSql && msg.role === 'sql') {
            //     return null;
            // }
            // if (!showChart && msg.role === 'echarts') {
            //     return null;
            // }
            // if (!showAnswer && msg.role === 'sqlAnswer') {
            //     return null;
            // }
            const res = ({
                key: msg.id,
                role: msg.role,
                content: msg.mdMsg,
                loading: msg.status === 'loading',
                // typing: msg.status === 'local' ? false : true,
                typing: false,
                'data-msg': msg,
                'data-block': messageManager.getBlockById(msg.blockId)
            })
            return res
        }).filter(item => item);
    }, [messageManager.messages]);

    const getChatRoles = useCallback((bubble, index) => {

        bubble.onClick = (e) => {

            onChatItemClick(e, bubble)
        }
        const role = chatRoles(bubble as any, index, messageManager.getMessages)
        return role as any
    }, [])


    onMessage(async (resJson, aiMsg) => {


        if (resJson.role === "QA" || resJson.role === "DOC") {

            if (!resJson.content || !props.historyDataSource) {
                return;
            }
            const param = props.getHistoryParams?.();
            props.historyDataSource({ ...param, id: resJson.content }).subscribe({
                next: (res) => {
                    if (res && res.data && res.data.length > 0) {
                        const recordDetail = res.data[0];
                        const msgs = messageManager.getMessages();
                        const msg = msgs[msgs.length - 1];
                        messageManager.updateMessage({ ...msg, data: recordDetail })
                    }
                },
            })
            // mateChatOptions.loadChatDetail && mateChatOptions.loadChatDetail(resJson.content)
        }
        dealSingleProcess(resJson, aiMsg)
        const msg = messageManager.getMessageById(aiMsg.id)
        props.onMessage && props.onMessage(resJson, msg);
        scrollToBottomAuto()
    });
    onClose(() => {

        props.onClose && props.onClose();
        scrollToBottomAuto()
    });
    onError((err) => {
        props.onError && props.onError(err);
    });

    const fileList = useRef([])

    const doQuery = (nextContent: string) => {

        if (isRequesting) {
            return;
        }
        if (!nextContent) return;

        const data = {
            // search:  isSearch,
            // deepThink: isThink
        } as any;
        if (showSearch) {
            data.search = isSearch

            if (deepSearchType == 'boolean') {
                data.deepResearch = isSearch ? true : false;
                delete data.search;
            }

            if (typeof showSearch === 'object' && showSearch.submitKey) {
                data[showSearch.submitKey] = isSearch ? true : false;
            }
        }
        if (showThink) {
            data.deepThink = isThink
            if (typeof showThink === 'object' && showThink.submitKey) {
                data[showThink.submitKey] = showThink ? true : false;
            }
        }


        if (currentCategory) {
            data.categoryId = currentCategory;
        }

        if (props.getQueryData) {
            const queryData = props.getQueryData(nextContent);
            Object.assign(data, queryData);
        }

        if (fileList.current && fileList.current.length > 0) {
            data.fileUrlList = fileList.current;
            fileList.current = [];
        }

        setTimeout(() => {
            setIsRequesting(true);
            sendData(data, nextContent)
        }, 50);
        // sendData(data as any, nextContent);

    }


    const onSubmit = (nextContent: string) => {


        if (props.uploadConfig && senderHeaderRef.current.items && senderHeaderRef.current.items.length > 0) {
            senderHeaderRef.current.upload().then((uploadRes) => {

                fileList.current = uploadRes.map(({ file, result }, index) => {
                    return result.result.fileUrl
                })
                if (props.onSend) {
                    props.onSend(nextContent, { fileList: fileList.current });
                }
                else {
                    doQuery(nextContent)
                }
                senderHeaderRef.current.clearItems();
                setHeaderOpen(false);
                setContent('');
            });

        }
        else {
            if (props.onSend) {
                props.onSend(nextContent);
            }
            else {
                doQuery(nextContent)
            }
            setContent('');
        }
    };
    const addItem = useCallback(() => {



    }, [])



    const onPrefixItemClick = (key: string) => {
        if (key === 'think') {
            // toggleThink()
            const tempThink = !isThink;
            setIsThink(tempThink)
        }
        else if (key === 'search') {
            if (isSearch === 1) {
                setIsSearch(0)
            }
            else {
                setIsSearch(1)
            }
        }
        else if (key === 'deepSearch') {
            if (isSearch === 2) {
                setIsSearch(0)
            }
            else {
                setIsSearch(2)
            }
        }
        else if (key === 'clean') {

            let request = null;
            if (props.chatMode == 'gpt') {
                const param = props.getQueryData('clean');

                request = chatCleanTimeService.cleanHistory({
                    chatType: 'GptChat',
                    modelName: param.modelName,
                    sessionId: param.sessionId
                } as CleanTimeVo)
            }
            else if (props.chatMode == 'kb') {
                const param = props.getQueryData('clean');
                request = chatCleanTimeService.cleanHistory({
                    chatType: 'EntKbChat',
                    kbId: param.kbId,
                } as CleanTimeVo)
            }
            else if (props.chatMode == 'spagent') {
                const param = props.getQueryData('clean');
                request = agentChatCleanTimeServise.cleanHistory({
                    chatType: 'AgentChat',
                    agentId: param.agentId,
                } as CleanTimeVo)
            }
            else if (props.chatMode == 'agent') {
                const param = props.getQueryData('clean');
                request = chatCleanTimeService.cleanHistory({
                    chatType: 'AgentChat',
                    agentId: param.agentId,
                } as CleanTimeVo)
            }
            else if (props.chatMode == 'bot') {
                const param = props.getQueryData('clean');
                request = chatCleanTimeService.cleanHistory({
                    chatType: 'BotChat',
                    botId: param.botId,
                } as CleanTimeVo)
            }
            else if (props.chatMode == 'db') {
                const param = props.getQueryData('clean');
                request = chatCleanTimeService.cleanHistory({
                    chatType: 'DataChat',
                    sourceId: param.sourceId,
                } as CleanTimeVo)
            }

            if (request) {
                request.subscribe(res => {
                    initData();
                    setHasMore(false);
                })
            }
            else {
                initData();
                setHasMore(false);
            }

        }
    };


    const initData = () => {
        setHasMore(true);
        setPageNum(1);
        setTotal(0);

        messageManager.setMessages([])
        setHistoryData([]);

    }
    // 暴露清空方法
    useImperativeHandle(ref, () => ({
        initData: initData,
        doQuery: (nextContent: string) => {
            doQuery(nextContent);
        },
    }));

    const { visible: popVisible, hideModal: hidePop, showModal: showPop, switchVisible: togglePop } = useSetModalState();
    const [recallItem, setRecallItem] = useState<any>(null);
    const [sourceEl, setSourceEl] = useState<any>(null)
    const [styleObj, setStyleObj] = useState<React.CSSProperties>({});
    const handlePop = (isOpen) => {
        if (isOpen) {
            showPop()
        }
        else {
            hidePop()
        }
    }
    useEffect(() => {
        // 注册监听 List/ItemClick 事件
        const unsubscribe = eventStore.on('BubbleList/SourceClick', ({ event, item, text }) => {

            if (props.chatMode == 'kb' || props.chatMode == 'bot' || props.chatMode == 'agent') {

                const sourceData = item['data-msg'].data as KbChatRecordPo;

                const queryData = props.getQueryData?.('text');

                let req = null;
                if (props.chatMode == 'agent') {
                    req = kbChatService.multiKbRecallSegmentList({ ...queryData, recallSegmentIds: sourceData.recallSegmentIds } as KbChatRecordPo)
                }
                else {
                    req = kbChatService.recallSegmentList({ ...queryData, recallSegmentIds: sourceData.recallSegmentIds } as KbChatRecordPo)
                }
                req.subscribe(res => {
                    const data = res.data || [];

                    const recallItem = data[Number(text) - 1];
                    if (recallItem) {
                        setRecallItem({
                            content: recallItem.segmentText
                        })


                        const a = event.target as Element;

                        const parent = a.closest('.chatboard-chat')

                        const rect = parent.getBoundingClientRect();
                        const obj = { position: 'absolute', left: event.pageX - rect.left, top: event.pageY - rect.y } as React.CSSProperties;

                        setStyleObj(obj);


                        setSourceEl(parent);
                        showPop()
                    }
                    // showModal();
                })
            }
            else if (props.chatMode === 'gpt' || props.chatMode === 'spagent') {
                const sourceData = item['data-msg'] as AisqlMessage;

                const recallList = sourceData.searchResult ? JSON.parse(sourceData.searchResult) : [];
                const recallItem = recallList[Number(text) - 1];
                if (recallItem) {
                    setRecallItem({
                        title: recallItem.name,
                        content: recallItem.snippet,
                        url: recallItem.url
                    })
                    const a = event.target as Element;

                    const parent = a.closest('.chatboard-chat')

                    const rect = parent.getBoundingClientRect();
                    const obj = { position: 'absolute', left: event.pageX - rect.left, top: event.pageY - rect.y } as React.CSSProperties;

                    setStyleObj(obj);

                    setSourceEl(parent);
                    showPop()
                }

            }
            // 执行页面逻辑...
        });

        // 组件卸载时自动取消监听
        return unsubscribe;
    }, []);


    const [content, setContent] = React.useState('');

    const { visible: qaVisible, hideModal: hideQaModal, showModal: showQaModal } = useSetModalState();
    const [qaForm] = Form.useForm();
    const saveQaData = () => {
        qaForm.validateFields().then((values) => {
            kbQaService.addLabledQa({ ...values, fromSource: 2 } as KbQaPo).subscribe(res => {

                antdMessage.success("标注成功");
                hideQaModal();

            });
        });

    }

    const [qaFormDetail, setQaFormDetail] = useState<KbChatRecordPo>();
    useEffect(() => {
        // 注册监听 List/ItemClick 事件
        const unsubscribe = eventStore.on('BubbleList/QaButtonClick', ({ event, item }) => {

            const sourceData = item['data-msg'].data as KbChatRecordPo;

            if (sourceData.labelQa) {
                antdMessage.error("已经标注过此QA");
                return;
            }
            if (props.chatMode == 'bot') {
                sourceData.kbId = (sourceData as any).sourceId
            }

            setQaFormDetail(sourceData)

            setTimeout(() => {
                // qaForm.resetFields();
                qaForm.setFieldsValue({
                    ...sourceData

                })
                showQaModal()
            }, 100)


        });

        // 组件卸载时自动取消监听
        return unsubscribe;
    }, []);






    const [currentCategory, setCurrentCategory] = useState(0);

    useEffect(() => {
        if (props.categoryList && props.categoryList.length > 0) {
            // setCurrentCategory(props.categoryList[0]);
            const defaultCat = props.categoryList.find(item => item.label.indexOf('默认') > -1);
            if (defaultCat) {
                setCurrentCategory(defaultCat.value);
            }
            else {
                setCurrentCategory(props.categoryList[0].value);
            }

        }
    }, [props.categoryList])


    const { isRecording, startRecord, stopRecord, finalText, interimText, wsHandler, isConnecting, isConnected } = useSpeech({
        url: '',
        onResult: (result) => {

            setContent(result);
        }
    })



    return (
        <div className={cn(props.className, styles.layout)} >
            {/* <Button onClick={addItem}> </Button>
            <Bubble.List 
                content="Hello, welcome to use Ant Design X! Just ask if you have any questions."

                roles={roles}
                items={items}
            />

            <Bubble.List /> */}
            {showCleanButton && <Button type='text' shape='circle' className='absolute right-4 top-0 !p-0 hover:!text-primary' onClick={() => onPrefixItemClick('clean')}>
                <Icon icon="local:icon-clean" width='20' height='20' />
            </Button>}


            <div className={cn(styles.chat, 'chatboard-chat')}>
                {/* 🌟 消息列表 */}


                <div className={styles.messages} ref={scrollRef} onScroll={(e) => {
                    const target = e.target as HTMLDivElement;

                    if (target.scrollTop < 100 && !loadingHistory.current && hasMore) {
                        loadMoreData();
                    }
                }}>

                    {loadingHistory.current && <div className='w-full text-center'>加载历史消息中...  </div>}
                    {(bubbleItems && bubbleItems.length) > 0 ?
                        <Bubble.List
                            className='max-w-[1000px] mx-auto'
                            items={bubbleItems}

                            roles={(bubble, index) => {
                                // console.log(bubble)
                                bubble.onClick = (e) => {

                                    onChatItemClick(e, bubble)
                                }
                                const role = chatRoles(bubble as any, index, messageManager.getMessages)

                                return role as any
                            }}


                        />
                        // items.map((item, index) => {
                        //     // return (
                        //     //     <div>
                        //     //         { JSON.stringify(roles['ai'].placement )}
                        //     //     </div>
                        //     // )
                        //     return (
                        //         <Bubble role={roles[item.role]}  key={item.key} onClick={() => {
                        //             console.log(item)
                        //         }}  {...roles[item.role]} content={item.content} >

                        //         </Bubble>)
                        // })

                        : <PlaceholderNode guideWords={props.guideWords} questions={props.questions} onQuestionClick={(question: string) => {

                            doQuery(question);

                        }} />}

                </div>
                <Popover open={popVisible} fresh content={
                    // <div style={{ maxWidth: 400 }}>{
                    //     recallItem?.segmentText
                    // }</div>

                    // <a-typography class="chat-citation" style="width: 100%;">
                    //         <!-- {{ sourceDetail }} -->
                    //         <a-typography-title class="chat-citation-title" :level="5">{{ sourceDetail.title
                    //             }}</a-typography-title>
                    //         <a-row :wrap="false" :gutter="10">
                    //             <a-col>
                    //                 <img class="chat-citation-img" v-if="sourceDetail.thumbnailUrl"
                    //                     style="width: 80px;height: 80px;" :src="sourceDetail.thumbnailUrl" alt=""
                    //                     srcset="">
                    //             </a-col>
                    //             <a-col flex="auto">
                    //                 <a-typography-paragraph class="chat-citation-content"
                    //                     :content="sourceDetail.snippet"
                    //                     :ellipsis="{ rows: 4, expandable: true }"></a-typography-paragraph>
                    //             </a-col>
                    //         </a-row>
                    //     </a-typography>
                    <div style={{ maxWidth: 400 }}>
                        {recallItem && <Typography className='chat-citation'>
                            {recallItem.title && <Title className='chat-citation-title' level={5}>
                                {recallItem.title}
                            </Title>}
                            <Row wrap={false} gutter={10}>
                                {recallItem.thumbnailUrl && <Col >
                                    {<img style={{ maxWidth: 80, height: 80 }} src={recallItem.thumbnailUrl} alt="" />}
                                </Col>}
                                {recallItem.content && <Col flex={'auto'}>
                                    <Paragraph className='chat-citation-content' title={recallItem.content} ellipsis={{ rows: 4, expandable: 'collapsible' }}>
                                        {
                                            recallItem.content
                                        }
                                    </Paragraph>
                                </Col>}
                            </Row>
                        </Typography>}
                        {recallItem && recallItem.url && <div className="block-ellipsis chat-citation-link">
                            <a href={recallItem.url} target="_blank" rel="noreferrer" >{recallItem.url}</a>
                        </div>}

                    </div>
                } trigger='click' getPopupContainer={(el) => { return el.parentNode || sourceEl || document.body }}
                    onOpenChange={handlePop}
                >
                    <div style={styleObj}>

                    </div>
                </Popover>

                <Modal title='添加问答对' footer={null} open={qaVisible} onCancel={() => { hideQaModal() }}>
                    <Form form={qaForm} onFinish={saveQaData} >
                        <Form.Item<KbQaPo> name='id' hidden><Input.TextArea /></Form.Item>
                        <Form.Item<KbQaPo> name='kbId' hidden ><Input.TextArea /></Form.Item>

                        <Form.Item<KbQaPo> name='question' required label='问题'><Input.TextArea rows={4} /></Form.Item>
                        <Form.Item<KbQaPo> name='answer' required label='答案'><Input.TextArea rows={6} /></Form.Item>
                        <Flex justify='end' gap={20}>
                            <Button onClick={() => { hideQaModal() }}>取消</Button>
                            <Button type='primary' htmlType='submit'>确定</Button>
                        </Flex>
                    </Form>

                </Modal>
                {/* 🌟 输入框 */}

                {/* <div className='flex-none max-w-[1000px] mx-auto p-2  px-14 relative'>
                    {hasScroll && <Button onClick={() => scrollCat('left')} shape='circle' className='absolute left-0 top-1/2 -mt-4' icon={<LeftOutlined />} />}

                    <div className='overflow-auto flex gap-2 items-center no-scrollbar ' ref={catRef}>
                        {props.categoryList && props.categoryList.map((cat) => {
                            return <ToggleButton key={cat.value} isActive={(currentCategory && cat.value === currentCategory)} onClick={() => {
                                setCurrentCategory(cat.value)
                            }} >{cat.label}</ToggleButton>
                        })}


                    </div>


                    
                    {hasScroll && <Button onClick={() => scrollCat('right')} className='absolute right-0 top-1/2  -mt-4' shape="circle" icon={<RightOutlined />} />}
                </div> */}

                <Sender
                    value={content}
                    ref={senderRef}
                    onSubmit={(value) => {

                        onSubmit(value);

                    }}
                    onChange={setContent}
                    allowSpeech={{
                        // When setting `recording`, the built-in speech recognition feature will be disabled
                        recording: isRecording,
                        onRecordingChange: (nextRecording) => {

                            if (nextRecording) {
                                startRecord(content);
                            }
                            else {
                                stopRecord();
                            }

                        },
                    }}
                    rootClassName=' pb-16 rounded-[20px] max-w-[1000px] mx-auto bg-fill-container '
                    classNames={{
                        actions: ' h-full flex items-start'
                    }}
                    prefix={<PrefixNode className=' absolute   bottom-4 left-4 ' showThink={showThink} showSearch={showSearch} isThink={isThink} isSearch={isSearch} deepSearchType={deepSearchType} onItemClick={onPrefixItemClick} />}
                    className={styles.sender}

                    header={
                        <SenderHeader ref={senderHeaderRef} open={headerOpen} setOpen={setHeaderOpen} uploadConfig={props.uploadConfig} senderRef={senderRef}></SenderHeader>
                    }

                    actions={(_, info) => {
                        const { SendButton, LoadingButton, ClearButton, SpeechButton } = info.components;
                        return (
                            <>
                                <div className='absolute right-4 bottom-4 '>
                                    {isRequesting ? (
                                        <LoadingButton type="default" onClick={controller.current.abort} disabled />
                                    ) : (
                                        <Space size={4}>
                                            {props.uploadConfig && <Button type='text' shape='circle' onClick={() => {
                                                setHeaderOpen(true)
                                            }}>
                                                <LinkOutlined />
                                            </Button>}
                                            {showVoice && <SpeechButton className='text-base' loading={isConnecting} disabled={isConnected} />}
                                            <SendButton variant='solid' color='primary' icon={null}   >
                                                <Icon width='18' height='18' icon='local:icon-send' />
                                            </SendButton></Space>
                                    )}

                                </div>

                            </>
                        );
                    }}
                />
            </div>


        </div>
    )
})

export default Chatboard