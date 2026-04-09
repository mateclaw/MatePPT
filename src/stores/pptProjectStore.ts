import { create } from 'zustand';
import { PptProjectPo } from '@/models/pptProjectPo';
import { PptProjectService } from '@/services/pptProject.service';
import { ClassicService } from "@/services/classic.service";
import { CreationService } from "@/services/creation.service";


import { PptProjectSlideService } from '@/services/pptProjectSlide.service';
import { lastValueFrom } from 'rxjs';
import { OutlineService } from '@/services/outline.service';
import { OutlineSlideVo } from '@/models/outlineSlideVo';
import { PptProjectSlidePo } from '@/models/pptProjectSlidePo';
import { PPTElement, PPTSlide, PPTTheme } from '@/ppt/core';
import { SlideSerializer } from '@/ppt/classic/serializer/SlideSerializer';
import { SlideParser } from '@/ppt/classic/parser/SlideParser';
import type { FilterCriteria } from '@/ppt/classic/components/PptTemplateSelector';

export type CreationViewMode = 'ppt' | 'code' | 'dual' | 'visual';
export const CreateMode = {
  Classic: 'classic',
  Creative: 'creative',
  None: null
} as const;

// export type CreateMode = 'classic' | 'creative' | null;
export type CreateMode = typeof CreateMode[keyof typeof CreateMode];

const DEFAULT_CLASSIC_VIEWPORT_RATIO = 0.5625;

const normalizeCreateMode = (raw: unknown): CreateMode => {
  if (!raw) return null;
  const lowered = String(raw).toLowerCase();
  if (lowered === 'classic') return 'classic';
  if (lowered === 'creative') return 'creative';
  return null;
};

const parseJsonIfNeeded = <T>(raw: T | string): T | null => {
  if (!raw) return null;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('解析JSON失败:', error);
    return null;
  }
};

export interface PptDocumentData {
  title?: string;
  theme?: PPTTheme | Record<string, unknown> | null;
  width?: number;
  height?: number;
  slides: PptProjectSlidePo[];
  totalPages?: number;
}

interface PptProjectState {
  // 项目基本信息
  projectId: string | null;
  projectDetail: PptProjectPo | null;
  projectDetailLoading: boolean;
  createMode: CreateMode;

  // 大纲相关
  outlineData: OutlineSlideVo[] | null;
  outlineGenerating: boolean;

  // PPT 数据（通用于经典模式和创意模式）
  pptData: PptDocumentData | null;
  displayPptData: PptDocumentData | null;
  generatingPpt: boolean;
  receivedSlides: PptProjectSlidePo[];
  totalPages: number;

  // 创意模式特有的缓冲状态
  creationCompletedSlides: PptProjectSlidePo[];
  creationCurrentHtml: string;
  creationModeView: CreationViewMode;

  // 创意模式分页加载
  creationSlidesPage: number;
  creationSlidesPageSize: number;
  creationSlidesAllLoaded: boolean;
  loadingCreationSlides: boolean;
  // 经典模式分页加载
  classicSlidesPage: number;
  classicSlidesPageSize: number;
  classicSlidesAllLoaded: boolean;
  loadingClassicSlides: boolean;

  // 编辑器状态
  currentSlideIndex: number;
  selectedElement: PPTElement | null;

  // 用户输入信息
  userInput: string;
  selectedLanguage: string;
  selectedPageRange: string;

  // 模板选择
  selectedTemplateId: string | null;
  selectedTemplateFilter: FilterCriteria | null;

  // Actions
  setProjectId: (projectId: string) => void;
  setProjectDetail: (detail: PptProjectPo) => void;
  setProjectDetailLoading: (loading: boolean) => void;
  setCreateMode: (type: CreateMode) => void;

  setOutlineData: (data: OutlineSlideVo[]) => void;
  setOutlineGenerating: (loading: boolean) => void;

  setPptData: (data: PptDocumentData | null) => void;
  setDisplayPptData: (data: PptDocumentData | null) => void;
  setGeneratingPpt: (generating: boolean) => void;
  setReceivedSlides: (slides: PptProjectSlidePo[]) => void;
  setTotalPages: (pages: number) => void;

  // 创意模式相关 Actions
  setCreationCompletedSlides: (slides: PptProjectSlidePo[]) => void;
  setCreationCurrentHtml: (html: string) => void;
  setCreationModeView: (mode: CreationViewMode) => void;
  setCreationSlidesPage: (page: number) => void;
  setCreationSlidesPageSize: (size: number) => void;
  setCreationSlidesAllLoaded: (loaded: boolean) => void;
  setLoadingCreationSlides: (loading: boolean) => void;
  setClassicSlidesPage: (page: number) => void;
  setClassicSlidesPageSize: (size: number) => void;
  setClassicSlidesAllLoaded: (loaded: boolean) => void;
  setLoadingClassicSlides: (loading: boolean) => void;

  setCurrentSlideIndex: (index: number) => void;
  setSelectedElement: (element: PPTElement | null) => void;

  setUserInput: (input: string) => void;
  setSelectedLanguage: (lang: string) => void;
  setSelectedPageRange: (range: string) => void;

  setSelectedTemplateId: (id: string | null) => void;
  setSelectedTemplateFilter: (filter: FilterCriteria | null) => void;

  // 异步 Action
  verifyAndLoadProject: (projectId: string) => Promise<void>;
  loadProjectDetail: (projectId: string) => Promise<void>;
  loadCreationExistingSlides: (projectId: string, page?: number, pageSize?: number) => Promise<boolean>;
  setOutlineDataWithSync: (data: OutlineSlideVo[]) => void;
  saveOutlineToBackend: (projectId: string, outlineData: OutlineSlideVo[]) => Promise<boolean>;
  saveSelectedTemplate: (templateId: string, filter: FilterCriteria, createMode?: 'classic' | 'creative') => void;
  clearSelectedTemplate: () => void;
  saveProjectDetailToBackend: (projectDetail: PptProjectPo) => Promise<boolean>;
  loadClassicSlides: (projectId: string, detail?: PptProjectPo, page?: number, pageSize?: number) => Promise<void>;
  saveClassicSlidesToBackend: (projectId: string, slides: PPTSlide[]) => Promise<boolean>;

  // 插入新页面的统一方法（包括数据更新、索引切换、缩略图生成）
  insertSlideAtPosition: (newSlide: PptProjectSlidePo, insertIndex: number, onGenerateThumbnail?: (slide: PptProjectSlidePo, index: number) => Promise<void>) => Promise<void>;

  // 重置状态
  resetProject: () => void;
}

const initialState = {
  projectId: null,
  projectDetail: null,
  projectDetailLoading: false,
  createMode: null,
  outlineData: null,
  outlineGenerating: false,
  pptData: null,
  displayPptData: { slides: [], totalPages: 0 },
  generatingPpt: false,
  receivedSlides: [],
  totalPages: 0,
  creationCompletedSlides: [],
  creationCurrentHtml: '',
  creationModeView: 'code' as CreationViewMode,
  creationSlidesPage: 1,
  creationSlidesPageSize: 5,
  creationSlidesAllLoaded: false,
  loadingCreationSlides: false,
  classicSlidesPage: 1,
  classicSlidesPageSize: 10,
  classicSlidesAllLoaded: false,
  loadingClassicSlides: false,
  currentSlideIndex: 0,
  selectedElement: null,
  userInput: '',
  selectedLanguage: 'zh-CN',
  selectedPageRange: '10-15',
  selectedTemplateId: null,
  selectedTemplateFilter: null,
};

const pptProjectService = PptProjectService.getInstance();
const classicService = ClassicService.getInstance();
const creationService = CreationService.getInstance();
const pptProjectSlideService = PptProjectSlideService.getInstance();
const outlineService = OutlineService.getInstance();


export const usePptProjectStore = create<PptProjectState>((set, get) => ({
  ...initialState,

  setProjectId: (projectId) => set({ projectId: projectId }),
  setProjectDetail: (detail) => set({
    projectDetail: detail,
    // 避免沿用上一个项目的类型，若后端未返回则置空
    createMode: normalizeCreateMode(detail.createMode),
  }),
  setProjectDetailLoading: (loading) => set({ projectDetailLoading: loading }),
  setCreateMode: (type) => {
    set({ createMode: normalizeCreateMode(type) });
    const currentDetail = get().projectDetail;
    if (currentDetail) {
      set({ projectDetail: { ...currentDetail, createMode: normalizeCreateMode(type) } });
    }
  },

  setOutlineData: (data) => set({ outlineData: data }),
  setOutlineGenerating: (loading) => set({ outlineGenerating: loading }),

  setPptData: (data) => set({ pptData: data }),
  setDisplayPptData: (data) => set({ displayPptData: data }),
  setGeneratingPpt: (generating) => set({ generatingPpt: generating }),
  setReceivedSlides: (slides) => set({ receivedSlides: slides }),
  setTotalPages: (pages) => set({ totalPages: pages }),

  // 创意模式相关
  setCreationCompletedSlides: (slides) => set({ creationCompletedSlides: slides }),
  setCreationCurrentHtml: (html) => set({ creationCurrentHtml: html }),
  setCreationModeView: (mode) => set({ creationModeView: mode }),
  setCreationSlidesPage: (page) => set({ creationSlidesPage: page }),
  setCreationSlidesPageSize: (size) => set({ creationSlidesPageSize: size }),
  setCreationSlidesAllLoaded: (loaded) => set({ creationSlidesAllLoaded: loaded }),
  setLoadingCreationSlides: (loading) => set({ loadingCreationSlides: loading }),
  setClassicSlidesPage: (page) => set({ classicSlidesPage: page }),
  setClassicSlidesPageSize: (size) => set({ classicSlidesPageSize: size }),
  setClassicSlidesAllLoaded: (loaded) => set({ classicSlidesAllLoaded: loaded }),
  setLoadingClassicSlides: (loading) => set({ loadingClassicSlides: loading }),

  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
  setSelectedElement: (element) => set({ selectedElement: element }),

  setUserInput: (input) => set({ userInput: input }),
  setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
  setSelectedPageRange: (range) => set({ selectedPageRange: range }),

  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
  setSelectedTemplateFilter: (filter) => set({ selectedTemplateFilter: filter }),

  // 验证并加载项目详情（包括 outline）
  verifyAndLoadProject: async (projectId: string) => {
    set({ projectDetailLoading: true, projectDetail: null,outlineData:[] });
    try {
      const res = await lastValueFrom(
        pptProjectService.detail({ projectId } as PptProjectPo)
      );
      const projectData = res.data;
      const incomingCreateMode = normalizeCreateMode(projectData?.createMode);
      if (!incomingCreateMode) {
        console.warn('警告: 返回的项目数据中没有createMode字段', projectData);
      }

      if (incomingCreateMode === 'classic') {
        await get().loadClassicSlides(projectId, projectData, 1, 10);
      }

      // 如果项目中有大纲数据，同时更新 outlineData
      if (projectData.outline) {
        try {
          let outline = null;
          if (typeof projectData.outline === 'string') {
            outline = JSON.parse(projectData.outline);
          }
          else {
            outline = projectData.outline;
          }
          set({
            projectId: projectId,
            projectDetail: projectData,
            createMode: incomingCreateMode ?? null,
            outlineData: outline,
            projectDetailLoading: false,
            totalPages: outline.pageCount
          });

          console.log('项目数据已更新', incomingCreateMode);
        } catch (parseError) {
          console.error('解析大纲失败:', parseError);
          set({
            projectId: projectId,
            projectDetail: projectData,
            createMode: incomingCreateMode ?? null,
            projectDetailLoading: false
          });
        }
      } else {
        set({
          projectId: projectId,
          projectDetail: projectData,
          createMode: incomingCreateMode ?? null,
          projectDetailLoading: false
        });
      }
    } catch (error) {
      set({ projectDetailLoading: false });
      throw error;
    }
  },

  // 单独的加载 projectDetail 方法（用于已有 projectId 的场景）
  loadProjectDetail: async (projectId: string) => {
    set({ projectDetailLoading: true });
    try {
      const res = await lastValueFrom(
        pptProjectService.detail({ projectId } as PptProjectPo)
      );
      const projectData = res.data as PptProjectPo;
      const incomingCreateMode = normalizeCreateMode(projectData?.createMode);


      if (incomingCreateMode === 'classic') {
        await get().loadClassicSlides(projectId, projectData, 1, 10);
      }
      // 如果项目中有大纲数据，同时更新 outlineData
      if (projectData.outline) {
        try {
          let outline: OutlineSlideVo[] = null;
          if (typeof projectData.outline === 'string') {
            outline = JSON.parse(projectData.outline);
          } else {
            outline = projectData.outline;
          }
          set({
            projectDetail: projectData,
            createMode: incomingCreateMode ?? null,
            outlineData: outline,
            projectDetailLoading: false
          });
        } catch (parseError) {
          console.error('解析大纲失败:', parseError);
          set({
            projectDetail: projectData,
            createMode: incomingCreateMode ?? null,
            projectDetailLoading: false
          });
        }
      } else {
        set({
          projectDetail: projectData,
          createMode: incomingCreateMode ?? null,
          projectDetailLoading: false
        });
      }
    } catch (error) {
      set({ projectDetailLoading: false });
      throw error;
    }
  },

  // 加载创意模式已存在的幻灯片（支持分页），返回 true 表示有幻灯片，false 表示没有
  loadCreationExistingSlides: async (projectId: string, page: number = 1, pageSize: number = 10): Promise<boolean> => {
    if (page === 1) {
      set({ loadingCreationSlides: true, creationSlidesPage: 1, creationSlidesPageSize: pageSize, creationSlidesAllLoaded: false });
    }

    try {
      console.log(`[creation] 加载第 ${page} 页幻灯片，每页${pageSize}条`);

      const res = await lastValueFrom(
        pptProjectSlideService.list({
          projectId,
          pageNum: page,
          pageSize: pageSize
        } as PptProjectSlidePo)
      );

      if (res.data && res.data.length > 0) {
        console.log(`[creation] 第 ${page} 页加载成功，共 ${res.data.length} 条数据`);
        const slides = (res.data as PptProjectSlidePo[]).map((slide) => ({
          ...slide,
          status: slide.status || (slide.slideHtml ? 'finished' : 'running'),
        }));
        const { displayPptData, outlineData } = get();

        if (page === 1) {
          // 首页：直接设置
          set({
            displayPptData: {
              slides: slides,
              totalPages: outlineData?.length || slides.length,
            },
            totalPages: outlineData?.length || slides.length,
            receivedSlides: slides,
            generatingPpt: false,
            creationModeView: 'ppt',
            loadingCreationSlides: false
          });
          console.log('[creation] 首页加载完成，共', outlineData?.length || slides.length, '页');
        } else {
          // 后续页：追加数据
          const existingSlides = displayPptData?.slides || [];
          const mergedSlides = [...existingSlides, ...slides];

          set({
            displayPptData: {
              ...displayPptData,
              slides: mergedSlides,
            },
            receivedSlides: mergedSlides
          });
          console.log(`[creation] 第 ${page} 页数据已追加，目前共 ${mergedSlides.length} 条数据`);
        }

        // 检查是否还有下一页
        if (slides.length < pageSize) {
          console.log('[creation] 已加载全部幻灯片');
          set({ creationSlidesAllLoaded: true });
        } else {
          // 页面已满，可能还有下一页
          set({ creationSlidesPage: page + 1 });
        }
        return true; // 有幻灯片
      } else {
        // 没有已有幻灯片
        if (page === 1) {
          console.log('[creation] 没有已生成的幻灯片，需要新生成');
          set({ loadingCreationSlides: false });
        }
        return false; // 没有幻灯片
      }
    } catch (error) {
      console.error(`[creation] 加载第 ${page} 页失败:`, error);
      if (page === 1) {
        set({ loadingCreationSlides: false });
      }
      throw error;
    }
  },

  // ... existing code ...

  // 保存大纲到 store 并更新 projectDetail 中的大纲
  setOutlineDataWithSync: (data: OutlineSlideVo[]) => {
    set({ outlineData: data });
    // 同时更新 projectDetail 中的大纲数据（用于后续保存到后端）
    const currentDetail = get().projectDetail;
    if (currentDetail) {
      set({
        projectDetail: {
          ...currentDetail,
          outline: data
        }
      });
    }
  },

  // 保存大纲修改到后端
  saveOutlineToBackend: async (projectId: string, outlineData: OutlineSlideVo[]) => {
    try {
      await lastValueFrom(
        outlineService.updateOutline({
          projectId,
          outline: outlineData
        } as PptProjectPo)
      );
      // 保存成功后，同时更新 store 中的数据
      set({ outlineData: outlineData });
      return true;
    } catch (error) {
      console.error('保存大纲到后端失败:', error);
      throw error;
    }
  },


  // 保存选中的模板到 store
  saveSelectedTemplate: (templateId: string, filter: FilterCriteria, createMode?: 'classic' | 'creative') => {
    set({
      selectedTemplateId: templateId,
      selectedTemplateFilter: filter,
      createMode: createMode || get().createMode,
    });
    if (createMode && get().projectDetail) {
      const detail = get().projectDetail!;
      set({ projectDetail: { ...detail, createMode: createMode } });
    }
  },

  clearSelectedTemplate: () => {
    set({
      selectedTemplateId: null,
      selectedTemplateFilter: null
    });
  },

  // 保存projectDetail到后台
  saveProjectDetailToBackend: async (projectDetail: PptProjectPo) => {
    set({ projectDetail });
    try {
      await lastValueFrom(
        pptProjectService.update(projectDetail)
      );
      return true;
    } catch (error) {
      console.error('保存项目详情到后端失败:', error);
      throw error;
    }
  },

  // 加载经典模式的 slides 数据（分页）
  loadClassicSlides: async (projectId: string, detail?: PptProjectPo, page: number = 1, pageSize: number = 10) => {
    const currentDetail = detail || get().projectDetail;
    if (!currentDetail) return;
    if (page === 1) {
      set({ loadingClassicSlides: true, classicSlidesPage: 1, classicSlidesPageSize: pageSize, classicSlidesAllLoaded: false });
    }
    try {
      const res = await lastValueFrom(
        pptProjectSlideService.list({ projectId, pageNum: page, pageSize } as PptProjectSlidePo)
      );
      const slidesData = Array.isArray(res.data) ? res.data as PptProjectSlidePo[] : [];
      const parsedSlides = slidesData.map((item) => {
        const rawSlideJson = parseJsonIfNeeded<unknown>(item.slideJson) || item.slideJson;
        const parsedSlide = SlideParser.parse(rawSlideJson) || (rawSlideJson as PPTSlide | undefined);
        const slideType = item.slideType || parsedSlide?.type || '';
        const slideNo = item.slideNo || 0;
        return {
          ...item,
          slideJson: (parsedSlide || rawSlideJson) as PPTSlide,
          slideType,
          slideNo,
        };
      });

      const theme = parseJsonIfNeeded<PPTTheme>(currentDetail.theme) || currentDetail.theme;
      const width = currentDetail.width || 1280;
      const height = currentDetail.height || Math.round(width * DEFAULT_CLASSIC_VIEWPORT_RATIO);
      const totalFromRes = typeof res.total === 'number' && res.total > 0 ? res.total : undefined;
      const currentDisplay = get().displayPptData || { slides: [] };
      const mergedSlides = page === 1 ? parsedSlides : [...(currentDisplay.slides || []), ...parsedSlides];
      const displayData = {
        title: currentDetail.projectName  || '未命名演示文稿',
        theme: theme || undefined,
        width,
        height,
        slides: mergedSlides,
        totalPages: totalFromRes ?? mergedSlides.length,
      };

      set({
        displayPptData: displayData,
        pptData: displayData,
        receivedSlides: mergedSlides,
        totalPages: totalFromRes ?? mergedSlides.length,
        loadingClassicSlides: false,
      });

      const hasAll = typeof totalFromRes === 'number'
        ? mergedSlides.length >= totalFromRes
        : parsedSlides.length < pageSize;
      if (hasAll) {
        set({ classicSlidesAllLoaded: true });
      } else {
        set({ classicSlidesPage: page + 1 });
      }
    } catch (error) {
      console.error('[classic] 加载幻灯片失败:', error);
      set({ loadingClassicSlides: false });
      throw error;
    }
  },

  // 保存经典模式 slides 到后端
  saveClassicSlidesToBackend: async (projectId: string, slides: PPTSlide[]) => {
    try {
      console.log('[classic] 保存幻灯片数据:', slides);
      const payload = (slides || [])
        .map((slide, index: number) => {

          const {
            slideId,
            projectId: slideProjectId,
            slideNo,
            slideType,
            contentJson,
            dirty,
          } = slide as PPTSlide & { slideId?: string; projectId?: string; slideNo?: number; slideType?: string; contentJson?: unknown; dirty?: boolean };
          const normalizedSlideNo = slideNo || index + 1;
          const normalizedSlideType = slideType || slide.type || '';
          return {
            slideId,
            projectId: slideProjectId || projectId,
            slideNo: normalizedSlideNo,
            slideType: normalizedSlideType,
            slideJson: SlideSerializer.serialize(slide as PPTSlide),

            // contentJson: contentJson || '',
          } as PptProjectSlidePo;
        });


      if (!payload.length) {
        console.warn('[classic] 没有可保存的幻灯片数据');
        return false;
      }

      await lastValueFrom(
        pptProjectSlideService.updateBatch(payload as PptProjectSlidePo[])
      );
      return true;
    } catch (error) {
      console.error('保存经典模式幻灯片失败:', error);
      throw error;
    }
  },

  // 插入新页面的统一方法，包括：
  // 1. 更新 displayPptData 中的 slides 数组，插入到指定位置
  // 2. 丘换 currentSlideIndex 到新插入的页面
  // 3. 调用回调执行缩略图生成等副作用
  insertSlideAtPosition: async (newSlide: PptProjectSlidePo, insertIndex: number, onGenerateThumbnail?: (slide: PptProjectSlidePo, index: number) => Promise<void>) => {
    const currentData = get().displayPptData || { slides: [], totalPages: 0 };
    const currentSlides = currentData.slides || [];

    // 插入新页面
    const updatedSlides = [
      ...currentSlides.slice(0, insertIndex),
      newSlide,
      ...currentSlides.slice(insertIndex).map((slide, index) => {
        return {
          ...slide,
          slideNo: insertIndex + index + 1
        };
      })
    ];

    // 更新整个 PPT 数据
    const updatedData = {
      ...currentData,
      totalPages: currentData.totalPages ? currentData.totalPages + 1 : updatedSlides.length,
      slides: updatedSlides
    };

    set({
      displayPptData: updatedData,
      currentSlideIndex: insertIndex
    });

    console.log('[insertSlideAtPosition] 插入新页面，当前索引:', updatedData);
    // 执行缩略图生成回调
    if (onGenerateThumbnail) {
      try {


        onGenerateThumbnail(newSlide, insertIndex);



      } catch (error) {
        console.error('缩略图生成失败:', error);
      }
    }
  },

  // 重置项目状态
  resetProject: () => set(initialState),
}));
