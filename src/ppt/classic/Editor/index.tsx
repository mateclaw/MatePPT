import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, ConfigProvider, FloatButton, Modal, App, Input, Tabs } from 'antd'
import { Icon } from 'umi'

import { useMainStore } from '@/ppt/store'
import useGlobalHotkey from '@/ppt/hooks/useGlobalHotkey'
import usePasteEvent from '@/ppt/hooks/usePasteEvent'
import EditorHeader from './EditorHeader'
import Canvas from './Canvas'
import CanvasTool from './CanvasTool'
import Thumbnails from './Thumbnails'
// import Toolbar from './Toolbar'
import Remark from './Remark'

import ExportDialog from './ExportDialog'
import SelectPanel from './SelectPanel'
import SearchPanel from './SearchPanel'
// import NotesPanel from './NotesPanel'
import SymbolPanel from './SymbolPanel'
import MarkupPanel from './MarkupPanel'
import AIPPTDialog from './AIPPTDialog'
import { TopToolbar } from "./EditorToolbar/TopToolbar";
import styles from './index.module.scss'
import { useShallow } from "zustand/react/shallow";
import { usePptProjectStore } from '@/stores/pptProjectStore'
import type { PPTSlide } from '@/ppt/core'
import { type ThemeColors, THEME_COLOR_KEYS } from '@/ppt/core/entity/presentation/ThemeColors'
import { PptProjectSlidePo } from '@/models/pptProjectSlidePo'
import type { PptDocumentData } from '@/stores/pptProjectStore'
import { PptProjectStatus, TextElement, type ChartType } from '@/ppt/core'
import { useExportPolling } from '@/ppt/hooks/useExportPolling'
import { ClassicModeToolbar } from './EditorToolbar/ClassicModeToolbar'
import { BottomToolbar } from './EditorToolbar/BottomToolbar'
import { RightToolbar } from './EditorToolbar/RightToolbar'
import { useMemoizedFn } from 'ahooks'
import { useSlidesStore } from '@/ppt/store/useSlidesStore'
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore'
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot'
import useScaleCanvas from '@/ppt/hooks/useScaleCanvas'
import useScreening from '@/ppt/hooks/useScreening'
import { normalizePPTColor } from '@/ppt/core/utils/pptColor'
import LayoutDrawer from '@/ppt/classic/Editor/LayoutDrawer'
import TemplateDrawer from '@/ppt/classic/Editor/TemplateDrawer'
import ThemeDrawer from '@/ppt/classic/Editor/ThemeDrawer'
import BackgroundDrawer from '@/ppt/classic/Editor/BackgroundDrawer'
import { SlideParser } from '@/ppt/classic/parser/SlideParser'
import useCreateElement from '@/ppt/hooks/useCreateElement'
import { ThemeChanger } from '@/ppt/core/color/ThemeChanger'
import { PPTColorCalculator } from '@/ppt/core/color/PPTColorCalculator'
import type { ShapePoolItem } from '@/ppt/configs/shapes'
import type { LinePoolItem } from '@/ppt/configs/lines'
import { nanoid } from 'nanoid'
import { emitter, EmitterEvents } from '@/ppt/utils/emitter'
import { ADD_TEXT_PRESETS, PRESET_STYLES, type AddTextPresetKey } from '@/ppt/configs'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import S3Uploader from '@/components/base/file-uploader/s3-uploader'
import { S3Service } from '@/services/s3.service'
import { FileInfoVo } from '@/models/fileInfoVo'
import { buildDirectUploadTarget } from '@/hooks/s3uploader-hooks'
import { lastValueFrom } from 'rxjs'
import { PptThemeService } from '@/services/pptTheme.service'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'


interface EditorProps {
  onBack?: () => void;
  onAddBlankSlide?: () => void;
  onAddTemplateSlide?: () => void;
  onAddAIGeneratedSlide?: () => void;
  onLoadMoreSlides?: () => Promise<void>;
  hasMoreSlides?: boolean;
  loadingMoreSlides?: boolean;
}

const DEFAULT_REMARK_HEIGHT = 40;
const s3service = S3Service.getInstance();
const pptThemeService = PptThemeService.getInstance();

export default function Editor({
  onBack,
  onAddBlankSlide,
  onAddTemplateSlide,
  onAddAIGeneratedSlide,
  onLoadMoreSlides,
  hasMoreSlides,
  loadingMoreSlides,
}: EditorProps) {
  const {
    dialogForExport,
    showSelectPanel,
    showSearchPanel,
    showNotesPanel,
    showSymbolPanel,
    showMarkupPanel,
    showAIPPTDialog,
    setDialogForExport,
    setShowAIPPTDialog,
    hideFloatButton,

  } = useMainStore(useShallow((state) => ({
    dialogForExport: state.dialogForExport,
    showSelectPanel: state.showSelectPanel,
    showSearchPanel: state.showSearchPanel,
    showNotesPanel: state.showNotesPanel,
    showSymbolPanel: state.showSymbolPanel,
    showMarkupPanel: state.showMarkupPanel,
    showAIPPTDialog: state.showAIPPTDialog,
    setDialogForExport: state.setDialogForExport,
    setShowAIPPTDialog: state.setShowAIPPTDialog,
    hideFloatButton: state.activeElementIdList.length > 0,

  })))

  const media = useBreakpoints();
  const isMobile = media === MediaType.mobile || media === MediaType.tablet;

  const [remarkHeight, setRemarkHeight] = useState(DEFAULT_REMARK_HEIGHT)
  const lastRemarkHeightRef = useRef(DEFAULT_REMARK_HEIGHT)

  useGlobalHotkey()
  usePasteEvent()

  const { message } = App.useApp();

  const { setCreatingElement, setActiveElementIdList, setEditorAreaFocus } = useMainStore(
    useShallow((state) => ({
      setCreatingElement: state.setCreatingElement,
      setActiveElementIdList: state.setActiveElementIdList,
      setEditorAreaFocus: state.setEditorAreaFocus,
    }))
  );
  const {
    createImageElement,
    createChartElement,
    createTableElement,
    createLatexElement,
    createVideoElement,
    createAudioElement,
  } = useCreateElement();

  const handleAddText = useMemoizedFn((preset: AddTextPresetKey = 'body') => {
    const { viewportSize, viewportRatio, addElement } = useSlidesStore.getState();
    const slideWidth = viewportSize;
    const slideHeight = viewportSize * viewportRatio;
    const presetConfig = ADD_TEXT_PRESETS.find((item) => item.key === preset);
    if (!presetConfig) return;
    const presetStyle = PRESET_STYLES.find((style) => style.label === presetConfig.presetLabel);
    const width = Math.round(slideWidth * presetConfig.widthRatio);
    const height = presetConfig.height;
    const top = Math.round(slideHeight * presetConfig.topRatio);
    const left = Math.round((slideWidth - width) / 2);
    const id = nanoid(10);
    const element = new TextElement({
      id,
      left,
      top,
      width,
      height,
      content: presetConfig.content,
      alignV: 'top',
      wrapText: true,
    });

    addElement(element);
    setActiveElementIdList([id]);
    setCreatingElement(null);
    setEditorAreaFocus(true);
    addHistorySnapshot();
    const applyPreset = (attemptsLeft: number) => {
      const editorRef = document.querySelector(`#editable-element-${id} .ProseMirror`) as HTMLElement | null;
      if (!editorRef && attemptsLeft > 0) {
        requestAnimationFrame(() => applyPreset(attemptsLeft - 1));
        return;
      }
      if (presetStyle?.cmd) {
        emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, {
          target: id,
          action: presetStyle.cmd,
        });
        emitter.emit(EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE);
      }
      editorRef?.focus();
    };
    applyPreset(10);
  });

  const handleAddShape = useMemoizedFn((shape: ShapePoolItem) => {
    setCreatingElement({ type: 'shape', data: shape });
  });

  const handleAddLine = useMemoizedFn((line: LinePoolItem) => {
    setCreatingElement({ type: 'line', data: line });
  });

  const handleAddChart = useMemoizedFn((chartType: ChartType) => {
    createChartElement(chartType);
  });

  const handleAddTable = useMemoizedFn((row: number, col: number) => {
    createTableElement(row, col);
  });

  const handleAddMath = useMemoizedFn((data: {
    latex: string;
    mathML: string;
    width: number;
    height: number;
    viewBox?: [number, number];
    path?: string;
  }) => {
    createLatexElement({
      path: data.path,
      latex: data.latex,
      mathML: data.mathML,
      w: data.width,
      h: data.height,
      viewBox: data.viewBox,
    });
  });

  const handleAddVideo = useMemoizedFn((src: string) => {
    createVideoElement(src);
  });

  const handleAddAudio = useMemoizedFn((src: string) => {
    createAudioElement(src);
  });


  const {
    projectDetail,
    generatingPpt,
    projectId,
    createMode,
    saveClassicSlidesToBackend,
    setPptData,
    setDisplayPptData,
    setReceivedSlides,
    setTotalPages,
    setClassicSlidesPage,
    setClassicSlidesAllLoaded,
    setLoadingClassicSlides,
    pptData,
    displayPptData,
    totalPages,
  } =
    usePptProjectStore(
      useShallow((state) => ({
        projectDetail: state.projectDetail,
        generatingPpt: state.generatingPpt,
        projectId: state.projectId,
        createMode: state.createMode,
        saveClassicSlidesToBackend: state.saveClassicSlidesToBackend,
        setPptData: state.setPptData,
        setDisplayPptData: state.setDisplayPptData,
        setReceivedSlides: state.setReceivedSlides,
        setTotalPages: state.setTotalPages,
        setClassicSlidesPage: state.setClassicSlidesPage,
        setClassicSlidesAllLoaded: state.setClassicSlidesAllLoaded,
        setLoadingClassicSlides: state.setLoadingClassicSlides,
        pptData: state.pptData,
        displayPptData: state.displayPptData,
        totalPages: state.totalPages,

      }))
    );

  const handleSave = useMemoizedFn(async () => {
    if (!projectDetail) {
      message.warning('项目未加载完成，无法保存');
      return;
    }

    try {
      if (!projectId) {
        message.warning('项目ID缺失，无法保存');
        return;
      }
      const slidesStore = useSlidesStore.getState();
      const { slides } = slidesStore;
      const dirtySlides = slides.filter((slide) => (slide as any).dirty);
      if (!dirtySlides.length) {
        message.info('暂无需要保存的更改');
        return;
      }
      await saveClassicSlidesToBackend(projectId, dirtySlides);
      const dirtyIds = new Set(dirtySlides.map((slide) => slide.id));
      const nextSlides = slides.map((slide) =>
        dirtyIds.has(slide.id) ? ({ ...slide, dirty: false } as PPTSlide) : slide
      );
      slidesStore.setSlides(nextSlides);
      message.success('PPT 已保存');
    } catch (error) {
      console.error('[classic] 保存失败:', error);
      message.error('PPT 保存失败');
    }
  });
  const { startPolling, isPolling } = useExportPolling();
  const handleExport = useMemoizedFn((exportFormat: string) => {
    if (!projectId || !createMode) {
      message.error('项目ID不存在，无法导出');
      return;
    }
    startPolling({
      projectId,
      createMode: createMode,
      exportFormat,
    });
  });
  const { slideIndex, slides, themeColors } = useSlidesStore(
    useShallow((state) => ({
      slideIndex: state.slideIndex,
      slides: state.slides,
      themeColors: state.theme?.themeColors,
    }))
  );
  const setTheme = useSlidesStore(useShallow((state) => state.setTheme));
  const setViewportSize = useSlidesStore(useShallow((state) => state.setViewportSize));
  const setViewportRatio = useSlidesStore(useShallow((state) => state.setViewportRatio));
  const canvasScale = useMainStore((state) => state.canvasScale);
  const { snapshotCursor, snapshotLength, resetSnapshotDatabase } = useSnapshotStore(
    useShallow((state) => ({
      snapshotCursor: state.snapshotCursor,
      snapshotLength: state.snapshotLength,
      resetSnapshotDatabase: state.resetSnapshotDatabase
    }))
  );
  const canUndo = snapshotCursor > 0;
  const canRedo = snapshotCursor >= 0 && snapshotCursor < snapshotLength - 1;
  const { undo, redo, addHistorySnapshot } = useHistorySnapshot();
  const { setCanvasScaleByRatio, resetCanvas, scaleCanvas } = useScaleCanvas();
  const { enterScreening, enterScreeningFromStart } = useScreening();
  const isApplyingSnapshotRef = useRef(false);
  const [isLayoutDrawerOpen, setIsLayoutDrawerOpen] = useState(false);
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
  const [isThemeDrawerOpen, setIsThemeDrawerOpen] = useState(false);
  const [isBackgroundDrawerOpen, setIsBackgroundDrawerOpen] = useState(false);
  const [imageInputModalVisible, setImageInputModalVisible] = useState(false);
  const [imageInputValue, setImageInputValue] = useState('');
  const [imageTabKey, setImageTabKey] = useState<'s3' | 'url'>('s3');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [videoInputModalVisible, setVideoInputModalVisible] = useState(false);
  const [audioInputModalVisible, setAudioInputModalVisible] = useState(false);
  const [videoTabKey, setVideoTabKey] = useState<'s3' | 'url'>('s3');
  const [audioTabKey, setAudioTabKey] = useState<'s3' | 'url'>('s3');
  const [videoInputValue, setVideoInputValue] = useState('');
  const [audioInputValue, setAudioInputValue] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState('');

  useEffect(() => {
    const unsubscribe = useSlidesStore.subscribe((nextState, prevState) => {
      if (nextState.slides === prevState.slides) return;
      if (isApplyingSnapshotRef.current) {
        isApplyingSnapshotRef.current = false;
        return;
      }
      addHistorySnapshot();
    });
    return () => {
      unsubscribe();
    };
  }, [addHistorySnapshot]);

  const handleToggleNotes = useMemoizedFn(() => {
    if (remarkHeight === 0) {
      setRemarkHeight(lastRemarkHeightRef.current || DEFAULT_REMARK_HEIGHT);
      return;
    }
    lastRemarkHeightRef.current = remarkHeight;
    setRemarkHeight(0);
  });

  const isCountableElement = useMemoizedFn((element) => {
    if (!element) return false;
    if (element.type === 'text') return true;
    if (element.type === 'image') return true;
    if (element.type === 'chart') return true;
    if (element.type === 'shape' && element.text) return true;
    return false;
  });

  const layoutAvailability = useMemo(() => {
    const slide = slides[slideIndex];
    if (!slide || !slide.elements || slide.elements.length === 0) {
      return { groupCount: 0, elementCount: 0, canClick: false };
    }

    const groupIdCount = new Map<string, number>();
    slide.elements.forEach((el: any) => {
      const gid = el?.groupId;
      if (gid && String(gid).trim() && isCountableElement(el)) {
        groupIdCount.set(gid, (groupIdCount.get(gid) || 0) + 1);
      }
    });
    if (!groupIdCount.size) return { groupCount: 0, elementCount: 0, canClick: false };
    const counts = Array.from(groupIdCount.values());
    const first = counts[0];
    const uniform = counts.every((c) => c === first);
    const elementCount = uniform ? first : Math.min(...counts);
    const groupCount = groupIdCount.size;
    return { groupCount, elementCount, canClick: groupCount > 0 && elementCount > 0 };

  }, [slides, slideIndex, isCountableElement]);

  const slide = slides[slideIndex] as PPTSlide & { slideId?: number };
  const slideId = slide?.slideId;

  const resolveUploadUrl = (data: any) => {
    return (
      data?.result?.httpUrl ||
      data?.result?.fileUrl ||
      data?.response?.result?.httpUrl ||
      data?.response?.result?.fileUrl ||
      ''
    );
  };

  const resolveSlideId = () => {
    const currentSlide = slides[slideIndex] as PPTSlide & { slideId?: number };
    return currentSlide?.slideId;
  };

  const elementUploadPath = useMemo(() => {
    if (!projectId) return '';
    const slideId = resolveSlideId();
    if (!slideId) return '';
    return `pptProject/${projectId}/slides/${slideId}/elements`;
  }, [projectId, slideIndex, slides]);
  const videoUploadTypes = '.mp4,.mov,.webm,.mkv,.m3u8,.flv';
  const audioUploadTypes = '.mp3,.wav,.aac,.m4a,.ogg,.flac';

  const getPptElementUploadTarget = useMemoizedFn(async (file: File) => {
    if (!projectId) {
      throw new Error('项目ID缺失，无法上传');
    }
    const slideId = resolveSlideId();
    if (!slideId) {
      throw new Error('当前页面缺少 slideId，无法上传');
    }
    const request = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      projectId,
      slideId: String(slideId),
    } as FileInfoVo;
    const response = await lastValueFrom(s3service.getPptSlideUploadUrl(request));
    if (!response || response.code !== 0 || !response.data) {
      throw new Error(response?.msg || '获取上传地址失败');
    }
    return buildDirectUploadTarget(String(response.data));
  });

  const resetImageModal = () => {
    setImageInputModalVisible(false);
    setImageInputValue('');
    setUploadedImageUrl('');
    setImageTabKey('s3');
  };

  const resetVideoModal = () => {
    setVideoInputModalVisible(false);
    setVideoTabKey('s3');
    setVideoInputValue('');
    setUploadedVideoUrl('');
  };

  const resetAudioModal = () => {
    setAudioInputModalVisible(false);
    setAudioTabKey('s3');
    setAudioInputValue('');
    setUploadedAudioUrl('');
  };

  const handleImageInputOk = useMemoizedFn(() => {
    let imageUrl = '';
    if (imageTabKey === 'url') {
      if (!imageInputValue.trim()) {
        message.warning('请输入图片 URL');
        return;
      }
      imageUrl = imageInputValue.trim();
    } else {
      if (!uploadedImageUrl) {
        message.warning('请先上传图片');
        return;
      }
      imageUrl = uploadedImageUrl;
    }
    createImageElement(imageUrl);
    resetImageModal();
  });

  const handleVideoInputOk = useMemoizedFn(() => {
    if (videoTabKey === 'url') {
      if (!videoInputValue.trim()) {
        message.warning('请输入视频 URL');
        return;
      }
      handleAddVideo(videoInputValue.trim());
    } else {
      if (!uploadedVideoUrl) {
        message.warning('请先上传视频');
        return;
      }
      handleAddVideo(uploadedVideoUrl);
    }
    resetVideoModal();
  });

  const handleAudioInputOk = useMemoizedFn(() => {
    if (audioTabKey === 'url') {
      if (!audioInputValue.trim()) {
        message.warning('请输入音频 URL');
        return;
      }
      handleAddAudio(audioInputValue.trim());
    } else {
      if (!uploadedAudioUrl) {
        message.warning('请先上传音频');
        return;
      }
      handleAddAudio(uploadedAudioUrl);
    }
    resetAudioModal();
  });

  const handleReloadPptData = useMemoizedFn((newPptData, source: 'layout' | 'template' | 'theme' = 'template') => {
    console.log('[classic] handleReloadPptData', newPptData);
    if (!newPptData) return;
    const resolveThemeMap = (raw: unknown): Record<string, string> | null => {
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
    };
    const themeMap = source !== 'theme' ? resolveThemeMap(themeColors) : null;
    const themedPptData = themeMap ? ThemeChanger.changeTheme(newPptData, themeMap) : newPptData;

    const resolveThemeColors = (themeData: any): ThemeColors | null => {
      const rawColors = themeData?.themeColors;
      if (!rawColors) return null;
      if (typeof rawColors === 'string') {
        try {
          return JSON.parse(rawColors) as ThemeColors;
        } catch (error) {
          console.warn('[classic] 解析主题色失败:', error);
          return null;
        }
      }
      return rawColors as ThemeColors;
    };

    const parseSlideJson = (raw: unknown): PPTSlide | undefined => {
      if (!raw) return undefined;
      const parsed = (() => {
        if (typeof raw !== 'string') return raw;
        try {
          return JSON.parse(raw);
        } catch (error) {
          console.warn('[classic] 解析 slideJson 失败:', error);
          return undefined;
        }
      })();
      const slide = SlideParser.parse(parsed);
      const resolved = slide || (parsed && typeof parsed === 'object' ? (parsed as PPTSlide) : undefined);
      if (resolved && themeMap) {
        return ThemeChanger.changeTheme(resolved, themeMap) as PPTSlide;
      }
      return resolved;
    };

    const currentDisplaySlides = (displayPptData?.slides || []) as PptProjectSlidePo[];
    const buildProjectSlide = (item: PPTSlide, index: number, fallback?: PptProjectSlidePo) => {
      const typedSlide = item as PPTSlide & { slideId?: number; slideType?: string; slideNo?: number };
      const slidePo = new PptProjectSlidePo();
      const resolvedSlideId = typedSlide.slideId ?? fallback?.slideId;
      const resolvedProjectId = projectId ?? fallback?.projectId;
      const resolvedSlideNo = typedSlide.slideNo ?? fallback?.slideNo ?? index + 1;
      const resolvedSlideType = typedSlide.type || typedSlide.slideType || fallback?.slideType || 'content';

      if (resolvedSlideId !== undefined) slidePo.slideId = resolvedSlideId;
      if (resolvedProjectId) slidePo.projectId = resolvedProjectId;
      slidePo.slideNo = resolvedSlideNo;
      slidePo.slideType = resolvedSlideType;
      slidePo.slideJson = item;
      return slidePo;
    };
    const toProjectSlides = (rawSlides: PPTSlide[] = []) =>
      rawSlides.map((item, index) => buildProjectSlide(item, index, currentDisplaySlides[index]));


    // if (newPptData.theme) {
    //   const nextThemeColors = resolveThemeColors(newPptData.theme);
    //     setTheme({
    //       fontColor: normalizePPTColor(newPptData.theme.fontColor),
    //       fontName: newPptData.theme.fontName,
    //       ...(nextThemeColors ? { themeColors: nextThemeColors } : {}),
    //     });
    //   setThemeColors(nextThemeColors);
    // }
    if (source === 'layout') {
      const resolveLayoutSlide = () => {
        if (Array.isArray(themedPptData)) {
          const po = themedPptData[0] as PptProjectSlidePo | undefined;
          return { slide: po ? parseSlideJson(po.slideJson) : undefined, slidePo: po };
        }
        const rawSlides = (themedPptData as { slides?: any[] }).slides || [];
        const first = rawSlides[0];
        if (first && typeof first === 'object' && 'slideJson' in first) {
          const po = first as PptProjectSlidePo;
          return { slide: parseSlideJson(po.slideJson), slidePo: po };
        }
        return { slide: rawSlides[0] as PPTSlide | undefined, slidePo: undefined };
      };

      const { slide: nextSlide, slidePo } = resolveLayoutSlide();
      if (!nextSlide) return;

      const slidesStore = useSlidesStore.getState();
      const { slides: currentSlides, slideIndex: currentIndex } = slidesStore;
      const currentSlide = currentSlides[currentIndex];
      if (!currentSlide) return;

      const mergedSlide = {
        ...currentSlide,
        ...nextSlide,
        id: currentSlide.id,
        slideId: (currentSlide as any).slideId,
      } as PPTSlide & { slideId?: number };
      const updatedSlides = [...currentSlides];
      updatedSlides[currentIndex] = mergedSlide;
      slidesStore.setSlides(updatedSlides);

      const currentDisplay = displayPptData || { slides: [], totalPages: 0 };
      const updatedDisplaySlides = [...(currentDisplay.slides || [])];
      const nextPo = buildProjectSlide(
        mergedSlide,
        currentIndex,
        updatedDisplaySlides[currentIndex] as PptProjectSlidePo | undefined,
      );
      if (slidePo) {
        nextPo.slideId = nextPo.slideId ?? slidePo.slideId;
        nextPo.projectId = nextPo.projectId ?? slidePo.projectId;
        nextPo.slideNo = slidePo.slideNo || nextPo.slideNo;
        nextPo.slideType = slidePo.slideType || nextPo.slideType;
      }
      if (updatedDisplaySlides[currentIndex]) {
        const prev = updatedDisplaySlides[currentIndex] as PptProjectSlidePo;
        updatedDisplaySlides[currentIndex] = {
          ...prev,
          ...nextPo,
          slideId: nextPo.slideId ?? prev.slideId,
          projectId: nextPo.projectId ?? prev.projectId,
          slideNo: prev.slideNo || nextPo.slideNo,
        };
      } else if (nextPo) {
        updatedDisplaySlides[currentIndex] = nextPo;
      }

      const nextDisplay: PptDocumentData = {
        ...(currentDisplay || {}),
        width: themedPptData.width || currentDisplay.width,
        height: themedPptData.height || currentDisplay.height,
        theme: themedPptData.theme || currentDisplay.theme,
        slides: updatedDisplaySlides,
      };

      setDisplayPptData(nextDisplay);
      setPptData(nextDisplay);
      setReceivedSlides(updatedDisplaySlides);

      // if (newPptData.theme) {
      //   const nextThemeColors = resolveThemeColors(newPptData.theme);
      //   setTheme({
      //     fontColor: normalizePPTColor(newPptData.theme.fontColor),
      //     fontName: newPptData.theme.fontName,
      //     ...(nextThemeColors ? { themeColors: nextThemeColors } : {}),
      //   });
      //   setThemeColors(nextThemeColors);
      // }
      if (themedPptData.width && themedPptData.height) {
        setViewportSize(themedPptData.width);
        setViewportRatio(themedPptData.height / themedPptData.width);
      }
      return;
    }

    if (Array.isArray(themedPptData)) {
      const slidePos = themedPptData as PptProjectSlidePo[];
      const normalizedSlides = slidePos.map((item, index) => {
        const parsedSlide = parseSlideJson(item.slideJson);
        if (!parsedSlide) return null;
        const typedSlide = parsedSlide as PPTSlide & { slideType?: string };
        return {
          ...item,
          slideJson: parsedSlide as PPTSlide,
          slideType: item.slideType || typedSlide.type || typedSlide.slideType || 'content',
          slideNo: item.slideNo || index + 1,
        } as PptProjectSlidePo;
      }).filter(Boolean) as PptProjectSlidePo[];

      const nextSlides = normalizedSlides.map((item) => item.slideJson as PPTSlide);
      useSlidesStore.getState().setSlides(nextSlides);

      const totalPagesFromRes = normalizedSlides.find((item) => typeof item.totalPage === 'number')?.totalPage;
      const nextDisplay: PptDocumentData = {
        ...(displayPptData || {}),
        slides: normalizedSlides,
        totalPages: totalPagesFromRes || normalizedSlides.length,
      };

      setPptData(nextDisplay);
      setDisplayPptData(nextDisplay);
      setReceivedSlides(normalizedSlides);
      setTotalPages(nextDisplay.totalPages || normalizedSlides.length);
      setClassicSlidesPage(1);
      setClassicSlidesAllLoaded(true);
      setLoadingClassicSlides(false);
      return;
    }



    const nextPptData: PptDocumentData = {
      ...themedPptData,
      theme: {
        ...themedPptData.theme
      },
      slides: toProjectSlides(themedPptData.slides || [])
    };

    console.log('[classic] handleReloadPptData', nextPptData);
    resetSnapshotDatabase();
    setPptData(nextPptData);
    setDisplayPptData(nextPptData);
    setReceivedSlides(nextPptData.slides || []);
    setTotalPages(typeof nextPptData.totalPages === 'number'
      ? nextPptData.totalPages
      : (nextPptData.slides?.length || 0));
    setClassicSlidesPage(1);
    setClassicSlidesAllLoaded(true);
    setLoadingClassicSlides(false);
  });

  const handleThemeSelect = useMemoizedFn((theme) => {
    const parseJsonIfNeeded = (raw: unknown) => {
      if (!raw) return null;
      if (typeof raw !== 'string') return raw;
      try {
        return JSON.parse(raw);
      } catch (error) {
        console.warn('[classic] 解析主题色失败:', error);
        return null;
      }
    };

    const toThemeColors = (raw: unknown): ThemeColors | null => {
      if (!raw) return null;
      const parsed = parseJsonIfNeeded(raw);
      if (!parsed) return null;
      if (Array.isArray(parsed)) {
        const next = {} as ThemeColors;
        THEME_COLOR_KEYS.forEach((key, index) => {
          next[key] = typeof parsed[index] === 'string' ? parsed[index] : '';
        });
        return next;
      }
      if (typeof parsed === 'object') {
        const next = {} as ThemeColors;
        THEME_COLOR_KEYS.forEach((key) => {
          const value = (parsed as Record<string, unknown>)[key];
          next[key] = typeof value === 'string' ? value : '';
        });
        return next;
      }
      return null;
    };

    const rawColors = theme?.themeColors ?? theme?.colors ?? theme;
    const nextThemeColors = toThemeColors(rawColors);

    
    if (nextThemeColors) {
      setTheme({ themeColors: nextThemeColors });
      PPTColorCalculator.clearCache();
      const slidesStore = useSlidesStore.getState();
      const currentSlides = slidesStore.slides;
      if (currentSlides?.length) {
        const nextSlides = currentSlides.map((slide) => ({ ...slide }));
        const afterChangeThemSlides = ThemeChanger.changeTheme(nextSlides, nextThemeColors as unknown as Record<string, string>);
        const chartKeys = THEME_COLOR_KEYS.filter((key) => key.startsWith('accent'));
        const themeFollowColors = chartKeys.map((key) => PPTColor.ofScheme(key, nextThemeColors[key] || '#000000'));
        const syncedSlides = (afterChangeThemSlides as PPTSlide[]).map((slide) => {
          const elements = (slide.elements || []).map((el: any) => {
            if (el?.type !== 'chart' || !el?.themeFollowSlide) return el;
            return {
              ...el,
              themeColors: themeFollowColors,
            };
          });
          return { ...slide, elements };
        });
        slidesStore.setSlides(syncedSlides as PPTSlide[]);
        addHistorySnapshot();

      }
      if (projectId) {
        lastValueFrom(pptThemeService.switchTheme({
          projectId,
          themeColors: nextThemeColors,
        } as any)).catch((error) => {
          console.error('[classic] 主题保存失败:', error);
          message.error('主题保存失败');
        });
      }
      // if (pptData?.theme) {
      //   setPptData({ ...pptData, theme: { ...pptData.theme, themeColors: nextThemeColors } });
      // }

    }
  });

  const handleOpenImageModal = useMemoizedFn(() => {
    setImageInputValue('');
    setUploadedImageUrl('');
    setImageTabKey('s3');
    setImageInputModalVisible(true);
  });

  const handleOpenVideoModal = useMemoizedFn(() => {
    setVideoInputValue('');
    setUploadedVideoUrl('');
    setVideoTabKey('s3');
    setVideoInputModalVisible(true);
  });

  const handleOpenAudioModal = useMemoizedFn(() => {
    setAudioInputValue('');
    setUploadedAudioUrl('');
    setAudioTabKey('s3');
    setAudioInputModalVisible(true);
  });
  return (
    <>
      <div className={styles['ppt-editor']}>
        <div className={styles['layout-header']}>
          {/* <EditorHeader /> */}
          <TopToolbar
            title={projectDetail?.projectName || 'Untitled PPT'}
            lastSavedTime={projectDetail?.createTime}

            isCompleted={projectDetail?.status === PptProjectStatus.Completed || projectDetail?.status === PptProjectStatus.Failed}
            onBack={onBack}
            onPreview={(fromCurrent) => {
              if (fromCurrent) {
                enterScreening();
              } else {
                enterScreeningFromStart();
              }
            }}
            onSave={generatingPpt ? null : handleSave}
            onExport={generatingPpt ? null : handleExport}
            isExporting={isPolling}


            centerSlot={
              <ClassicModeToolbar
                onAddText={handleAddText}
                onOpenImageModal={handleOpenImageModal}
                onAddShape={handleAddShape}
                onAddLine={handleAddLine}
                onAddChart={handleAddChart}
                onAddTable={handleAddTable}
                onAddMath={handleAddMath}
                onOpenVideoModal={handleOpenVideoModal}
                onOpenAudioModal={handleOpenAudioModal}
              />
            }
          />
        </div>
        <div className={styles['layout-content']}>
          {!isMobile && (
            <div className={styles['layout-content-left']}>
              <Thumbnails
                onAddBlankSlide={onAddBlankSlide}
                onAddTemplateSlide={onAddTemplateSlide}
                onAddAIGeneratedSlide={onAddAIGeneratedSlide}
                onLoadMoreSlides={onLoadMoreSlides}
                hasMoreSlides={hasMoreSlides}
                loadingMoreSlides={loadingMoreSlides}
              />
            </div>
          )}
          <div className={styles['layout-content-center']}>
            {/* <div className={styles['center-top']}>
              <CanvasTool />
            </div> */}
            <div className={styles['center-body']} style={{ height: `calc(100% - ${remarkHeight}px)` }}>
              <Canvas />
            </div>
            <div className={styles['center-bottom']} style={{ height: `${remarkHeight}px` }}>
              <Remark height={remarkHeight} onHeightChange={setRemarkHeight} />
            </div>
            {createMode === 'classic' && !hideFloatButton && !isMobile && (
              <ConfigProvider
                theme={{
                  components: {
                    FloatButton: {
                      controlHeightLG: 52,
                    },
                  },
                }}
              >
                <FloatButton.Group
                  shape="square"
                  style={{
                    bottom: '50%',
                    transform: 'translateY(50%)',
                    right: 0,
                    background: 'transparent',
                  }}
                >
                  {layoutAvailability.canClick && (
                    <Button
                      icon={<Icon icon="local:ppt/icon-layout" />}
                      type="text"
                      className="flex flex-col gap-0 h-12 text-xs w-12"
                      onClick={() => setIsLayoutDrawerOpen(true)}
                    >
                      布局
                    </Button>
                  )}

                  <Button
                    icon={<Icon icon="local:icon-ppt-background" width='20' height='20' />}
                    type="text"
                    className="flex flex-col gap-0 h-12 text-xs w-12"
                    onClick={() => setIsBackgroundDrawerOpen(true)}
                  >
                    背景
                  </Button>
                  <Button
                    icon={<Icon icon="local:ppt/icon-magic" />}
                    type="text"
                    className="flex flex-col gap-0 h-12 text-xs w-12"
                    onClick={() => setIsTemplateDrawerOpen(true)}
                  >
                    模板
                  </Button>
                  <Button
                    icon={<Icon icon="local:ppt/icon-palette" />}
                    type="text"
                    className="flex flex-col gap-0 h-12 text-xs w-12"
                    onClick={() => setIsThemeDrawerOpen(true)}
                  >
                    主题
                  </Button>
                </FloatButton.Group>
              </ConfigProvider>
            )}
          </div>
          {/* <div className={styles['layout-content-right']}>
            <Toolbar />
          </div> */}
          {!isMobile && <RightToolbar />}
        </div>
        <div className={styles['layout-footer']}>
          <BottomToolbar
            currentIndex={slideIndex}
            totalSlides={totalPages || slides.length}
            scale={canvasScale}
            canUndo={canUndo}
            canRedo={canRedo}
            showNotes={remarkHeight > 0}
            onUndo={() => {
              isApplyingSnapshotRef.current = true;
              undo();
            }}
            onRedo={() => {
              isApplyingSnapshotRef.current = true;
              redo();
            }}
            onScaleChange={(scale) => {
              if (scale > canvasScale) {
                scaleCanvas('+');
              } else if (scale < canvasScale) {
                scaleCanvas('-');
              } else {
                setCanvasScaleByRatio(scale);
              }
            }}
            onFitToScreen={resetCanvas}
            onToggleNotes={handleToggleNotes}
            onPlay={(fromCurrent) => {
              if (fromCurrent) {
                enterScreening();
              } else {
                enterScreeningFromStart();
              }
            }}
          />
        </div>
      </div>

      {showSelectPanel && <SelectPanel />}
      {showSearchPanel && <SearchPanel />}
      {/* {showNotesPanel && <NotesPanel />} */}
      {showMarkupPanel && <MarkupPanel />}
      {showSymbolPanel && <SymbolPanel />}

      <Modal
        open={!!dialogForExport}
        width={680}
        footer={null}
        onCancel={() => setDialogForExport('')}
        destroyOnHidden
      >
        <ExportDialog />
      </Modal>

      <Modal
        open={showAIPPTDialog}
        width={720}
        footer={null}
        maskClosable={false}
        keyboard={false}
        onCancel={() => setShowAIPPTDialog(false)}
        destroyOnHidden
      >
        <AIPPTDialog />
      </Modal>

      <Modal
        title="插入图片"
        open={imageInputModalVisible}
        onOk={handleImageInputOk}
        onCancel={resetImageModal}
        okText="确定"
        cancelText="取消"
        width={850}
        destroyOnHidden
      >
        <Tabs
          activeKey={imageTabKey}
          onChange={(key) => setImageTabKey(key as 's3' | 'url')}
          items={[
            {
              key: 's3',
              label: 'S3 上传',
              children: (
                <div style={{ paddingTop: '12px' }}>
                  <S3Uploader
                    uploadPath={elementUploadPath}
                    uploadTypes="preset:pic"
                    uploadMaxCount={1}
                    getUploadTarget={getPptElementUploadTarget}
                    onSuccess={(data: any) => {
                      const url = resolveUploadUrl(data);
                      if (url) {
                        setUploadedImageUrl(url);
                      }
                    }}
                    onError={(error) => {
                      message.error('图片上传失败: ' + error.message);
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'url',
              label: '网络地址',
              children: (
                <div style={{ paddingTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                    输入图片 URL
                  </label>
                  <Input.TextArea
                    rows={4}
                    value={imageInputValue}
                    onChange={(e) => setImageInputValue(e.target.value)}
                    placeholder="例如：https://example.com/image.jpg"
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <Modal
        title="插入视频"
        open={videoInputModalVisible}
        onOk={handleVideoInputOk}
        onCancel={resetVideoModal}
        okText="确定"
        cancelText="取消"
        width={850}
        destroyOnHidden
      >
        <Tabs
          activeKey={videoTabKey}
          onChange={(key) => setVideoTabKey(key as 's3' | 'url')}
          items={[
            {
              key: 's3',
              label: 'S3 上传',
              children: (
                <div style={{ paddingTop: '12px' }}>
                  <S3Uploader
                    uploadPath={elementUploadPath}
                    uploadTypes={videoUploadTypes}
                    uploadMaxCount={1}
                    getUploadTarget={getPptElementUploadTarget}
                    onSuccess={(data: any) => {
                      const url = resolveUploadUrl(data);
                      if (url) {
                        setUploadedVideoUrl(url);
                      }
                    }}
                    onError={(error) => {
                      message.error('视频上传失败: ' + error.message);
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'url',
              label: '网络地址',
              children: (
                <div style={{ paddingTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                    输入视频 URL
                  </label>
                  <Input.TextArea
                    rows={4}
                    value={videoInputValue}
                    onChange={(e) => setVideoInputValue(e.target.value)}
                    placeholder="例如：https://example.com/video.mp4"
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <Modal
        title="插入音频"
        open={audioInputModalVisible}
        onOk={handleAudioInputOk}
        onCancel={resetAudioModal}
        okText="确定"
        cancelText="取消"
        width={850}
        destroyOnHidden
      >
        <Tabs
          activeKey={audioTabKey}
          onChange={(key) => setAudioTabKey(key as 's3' | 'url')}
          items={[
            {
              key: 's3',
              label: 'S3 上传',
              children: (
                <div style={{ paddingTop: '12px' }}>
                  <S3Uploader
                    uploadPath={elementUploadPath}
                    uploadTypes={audioUploadTypes}
                    uploadMaxCount={1}
                    getUploadTarget={getPptElementUploadTarget}
                    onSuccess={(data: any) => {
                      const url = resolveUploadUrl(data);
                      if (url) {
                        setUploadedAudioUrl(url);
                      }
                    }}
                    onError={(error) => {
                      message.error('音频上传失败: ' + error.message);
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'url',
              label: '网络地址',
              children: (
                <div style={{ paddingTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                    输入音频 URL
                  </label>
                  <Input.TextArea
                    rows={4}
                    value={audioInputValue}
                    onChange={(e) => setAudioInputValue(e.target.value)}
                    placeholder="例如：https://example.com/audio.mp3"
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {createMode === 'classic' && slideId && (
        <LayoutDrawer
          isOpen={isLayoutDrawerOpen}
          slideId={slideId}

          onClose={() => setIsLayoutDrawerOpen(false)}
          onDataReload={handleReloadPptData}
          layoutAvailability={layoutAvailability}
          themeColors={themeColors}
        />
      )}
      {createMode === 'classic' && (
        <TemplateDrawer
          isOpen={isTemplateDrawerOpen}
          projectId={projectId}
          createMode={createMode}
          onClose={() => setIsTemplateDrawerOpen(false)}
          onDataReload={handleReloadPptData}
        />
      )}
      {createMode === 'classic' && (
        <ThemeDrawer
          isOpen={isThemeDrawerOpen}
          projectId={projectId}
          onClose={() => setIsThemeDrawerOpen(false)}
          onThemeSelect={(theme) => handleThemeSelect(theme)}
        />
      )}
      {createMode === 'classic' && (
        <BackgroundDrawer
          isOpen={isBackgroundDrawerOpen}
          onClose={() => setIsBackgroundDrawerOpen(false)}
        />
      )}
    </>
  )
}
