import { useEffect, useMemo, useRef } from 'react';
import FullscreenSpin from '@/components/FullscreenSpin';
import Editor from '@/ppt/classic/Editor';
import Screen from '@/ppt/classic/Screen';
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/ppt/core/constants';
import { useMainStore } from '@/ppt/store/useMainStore';
import { useScreenStore } from '@/ppt/store/useScreenStore';
import { useSlidesStore } from '@/ppt/store/useSlidesStore';
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore';
import { deleteDiscardedDB } from '@/ppt/utils/database';
import { isPC } from '@/ppt/utils/common';
import { usePptProjectStore } from '@/stores/pptProjectStore';
import type { PptDocumentData } from '@/stores/pptProjectStore';
import type { PptProjectSlidePo } from '@/models/pptProjectSlidePo';
import type { PPTSlide } from '@/ppt/core';
import { useShallow } from 'zustand/react/shallow';
import { generateId } from '@/ppt/core/utils/id-generator';

interface ClassicPptEditorProps {
  pptData?: PptDocumentData | null;
  onBack?: () => void;
  onAddBlankSlide?: () => void;
  onAddTemplateSlide?: () => void;
  onAddAIGeneratedSlide?: () => void;
  onLoadMoreSlides?: () => Promise<void>;
  hasMoreSlides?: boolean;
  loadingMoreSlides?: boolean;
}

const DEFAULT_VIEWPORT_RATIO = 0.5625;

const normalizeSlides = (rawSlides: PPTSlide[] = []) => {
  const seenIds = new Set<string>();
  return rawSlides.map((slide) => {
    const originalId = typeof slide?.id === 'string' ? slide.id : '';
    let id = originalId;
    if (!id || seenIds.has(id)) {
      id = generateId('slide');
    }
    seenIds.add(id);
    return {
      ...slide,
      id,
    };
  });
};

const toClassicSlides = (slides: PptProjectSlidePo[] = []) =>
  slides.map((slide, index) => {
    const base = slide?.slideJson || ({} as PPTSlide);
    const typedBase = base as PPTSlide & { slideType?: string };
    return {
      ...base,
      slideId: slide.slideId,
      slideNo: slide.slideNo || index + 1,
      slideType: slide.slideType || base.type || typedBase.slideType,
      remark: slide.remark ?? base.remark,
    } as PPTSlide & { slideId?: number; slideNo?: number; slideType?: string };
  });

const ClassicPptEditor: React.FC<ClassicPptEditorProps> = ({
  pptData,
  onBack,
  onAddBlankSlide,
  onAddTemplateSlide,
  onAddAIGeneratedSlide,
  onLoadMoreSlides,
  hasMoreSlides,
  loadingMoreSlides,
}) => {
  const { setSlides, setTheme, setTitle, setViewportSize, setViewportRatio } = useSlidesStore(
    useShallow((state) => ({
      setSlides: state.setSlides,
      setTheme: state.setTheme,
      setTitle: state.setTitle,
      setViewportSize: state.setViewportSize,
      setViewportRatio: state.setViewportRatio,
    }))
  );
  const slides = useSlidesStore((state) => state.slides);
  const screening = useScreenStore((state) => state.screening);
  const databaseId = useMainStore((state) => state.databaseId);
  const generatingPpt = usePptProjectStore((state) => state.generatingPpt);
  const { initSnapshotDatabase, resetSnapshotDatabase } = useSnapshotStore(
    useShallow((state) => ({
      initSnapshotDatabase: state.initSnapshotDatabase,
      resetSnapshotDatabase: state.resetSnapshotDatabase,
    }))
  );
  const isPcDevice = useMemo(() => isPC(), []);
  const snapshotInitRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pptData?.slides?.length) return;

    setTitle(pptData.title || '未命名演示文稿');

    if (pptData.theme) setTheme(pptData.theme);
    if (pptData.width) setViewportSize(pptData.width);
    if (pptData.width && pptData.height) {
      setViewportRatio(pptData.height / pptData.width);
    } else {
      setViewportRatio(DEFAULT_VIEWPORT_RATIO);
    }
    if (generatingPpt) return;
    const slides = normalizeSlides(toClassicSlides(pptData.slides || []));
    setSlides(slides);
  }, [generatingPpt, pptData, setSlides, setTheme, setTitle, setViewportRatio, setViewportSize]);

  useEffect(() => {
    if (!pptData?.slides?.length) return;
    const initKey = pptData?.title || 'default';
    if (snapshotInitRef.current === initKey) return;
    snapshotInitRef.current = initKey;

    const initSnapshots = async () => {
      await deleteDiscardedDB();
      await resetSnapshotDatabase();
      await initSnapshotDatabase();
    };
    initSnapshots().catch((error) => {
      console.error('[classic] 初始化快照数据库失败:', error);
    });
  }, [pptData, initSnapshotDatabase, resetSnapshotDatabase]);

  useEffect(() => {
    const beforeUnload = () => {
      const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB);
      const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : [];
      discardedDBList.push(databaseId);
      localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, JSON.stringify(discardedDBList));
    };

    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [databaseId]);

  if (!isPcDevice) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        当前编辑模式暂不支持移动端预览，请在电脑端访问。
      </div>
    );
  }

  if (!slides.length) {
    return <FullscreenSpin loading tip="数据初始化中，请稍等 ..." />;
  }

  if (screening) {
    return <Screen />;
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        onBack={onBack}
        onAddBlankSlide={onAddBlankSlide}
        onAddTemplateSlide={onAddTemplateSlide}
        onAddAIGeneratedSlide={onAddAIGeneratedSlide}
        onLoadMoreSlides={onLoadMoreSlides}
        hasMoreSlides={hasMoreSlides}
        loadingMoreSlides={loadingMoreSlides}
      />
    </div>
  );
};

export default ClassicPptEditor;
