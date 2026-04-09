import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'umi';
import { App, Input, Modal, Spin } from 'antd';
import LoadingComponent from '@/components/base/loading';
import { ClassicService } from '@/services/classic.service';
import { PptProjectPo } from '@/models/pptProjectPo';
import { useMateChat } from '@/hooks/useMateChat';
import { CreateMode, usePptProjectStore } from '@/stores/pptProjectStore';
import type { PptDocumentData } from '@/stores/pptProjectStore';
import type { FilterCriteria } from '@/ppt/classic/components/PptTemplateSelector';
import { cloneDeep } from 'lodash';
import { PptProjectStatus } from '@/ppt/types/AIPPT';
import { useSetModalState } from '@/hooks/common-hooks';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useMemoizedFn } from 'ahooks';
import PptTemplateLayoutModal from '@/ppt/classic/components/PptLayoutSelectorModal';
import { nanoid } from 'nanoid';
import ClassicPptEditor from '@/ppt/classic/ClassicPptEditor';
import { useSlidesStore } from '@/ppt/store/useSlidesStore';
import { usePptEditorProject } from '@/hooks/ppt/usePptEditorProject';
import { PptProjectSlidePo } from '@/models/pptProjectSlidePo';
import { EditorMode, type PPTElement, type PPTSlide } from '@/ppt/core';
import { SlideParser } from '@/ppt/classic/parser/SlideParser';
import { useShallow } from 'zustand/react/shallow';
import { useMainStore } from '@/ppt/store';
import AssistantPro from '@/components/base/AssistantPro';
import { ThemeChanger } from '@/ppt/core/color/ThemeChanger';
import { type ThemeColors, THEME_COLOR_KEYS } from '@/ppt/core/entity/presentation/ThemeColors';

const classicService = ClassicService.getInstance();
const classicStreamUrl = ClassicService.getInstance().generateStream({} as any).getUrl();

const tip = `系统可能不会保存您所做的更改。`;

const PptClassicEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    projectId,
    projectDetail,
    displayPptData,
    outlineData,
    setDisplayPptData,
    receivedSlides,
    setReceivedSlides,
    totalPages,
    setTotalPages,
    generatingPpt,
    setGeneratingPpt,
    classicSlidesAllLoaded,
    loadingClassicSlides,
    selectedTemplateId,
    selectedTemplateFilter,
    createMode,
    setProjectDetail,
    loadClassicSlides,
  } = usePptProjectStore();

  const { currentSlideNo, themeColors, setTheme } = useSlidesStore(useShallow((state) => ({
    currentSlideNo: state.slideIndex + 1,
    themeColors: state.theme?.themeColors,
    setTheme: state.setTheme,
  })));

  const { setMode } = useMainStore(
    useShallow((state) => ({

      setMode: state.setMode,

    })),
  )

  useEffect(() => {
    setMode(EditorMode.EDIT);
    setDisplayPptData({ slides: [], totalPages: 0 });
    setTotalPages(0);
    setReceivedSlides([]);
    setGeneratingPpt(false);
    const slidesStore = useSlidesStore.getState();
    slidesStore.setSlides([]);
    slidesStore.updateSlideIndex(0);

  }, [id, setDisplayPptData, setGeneratingPpt, setMode, setReceivedSlides, setTotalPages]);


  const [isGeneratingSinglePage, setIsGeneratingSinglePage] = useState(false);
  const allowStatusCheckRef = useRef(true);
  const slideDataRef = useRef<PptDocumentData | null>(null);
  const hasUnsavedChanges = useRef(false);
  const classicMateChat = useMateChat(classicStreamUrl, {});
  const { message } = App.useApp();
  const initialClassicLoadRef = useRef<{ projectId?: string; loaded: boolean }>({ loaded: false });

  useEffect(() => {
    initialClassicLoadRef.current = { projectId: id, loaded: false };
  }, [id]);

  const resolveThemeMap = useMemoizedFn((raw: unknown): Record<string, string> | null => {
    if (!raw) return null;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as Record<string, string>;
      } catch (error) {
        console.warn('[classic] 解析主题色失败:', error);
        return null;
      }
    }
    if (Array.isArray(raw)) {
      const next: Record<string, string> = {};
      THEME_COLOR_KEYS.forEach((key, index) => {
        const value = raw[index];
        if (typeof value === 'string') next[key] = value;
      });
      return Object.keys(next).length ? next : null;
    }
    if (typeof raw === 'object') {
      return raw as Record<string, string>;
    }
    return null;
  });

  const parseSlideJson = useMemoizedFn((raw: unknown): PPTSlide | null => {
    if (!raw) return null;
    const parsed = (() => {
      if (typeof raw !== 'string') return raw;
      try {
        return JSON.parse(raw);
      } catch (error) {
        console.warn('[classic] 解析 slideJson 失败:', error);
        return null;
      }
    })();
    if (!parsed) return null;
    return SlideParser.parse(parsed) || (parsed as PPTSlide);
  });

  const applyThemeToSlide = useMemoizedFn((raw: unknown): PPTSlide | null => {
    const slide = parseSlideJson(raw);
    if (!slide) return null;
    const themeMap = resolveThemeMap(themeColors);
    if (!themeMap) return slide;
    return ThemeChanger.changeTheme(slide, themeMap) as PPTSlide;
  });



  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        event.preventDefault();
        event.returnValue = tip;
        return tip;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const loadClassicSlidesFirstPage = useMemoizedFn((detail: PptProjectPo) => {
    if (!detail || detail.createMode !== 'classic') return;
    const currentProjectId = detail.projectId;
    const alreadyLoadedForProject =
      initialClassicLoadRef.current.loaded && initialClassicLoadRef.current.projectId === currentProjectId;
    const hasSlides = (displayPptData?.slides?.length || 0) > 0;
    if (alreadyLoadedForProject || hasSlides || loadingClassicSlides) return;

    initialClassicLoadRef.current = { projectId: currentProjectId, loaded: true };
    loadClassicSlides(currentProjectId, detail, 1, 10).catch((error) => {
      console.error('[classic] 加载幻灯片失败:', error);
      initialClassicLoadRef.current = { projectId: currentProjectId, loaded: false };
    });
  });

  const { loadingDetail, startStatusCheck, stopStatusCheck } = usePptEditorProject({
    projectId: id,
    allowStatusCheckRef,
    onReset: () => {
      setDisplayPptData({ slides: [], totalPages: 0 });
      setTotalPages(0);
      setReceivedSlides([]);
    },
    onProjectLoaded: (currentDetail) => {
      const stateParams = location.state as any;
      const detail = cloneDeep(currentDetail);
      if (stateParams?.createMode) {
        detail.createMode = stateParams.createMode;
      }
      setProjectDetail(detail);
      handleProjectStatus(detail);
    },
    onProjectMissing: () => {
      navigate('/ppt/new');
    },
    onStatusUpdate: (updatedProject) => {
      setProjectDetail(updatedProject);
      if (updatedProject.status === PptProjectStatus.Completed || updatedProject.status === PptProjectStatus.Failed) {
        stopStatusCheck();
        handleProjectStatus(updatedProject);
      } else if (updatedProject.status === PptProjectStatus.Processing) {
        if (updatedProject.createMode === 'classic') {
          loadClassicSlidesFirstPage(updatedProject);
        }
      }
    },
  });



  const handleProjectStatus = (detail: PptProjectPo) => {
    const status = detail.status as PptProjectStatus | 'error';
    if (status === 'error') {
      setGeneratingPpt(false);
      return;
    }
    switch (status) {
      case PptProjectStatus.Pending:
        setGeneratingPpt(true);
        startGenerateFlow(detail);
        break;
      case PptProjectStatus.Processing:
        setGeneratingPpt(true);
        if (detail.createMode === 'classic') {
          loadClassicSlidesFirstPage(detail);
        }
        startStatusCheck(detail.projectId);
        break;
      case PptProjectStatus.Completed:
        setGeneratingPpt(false);
        loadFinishedSlides(detail);
        break;
      case PptProjectStatus.Failed:
        setGeneratingPpt(false);
        break;
      default:
        loadFinishedSlides(detail);
        break;
    }
  };

  const handleClassicMessage = useMemoizedFn((message: any) => {
    if (message.role === 'SLIDE') {
      try {
        const slideData: PptProjectSlidePo = typeof message.content === 'string'
          ? JSON.parse(message.content)
          : message.content;
        const payload = slideData;
        const totalPage = payload?.totalPage ? payload?.totalPage : outlineData?.length;
        const slideNo = payload?.slideNo ?? slideData?.slideNo;
        const slideJson = payload?.slideJson ?? slideData?.slideJson;
        const slideId = payload?.slideId ?? slideData?.slideId;
        const projectId = payload?.projectId ?? slideData?.projectId;
        const slideType = payload?.slideType ?? slideData?.slideType;

        if (totalPage && totalPage > 0) {
          if (totalPages !== totalPage) {
            setTotalPages(totalPage);
          }
        }

        if (slideJson) {
          const parsedSlideRaw = (() => {
            if (typeof slideJson !== 'string') return slideJson;
            try {
              return JSON.parse(slideJson);
            } catch (error) {
              console.warn('[classic] 解析 slideJson 失败:', error);
              return slideJson;
            }
          })();
          const parsedSlide = SlideParser.parse(parsedSlideRaw) || (parsedSlideRaw as PPTSlide);
          pendingSlidesRef.current.push({
            slideData,
            parsedSlide,
            slideNo: slideNo || slideData.slideNo,
            slideType,
            totalPage,
          });
          if (activeQueueSlideIndexRef.current === null) {
            processNextPendingSlide();
          }
        }
        //  else if (slideJson) {
        //   const typedSlide = slideJson as PPTSlide & { slideType?: string };
        //   const normalizedSlide = new PptProjectSlidePo();
        //   if (slideId !== undefined) normalizedSlide.slideId = slideId;
        //   if (projectId) normalizedSlide.projectId = projectId;
        //   normalizedSlide.slideNo = slideNo || (slideDataRef.current?.slides?.length || 0) + 1;
        //   normalizedSlide.slideType = slideType || typedSlide.type || typedSlide.slideType || 'content';
        //   normalizedSlide.slideJson = slideJson;

        //   const previousDoc = slideDataRef.current;
        //   const nextSlides = previousDoc?.slides?.length
        //     ? [...previousDoc.slides, normalizedSlide]
        //     : [normalizedSlide];
        //   const nextDocument: PptDocumentData = {
        //     ...(previousDoc || {}),
        //     slides: nextSlides,
        //     totalPages: totalPage || nextSlides.length,
        //   };
        //   slideDataRef.current = nextDocument;
        //   setDisplayPptData({ ...nextDocument, slides: [...nextSlides] });
        //   setReceivedSlides([...nextSlides]);
        // }

        finalizeGenerationIfReady(totalPage);
      } catch (error) {
        console.error('解析幻灯片数据失败:', error);
        message.error('幻灯片数据解析失败');
        setGeneratingPpt(false);
      }
    }
    else if (message.role === 'PROJECT') {
      console.log('[classic] 接收到项目消息', message);
      const projectData: PptProjectPo = typeof message.content === 'string'
        ? JSON.parse(message.content)
        : message.content;

      if (projectData.theme) {
        setProjectDetail({ ...projectDetail, theme: projectData.theme });
        if (projectData.theme) {
          const rawColors = projectData.theme.themeColors;
          if (typeof rawColors === 'string') {
            try {
              const parsed = JSON.parse(rawColors);
              setTheme({ ...projectData.theme, themeColors: parsed });
            } catch (error) {
              console.warn('[classic] 解析主题色失败:', error);
              setTheme({ ...projectData.theme });
            }
          } else {
            setTheme({ ...projectData.theme });
          }
        }
      }
    }
  });

  const generatePpt = useMemoizedFn((templateId: string, filter: FilterCriteria) => {
    if (!projectDetail || !outlineData) {
      console.warn('项目详情未加载完成，请稍候');
      return;
    }

    if (projectDetail.status === PptProjectStatus.Processing) {
      message.warning('项目正在生成中，请稍候');
      return;
    }

    allowStatusCheckRef.current = false;
    stopStatusCheck();

    setGeneratingPpt(true);
    slideDataRef.current = null;
    setReceivedSlides([]);
    setDisplayPptData({ slides: [], totalPages: 0 });
    elementQueueRef.current.clear();
    pendingSlidesRef.current = [];
    activeQueueSlideIndexRef.current = null;

    const questParam = {
      projectId: id,
      templateId: templateId,
      createMode: createMode,
    };

    classicMateChat.onMessage(handleClassicMessage);
    classicMateChat.sendData(questParam as PptProjectPo);
  });

  const startGenerateFlow = (detail: PptProjectPo) => {
    const stateParams = location.state as any;
    const templateId = stateParams?.templateId || selectedTemplateId;
    const filter = stateParams?.filter || selectedTemplateFilter;

    if (!templateId) {
      message.warning('缺少模板信息，请返回下一步');
      return;
    }

    generatePpt(templateId, filter);
  };

  const loadFinishedSlides = (detail: PptProjectPo) => {
    if (detail.createMode === 'classic') {
      loadClassicSlidesFirstPage(detail);
    }
  };

  const handleLoadMoreSlides = async () => {
    console.log('[classic] 加载更多幻灯片');
    if (!projectDetail || createMode !== 'classic') return;
    try {
      const nextPage = usePptProjectStore.getState().classicSlidesPage;
      await loadClassicSlides(projectDetail.projectId, projectDetail, nextPage, 10);
    } catch (error) {
      console.error('[classic] 加载更多幻灯片失败:', error);
    }
  };

  const handleBack = () => {
    if (generatingPpt) {
      showWarningModal();
      return;
    }
    if (hasUnsavedChanges.current) {
      message.warning('您有未保存的更改，是否离开？');
      return;
    }
    navigate('/ppt/my-works');
  };

  const handleWarningModalOk = useMemoizedFn(() => {
    if (classicMateChat && classicMateChat.cancelRequest) classicMateChat.cancelRequest();
    navigate(`/ppt/my-works`);
    // classicService.stopSse({ projectId: projectId } as PptProjectPo).subscribe(() => {
    //   navigate(`/ppt/my-works`);
    // });
  });

  const { visible: warningModalVisible, showModal: showWarningModal, hideModal: hideWarningModal } = useSetModalState();
  const { visible: selectTemplateModalVisible, showModal: showSelectTemplateModal, hideModal: hideSelectTemplateModal } = useSetModalState();

  const [aiInputModalVisible, setAiInputModalVisible] = useState(false);
  const [aiInputValue, setAiInputValue] = useState('');
  const elementQueueRef = useRef<Map<number, { remaining: PPTElement[]; timer?: number }>>(new Map());
  const activeQueueSlideIndexRef = useRef<number | null>(null);
  const pendingSlidesRef = useRef<Array<{
    slideData: PptProjectSlidePo;
    parsedSlide: PPTSlide;
    slideNo?: number;
    slideType?: string;
    totalPage?: number;
  }>>([]);

  const finalizeGenerationIfReady = (total?: number) => {
    const currentSlideCount = slideDataRef.current?.slides?.length || 0;
    const expectedTotal = total || totalPages || outlineData?.length;
    if (
      currentSlideCount > 0 &&
      expectedTotal &&
      currentSlideCount >= expectedTotal &&
      pendingSlidesRef.current.length === 0 &&
      elementQueueRef.current.size === 0 &&
      activeQueueSlideIndexRef.current === null
    ) {
      setGeneratingPpt(false);
      message.success('PPT 生成完成！');
      const updatedProject = {
        ...projectDetail,
        status: PptProjectStatus.Completed,
      };
      setProjectDetail(updatedProject as PptProjectPo);
      slideDataRef.current = null;
    }
  };

  const processQueuedSlide = (pending: {
    slideData: PptProjectSlidePo;
    parsedSlide: PPTSlide;
    slideNo?: number;
    slideType?: string;
    totalPage?: number;
  }) => {
    const { slideData, parsedSlide, slideNo, slideType, totalPage } = pending;
    const slidesStore = useSlidesStore.getState();
    const currentSlides = slidesStore.slides || [];
    const insertIndex = typeof slideNo === 'number' && slideNo > 0
      ? slideNo - 1
      : currentSlides.length;
    const baseSlide = {
      ...parsedSlide,
      elements: [],
    } as PPTSlide;
    const nextSlides = [...currentSlides];
    if (insertIndex >= nextSlides.length) {
      nextSlides.push(baseSlide);
    } else {
      nextSlides[insertIndex] = baseSlide;
    }
    slidesStore.setSlides(nextSlides);
    activeQueueSlideIndexRef.current = insertIndex;
    slidesStore.updateSlideIndex(insertIndex);
    const existingQueue = elementQueueRef.current.get(insertIndex);
    if (existingQueue?.timer) {
      window.clearTimeout(existingQueue.timer);
    }
    elementQueueRef.current.set(insertIndex, {
      remaining: [...(parsedSlide.elements || [])],
    });
    scheduleElementQueue(insertIndex);

    const previousDoc = slideDataRef.current;
    const previousSlides = previousDoc?.slides || [];
    const normalizedSlide: PptProjectSlidePo = {
      ...slideData,
      slideJson: parsedSlide,
      slideNo: slideNo || slideData.slideNo || previousSlides.length + 1,
      slideType: slideType || parsedSlide?.type || slideData.slideType,
    };
    const mergedSlides = previousSlides.length ? [...previousSlides, normalizedSlide] : [normalizedSlide];
    const nextDocument: PptDocumentData = {
      ...(previousDoc || {}),
      slides: mergedSlides,
      totalPages: totalPage || mergedSlides.length,
    };
    slideDataRef.current = nextDocument;
    setDisplayPptData({ ...nextDocument, slides: [...mergedSlides] });
    setReceivedSlides([...mergedSlides]);
  };

  const processNextPendingSlide = () => {
    const nextPending = pendingSlidesRef.current.shift();
    if (!nextPending) {
      activeQueueSlideIndexRef.current = null;
      finalizeGenerationIfReady();
      return;
    }
    processQueuedSlide(nextPending);
  };

  const scheduleElementQueue = (slideIndex: number) => {
    const queue = elementQueueRef.current.get(slideIndex);
    if (!queue) return;
    const next = queue.remaining.shift();
    if (!next) {
      elementQueueRef.current.delete(slideIndex);
      if (activeQueueSlideIndexRef.current === slideIndex) {
        processNextPendingSlide();
      }
      return;
    }
    const slidesStore = useSlidesStore.getState();
    const currentSlides = slidesStore.slides || [];
    const currentSlide = currentSlides[slideIndex];
    if (!currentSlide) return;
    const updatedSlide = {
      ...currentSlide,
      elements: [...(currentSlide.elements || []), next],
    } as PPTSlide;
    const nextSlides = [...currentSlides];
    nextSlides[slideIndex] = updatedSlide;
    slidesStore.setSlides(nextSlides);
    queue.timer = window.setTimeout(() => scheduleElementQueue(slideIndex), 120);
  };

  useEffect(() => {
    elementQueueRef.current.clear();
    pendingSlidesRef.current = [];
    activeQueueSlideIndexRef.current = null;
  }, [id]);

  const insertClassicSlideAtPosition = useMemoizedFn(async (slideJson: PPTSlide, insertIndex: number, slideMeta?: { slideId?: string; projectId?: string; slideNo?: number; slideType?: string }) => {
    const slidesStore = useSlidesStore.getState();
    // const slides = slidesStore.slides || [];
    // const nextSlides = [
    //   ...slides.slice(0, insertIndex),
    //   newSlide,
    //   ...slides.slice(insertIndex),
    // ];
    // slidesStore.setSlides(nextSlides);
    // slidesStore.updateSlideIndex(insertIndex);
    const parsedSlideRaw = (() => {
      if (typeof slideJson !== 'string') return slideJson;
      try {
        return JSON.parse(slideJson);
      } catch (error) {
        console.warn('[classic] 解析 slideJson 失败:', error);
        return slideJson;
      }
    })();
    const parsedSlide = SlideParser.parse(parsedSlideRaw) || (parsedSlideRaw as PPTSlide);
    slidesStore.addSlide(parsedSlide);
    const typedSlide = parsedSlide as PPTSlide & { slideType?: string };
    const slidePo = new PptProjectSlidePo();
    if (slideMeta?.slideId !== undefined) slidePo.slideId = slideMeta.slideId;
    if (slideMeta?.projectId !== undefined) slidePo.projectId = slideMeta.projectId;
    slidePo.slideNo = slideMeta?.slideNo || insertIndex + 1;
    slidePo.slideType = slideMeta?.slideType || typedSlide.type || typedSlide.slideType || 'content';
    slidePo.slideJson = parsedSlide;
    await usePptProjectStore.getState().insertSlideAtPosition(slidePo, insertIndex);
  });

  const handleAddBlankSlide = useMemoizedFn(async () => {
    if (createMode !== 'classic') return;
    setIsGeneratingSinglePage(true);
    const { slideIndex } = useSlidesStore.getState();
    const slideNo = slideIndex + 2;
    classicService.blankInsert({
      projectId: id,
      slideNo: slideNo,
      userInput: aiInputValue,
    } as any).subscribe({
      next: async (res) => {
        if (res.code === 0 && res.data) {
          message.success('空白页面已插入');
          const responseData = res.data;
          if (responseData.slideJson) {
            const newSlide = applyThemeToSlide(responseData.slideJson) || (responseData.slideJson as PPTSlide);
            const insertIndex = slideIndex + 1;
            await insertClassicSlideAtPosition(newSlide, insertIndex, { ...responseData });
          }
        }
      },
      error: (err) => {
        message.error('AI生成失败: ' + (err?.message || '未知错误'));
        console.error('AI generate failed:', err);
      },
      complete() {
        setIsGeneratingSinglePage(false);
      },
    });

  });

  const handleAddTemplateSlide = useMemoizedFn((layoutId: string) => {
    if (createMode !== 'classic') return;
    setIsGeneratingSinglePage(true);
    const { slideIndex } = useSlidesStore.getState();
    const slideNo = slideIndex + 2;
    classicService.insertLayout({
      projectId: id,
      slideNo: slideNo,
      layoutId: layoutId,
    } as any).subscribe({
      next: async (res) => {
        if (res.code === 0 && res.data) {
          message.success('模板页已插入');
          const responseData = res.data;
          console.log('[classic] 插入的幻灯片:', responseData);
          if (responseData.slideJson) {
            const newSlide = applyThemeToSlide(responseData.slideJson) || (responseData.slideJson as PPTSlide);
            const insertIndex = slideIndex + 1;
            console.log('[classic] 插入的幻灯片:', newSlide);
            await insertClassicSlideAtPosition(newSlide, insertIndex, { ...responseData });
            setIsGeneratingSinglePage(false);
          }
        }
      },
      error: (err) => {
        message.error('AI生成失败: ' + (err?.message || '未知错误'));
        console.error('AI generate failed:', err);
        setIsGeneratingSinglePage(false);
      },
      complete() {
        setGeneratingPpt(false);
        setIsGeneratingSinglePage(false);
      },
    });
  });

  const handleAddAIGeneratedSlide = useMemoizedFn(() => {
    setAiInputValue('');
    setAiInputModalVisible(true);
  });

  const handleAiInputOk = useMemoizedFn(() => {
    if (!aiInputValue.trim()) {
      message.warning('请输入内容');
      return;
    }
    setAiInputModalVisible(false);
    setIsGeneratingSinglePage(true);
    const { slideIndex } = useSlidesStore.getState();
    const slideNo = slideIndex + 2;
    classicService.aiInsert({
      projectId: id,
      slideNo: slideNo,
      userInput: aiInputValue,
    } as any).subscribe({
      next: async (res) => {
        if (res.code === 0 && res.data) {
          message.success('AI生成页面已插入');
          const responseData = res.data;
          if (responseData.slideJson) {
            const newSlide = applyThemeToSlide(responseData.slideJson) || (responseData.slideJson as PPTSlide);
            const insertIndex = slideIndex + 1;
            await insertClassicSlideAtPosition(newSlide, insertIndex, { ...responseData });
          }
        }
      },
      error: (err) => {
        message.error('AI生成失败: ' + (err?.message || '未知错误'));
        console.error('AI generate failed:', err);
      },
      complete() {
        setIsGeneratingSinglePage(false);
      },
    });
  });

  // 自动分页加载：每页加载完成后，3 秒后加载下一页，直到全部完成
  const autoLoadTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (autoLoadTimerRef.current) {
      window.clearTimeout(autoLoadTimerRef.current);
      autoLoadTimerRef.current = null;
    }
    if (!projectDetail || createMode !== 'classic') return;
    if (generatingPpt) return;
    if (classicSlidesAllLoaded || loadingClassicSlides) return;

    autoLoadTimerRef.current = window.setTimeout(() => {
      handleLoadMoreSlides();
    }, 3000);

    return () => {
      if (autoLoadTimerRef.current) {
        window.clearTimeout(autoLoadTimerRef.current);
        autoLoadTimerRef.current = null;
      }
    };
  }, [
    projectDetail,
    createMode,
    generatingPpt,
    classicSlidesAllLoaded,
    loadingClassicSlides,
    handleLoadMoreSlides,
  ]);

  return (
    <div className="h-full w-full relative flex flex-col ">
      {loadingDetail && <LoadingComponent />}

      {!loadingDetail &&
        ((projectDetail && projectDetail.errorInfo) ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
              <p className="text-red-500">{projectDetail.errorInfo}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-hidden ">
              <ClassicPptEditor
                pptData={displayPptData}
                onBack={handleBack}
                onAddBlankSlide={handleAddBlankSlide}
                onAddTemplateSlide={showSelectTemplateModal}
                onAddAIGeneratedSlide={handleAddAIGeneratedSlide}
                onLoadMoreSlides={handleLoadMoreSlides}
                hasMoreSlides={!classicSlidesAllLoaded && !generatingPpt}
                loadingMoreSlides={loadingClassicSlides}
              />
            </div>

            {(generatingPpt || projectDetail?.status === 'processing' || isGeneratingSinglePage) && (
              <div className="absolute top-12 w-full  flex items-center justify-center pointer-events-none z-50">
                <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex gap-4  items-center justify-center">
                  <Spin size="small" />
                  <p>正在生成PPT...</p>
                  {!isGeneratingSinglePage && (
                    <p className="text-sm ">
                      {receivedSlides.length} / {totalPages}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ))}

      <Modal
        title={
          <div className="text-lg font-bold">
            <span className='mr-2 text-warning-500'>
              <ExclamationCircleOutlined />
            </span>
            温馨提示
          </div>
        }
        open={warningModalVisible}
        onOk={handleWarningModalOk}
        onCancel={hideWarningModal}
        okText="放弃创作"
        cancelText="再等等"
      >
        正在创作PPT，关闭页面可能无法保存已生成好的内容，请您耐心等待
      </Modal>

      <Modal
        title="AI生成页面"
        open={aiInputModalVisible}
        onOk={handleAiInputOk}
        onCancel={() => setAiInputModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
            描述你要生成的内容
          </label>
          <Input.TextArea
            rows={6}
            value={aiInputValue}
            onChange={(e) => setAiInputValue(e.target.value)}
            placeholder="例如：添加公司概览"
          />
        </div>
      </Modal>

      <AssistantPro slideNo={
        currentSlideNo
      }
        createMode={
          CreateMode.Classic
        }
      />

      <PptTemplateLayoutModal
        isOpen={selectTemplateModalVisible}
        projectId={projectId}

        createMode={createMode}
        onClose={hideSelectTemplateModal}
        themeColors={themeColors}
        onConfirm={(layoutId) => {
          handleAddTemplateSlide(layoutId);
          hideSelectTemplateModal();
        }}
      />
    </div>
  );
};

export default PptClassicEditorPage;
