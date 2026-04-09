import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'umi';
import { App } from 'antd';
import LoadingComponent from '@/components/base/loading';
import { LayoutService } from '@/services/layout.service';
import { LayoutPo } from '@/models/layoutPo';
import { useSlidesStore } from '@/ppt/store/useSlidesStore';
import { useMainStore } from '@/ppt/store/useMainStore';
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore';
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot';
// import useScaleCanvas from '@/ppt/hooks/useScaleCanvas';
import useGlobalHotkey from '@/ppt/hooks/useGlobalHotkey';
import usePasteEvent from '@/ppt/hooks/usePasteEvent';
import Canvas from '@/ppt/classic/Editor/Canvas';
import Thumbnails from '@/ppt/classic/Editor/Thumbnails';
import { TopToolbar } from '@/ppt/classic/Editor/EditorToolbar/TopToolbar';
import { BottomToolbar } from '@/ppt/classic/Editor/EditorToolbar/BottomToolbar';
import { AnnotationPanel } from '@/ppt/classic/components/AnnotationPanel';
import styles from '@/ppt/classic/Editor/index.module.scss';
import { useShallow } from 'zustand/react/shallow';
import { generateId } from '@/ppt/core/utils/id-generator';
import { deleteDiscardedDB } from '@/ppt/utils/database';
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/ppt/core/constants';
import { EditorMode, PPTDocument, type PPTElement } from '@/ppt/core';
import { DocumentParser } from '@/ppt/classic/parser/DocumentParser';
import { DocumentSerializer } from '@/ppt/classic/serializer/DocumentSerializer';
import { RightToolbar } from '@/ppt/classic/Editor/EditorToolbar/RightToolbar';

const layoutService = LayoutService.getInstance();
const DEFAULT_VIEWPORT_RATIO = 0.5625;

const normalizeSlides = (rawSlides: any[] = []) => {
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

const PptEditorPage: React.FC = () => {
    const { id } = useParams();
    const location = useLocation();
    const { message } = App.useApp();

    const snapshotInitRef = useRef<string | null>(null);

    const [layoutDetail, setLayoutDetail] = useState<LayoutPo>(null);

    const [loadingDetail, setLoadingDetail] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);

    const {
        setSlides,
        setTheme,
        setTitle,
        setViewportSize,
        setViewportRatio,
        updateSlideIndex,
    } = useSlidesStore(
        useShallow((store) => ({
            setSlides: store.setSlides,
            setTheme: store.setTheme,
            setTitle: store.setTitle,
            setViewportSize: store.setViewportSize,
            setViewportRatio: store.setViewportRatio,
            updateSlideIndex: store.updateSlideIndex,
        }))
    );
    const slides = useSlidesStore((store) => store.slides);
    const slideIndex = useSlidesStore((store) => store.slideIndex);
    const {
        activeElementIdList,
        handleElementId,
        setActiveElementIdList,
        setHoveredElementId,
        setMode,
        setDisableHotkeys,
        databaseId,
        canvasScale,
    } = useMainStore(
        useShallow((store) => ({
            activeElementIdList: store.activeElementIdList,
            handleElementId: store.handleElementId,
            setActiveElementIdList: store.setActiveElementIdList,
            setHoveredElementId: store.setHoveredElementId,
            setMode: store.setMode,
            setDisableHotkeys: store.setDisableHotkeys,
            databaseId: store.databaseId,
            canvasScale: store.canvasScale,
        }))
    );
    const { initSnapshotDatabase, resetSnapshotDatabase, snapshotCursor, snapshotLength } = useSnapshotStore(
        useShallow((store) => ({
            initSnapshotDatabase: store.initSnapshotDatabase,
            resetSnapshotDatabase: store.resetSnapshotDatabase,
            snapshotCursor: store.snapshotCursor,
            snapshotLength: store.snapshotLength,
        }))
    );
    const { undo, redo, addHistorySnapshot } = useHistorySnapshot();
    // const { setCanvasScaleByRatio, resetCanvas, scaleCanvas } = useScaleCanvas();
    const isApplyingSnapshotRef = useRef(false);

    useEffect(() => {
        const loadLayoutDetail = async () => {
            if (id) {
                layoutService.detail({ layoutId: String(BigInt(id)) } as any).subscribe({
                    next: (res) => {
                        setLoadingDetail(false);
                        console.log('[layout] 获取布局详情:', res.data);
                        setLayoutDetail(res.data);
                    },
                });
            }
        };

        if (location.state && (location.state as any).layoutData) {
            setLayoutDetail((location.state as any).layoutData);
            setLoadingDetail(false);
            return;
        }
        loadLayoutDetail();
    }, [id, location.state]);

    const parsedTemplateData = useMemo<PPTDocument>(() => {
        if (!layoutDetail) return null;
        try {
            console.log('解析布局数据:', layoutDetail);
            let slidesData: any = layoutDetail.documentJson;
            if (typeof slidesData === 'string') {
                slidesData = JSON.parse(slidesData);
            }
            let docSource: any = slidesData;
            if (docSource && Array.isArray(docSource.slides)) {
                return DocumentParser.parse(docSource);
            }
            const singleSlide = docSource as any;
            return DocumentParser.parse({
                title: `layout-${layoutDetail.layoutId}`,
                width: 1280,
                height: 720,
                slides: singleSlide ? [singleSlide] : [],
            });
        } catch (error) {
            console.error('解析布局数据失败:', error);
            return null;
        }
    }, [layoutDetail]);

    useEffect(() => {
        if (!parsedTemplateData?.slides?.length) return;
        setTitle(`layout-${layoutDetail?.layoutId ?? ''}` || parsedTemplateData.title || '未命名布局');
        if (parsedTemplateData.theme) setTheme(parsedTemplateData.theme);
        setViewportSize(1280);
        setViewportRatio(720 / 1280);
        setSlides(normalizeSlides(parsedTemplateData.slides));
        updateSlideIndex(0);
    }, [parsedTemplateData, setSlides, setTheme, setTitle, setViewportRatio, setViewportSize, layoutDetail, updateSlideIndex]);

    useEffect(() => {
        if (!parsedTemplateData?.slides?.length) return;
        const initKey = layoutDetail?.layoutId?.toString?.() || id || 'layout';
        if (snapshotInitRef.current === initKey) return;
        snapshotInitRef.current = initKey;

        const initSnapshots = async () => {
            await deleteDiscardedDB();
            await resetSnapshotDatabase();
            await initSnapshotDatabase();
        };
        initSnapshots().catch((error) => {
            console.error('[layout] 初始化快照数据库失败:', error);
        });
    }, [parsedTemplateData, layoutDetail, id, initSnapshotDatabase, resetSnapshotDatabase]);

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

    useEffect(() => {
        const unsubscribe = useSlidesStore.subscribe((state, prevState) => {
            if (state.slides === prevState.slides) return;
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

    useGlobalHotkey();
    usePasteEvent();

    useEffect(() => {
        setMode(EditorMode.EDIT);
        setDisableHotkeys(false);
        return () => {
            setMode(EditorMode.EDIT);
            setDisableHotkeys(false);
            setHoveredElementId('');
        };
    }, [setMode, setDisableHotkeys, setHoveredElementId]);

    const currentSlide = useSlidesStore((store) => store.getCurrentSlide());
    const updateSlide = useSlidesStore((store) => store.updateSlide);
    const removeSlideProps = useSlidesStore((store) => store.removeSlideProps);
    const updateElement = useSlidesStore((store) => store.updateElement);

    const selectedElements = useMemo(() => {
        const elements = currentSlide?.elements || [];
        if (!activeElementIdList.length) return [];
        return elements.filter((element) => activeElementIdList.includes(element.id));
    }, [currentSlide, activeElementIdList]);

    const lastSelectedElement = useMemo(() => {
        const elements = currentSlide?.elements || [];
        return elements.find((element) => element.id === handleElementId);
    }, [currentSlide, handleElementId]);

    const handleSaveSlide = useCallback(() => {
        if (!layoutDetail) {
            message.warning('布局详情未加载完成');
            return;
        }
        setLoadingSave(true);
        const { title, theme, slides: nextSlides, viewportSize, viewportRatio } = useSlidesStore.getState();
        const width = viewportSize || 1280;
        const height = Math.round((viewportRatio || DEFAULT_VIEWPORT_RATIO) * width);
        const nextDoc: PPTDocument = {
            title,
            theme,
            width,
            height,
            slides: nextSlides,
        } as PPTDocument;

        let safeDocument: any = null;
        try {
            safeDocument = DocumentSerializer.serialize(nextDoc);
            JSON.stringify(safeDocument);
        } catch (error) {
            console.error('布局数据序列化失败:', error);
            message.error('布局数据序列化失败，请检查数据');
            setLoadingSave(false);
            return;
        }

        layoutService.update({
            ...layoutDetail,
            documentJson: safeDocument,
        } as LayoutPo).subscribe({
            next: () => {
                message.success('保存成功');
                setLoadingSave(false);
            },
            error: () => {
                message.error('保存失败');
                setLoadingSave(false);
            },
        });
    }, [layoutDetail, message]);

    const handleElementHover = useCallback((element?: PPTElement | null) => {
        setHoveredElementId(element?.id || '');
    }, [setHoveredElementId]);

    return (
        <div className="h-full w-full relative flex flex-col ">
            {loadingDetail && <LoadingComponent />}

            {!loadingDetail && (
                <>
                    <div className="flex-1 overflow-hidden">
                        <div className={styles['ppt-editor']}>
                            <div className={styles['layout-header']}>
                                <TopToolbar
                                    title={`layout-${layoutDetail?.layoutId ?? ''}` || '未命名布局'}
                                    onBack={() => window.history.back()}
                                    onSave={null}
                                    onRelease={handleSaveSlide}
                                    buttonText={{ release: '保存' }}
                                />
                            </div>
                            <div className={styles['layout-content']}>
                                <div className={styles['layout-content-left']}>
                                    <Thumbnails hideAddSlideButton={true} />
                                </div>
                                <div className={styles['layout-content-center']} style={{ position: 'relative' }}>

                                    <div
                                        className={`${styles['center-body']} ${styles['center-body-annotate']}`}
                                        style={{ height: '100%' }}
                                    >
                                        <Canvas />
                                    </div>
                                </div>

                                <RightToolbar />
                            </div>

                        </div>


                    </div>

                </>
            )}
        </div>
    );
};

export default PptEditorPage;
