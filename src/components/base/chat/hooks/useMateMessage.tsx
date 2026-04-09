import type { AisqlMessage, AisqlBlock, AisqlAxis } from "@/types/aisql.d";
import { useSafeState } from "ahooks";
import { nanoid } from "nanoid";
import { useSyncState } from "../hooks/useSyncState";
import { useCallback } from "react";
export const useMateMessage = () => {
    const [messages, setMessages, getMessages] = useSyncState<AisqlMessage[]>([]);
    const [blocks, setBlocks, getBlocks] = useSyncState<AisqlBlock[]>([]);

    const [currentBlock, setCurrentBlock, getCurrentBlock] = useSyncState<AisqlBlock>({
        blockId: nanoid(),
    });

    const createUserMessage = useCallback((message: string, blockId?: string) => {
        const data = {
            id: nanoid(),
            role: 'user',
            mdMsg: message,
            blockId: blockId ? blockId : getCurrentBlock().blockId,
            status: 'local'
        } as AisqlMessage;
        setMessages([...getMessages(), data]);
        return data;
    }, [])

    const createAiMessage = useCallback((message: string, blockId?: string) => {
        const data = {
            id: nanoid(),
            role: 'ai',
            mdMsg: message,
            originMsg: message,
            blockId: blockId ? blockId : getCurrentBlock().blockId,
            status: 'loading'
        } as AisqlMessage;
        setMessages([...getMessages(), data]);
        return data;
    }, [])

    const createAiMessaggeByIndex = useCallback((index: number, message: string, blockId?: string) => {
        const data = {
            id: nanoid(),
            role: 'ai',
            mdMsg: message,
            originMsg: message,
            blockId: blockId ? blockId : getCurrentBlock().blockId,
            status: 'loading'
        } as AisqlMessage;

        setMessages((prev) => {
            const safeIndex = Math.max(0, Math.min(index, prev.length));
            return [...prev.slice(0, safeIndex),  // 插入位置前的元素
                data,                  // 新插入的元素
            ...prev.slice(safeIndex)]
        });
        return data;
    }, [])

    const createBlock = useCallback(() => {
        const data = {
            blockId: nanoid(),
        } as AisqlBlock;
        setBlocks([...getBlocks(), data]);
        setCurrentBlock(data);
        return data;
    }, [])

    const getBlockById = useCallback((blockId: string) => {
        return getBlocks().find(item => item.blockId === blockId);
    }, [])
    const getMessageById = useCallback((id: string) => {
        return getMessages().find(item => item.id === id);
    }, [])

    const updateBlock = useCallback((record: AisqlBlock) => {
        const index = getBlocks().findIndex(item => item.blockId === record.blockId);

        if (index !== -1) {
            const newBlocks = [...getBlocks()];
            newBlocks[index] = record;
            setBlocks(newBlocks);
            if (getCurrentBlock().blockId === record.blockId) {
                setCurrentBlock(record);
            }
        }
    }, [])

    const clearBlockErrorMessage = useCallback((blockId: string) => {
        setMessages(prev => prev.filter(item => !(item.blockId === blockId && item.role === 'error')));
    }, [])

    const updateMessage = useCallback((record: AisqlMessage) => {
        const index = getMessages().findIndex(item => item.id === record.id);
        if (index !== -1) {
            const newMessages = [...getMessages()];
            newMessages[index] = record;
            setMessages(newMessages);
            return newMessages[index];
        }
    }, [])

    return {
        messages,
        createUserMessage,
        getMessages,
        createAiMessage,
        updateMessage,
        setMessages,
        getBlocks,
        setBlocks,
        blocks,
        createBlock,
        updateBlock,
        currentBlock,
        setCurrentBlock,
        getCurrentBlock,
        getBlockById,
        createAiMessaggeByIndex,
        clearBlockErrorMessage,
        getMessageById

    } 
}