import React, { useCallback, useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { App, Button, Dropdown, Spin } from 'antd';
import { nanoid } from 'nanoid';
import MateMarkdown from '@/components/base/mate-markdown';
import { useMateChat } from '@/hooks/useMateChat';
import { SlideChatService } from '@/services/slideChat.service';
import { SlideOptimizeLogService } from '@/services/slideOptimizeLog.service';
import { usePptProjectStore } from '@/stores/pptProjectStore';
import { useShallow } from 'zustand/react/shallow';
import { useSpeech } from '@/hooks/speech-hooks';
import type { AisqlMessage } from '@/types/aisql';
import type { SlidePatchApplyVo } from '@/models/slidePatchApplyVo';
import type { SlideOptimizeLogPo } from '@/models/slideOptimizeLogPo';
import { lastValueFrom } from 'rxjs';
import { ModelType } from './types';
import ScrollToBottomButton from '@/components/base/ScrollToBottomButton';

interface AssistantChatProps {
  slideNo: number;
  historyVisible?: boolean;
  onHistoryVisibleChange?: (next: boolean) => void;
}

export interface AssistantChatRef {
  clearSession: () => void;
  openHistory: () => void;
}

const slideChatStreamUrl = SlideChatService.getInstance().optimizeStream({} as any).getUrl();
const slideChatService = SlideChatService.getInstance();
const slideOptimizeLogService = SlideOptimizeLogService.getInstance();

const parseToolDetail = (raw: string) => {
  const summaryMatch = raw.match(/<summary>([\s\S]*?)<\/summary>/i);
  const paramsMatch = raw.match(/<params>([\s\S]*?)<\/params>/i);
  const returnMatch = raw.match(/<return[^>]*>([\s\S]*?)<\/return>/i);
  const statusMatch = raw.match(/<return[^>]*data-status="([^"]+)"/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : '';
  const paramsRaw = paramsMatch ? paramsMatch[1].trim() : '';
  let params: Record<string, unknown> | undefined;
  if (paramsRaw) {
    try {
      params = JSON.parse(paramsRaw);
    } catch (error) {
      params = undefined;
    }
  }
  const returnText = returnMatch ? returnMatch[1].trim() : '';
  return {
    summary,
    paramsRaw,
    params,
    returnText,
    status: statusMatch ? statusMatch[1] : undefined,
    raw,
  };
};

const decodeHtmlEntities = (input: string) => {
  if (!input) return input;
  let output = input;
  output = output.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isNaN(code) ? _ : String.fromCharCode(code);
  });
  output = output.replace(/&#(\d+);/g, (_, num) => {
    const code = Number.parseInt(num, 10);
    return Number.isNaN(code) ? _ : String.fromCharCode(code);
  });
  output = output.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isNaN(code) ? _ : String.fromCharCode(code);
  });
  output = output.replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return output;
};

const tryExtractPatch = (resJson: any) => {
  if (!resJson) return undefined;
  const role = String(resJson.role || '').toLowerCase();
  if (role === 'patch') return resJson.content;
  const name = String(resJson.name || '').toLowerCase();
  if (name.includes('patch')) return resJson.content;
  if (typeof resJson.function_call === 'string') {
    try {
      const payload = JSON.parse(resJson.function_call);
      if (payload?.name && String(payload.name).toLowerCase().includes('patch')) {
        return payload?.arguments?.patch || payload?.arguments || resJson.content;
      }
    } catch (error) {
      return undefined;
    }
  }
  return undefined;
};

const AssistantChat = forwardRef<AssistantChatRef, AssistantChatProps>(({ slideNo, historyVisible, onHistoryVisibleChange }, ref) => {
  const { message } = App.useApp();
  const [content, setContent] = useState('');
  const [showRefCards, setShowRefCards] = useState(false);
  const [referencedSlides, setReferencedSlides] = useState<number[]>([]);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.DEEPSEEK);
  const [internalHistory, setInternalHistory] = useState(false);
  const showHistory = historyVisible ?? internalHistory;
  const setShowHistory = onHistoryVisibleChange ?? setInternalHistory;

  const { projectId, displayPptData, currentSlideIndex, setDisplayPptData, setPptData } = usePptProjectStore(
    useShallow((state) => ({
      projectId: state.projectId,
      displayPptData: state.displayPptData,
      currentSlideIndex: state.currentSlideIndex,
      setDisplayPptData: state.setDisplayPptData,
      setPptData: state.setPptData,
    })),
  );

  const activeSlideIndex = useMemo(() => {
    if (slideNo && slideNo > 0) return slideNo - 1;
    return currentSlideIndex || 0;
  }, [slideNo, currentSlideIndex]);

  const activeSlide = useMemo(() => {
    return displayPptData?.slides?.[activeSlideIndex];
  }, [displayPptData?.slides, activeSlideIndex]);

  const totalSlides = displayPptData?.slides?.length || 0;

  const [historyList, setHistoryList] = useState<SlideOptimizeLogPo[]>([]);
  const [historyPageNum, setHistoryPageNum] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const modelItems = useMemo(
    () => Object.values(ModelType).map((value) => ({ key: value, label: value })),
    [],
  );
  const [historyInitScroll, setHistoryInitScroll] = useState(false);
  const displayHistory = useMemo(
    () => [...historyList].reverse(),
    [historyList],
  );

  const mateChat = useMateChat(slideChatStreamUrl, {});
  const { messageManager, sendData, onMessage, onClose, onError, isRequesting } = mateChat;

  const scrollRef = useRef<HTMLDivElement>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const [showHistoryToBottom, setShowHistoryToBottom] = useState(false);
  const [showChatToBottom, setShowChatToBottom] = useState(false);

  useEffect(() => {
    setHistoryList([]);
    setHistoryPageNum(1);
    setHistoryTotal(0);
  }, [activeSlide?.slideId, projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messageManager.messages, isRequesting]);

  const clearSession = useCallback(() => {
    messageManager.setMessages([]);
  }, [messageManager]);

  const applySlideHtmlById = useCallback((slideId: string, nextHtml: string) => {
    if (!nextHtml) return;
    const slides = displayPptData?.slides || [];
    let targetIndex = -1;
    if (slideId) {
      targetIndex = slides.findIndex((slide) => slide.slideId === slideId);
    }
    if (targetIndex === -1) {
      targetIndex = activeSlideIndex;
    }
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const nextSlides = slides.map((slide, index) => {
      if (index !== targetIndex) return slide;
      return {
        ...slide,
        slideHtml: nextHtml,
      };
    });
    const nextDisplay = {
      ...(displayPptData || { slides: [] }),
      slides: nextSlides,
    };
    setDisplayPptData(nextDisplay);
    setPptData(nextDisplay);
  }, [activeSlideIndex, displayPptData, setDisplayPptData, setPptData]);

  useImperativeHandle(ref, () => ({
    clearSession,
    openHistory: () => setShowHistory(true),
  }), [clearSession, setShowHistory]);

  const handleSend = useCallback(() => {
    if (!content.trim() && referencedSlides.length === 0) return;
    if (!projectId) {
      message.error('项目信息未加载完成');
      return;
    }
    if (!activeSlide?.slideId) {
      message.error('当前页面未就绪');
      return;
    }

    const prefix = referencedSlides.length > 0 ? `${referencedSlides.map((n) => `@P.${n}`).join(' ')} ` : '';
    const question = `${prefix}${content}`.trim();

    const data: Record<string, any> = {
      projectId,
      slideId: activeSlide.slideId,
      question,
      modelName: selectedModel,
    };
    if (isSearchEnabled) {
      data.search = 1;
    }

    sendData(data, question);
    setContent('');
    setReferencedSlides([]);
    setShowRefCards(false);
  }, [content, referencedSlides, projectId, activeSlide?.slideId, selectedModel, isSearchEnabled, sendData, message]);

  const loadHistory = useCallback(async (pageNum = 1, append = false) => {
    if (!projectId || !activeSlide?.slideId) return;
    setHistoryLoading(true);
    try {
      const res = await lastValueFrom(slideOptimizeLogService.list({
        projectId,
        slideId: activeSlide.slideId,
        pageNum,
        pageSize: 10,
      } as SlideOptimizeLogPo));
      const list = Array.isArray(res?.data) ? (res.data as SlideOptimizeLogPo[]) : [];
      setHistoryTotal(res?.total || 0);
      setHistoryPageNum(pageNum);
      setHistoryList((prev) => (append ? [...prev, ...list] : list));

    } catch (error) {
      console.error('load history failed:', error);
      message.error('加载历史记录失败');
    } finally {
      setHistoryLoading(false);
    }
  }, [projectId, activeSlide?.slideId, message]);

  const onApplyPatch = useCallback(async (patch: string) => {
    if (!patch) return;
    if (!activeSlide?.slideHtml) {
      message.error('当前页面没有可应用的 HTML 内容');
      return;
    }
    try {
      const res = await lastValueFrom(slideChatService.applyPatch({
        html: activeSlide.slideHtml,
        patch,
      } as SlidePatchApplyVo));
      const nextHtml = res?.data;
      if (!nextHtml) {
        message.error('补丁应用失败');
        return;
      }
      applySlideHtmlById(activeSlide?.slideId, nextHtml);
      message.success('已应用到当前页面');
    } catch (error) {
      console.error('applyPatch failed:', error);
      message.error('补丁应用失败');
    }
  }, [activeSlide?.slideHtml, activeSlide?.slideId, applySlideHtmlById, message]);

  const appendToolMessage = useCallback((detail: ReturnType<typeof parseToolDetail>, aiMsg: AisqlMessage) => {
    const id = nanoid();
    messageManager.setMessages((prev) => ([
      ...prev,
      {
        blockId: aiMsg.blockId,
        id,
        role: 'tool',
        mdMsg: detail.summary || '工具调用',
        status: 'local',
        toolDetail: detail,
      } as AisqlMessage,
    ]));
  }, [messageManager]);

  const pendingWriteRef = useRef(new Map<string, string>());

  const addSlideReference = (n: number) => {
    if (!referencedSlides.includes(n)) {
      setReferencedSlides([...referencedSlides, n]);
    }
    if (content.endsWith('@')) {
      setContent(content.slice(0, -1));
    }
    setShowRefCards(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace' && content === '' && referencedSlides.length > 0) {
      e.preventDefault();
      setReferencedSlides(referencedSlides.slice(0, -1));
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const { isRecording, startRecord, stopRecord } = useSpeech({
    url: '',
    onResult: (result) => {
      setContent(result);
    },
  });


  const unsubscribeMessage = onMessage((resJson, aiMsg) => {
    
    if (resJson?.role === 'SLIDE' && typeof resJson.content === 'string') {
      // const detail = parseToolDetail(resJson.content);

      // const summary = detail.summary || '';
      // const params = detail.params as any;
      const decoded = decodeHtmlEntities(String(resJson.content));
      pendingWriteRef.current.set(activeSlide?.slideId, decoded);
      applySlideHtmlById(activeSlide?.slideId, decoded);


      return;
    }
    // const patch = tryExtractPatch(resJson);
    // if (patch) {
    //   messageManager.updateMessage({ ...aiMsg, patch });
    // }
  });


  useEffect(() => {
    if (showHistory) {
      loadHistory(1, false);
      setHistoryInitScroll(true);
    }
  }, [showHistory, loadHistory]);
  // useEffect(() => {
  //   if (!showHistory || !historyInitScroll) return;
  //   if (!historyScrollRef.current) return;
  //   historyScrollRef.current.scrollTo({
  //     top: historyScrollRef.current.scrollHeight,
  //   });
  //   setHistoryInitScroll(false);
  // }, [showHistory, historyInitScroll, displayHistory.length]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* 消息区域 */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-8 space-y-8 no-scrollbar relative"
        ref={scrollRef}
        onScroll={(e) => {
          const target = e.currentTarget;
          const distanceToBottom = target.scrollHeight - (target.scrollTop + target.clientHeight);
          setShowChatToBottom(distanceToBottom > 100);
        }}
      >
        {messageManager.messages.length === 0 && (
          <div className="h-full flex flex-col justify-center items-center text-center animate-enter px-4">
            <div className="w-12 h-12 bg-[#6344ff]/5 rounded-2xl flex items-center justify-center mb-6 border border-[#6344ff]/10">
              <span className="text-2xl font-black italic text-[#6344ff]">M</span>
            </div>
            <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-[#6344ff] mb-2">开始智能设计</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed max-w-[260px]">
              您可以要求我<span className="text-gray-600 font-medium">润色文案</span>、<span className="text-gray-600 font-medium">修改排版</span>或<span className="text-gray-600 font-medium">生成演讲稿</span>。
            </p>

            <div className='flex flex-col items-start  gap-2 mt-4'>

              <Button size="small" className='text-xs' onClick={() => {
                setContent('请帮我重新生成该页的内容');
              }}>
                重新生成该页
              </Button>
              <Button size="small" className='text-xs' onClick={() => {
                setContent('这个页面的内容超出画面了，请帮我处理一下');
              }}>
                内容超出画面了
              </Button>
              <Button size="small" className='text-xs' onClick={() => {
                setContent('请帮我丰富该页的布局内容');
              }}>
                丰富页面布局内容
              </Button>

            </div>
          </div>
        )}

        {messageManager.messages.map((msg) => (
          <div key={msg.id} className="animate-enter">
            <div className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 border ${msg.role === 'user' ? 'bg-[#6344ff] text-white border-[#6344ff]' : 'bg-white text-[#6344ff] border-gray-100 shadow-sm'}`}>
                {msg.role === 'user' ? 'ME' : 'AI'}
              </div>
              <div className={`min-w-0 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className="text-[13px] text-gray-700 leading-relaxed pt-0.5 whitespace-pre-wrap break-words">
                  {msg.role === 'user' ? (
                    msg.mdMsg
                  ) : (
                    <MateMarkdown isChat={true} isPreview={true} value={msg.mdMsg || ''} className="assistant-pro-mate-markdown-chat mate-markdown-chat w-full" />
                  )}
                </div>
                {(msg as any).patch && (
                  <div className={`mt-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <Button size="small" onClick={() => onApplyPatch((msg as any).patch)}>
                      应用更改
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isRequesting && (
          <div className="flex items-center gap-2 pl-11">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-[#6344ff] rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-[#6344ff] rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-[#6344ff] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}

      </div>
      {showChatToBottom && !showHistory && (
        <ScrollToBottomButton
          style={{ bottom: 300 }}
          onClick={() => {
            if (!scrollRef.current) return;
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
          }}
        />
      )}
      {/* 底部输入区 */}
      <div className="px-4 pb-6 pt-4 relative">
        {isRecording && (
          <div className="absolute -top-16 left-4 right-4 bg-[#6344ff] text-white px-5 py-3 rounded-2xl shadow-xl shadow-[#6344ff]/20 animate-enter flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 items-center">
                <div className="w-1 h-4 bg-white/40 rounded-full animate-[pulse_0.8s_infinite]"></div>
                <div className="w-1 h-6 bg-white rounded-full animate-[pulse_0.8s_infinite_0.1s]"></div>
                <div className="w-1 h-3 bg-white/60 rounded-full animate-[pulse_0.8s_infinite_0.2s]"></div>
                <div className="w-1 h-5 bg-white rounded-full animate-[pulse_0.8s_infinite_0.3s]"></div>
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase">正在录音...</span>
            </div>
          </div>
        )}

        <div className="input-card rounded-[24px] bg-white border border-gray-100 transition-all duration-300 focus-within:ring-4 focus-within:ring-[#6344ff]/5 focus-within:border-[#6344ff]/40 overflow-hidden">
          <div className="flex flex-col w-full p-4">
            <div className="flex flex-wrap items-start gap-2 bg-transparent">
              {referencedSlides.map((s) => (
                <div key={s} className="flex items-center gap-1.5 px-2 py-1 bg-[#6344ff]/10 text-[#6344ff] rounded-lg text-[11px] font-bold border border-[#6344ff]/10 animate-enter shrink-0 mt-0.5">
                  <span>@P.{s}</span>
                  <button onClick={() => setReferencedSlides(referencedSlides.filter((id) => id !== s))} className="opacity-40 hover:opacity-100 transition-opacity">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}

              <textarea
                value={content}
                onChange={(e) => {
                  const next = e.target.value;
                  setContent(next);
                  if (next.endsWith('@')) {
                    setShowRefCards(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="继续输入指令..."
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[13px] py-1 resize-none placeholder:text-gray-300 text-gray-700 leading-relaxed thin-scrollbar"
                style={{ minHeight: '68px', maxHeight: '240px', lineHeight: '1.6' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-1.5">
              {/* <button onClick={() => setShowRefCards(!showRefCards)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#6344ff] hover:bg-[#6344ff]/5 rounded-xl transition-all">
                <span className="text-base font-medium leading-none">@</span>
              </button>
              <div className="w-[1px] h-3 bg-gray-100 mx-0.5"></div> */}

              <button
                onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${isSearchEnabled ? 'bg-[#6344ff]/5 text-[#6344ff]' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span className="text-[10px] font-bold uppercase tracking-tight">联网</span>
              </button>

              <Dropdown
                menu={{
                  items: modelItems,
                  onClick: (e) => { setSelectedModel(e.key as ModelType); },
                }}
                trigger={['click']}
              >
                <div className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-gray-50 rounded-xl text-gray-400 cursor-pointer transition-all">
                  <span className="text-[10px] font-bold uppercase tracking-tight">{
                    selectedModel
                  }</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </Dropdown>
            </div>

            <div className="flex items-center gap-2">
              <button
                onMouseDown={() => startRecord(content)}
                onMouseUp={() => stopRecord()}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isRecording ? 'bg-red-50 text-red-500 scale-110 shadow-lg ring-2 ring-red-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
              </button>
              <button
                onClick={handleSend}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${(content.trim() || referencedSlides.length > 0) ? 'bg-[#6344ff] text-white shadow-lg shadow-[#6344ff]/20' : 'bg-gray-50 text-gray-200 pointer-events-none'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        </div>

        {showRefCards && (
          <div className="absolute bottom-[110px] left-4 right-4 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[20px] max-h-48 overflow-y-auto no-scrollbar z-50 animate-enter">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-2 border-b border-gray-50 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">引用页面</span>
              <button onClick={() => setShowRefCards(false)} className="text-[10px] font-bold text-[#6344ff]">取消</button>
            </div>
            <div className="p-2 space-y-1 thin-scrollbar overflow-y-auto">
              {Array.from({ length: Math.max(totalSlides, 1) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => addSlideReference(i + 1)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${referencedSlides.includes(i + 1) ? 'bg-[#6344ff]/5 text-[#6344ff]' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 bg-gray-100 rounded flex items-center justify-center text-[9px] font-bold text-gray-400">P.{i + 1}</div>
                    <span className="text-xs font-medium tracking-tight">Slide {i + 1}</span>
                  </div>
                  {referencedSlides.includes(i + 1) && (
                    <div className="w-4 h-4 rounded-full bg-[#6344ff] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5"></path></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <div className="absolute inset-0 bg-white z-40 flex flex-col animate-enter">
          <div className="h-16 px-6 flex items-center justify-between border-b border-gray-50">
            <span className="text-sm font-bold">对话记录</span>
            <button onClick={() => setShowHistory(false)} className="text-xs font-bold text-[#6344ff] px-3 py-1 bg-[#6344ff]/5 rounded-full">关闭</button>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* <div className="px-6 pt-4 flex items-center justify-between">
              <Button size="small" onClick={() => clearSession()}>清空当前</Button>
              <Button size="small" onClick={() => loadHistory(1, false)}>刷新</Button>
            </div> */}
            <div
              className="flex-1 px-6 py-4 overflow-auto flex flex-col-reverse"
              ref={historyScrollRef}
              onScroll={(e) => {
                const target = e.currentTarget;
                // const distanceToBottom = target.scrollHeight - (target.scrollTop + target.clientHeight);
                const distanceToBottom = target.scrollTop;
                setShowHistoryToBottom(distanceToBottom < -100);


                if (target.scrollHeight + target.scrollTop - target.clientHeight < 120 && !historyLoading && historyList.length < historyTotal) {
                  loadHistory(historyPageNum + 1, true);
                }
              }}
            >
              {historyLoading && (
                <div className="flex items-center justify-center py-4">
                  <Spin size="small" />
                </div>
              )}
              {!historyLoading && historyList.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No History</p>
                </div>
              )}
              {historyList.map((item) => (
                <div key={item.id || nanoid()} className="mb-6">
                  <div className="flex items-start gap-3.5 flex-row-reverse">
                    <div className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 border bg-[#6344ff] text-white border-[#6344ff]">
                      ME
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] text-gray-700 leading-relaxed pt-0.5 whitespace-pre-wrap break-words">
                        {item.question || '无标题'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-3.5">
                    <div className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 border bg-white text-[#6344ff] border-gray-100 shadow-sm">
                      AI
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] text-gray-700 leading-relaxed pt-0.5 whitespace-pre-wrap break-words">
                        <MateMarkdown isChat={true} isPreview={true} value={item.answer || ''} className="mate-markdown-chat assistant-pro-mate-markdown-chat w-full" />
                      </div>
                      <div className="text-[10px] text-gray-300 mt-2">{item.createTime}</div>
                    </div>
                  </div>
                </div>
              ))}

              {showHistoryToBottom && (
                <ScrollToBottomButton
                  // style={{ right: 24, bottom: 24 }}
                  onClick={() => {
                    if (!historyScrollRef.current) return;
                    historyScrollRef.current.scrollTo({ top: historyScrollRef.current.scrollHeight, behavior: 'smooth' });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AssistantChat;
