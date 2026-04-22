import React, { useCallback, useEffect, useRef, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'umi';
import MateMarkdown from '@/components/base/mate-markdown';
import { useIsDarkTheme } from '@/components/base/theme-provider';
import HeroSection from '@/components/ppt-new/HeroSection';
import { useMateChat } from '@/hooks/useMateChat';
import { MetaDataVo } from '@/models/metaDataVo';
import { PptProjectPo } from '@/models/pptProjectPo';
import { OutlineService } from '@/services/outline.service';
import { PptProjectService } from '@/services/pptProject.service';
import { usePptProjectStore } from '@/stores/pptProjectStore';
import './ppt-new.css';

const pptProjectService = PptProjectService.getInstance();
const outlineService = OutlineService.getInstance();
const outlineDefaultUrl = outlineService.generateUserInput({} as PptProjectPo).getUrl();

const PptNewPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useIsDarkTheme();

  const [isLoading, setIsLoading] = useState(false);
  const mdContainerRef = useRef<HTMLDivElement>(null);
  const outlineDataRef = useRef<any>(null);
  const thinkDataRef = useRef('');
  const { loadProjectDetail, resetProject, setProjectId } = usePptProjectStore();

  const outlineMateChat = useMateChat(outlineDefaultUrl, {
    onMessage: (chatMessage) => {
      if (chatMessage.role === 'OUTLINE') {
        try {
          outlineDataRef.current =
            typeof chatMessage.content === 'string'
              ? JSON.parse(chatMessage.content)
              : chatMessage.content;
        } catch (error) {
          console.error('parse outline failed', error);
        }
        return;
      }

      thinkDataRef.current += chatMessage.content;
      mdContainerRef.current?.scrollTo({
        behavior: 'smooth',
        top: mdContainerRef.current.scrollHeight,
      });
    },
    onClose: () => {
      setIsLoading(false);

      if (!outlineDataRef.current) {
        message.warning('未收到大纲数据');
        return;
      }

      const { projectId: storeProjectId, setOutlineData } = usePptProjectStore.getState();
      setOutlineData(outlineDataRef.current);

      window.history.replaceState(null, '', `/ppt/detail/${storeProjectId}/outline`);
      navigate(`/ppt/detail/${storeProjectId}/outline`, {
        state: { from: 'new', outlineData: outlineDataRef.current },
      });
    },
    onError: (error: any) => {
      message.error(error?.message || error?.msg || '生成大纲失败');
      setIsLoading(false);
    },
  });

  const generateOutline = useCallback(
    async (userInput: string, metaData: MetaDataVo) => {
      try {
        const stateParams = location.state as any;
        setIsLoading(true);
        resetProject();
        outlineDataRef.current = null;
        thinkDataRef.current = '';

        const createParam: PptProjectPo = {
          userInput,
          metaData,
          createMode: 'classic',
          sourceType: 'user_input',
          templateId: stateParams?.templateId,
        } as PptProjectPo;

        const createRes = await new Promise<any>((resolve, reject) => {
          pptProjectService.add(createParam).subscribe({
            next: (res) => resolve(res),
            error: (err) => reject(err),
          });
        });

        const nextProjectId = createRes?.data?.projectId;
        setProjectId(nextProjectId);
        await loadProjectDetail(nextProjectId);

        outlineMateChat.setApiUrl(outlineDefaultUrl);
        outlineMateChat.sendData({ projectId: nextProjectId } as PptProjectPo);
      } catch (error: any) {
        message.error(error?.message || error?.msg || '创建项目失败');
        setIsLoading(false);
      }
    },
    [loadProjectDetail, location.state, message, outlineMateChat, resetProject, setProjectId],
  );

  useEffect(() => {
    const stateParams = location.state as any;
    if (stateParams?.userInput) {
      generateOutline(stateParams.userInput, (stateParams.metaData || {}) as MetaDataVo);
    }
  }, [generateOutline, location.state]);

  return (
    <div className="mateppt-root h-full">
      {isLoading ? (
        <div ref={mdContainerRef} className="h-full overflow-auto p-10">
          <MateMarkdown
            className="mate-markdown-chat"
            value={thinkDataRef.current}
            height="auto"
            isPreview={true}
            isChat
            options={{
              themeSettings: {
                toolbarTheme: isDark ? 'dark' : 'light',
                codeBlockTheme: isDark ? 'vs-dark' : 'one-light',
              } as any,
            }}
          />
        </div>
      ) : (
        <HeroSection isLoading={isLoading} onQuery={generateOutline} />
      )}
    </div>
  );
};

export default PptNewPage;
