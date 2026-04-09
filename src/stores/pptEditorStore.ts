/**
 * PPT 编辑器状态管理 (Zustand)
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { PPTDocument, PPTSlide } from '@/ppt/slide-editor';
import type { PPTElement as PPTElementType } from '@/ppt/slide-editor';

// 判断元素是否需要计入组内元素数
function isCountableElement(element: PPTElementType | undefined | null): boolean {
  if (!element) return false;
  const type = (element as any).type;
  if (type === 'text' || type === 'image' || type === 'chart') return true;
  if (type === 'shape' && (element as any).text) return true;
  return false;
}

/**
 * 编辑器选中状态
 */
export interface SelectionState {
  /** 选中的元素 ID 列表 */
  selectedElementIds: string[];
  /** 当前活跃的幻灯片 ID */
  activeSlideId: string;
  /** 是否多选模式 */
  multiSelect: boolean;
}

/**
 * 历史记录项
 */
export interface HistoryRecord {
  timestamp: number;
  document: PPTDocument;
  selectionState: SelectionState;
  description: string;
}

/**
 * PPT 编辑器状态类型
 */
export interface PPTEditorState {
  // 文档相关
  document: PPTDocument | null;
  
  // 选中状态
  selection: SelectionState;
  
  // 历史记录
  history: HistoryRecord[];
  historyIndex: number;
  maxHistorySize: number;
  
  // 编辑模式
  isEditing: boolean;
  editingElementId?: string;
  
  // 视图状态
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showRuler: boolean;

  // 布局可用性
  getLayoutAvailability: () => { groupCount: number; elementCount: number; canClick: boolean };
  
  // 文档操作
  setDocument: (document: PPTDocument) => void;
  createNewDocument: (width?: number, height?: number) => void;
  
  // 幻灯片操作
  setActiveSlide: (slideId: string) => void;
  getActiveSlide: () => PPTSlide | undefined;
  addSlide: (index?: number) => void;
  removeSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  
  // 元素选中操作
  selectElement: (elementId: string, multiSelect?: boolean) => void;
  deselectElement: (elementId: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  isElementSelected: (elementId: string) => boolean;
  getSelectedElements: () => PPTElementType[];
  
  // 元素编辑操作
  startEditElement: (elementId: string) => void;
  stopEditElement: () => void;
  updateElement: (elementId: string, updates: Partial<PPTElementType>) => void;
  deleteElement: (elementId: string) => void;
  deleteSelectedElements: () => void;
  duplicateElement: (elementId: string) => void;
  addElement: (element: PPTElementType) => void;
  
  // 元素排序操作
  bringToFront: (elementId: string) => void;
  sendToBack: (elementId: string) => void;
  bringForward: (elementId: string) => void;
  sendBackward: (elementId: string) => void;
  
  // 历史记录操作
  pushHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // 视图操作
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  toggleGrid: () => void;
  toggleRuler: () => void;
}

/**
 * 创建 PPT 编辑器 Store
 */
export const usePPTEditorStore = create<PPTEditorState>()(
  devtools(
    immer((set, get) => ({
      // 初始状态
      document: null,
      selection: {
        selectedElementIds: [],
        activeSlideId: '',
        multiSelect: false,
      },
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      isEditing: false,
      zoom: 1,
      panX: 0,
      panY: 0,
      showGrid: true,
      showRuler: true,

      // 文档操作
      setDocument: (document) => {
        set((state) => {
          state.document = document;
          if (document.slides.length > 0) {
            state.selection.activeSlideId = document.slides[0].id;
          }
          state.history = [];
          state.historyIndex = -1;
        });
      },

      createNewDocument: (width = 960, height = 540) => {
        const document = new PPTDocument({
          width,
          height,
          slides: [
            new PPTSlide({
              id: `slide-${Date.now()}`,
              background: { type: 'solid', color: '#ffffff' },
            }),
          ],
        });
        get().setDocument(document);
      },

      // 幻灯片操作
      setActiveSlide: (slideId) => {
        set((state) => {
          if (state.document?.getSlideById(slideId)) {
            state.selection.activeSlideId = slideId;
            state.selection.selectedElementIds = [];
          }
        });
      },

      getActiveSlide: () => {
        const state = get();
        if (!state.document) return undefined;
        return state.document.getSlideById(state.selection.activeSlideId);
      },

      addSlide: (index) => {
        set((state) => {
          if (!state.document) return;
          const newSlide = new PPTSlide({
            id: `slide-${Date.now()}`,
            background: { type: 'solid', color: '#ffffff' },
          });
          state.document.addSlide(newSlide, index);
          state.selection.activeSlideId = newSlide.id;
        });
        get().pushHistory('Add slide');
      },

      removeSlide: (slideId) => {
        set((state) => {
          if (!state.document) return;
          const index = state.document.slides.findIndex((s) => s.id === slideId);
          state.document.removeSlide(slideId);
          
          if (state.selection.activeSlideId === slideId) {
            const newIndex = Math.max(0, index - 1);
            const newSlide = state.document.slides[newIndex];
            state.selection.activeSlideId = newSlide?.id || '';
          }
        });
        get().pushHistory('Remove slide');
      },

      duplicateSlide: (slideId) => {
        set((state) => {
          if (!state.document) return;
          const slide = state.document.getSlideById(slideId);
          if (!slide) return;
          
          const clonedSlide = slide.clone();
          clonedSlide.id = `slide-${Date.now()}`;
          
          const index = state.document.slides.findIndex((s) => s.id === slideId);
          state.document.addSlide(clonedSlide, index + 1);
          state.selection.activeSlideId = clonedSlide.id;
        });
        get().pushHistory('Duplicate slide');
      },

      reorderSlides: (fromIndex, toIndex) => {
        set((state) => {
          if (!state.document) return;
          state.document.moveSlide(fromIndex, toIndex);
        });
        get().pushHistory('Reorder slides');
      },

      // 元素选中操作
      selectElement: (elementId, multiSelect = false) => {
        set((state) => {
          if (!multiSelect) {
            state.selection.selectedElementIds = [elementId];
          } else {
            if (!state.selection.selectedElementIds.includes(elementId)) {
              state.selection.selectedElementIds.push(elementId);
            }
          }
        });
      },

      deselectElement: (elementId) => {
        set((state) => {
          state.selection.selectedElementIds = state.selection.selectedElementIds.filter(
            (id) => id !== elementId
          );
        });
      },

      clearSelection: () => {
        set((state) => {
          state.selection.selectedElementIds = [];
          state.isEditing = false;
          state.editingElementId = undefined;
        });
      },

      selectAll: () => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            state.selection.selectedElementIds = activeSlide.elements.map((el) => el.id);
          }
        });
      },

      isElementSelected: (elementId) => {
        return get().selection.selectedElementIds.includes(elementId);
      },

      getSelectedElements: () => {
        const state = get();
        const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
        if (!activeSlide) return [];
        return activeSlide.elements.filter((el) =>
          state.selection.selectedElementIds.includes(el.id)
        );
      },

      // 元素编辑操作
      startEditElement: (elementId) => {
        set((state) => {
          state.isEditing = true;
          state.editingElementId = elementId;
          state.selection.selectedElementIds = [elementId];
        });
      },

      stopEditElement: () => {
        set((state) => {
          state.isEditing = false;
          state.editingElementId = undefined;
        });
      },

      updateElement: (elementId, updates) => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            activeSlide.updateElement(elementId, updates as any);
          }
        });
      },

      deleteElement: (elementId) => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            activeSlide.removeElement(elementId);
            state.selection.selectedElementIds = state.selection.selectedElementIds.filter(
              (id) => id !== elementId
            );
          }
        });
        get().pushHistory('Delete element');
      },

      deleteSelectedElements: () => {
        const state = get();
        const selectedIds = [...state.selection.selectedElementIds];
        selectedIds.forEach((id) => get().deleteElement(id));
        get().pushHistory('Delete elements');
      },

      duplicateElement: (elementId) => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            const element = activeSlide.getElementById(elementId);
            if (element) {
              const clonedElement = element.clone();
              clonedElement.id = `element-${Date.now()}`;
              clonedElement.left += 10;
              clonedElement.top += 10;
              activeSlide.addElement(clonedElement);
              state.selection.selectedElementIds = [clonedElement.id];
            }
          }
        });
        get().pushHistory('Duplicate element');
      },

      addElement: (element) => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            activeSlide.addElement(element);
            state.selection.selectedElementIds = [element.id];
          }
        });
        get().pushHistory('Add element');
      },

      // 元素排序操作
      bringToFront: (elementId) => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            const index = activeSlide.elements.findIndex((el) => el.id === elementId);
            if (index !== -1 && index !== activeSlide.elements.length - 1) {
              const [element] = activeSlide.elements.splice(index, 1);
              activeSlide.elements.push(element);
            }
          }
        });
      },

      sendToBack: (elementId) => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            const index = activeSlide.elements.findIndex((el) => el.id === elementId);
            if (index !== -1 && index !== 0) {
              const [element] = activeSlide.elements.splice(index, 1);
              activeSlide.elements.unshift(element);
            }
          }
        });
      },

      bringForward: (elementId) => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            const index = activeSlide.elements.findIndex((el) => el.id === elementId);
            if (index !== -1 && index < activeSlide.elements.length - 1) {
              const element = activeSlide.elements[index];
              activeSlide.elements[index] = activeSlide.elements[index + 1];
              activeSlide.elements[index + 1] = element;
            }
          }
        });
      },

      sendBackward: (elementId) => {
        set((state) => {
          const activeSlide = state.document?.getSlideById(state.selection.activeSlideId);
          if (activeSlide) {
            const index = activeSlide.elements.findIndex((el) => el.id === elementId);
            if (index !== -1 && index > 0) {
              const element = activeSlide.elements[index];
              activeSlide.elements[index] = activeSlide.elements[index - 1];
              activeSlide.elements[index - 1] = element;
            }
          }
        });
      },

      // 历史记录操作
      pushHistory: (description) => {
        set((state) => {
          if (!state.document) return;

          // 移除当前索引之后的所有历史记录
          state.history = state.history.slice(0, state.historyIndex + 1);

          // 创建新的历史记录
          const record: HistoryRecord = {
            timestamp: Date.now(),
            document: state.document.clone(),
            selectionState: { ...state.selection },
            description,
          };

          state.history.push(record);
          state.historyIndex = state.history.length - 1;

          // 保持历史记录大小限制
          if (state.history.length > state.maxHistorySize) {
            state.history.shift();
            state.historyIndex--;
          }
        });
      },

      undo: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            const record = state.history[state.historyIndex];
            state.document = record.document.clone();
            state.selection = { ...record.selectionState };
          }
        });
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            const record = state.history[state.historyIndex];
            state.document = record.document.clone();
            state.selection = { ...record.selectionState };
          }
        });
      },

      canUndo: () => {
        return get().historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      // 视图操作
      setZoom: (zoom) => {
        set((state) => {
          state.zoom = Math.max(0.1, Math.min(5, zoom));
        });
      },

      setPan: (x, y) => {
        set((state) => {
          state.panX = x;
          state.panY = y;
        });
      },

      toggleGrid: () => {
        set((state) => {
          state.showGrid = !state.showGrid;
        });
      },

      toggleRuler: () => {
        set((state) => {
          state.showRuler = !state.showRuler;
        });
      },

      // 判断当前页布局按钮是否可点击，并返回组数/元素数
      getLayoutAvailability: () => {
        const state = get();
        const slide = state.getActiveSlide();
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

        if (groupIdCount.size === 0) {
          return { groupCount: 0, elementCount: 0, canClick: false };
        }

        const counts = Array.from(groupIdCount.values());
        const first = counts[0];
        const uniform = counts.every((c) => c === first);
        const elementCount = uniform ? first : Math.min(...counts);
        const groupCount = groupIdCount.size;

        return { groupCount, elementCount, canClick: groupCount > 0 && elementCount > 0 };
      },
    })),
    { name: 'PPTEditorStore' }
  )
);

export default usePPTEditorStore;
