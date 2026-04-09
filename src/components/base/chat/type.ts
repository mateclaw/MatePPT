
import { GptChatRecordPo } from '@/models/gptChatRecordPo';
import { KbChatRecordPo } from "@/models/kbChatRecordPo";

export interface ChatRes  {
    content?: string;
    function_call?: string;
    name?: string;
    role?: string;
}
export enum ChatMessageType{
    GPT = 'GPT',
    KB = 'KB'
}



export type ChatMessage = GptChatRecordPo & KbChatRecordPo &  {
    question?: string;
    q?: string;
    sessionId?: string;
    kbId?: number;
    modelName?: string;
    type?: ChatMessageType;
    role?: string;
    content?: string;
    // [key:string]:any;
}

export type BubbleMessage = {
    role: string;
    content: string;
};