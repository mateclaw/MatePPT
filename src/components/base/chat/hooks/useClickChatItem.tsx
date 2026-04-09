import useUserStore from '@/stores/userStore';
import { config } from "@/config";
import { useXAgent, useXChat, XRequest } from '@ant-design/x';
import { useCallback, useRef, useState } from 'react';
import { useBoolean, useEventEmitter } from 'ahooks';
import { ChatMessage, BubbleMessage } from "../type";
import { useCopyToClipboard } from "react-use";
import { App } from "antd";
import { flow } from 'lodash';
import { useEventEmitterContextContext } from '@/context/event-emitter';
import { useEventStore } from '@/stores/eventStore';

export interface ChatOption {
    onMessage?: (message: ChatRes) => void;
    onOpen?: (response: any) => void;
    onClose?: () => void;
    onError?: (err: any) => void;
    token?: string;
}



export interface ChatRes {
    content?: string;
    function_call?: string;
    name?: string;
    role?: string;
}

export const useClickChatItem = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { message } = App.useApp();
    const [copyed, copy] = useCopyToClipboard();
    const { eventEmitter } = useEventEmitterContextContext()
    const emit = useEventStore((state) => state.emit);



    const onChatItemClick = useCallback(($event: React.MouseEvent<HTMLDivElement, MouseEvent>, item) => {

        function findPreElement(element) {
            // 找到包含 class "message-code-div" 的祖先元素
            const messageCodeDiv = findAncestorWithClass(element, 'message-code-div');

            // 获取该元素的兄弟元素中含有类名 "pre" 的元素
            return messageCodeDiv ? messageCodeDiv.querySelector('.message-code-header + pre') : null;
        }

        function findAncestorWithClass(element, className) {
            // 在元素的祖先元素中查找含有指定类名的元素
            while (element && !element.classList.contains(className)) {
                element = element.parentElement;
            }
            return element;
        }
        const element = $event.target as HTMLElement;
        const isSource = element.classList.contains('message-source-link') || element.closest('.message-source-link') !== null;
        const isCopy = element.classList.contains('message-code-copy') || element.closest('.message-code-copy') !== null;
        const isThinkButton = element.classList.contains('think-button') || element.closest('.think-button') !== null;
        const isRoute = element.classList.contains('mate-map-route-button') || element.closest('.mate-map-route-button') !== null;
        const isPoint = element.classList.contains('mate-map-point-button') || element.closest('.mate-map-point-button') !== null;

        const isChatReport = element.classList.contains('chat-report-container') || element.closest('.chat-report-container') !== null;
        const isChatFilesItem = element.classList.contains('chat-files-item') || element.closest('.chat-files-item') !== null;

        $event.stopPropagation();


        emit('BubbleList/ItemClick', {
            event: $event,
            data: item
        })
        if (isCopy) {
            const preElement = findPreElement(element);

            const text = preElement.innerText || '';

            copy(text);
            if (copyed) {
                message.success('复制成功');
            }
        }

        if (isThinkButton) {
            const trueElement = element.classList.contains('think-button') ? element : findAncestorWithClass(element, 'think-button');
            let hideBlock = true;
            if (trueElement.classList.contains('down')) {
                trueElement.classList.remove('down');
                trueElement.classList.add('up');
                trueElement.parentNode.classList.remove("hide-block");
                hideBlock = false;
            }
            else {
                trueElement.classList.remove('up');
                trueElement.classList.add('down');
                trueElement.parentNode.classList.add("hide-block")
                hideBlock = true;
            }

            emit('BubbleList/ThinkButtonClick', { event: $event as any, hideBlock });
        }
        if (isSource) {

            const text = element.innerText || '';
            emit('BubbleList/SourceClick', {
                event: $event,
                item,
                text
            })
            // loadRecallList($event, item, text);
            // eventEmitter.emit({ type: 'loadRecallList', payload: [$event, item, text] } as any);
            // emit('BubbleList/ItemClick',{
            //     event:$event,
            //     item,
            //     text
            // })
        }

        if (isRoute) {
            emit('Chatboard/onMapRoute', {
                event: $event,
                data: item,
                blockId: item['data-msg'].blockId

            });
        }

        if (isPoint) {
            emit('Chatboard/onMapPoint', {
                event: $event,
                data: item,
                blockId: item['data-msg'].blockId
            });

        }

        if (isChatReport) {
            const fileEl = element.closest('.chat-report-container');
            const reportIndex = parseInt(fileEl.getAttribute('data-report-index'));

            emit('Chatboard/onChatReport', {
                event: $event,
                data: item,
                reportIndex

            });
        }

        if (isChatFilesItem) {

            const fileEl = element.closest('.chat-files-item');
            const fileUrl = fileEl.getAttribute('data-file-url');
            emit('Chatboard/onChatFilesItemClick', {
                event: $event,
                data: item,
                fileUrl: fileUrl

            });
        }


    }, [])



    return {
        onChatItemClick
    };
};