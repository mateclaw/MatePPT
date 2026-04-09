import React, { useState, useRef } from 'react';
import { Tabs } from 'antd';
import AssistantChat, { type AssistantChatRef } from './AssistantChat';

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  slideNo: number;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ isOpen, onClose, slideNo }) => {
  const [showHistory, setShowHistory] = useState(false);
  const chatRef = useRef<AssistantChatRef>(null);

  return (
    <div className={`fixed top-0 right-0 bottom-0 w-[380px] tool-panel z-[100] bg-white flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

      {/* 顶部栏 */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-xl font-black italic text-[#6344ff] leading-none tracking-tighter">M</span>
          </div>
          <div className="w-[1px] h-3 bg-gray-100 mx-1"></div>
          <span className="text-xs font-semibold text-gray-800">智能助手</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 text-gray-400 hover:text-[#6344ff] transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className='flex-none px-6'>
        <Tabs defaultActiveKey="1" items={
          [
            {
              label: `第 ${slideNo || 1} 页`,
              key: '1',

            },
          ]
        }>
          {/* <Tabs.TabPane tab={`第 ${slideNo || 1} 页`} key="1">
          </Tabs.TabPane> */}
        </Tabs>

      </div>

      <div className="flex-1 overflow-hidden px-2 pb-2">
        <AssistantChat
          ref={chatRef}
          slideNo={slideNo}
          historyVisible={showHistory}
          onHistoryVisibleChange={setShowHistory}
        />
      </div>
    </div>
  );
};
