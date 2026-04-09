import useUserStore from '@/stores/userStore';
import { config } from "@/config";
import { useEffect, useRef, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useMateMessage } from '../components/base/chat/hooks/useMateMessage';
import { useEventStore } from "@/stores/eventStore";
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { AisqlMessage } from '@/types/aisql';
import { useMemoizedFn } from "ahooks";

// AI 响应消息角色类型
export enum ChatMessageRole {
    ERROR = 'error',
    CODE = 'code',
    SEARCH = 'SEARCH',
    FILEURLLIST = 'FILEURLLIST',
    QA = 'QA',
    DOC = 'DOC',
    ROUTE = 'ROUTE',
    POINT = 'POINT',
    QUERY_OBJECT = 'QUERY_OBJECT',
    BUFFER_OBJECT = 'BUFFER_OBJECT',
    SQL = 'sql',
    CHART = 'CHART',
    SQLRESULT = 'sqlResult',
    RESULT = 'RESULT',
    ANSWER = 'ANSWER',
    PROCESS = 'Process',
    SUPPLEMENT = 'SUPPLEMENT',
    SLIDE = 'SLIDE'
}

// 不需要特殊处理的角色
const PASSTHROUGH_ROLES = new Set([
    ChatMessageRole.SQL, ChatMessageRole.CHART, ChatMessageRole.SQLRESULT,
    ChatMessageRole.RESULT, ChatMessageRole.ANSWER, ChatMessageRole.PROCESS,
    ChatMessageRole.SUPPLEMENT,
    ChatMessageRole.SLIDE
]);

export interface ChatOption {
    onMessage?: (message: ChatRes, aiMsg: any) => void;
    onOpen?: (response: any) => void;
    onClose?: (aiMsg: any) => void;
    onError?: (err: any) => void;
    token?: string;
    loadingText?: string;
}

export interface ChatRes {
    content?: string;
    function_call?: string;
    name?: string;
    role?: string;
}


export const useMateChat = (
    apiUrl: string,
    mateChatOptions: ChatOption = {}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userInfo, accessToken } = useUserStore();

    const messageManager = useMateMessage();
    const [isRequesting, setIsRequesting] = useState(false);
    const apiUrlRef = useRef(apiUrl);

    useEffect(() => {
        apiUrlRef.current = apiUrl;
    }, [apiUrl]);


    const controller = useRef<AbortController>(new AbortController());

    const eventStore = useEventStore();
    const retryCount = useRef(0);

    const onMessage = useMemoizedFn((callback: (message: ChatRes, aiMsg: any) => void) => {
        mateChatOptions.onMessage = callback;
        return () => { mateChatOptions.onMessage = undefined; }; // 支持取消注册
    });
    const onClose = useMemoizedFn((callback: (aiMsg: any) => void) => {
        mateChatOptions.onClose = callback;
        return () => { mateChatOptions.onClose = undefined; };
    });

    const onError = useMemoizedFn((callback: (err: any) => void) => {
        mateChatOptions.onError = callback;
        return () => { mateChatOptions.onError = undefined; };
    });

    const cancelRequest = useMemoizedFn(() => {
        setIsRequesting(false);
        if (controller.current) {
            controller.current.abort();
        }
    });
    const setApiUrl = useMemoizedFn((nextUrl: string) => {
        apiUrlRef.current = nextUrl;
    });

    /**
     * 
     * @param chatParams 后台需要的参数
     * @param question 用户输入的问题
     * @returns 
     */
    const sendData = useMemoizedFn((chatParams: Object | FormData, question?: string) => {
        const param = chatParams;
        let fileUrlList = ''

        if (!param) {
            console.log('参数错误,消息不可为空')
            return;
        }

        // let trueParam: BodyInit = JSON.stringify(param);

        let trueParam: BodyInit = JSON.stringify(param);

        const head: Record<string, string> = {
            'User-Token': mateChatOptions.token || accessToken,
            "Content-Type": 'application/json',
            "Connection": "keep-alive"
        };
        
        if (param instanceof FormData) {
            trueParam = param;
            delete head['Content-Type'];
            fileUrlList = (param.get('fileUrlList') as string) || '';
        } else if (typeof param === 'object' && param !== null) {
            fileUrlList = (param as any)['fileUrlList'] || '';
        }

        setIsRequesting(true);
        controller.current = new AbortController();
        const block = messageManager.createBlock();

        messageManager.updateBlock({
            ...block,
            question: question,
            excuteParams: param,
        });

        const userMsg = messageManager.createUserMessage(question, block.blockId);
        retryCount.current = 0;

        if (fileUrlList) {
            messageManager.updateMessage({ ...userMsg, fileUrlList });
        }

        const aiMsg = messageManager.createAiMessage(mateChatOptions.loadingText || '', block.blockId);
        messageManager.updateMessage({ ...aiMsg, isChating: true });

        console.log('sendData', apiUrlRef.current);
        console.log('sendData', trueParam);

        try {

            const requestUrl = apiUrlRef.current;
            fetchEventSource(requestUrl.startsWith('http') ? requestUrl : config.baseUrl + `${requestUrl}`, {
                method: 'POST',
                headers: head,
                body: trueParam,
                signal: controller.current.signal,
                openWhenHidden: true,
                async onopen(response) {
                    if (mateChatOptions.onOpen) {
                        mateChatOptions.onOpen(response);
                    }
                },
                onmessage(res) {
                    try {
                        if(res.data === 'heartbeat'){
                            return ;
                        }
                        const resJson: ChatRes = JSON.parse(res.data);

                        // 处理错误响应
                        if (!resJson) {
                            handleMessageError('noResJson', new Error('noResJson'));
                            return;
                        }
                        if (resJson.role === ChatMessageRole.ERROR) {
                            handleMessageError(resJson.content || '未知错误', new Error(resJson.content));
                            return;
                        }

                        // 处理空响应
                        if (!resJson.role && !resJson.content) {
                            return;
                        }

                        // 处理各种消息类型
                        handleChatMessage(resJson, aiMsg, block);

                        // 触发消息回调
                        if (mateChatOptions.onMessage) {
                            const msg = cloneDeep(messageManager.getMessageById(aiMsg.id));
                            mateChatOptions.onMessage(resJson, msg);
                        }
                    } catch (err) {
                        console.error('处理消息出错:', err);
                    }
                },
                onclose() {
                    setIsRequesting(false);
                    const msg = messageManager.getMessageById(aiMsg.id);
                    const toUpdateMsg = { ...aiMsg, isChating: false } as AisqlMessage
                    if (msg.status == 'loading') {
                        toUpdateMsg.status = 'success';
                        messageManager.updateMessage(toUpdateMsg);
                    }
                    if (mateChatOptions.onClose) {
                        mateChatOptions.onClose(msg);
                    }

                },
                onerror(err) {
                    handleMessageError(err.message, err);
                },
            })

            // chatRequest.create(trueParam, {
            //     onSuccess(chunks) {


            //         // aiMsg.status = 'success';
            //         const msg = messageManager.getMessageById(aiMsg.id);
            //         if (mateChatOptions.onClose) {
            //             mateChatOptions.onClose(msg);
            //         }
            //         if (msg.status == 'loading') {

            //             messageManager.updateMessage({ ...msg, status: 'success' });
            //         }


            //         setIsRequesting(false);
            //         cancelRequest();
            //     },
            //     onError(error) {


            //         if (mateChatOptions.onError) {
            //             mateChatOptions.onError(error);
            //         }
            //         aiMsg.status = 'error';
            //         aiMsg.originMsg = error.message;
            //         messageManager.updateMessage(aiMsg);
            //         cancelRequest();
            //         setIsRequesting(false);
            //     },
            //     onUpdate(chunk) {

            //         if ((chunk as RSResult<any>).code) {
            //             const rs = chunk as RSResult<any>;
            //             aiMsg.status = 'error';
            //             aiMsg.role = 'error';
            //             aiMsg.originMsg = rs.msg || '未知错误';
            //             aiMsg.mdMsg = aiMsg.originMsg;
            //             messageManager.updateMessage(aiMsg);
            //             cancelRequest();
            //             setIsRequesting(false);
            //             return;
            //         }
            //         const resJson: ChatRes = JSON.parse(chunk.data);

            //         if (mateChatOptions.onMessage) {

            //             mateChatOptions.onMessage(resJson, aiMsg);
            //         }



            //         if (resJson.role === 'sql' || resJson.role === 'SQL' || resJson.role === 'CHART' || resJson.role === 'sqlResult' || resJson.role === 'RESULT' || resJson.role === 'ANSWER' || resJson.role === 'Process' || resJson.role === 'SUPPLEMENT') {
            //             // 不做处理，在外面处理
            //         }

            //         // else if () {

            //         //     const sqlResultMsg = messageManager.createAiMessage(resJson.content, block.blockId);
            //         //     sqlResultMsg.status = 'local';
            //         //     sqlResultMsg.role = 'ai';
            //         //     messageManager.updateMessage(sqlResultMsg);
            //         //     return;
            //         // }

            //         else if (resJson.role === 'code') {
            //             const codeMsg = messageManager.createAiMessage(resJson.content, block.blockId);
            //             codeMsg.status = 'local';
            //             codeMsg.role = 'code';
            //             messageManager.updateMessage(codeMsg);
            //             return;
            //         }
            //         else if (resJson.role === "SEARCH") {

            //             aiMsg.searchResult = resJson.content;
            //         }
            //         else if (resJson.role === "QA" || resJson.role === "DOC") {
            //             // console.log('QA', resJson.content)
            //             // mateChatOptions.loadChatDetail && mateChatOptions.loadChatDetail(resJson.content)
            //             eventStore.emit('Chatboard/onDoc', { event: null, data: resJson.content })
            //         }
            //         else if (resJson.role === "ROUTE") {

            //             // const content = JSON.parse(resJson.content);
            //             // aiMsg.mdMsg += `<div class="mate-map-route-button">查看</div>`;

            //             const routeMsg = messageManager.createAiMessage(resJson.content, block.blockId)
            //             routeMsg.status = 'local';
            //             routeMsg.role = 'route'
            //             messageManager.updateMessage(routeMsg)

            //             const newBlock = messageManager.getBlockById(block.blockId);
            //             newBlock.mapRouteObject = resJson.content;
            //             messageManager.updateBlock(newBlock);

            //             eventStore.emit('Chatboard/onMapRoute', { event: null, data: resJson.content, blockId: block.blockId })

            //         }
            //         else if (resJson.role === "POINT") {
            //             const routeMsg = messageManager.createAiMessage(resJson.content, block.blockId)
            //             routeMsg.status = 'local';
            //             routeMsg.role = 'point'
            //             messageManager.updateMessage(routeMsg)

            //             const newBlock = messageManager.getBlockById(block.blockId);
            //             newBlock.mapPointObject = resJson.content;
            //             messageManager.updateBlock(newBlock);
            //             eventStore.emit('Chatboard/onMapPoint', { event: null, data: resJson.content, blockId: block.blockId })
            //         }
            //         else if (resJson.role === "QUERY_OBJECT") {
            //             const newBlock = messageManager.getBlockById(block.blockId);
            //             newBlock.mapQueryObject = resJson.content;
            //             messageManager.updateBlock(newBlock);
            //             eventStore.emit('Chatboard/onMapQueryObject', { event: null, data: resJson.content, blockId: block.blockId })

            //         }
            //         else if (resJson.role === "BUFFER_OBJECT") {
            //             // 画区域
            //             const newBlock = messageManager.getBlockById(block.blockId);
            //             newBlock.mapBufferObject = resJson.content;
            //             messageManager.updateBlock(newBlock);
            //             eventStore.emit('Chatboard/onMapBufferObject', { event: null, data: resJson.content, blockId: block.blockId })
            //         }


            //         else if (resJson.content) {

            //             aiMsg.originMsg += resJson.content;
            //             aiMsg.mdMsg = aiMsg.originMsg;
            //             aiMsg.status = 'success';
            //             messageManager.updateMessage(aiMsg);
            //         }


            //         // onUpdate(chunk)
            //     },


            // });
        }
        catch (err) {
            console.error("发送消息时发生错误", err);
        }

        /**
         * 处理错误消息
         */
        const handleMessageError = (message: string, err: Error) => {
            setIsRequesting(false);
            console.error(message, err);
            
            aiMsg.status = 'error';
            aiMsg.role = ChatMessageRole.ERROR;
            aiMsg.originMsg = message || '未知错误';
            aiMsg.mdMsg = aiMsg.originMsg;
            messageManager.updateMessage(aiMsg);
            
            if (mateChatOptions.onError) {
                mateChatOptions.onError(err);
            }
        };

        /**
         * 处理不同类型的聊天消息
         */
        const handleChatMessage = (resJson: ChatRes, aiMsg: AisqlMessage, block: any) => {
            // 透传类型：不处理，由外部处理
            if (PASSTHROUGH_ROLES.has(resJson.role as any)) {
                return;
            }

            switch (resJson.role) {
                case ChatMessageRole.CODE:
                    const codeMsg = messageManager.createAiMessage(resJson.content, block.blockId);
                    codeMsg.status = 'local';
                    codeMsg.role = 'code';
                    messageManager.updateMessage(codeMsg);
                    break;

                case ChatMessageRole.SEARCH:
                    aiMsg.searchResult = resJson.content;
                    break;

                case ChatMessageRole.FILEURLLIST:
                    aiMsg.fileUrlList = resJson.content;
                    break;

                case ChatMessageRole.QA:
                case ChatMessageRole.DOC:
                    eventStore.emit('Chatboard/onDoc', { event: null, data: resJson.content });
                    break;

                case ChatMessageRole.ROUTE: {
                    const routeMsg = messageManager.createAiMessage(resJson.content, block.blockId);
                    routeMsg.status = 'local';
                    routeMsg.role = 'route';
                    messageManager.updateMessage(routeMsg);

                    const routeBlock = messageManager.getBlockById(block.blockId);
                    routeBlock.mapRouteObject = resJson.content;
                    messageManager.updateBlock(routeBlock);
                    eventStore.emit('Chatboard/onMapRoute', { event: null as any, data: resJson.content, blockId: block.blockId });
                    break;
                }

                case ChatMessageRole.POINT: {
                    const pointMsg = messageManager.createAiMessage(resJson.content, block.blockId);
                    pointMsg.status = 'local';
                    pointMsg.role = 'point';
                    messageManager.updateMessage(pointMsg);

                    const pointBlock = messageManager.getBlockById(block.blockId);
                    pointBlock.mapPointObject = resJson.content;
                    messageManager.updateBlock(pointBlock);
                    eventStore.emit('Chatboard/onMapPoint', { event: null as any, data: resJson.content, blockId: block.blockId });
                    break;
                }

                case ChatMessageRole.QUERY_OBJECT: {
                    const queryBlock = messageManager.getBlockById(block.blockId);
                    queryBlock.mapQueryObject = resJson.content;
                    messageManager.updateBlock(queryBlock);
                    eventStore.emit('Chatboard/onMapQueryObject', { event: null as any, data: resJson.content, blockId: block.blockId });
                    break;
                }

                case ChatMessageRole.BUFFER_OBJECT: {
                    const bufferBlock = messageManager.getBlockById(block.blockId);
                    bufferBlock.mapBufferObject = resJson.content;
                    messageManager.updateBlock(bufferBlock);
                    eventStore.emit('Chatboard/onMapBufferObject', { event: null as any, data: resJson.content, blockId: block.blockId });
                    break;
                }

                default:
                    // 普通内容消息
                    if (resJson.content) {
                        const msg = cloneDeep(messageManager.getMessageById(aiMsg.id));
                        if (mateChatOptions.loadingText && msg.originMsg.includes(mateChatOptions.loadingText)) {
                            msg.originMsg = msg.originMsg.replace(mateChatOptions.loadingText, '');
                        }
                        msg.originMsg += resJson.content;
                        msg.mdMsg = msg.originMsg;
                        msg.status = 'success';
                        messageManager.updateMessage(msg);
                    }
            }
        };

    })

    return {
        onMessage,
        onClose,
        onError,
        sendData,
        isRequesting,
        controller,
        cancelRequest,
        messageManager,
        setIsRequesting,
        setApiUrl,
    };
};
