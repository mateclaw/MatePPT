// store/eventsStore.js

import { create, StateCreator } from 'zustand';
import { shallow } from 'zustand/shallow';
// 定义所有组件的事件类型及对应参数
export type AppEvents = {
  // 格式: '[组件名]/[事件名]': 参数类型
  'BubbleList/ItemClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any };
  // <已思考>按钮点击事件
  'BubbleList/ThinkButtonClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, hideBlock: boolean };
  // 回答中的引用（灰色的小按钮）
  'BubbleList/SourceClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: any, text: string };
  'BubbleList/RecallClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: any, text: string };
  'BubbleList/RecallList': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: any };
  'BubbleList/ApplyMessage': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: any, isOk: boolean };
  'BubbleList/QaButtonClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: any };
  'Chatboard/onDoc': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/onSaveSql': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/onCopySql': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/onExecSql': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/onSelectChartType': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/onAxisChange': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/onChartReady': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/onChatReport': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any, reportIndex: number },
  'Chatboard/onChatFilesItemClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any, fileUrl: string },
  'Chatboard/onDbProcessTabChange': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/downloadCsv': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  // <已搜索到x条资源>点击事件
  'Chatboard/SourceButtonClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  // <查看进度>点击事件
  'Chatboard/ProcessButtonClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  'Chatboard/onMapRoute': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any, blockId: string },
  'Chatboard/onMapRouteClick': {
    event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: {
      lon: number,
      lat: number,
      name?: string,
      message?: string,
      block?: any
    }
  },
  'Chatboard/onMapPoint': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any, blockId: string },
  'Chatboard/onMapPointClick': {
    event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: {
      lon: number,
      lat: number,
      name: string,
      message?: string,
      extData?: any,
      block?: any
    }
  },
  'Chatboard/onMapQueryObject': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any, blockId: string },
  'Chatboard/onMapBufferObject': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any, blockId: string },

  'Feedback/ButtonClick': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  // 'Chatboard/onExecSql': { event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: any },
  // 'Button/Confirm': { value: string };
  // 'Modal/Close': { reason: 'auto' | 'manual' };
  // 可继续扩展其他组件事件...
};

// 辅助类型
export type EventType = keyof AppEvents;
export type EventPayload<T extends EventType> = AppEvents[T];




export type EventHandler<T extends EventType> = (payload: EventPayload<T>) => void;

export type EventState = {
  // 事件处理器池：{ [事件类型]: Set<回调函数> }
  handlers: Partial<{
    [T in EventType]: Set<EventHandler<T>>;
  }>;
  // 注册事件监听
  on: <T extends EventType>(type: T, handler: EventHandler<T>) => () => void;
  // 注销事件监听
  off: <T extends EventType>(type: T, handler: EventHandler<T>) => void;
  // 触发事件
  emit: <T extends EventType>(type: T, payload: EventPayload<T>) => void;
};

const createEventStore: StateCreator<EventState> = (set, get) => ({
  handlers: {} as EventState['handlers'],
  on: (type, handler) => {
    set((state) => {
      const handlersForType = state.handlers[type] ?? new Set();
      handlersForType.add(handler);
      return { handlers: { ...state.handlers, [type]: handlersForType } };
    });
    // 返回注销函数
    return () => get().off(type, handler);
  },
  off: (type, handler) => {
    set((state) => {
      const handlersForType = state.handlers[type];
      if (handlersForType) {
        handlersForType.delete(handler);
      }
      return { handlers: state.handlers };
    });
  },
  emit: (type, payload) => {
    const handlers = get().handlers[type];
    handlers?.forEach((handler) => handler(payload));
  },
});

export const useEventStore = create<EventState>()(createEventStore);
// 添加导出方法以便于外部使用

// 使用方法：
// const eventStore = useEventStore();
// useEffect(() => {
//     // 注册监听 List/ItemClick 事件
//     const unsubscribe = eventStore.on('BubbleList/SourceClick', ({ event, item, text }) => {

//         // 执行页面逻辑...
//     });

//     // 组件卸载时自动取消监听
//     return unsubscribe;
// }, []);