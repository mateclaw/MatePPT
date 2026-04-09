// src/utils/message.ts
import { message as antdMessage } from 'antd';

let globalMessage: typeof antdMessage;

export const initGlobalMessage = (msg: any) => {
    globalMessage = msg;
};

export const getGlobalMessage = () => {
    if (!globalMessage) {
        throw new Error('Global message not initialized!');
    }
    return globalMessage;
};

export const notify = ({ type, message, msg, duration }: { type: 'success' | 'error' | 'warning' | 'info', message?: string, msg?: string, duration?: number }) => {
    getGlobalMessage()[type](msg || message, duration);
};

// export const message = getGlobalMessage();