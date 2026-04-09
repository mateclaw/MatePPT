import useUserStore from '@/stores/userStore';
import { config } from "@/config";
import { useRef, useState } from 'react';
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ChatRes } from "../type";

export interface ChatOption {
    onMessage?: (message: ChatRes) => void;
    onOpen?: (response: any) => void;
    onClose?: () => void;
    onError?: (err: any) => void;
    token?: string;
    loadingText?: string;
}

export interface ChatMessage {
    question?: string;
    q?: string;
    sessionId?: string;
    kbId?: number;
    modelName?: string;
}

export const useMateChat = (
    apiUrl: string,
    mateChatOptions: ChatOption = {}
) => {
    const { accessToken } = useUserStore();
    const [isRequesting, setIsRequesting] = useState(false);
    const [sendBtnEnable, setSendBtnEnable] = useState(true);
    const retryCount = useRef(3);
    
    const controller = useRef<AbortController>(new AbortController());

    const onMessage = (callback: (message: ChatRes) => void) => {
        mateChatOptions.onMessage = callback;
    };

    const onClose = (callback: () => void) => {
        mateChatOptions.onClose = callback;
    };

    const onError = (callback: (err: any) => void) => {
        mateChatOptions.onError = callback;
    };

    const onOpen = (callback: (response: any) => void) => {
        mateChatOptions.onOpen = callback;
    };

    const cancelRequest = () => {
        setIsRequesting(false);
        setSendBtnEnable(true);
        if (controller.current) {
            controller.current.abort();
        }
    };

    const sendData = async (chatParams: Object | FormData, question?: string) => {
        const param = chatParams;

        if (!param) {
            console.log('参数错误,消息不可为空');
            return;
        }

        setSendBtnEnable(false);
        setIsRequesting(true);
        retryCount.current = 3;

        let trueParam: BodyInit = JSON.stringify(param);
        const head = {
            'User-Token': mateChatOptions.token || accessToken,
            "Content-Type": 'application/json',
        };

        if (param instanceof FormData) {
            trueParam = param;
            delete (head as any)['Content-Type'];
        }

        // 创建新的控制器
        controller.current = new AbortController();

        try {
            await fetchEventSource(apiUrl.startsWith('http') ? apiUrl : config.baseUrl + `${apiUrl}`, {
                method: 'POST',
                signal: controller.current.signal,
                headers: head,
                body: trueParam,
                async onopen(response) {
                    if (mateChatOptions.onOpen) {
                        mateChatOptions.onOpen(response);
                    }
                },
                onmessage: (res) => {
                    const resJson: ChatRes = JSON.parse(res.data);

                    if (!resJson) {
                        setIsRequesting(false);
                        setSendBtnEnable(true);
                        console.error('noResJson');
                        return;
                    } else if (resJson.role === 'error') {
                        setIsRequesting(false);
                        setSendBtnEnable(true);
                        console.error(resJson.content);
                        
                        if (mateChatOptions.onError) {
                            mateChatOptions.onError(new Error(resJson.content));
                        }
                        return;
                    }

                    if (!resJson.role && !resJson.content) {
                        setSendBtnEnable(true);
                        console.log('noContent');
                    }

                    if (mateChatOptions.onMessage) {
                        mateChatOptions.onMessage(resJson);
                    }
                },
                onclose() {
                    setIsRequesting(false);
                    setSendBtnEnable(true);

                    if (mateChatOptions.onClose) {
                        mateChatOptions.onClose();
                    }
                },
                onerror(err) {
                    setIsRequesting(false);
                    setSendBtnEnable(true);
                    retryCount.current--;

                    if (mateChatOptions.onError) {
                        mateChatOptions.onError(err);
                    }

                    if (retryCount.current <= 0) {
                        controller.current.abort(err);
                        throw err;
                    }
                }
            });
        } catch (err) {
            console.error("发送消息时发生错误", err);
            setIsRequesting(false);
            setSendBtnEnable(true);
            
            if (mateChatOptions.onError) {
                mateChatOptions.onError(err);
            }
        }
    };

    const sendMessage = async (chatParams: ChatMessage) => {
        const param = chatParams;
        
        setSendBtnEnable(false);
        setIsRequesting(true);
        retryCount.current = 3;

        if (!param || (!param.question && !param.q)) {
            console.log('参数错误,消息不可为空');
            return;
        }

        // 创建新的控制器
        controller.current = new AbortController();

        try {
            await fetchEventSource(apiUrl.startsWith('http') ? apiUrl : config.baseUrl + `${apiUrl}`, {
                method: 'POST',
                signal: controller.current.signal,
                headers: {
                    'User-Token': mateChatOptions.token || accessToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(param),
                async onopen(response) {
                    if (mateChatOptions.onOpen) {
                        mateChatOptions.onOpen(response);
                    }
                },
                onmessage: (res) => {
                    const resJson: ChatRes = JSON.parse(res.data);

                    if (!resJson) {
                        setIsRequesting(false);
                        setSendBtnEnable(true);
                        console.error('noResJson');
                        return;
                    } else if (resJson.role === 'error') {
                        setIsRequesting(false);
                        setSendBtnEnable(true);
                        console.error(resJson.content);
                        
                        if (mateChatOptions.onError) {
                            mateChatOptions.onError(new Error(resJson.content));
                        }
                        return;
                    }

                    if (!resJson.role && !resJson.content) {
                        setSendBtnEnable(true);
                        console.log('noContent');
                    }

                    if (mateChatOptions.onMessage) {
                        mateChatOptions.onMessage(resJson);
                    }
                },
                onclose() {
                    setIsRequesting(false);
                    setSendBtnEnable(true);

                    if (mateChatOptions.onClose) {
                        mateChatOptions.onClose();
                    }
                },
                onerror(err) {
                    setIsRequesting(false);
                    setSendBtnEnable(true);
                    retryCount.current--;

                    if (mateChatOptions.onError) {
                        mateChatOptions.onError(err);
                    }

                    if (retryCount.current <= 0) {
                        controller.current.abort(err);
                        throw err;
                    }
                }
            });
        } catch (err) {
            console.error("发送消息时发生错误", err);
            setIsRequesting(false);
            setSendBtnEnable(true);
            
            if (mateChatOptions.onError) {
                mateChatOptions.onError(err);
            }
        }
    };

    return {
        onMessage,
        onClose,
        onError,
        onOpen,
        sendData,
        sendMessage,
        isRequesting,
        sendBtnEnable,
        cancelRequest,
        controller,
        setIsRequesting,
        setSendBtnEnable
    };
};