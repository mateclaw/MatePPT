import React from 'react';
import { Sender } from '@ant-design/x';
import { Space } from 'antd';
import cn from 'classnames';
import { Icon } from 'umi';
import { MetaDataVo } from '@/models/metaDataVo';

interface PptChatSenderProps {
  content: string;
  setContent: (content: string) => void;
  doQuery: (value: string, metaData: MetaDataVo) => void;
  isLoading: boolean;
  variant?: 'default' | 'mateppt';
}

const PptChatSender: React.FC<PptChatSenderProps> = ({
  content,
  setContent,
  doQuery,
  isLoading,
  variant = 'default',
}) => {
  const isMatePpt = variant === 'mateppt';
  const canSubmit = content.trim().length > 0 && !isLoading;

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    doQuery(trimmed, {} as MetaDataVo);
    setContent('');
  };

  if (isMatePpt) {
    return (
      <div className={cn('rounded-[20px] max-w-[1264px] mx-auto bg-fill-container relative', 'ppt-new-sender')}>
        <div className="relative min-h-[300px]">
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(content);
              }
            }}
            disabled={isLoading}
            placeholder="输入主题或需求，例如：生成一份产品发布会 PPT"
            className={cn(
              'mateppt-sender-input w-full min-h-[300px] resize-none border-0 bg-transparent px-6 pb-20 pt-6 text-base leading-[26px] outline-none',
              'placeholder:text-slate-400',
            )}
          />

          <div className="absolute bottom-4 right-4">
            {isLoading ? (
              <button
                type="button"
                disabled
                className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border-none bg-gradient-to-br from-brand-500 to-indigo-500 text-white opacity-50 shadow-lg shadow-brand-500/30"
              >
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => {
                  handleSubmit(content);
                }}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-none text-white shadow-lg shadow-brand-500/30 transition-transform',
                  'bg-gradient-to-br from-brand-500 to-indigo-500',
                  canSubmit ? 'hover:scale-105' : 'cursor-not-allowed opacity-50',
                )}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sender
        value={content}
        onChange={setContent}
        onSubmit={handleSubmit}
        disabled={isLoading}
        placeholder="请输入要生成的 PPT 主题"
        rootClassName="rounded-[20px] max-w-[1264px] mx-auto bg-fill-container"
        styles={{
          input: {
            paddingBottom: '40px',
            lineHeight: '26px',
            height: '300px',
          },
        }}
        classNames={{
          actions: 'h-full flex items-end',
          input: 'pb-9',
        }}
        autoSize={{
          minRows: 4,
          maxRows: 10,
        }}
        className="items-start"
        actions={(_, info) => {
          const { SendButton, LoadingButton } = info.components;

          return (
            <div className="absolute bottom-4 right-4">
              {isLoading ? (
                <LoadingButton type="default" disabled />
              ) : (
                <Space size={4}>
                  <SendButton type="text" icon={null} disabled={!canSubmit}>
                    <Icon width="18" height="18" icon="local:icon-send" />
                  </SendButton>
                </Space>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default PptChatSender;
