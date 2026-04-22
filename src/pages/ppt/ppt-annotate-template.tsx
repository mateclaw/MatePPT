import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'umi';
import { App, Form, Input, Modal, Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { lastValueFrom, map } from 'rxjs';
import { useShallow } from 'zustand/react/shallow';
import LoadingComponent from '@/components/base/loading';
import { PptTemplateService } from '@/services/pptTemplate.service';
import { PptTemplatePo } from '@/models/pptTemplatePo';
import { PptSceneService } from '@/services/pptScene.service';
import { PptStyleService } from '@/services/pptStyle.service';
import { PptStylePo } from '@/models/pptStylePo';
import { PptScenePo } from '@/models/pptScenePo';
import { useSlidesStore } from '@/ppt/store/useSlidesStore';
import { useMainStore } from '@/ppt/store/useMainStore';
import { useSnapshotStore } from '@/ppt/store/useSnapshotStore';
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot';
import useGlobalHotkey from '@/ppt/hooks/useGlobalHotkey';
import usePasteEvent from '@/ppt/hooks/usePasteEvent';
import Canvas from '@/ppt/classic/Editor/Canvas';
import Thumbnails from '@/ppt/classic/Editor/Thumbnails';
import { TopToolbar } from '@/ppt/classic/Editor/EditorToolbar/TopToolbar';
import { AnnotationPanel } from '@/ppt/classic/components/AnnotationPanel';
import styles from '@/ppt/classic/Editor/index.module.scss';
import { generateId } from '@/ppt/core/utils/id-generator';
import { deleteDiscardedDB } from '@/ppt/utils/database';
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/ppt/core/constants';
import { DocumentParser } from '@/ppt/classic/parser/DocumentParser';
import { SlideSerializer } from '@/ppt/classic/serializer/SlideSerializer';
import { DocumentSerializer } from '@/ppt/classic/serializer/DocumentSerializer';
import { EditorMode, type PPTDocument, type PPTElement } from '@/ppt/core';

const pptTemplateService = PptTemplateService.getInstance();
const pptTemplateStyleService = PptStyleService.getInstance();
const pptTemplateSceneService = PptSceneService.getInstance();
const DEFAULT_VIEWPORT_RATIO = 0.5625;

const normalizeSlides = (rawSlides: any[] = []) => {
  const seenIds = new Set<string>();
  return rawSlides.map((slide) => {
    const originalId = typeof slide?.id === 'string' ? slide.id : '';
    let id = originalId;
    if (!id || seenIds.has(id)) id = generateId('slide');
    seenIds.add(id);
    return { ...slide, id };
  });
};

const PptAnnotateTemplatePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const baseDocRef = useRef<any>(null);
  const snapshotInitRef = useRef<string | null>(null);
  const isApplyingSnapshotRef = useRef(false);
  const [templateDetail, setTemplateDetail] = useState<PptTemplatePo | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [releaseModalVisible, setReleaseModalVisible] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseForm] = Form.useForm();
  const [updatedData, setUpdatedData] = useState<PPTDocument | null>(null);

  const {
    setSlides,
    setTheme,
    setTitle,
    setViewportSize,
    setViewportRatio,
    updateSlideIndex,
    setHighlightAnnotatedElements,
  } = useSlidesStore(useShallow((store) => ({
    setSlides: store.setSlides,
    setTheme: store.setTheme,
    setTitle: store.setTitle,
    setViewportSize: store.setViewportSize,
    setViewportRatio: store.setViewportRatio,
    updateSlideIndex: store.updateSlideIndex,
    setHighlightAnnotatedElements: store.setHighlightAnnotatedElements,
  })));
  const slideIndex = useSlidesStore((store) => store.slideIndex);
  const currentSlide = useSlidesStore((store) => store.getCurrentSlide());
  const updateSlide = useSlidesStore((store) => store.updateSlide);
  const removeSlideProps = useSlidesStore((store) => store.removeSlideProps);
  const updateElement = useSlidesStore((store) => store.updateElement);

  const {
    activeElementIdList,
    handleElementId,
    setActiveElementIdList,
    setHoveredElementId,
    setMode,
    setDisableHotkeys,
    databaseId,
  } = useMainStore(useShallow((store) => ({
    activeElementIdList: store.activeElementIdList,
    handleElementId: store.handleElementId,
    setActiveElementIdList: store.setActiveElementIdList,
    setHoveredElementId: store.setHoveredElementId,
    setMode: store.setMode,
    setDisableHotkeys: store.setDisableHotkeys,
    databaseId: store.databaseId,
  })));

  const { initSnapshotDatabase, resetSnapshotDatabase } = useSnapshotStore(useShallow((store) => ({
    initSnapshotDatabase: store.initSnapshotDatabase,
    resetSnapshotDatabase: store.resetSnapshotDatabase,
  })));
  const { addHistorySnapshot } = useHistorySnapshot();

  useEffect(() => {
    const stateTemplate = (location.state as any)?.templateData;
    if (stateTemplate) {
      setTemplateDetail(stateTemplate);
      setLoadingDetail(false);
      return;
    }
    if (!id) return;
    pptTemplateService.detail({ templateId: id } as PptTemplatePo).subscribe({
      next: (res) => {
        setTemplateDetail(res.data as PptTemplatePo);
        setLoadingDetail(false);
      },
      error: () => {
        message.error('模板详情加载失败');
        setLoadingDetail(false);
      },
    });
  }, [id, location.state, message]);

  const parsedTemplateData = useMemo<PPTDocument | null>(() => {
    if (!templateDetail) return null;
    try {
      let docSource: any = templateDetail.document;
      if (typeof docSource === 'string') docSource = JSON.parse(docSource);
      if (Array.isArray(docSource)) {
        docSource = {
          title: templateDetail.templateName,
          width: (templateDetail as any).width,
          height: (templateDetail as any).height,
          slides: docSource,
        };
      }
      if (docSource && typeof docSource === 'object' && Array.isArray(docSource.slides)) {
        return DocumentParser.parse(docSource);
      }
      return DocumentParser.parse({
        title: templateDetail.templateName,
        width: (templateDetail as any).width,
        height: (templateDetail as any).height,
        slides: [],
      });
    } catch (error) {
      console.error('parse template failed', error);
      return null;
    }
  }, [templateDetail]);

  useEffect(() => {
    if (!parsedTemplateData?.slides?.length) return;
    baseDocRef.current = parsedTemplateData;
    setTitle(templateDetail?.templateName || parsedTemplateData.title || '未命名模板');
    if (parsedTemplateData.theme) setTheme(parsedTemplateData.theme);
    setViewportSize(1280);
    setViewportRatio(720 / 1280);
    setSlides(normalizeSlides(parsedTemplateData.slides));
    updateSlideIndex(0);
  }, [parsedTemplateData, setSlides, setTheme, setTitle, setViewportRatio, setViewportSize, templateDetail, updateSlideIndex]);

  useEffect(() => {
    if (!parsedTemplateData?.slides?.length) return;
    const initKey = templateDetail?.templateId?.toString?.() || id || 'template';
    if (snapshotInitRef.current === initKey) return;
    snapshotInitRef.current = initKey;
    const initSnapshots = async () => {
      await deleteDiscardedDB();
      await resetSnapshotDatabase();
      await initSnapshotDatabase();
    };
    initSnapshots().catch((error) => console.error('init snapshots failed', error));
  }, [parsedTemplateData, templateDetail, id, initSnapshotDatabase, resetSnapshotDatabase]);

  useEffect(() => {
    const beforeUnload = () => {
      const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB);
      const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : [];
      discardedDBList.push(databaseId);
      localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, JSON.stringify(discardedDBList));
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
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
    return () => unsubscribe();
  }, [addHistorySnapshot]);

  useGlobalHotkey();
  usePasteEvent();

  useEffect(() => {
    setMode(EditorMode.ANNOTATE);
    setDisableHotkeys(true);
    setHighlightAnnotatedElements(true);
    return () => {
      setMode(EditorMode.EDIT);
      setDisableHotkeys(false);
      setHoveredElementId('');
      setHighlightAnnotatedElements(false);
    };
  }, [setMode, setDisableHotkeys, setHoveredElementId, setHighlightAnnotatedElements]);

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
    if (!templateDetail) return;
    setLoadingSave(true);
    const slide = useSlidesStore.getState().slides?.[slideIndex];
    if (!slide) {
      message.warning('当前页无数据，无法保存');
      setLoadingSave(false);
      return;
    }
    pptTemplateService.annotateClassicSlide({
      templateId: templateDetail.templateId,
      slideNo: slideIndex + 1,
      slideJson: SlideSerializer.serialize(slide as any),
    } as PptTemplatePo).subscribe({
      next: () => {
        message.success('保存成功');
        setLoadingSave(false);
      },
      error: () => {
        message.error('保存失败');
        setLoadingSave(false);
      },
    });
  }, [templateDetail, slideIndex, message]);

  const handleElementHover = useCallback((element?: PPTElement | null) => {
    setHoveredElementId(element?.id || '');
  }, [setHoveredElementId]);

  const handleRelease = useCallback(() => {
    if (!templateDetail) return;
    const { title, theme, slides: nextSlides, viewportSize, viewportRatio } = useSlidesStore.getState();
    const baseDoc = baseDocRef.current || {};
    const width = viewportSize || baseDoc.width || 1280;
    const height = baseDoc.height || Math.round((viewportRatio || DEFAULT_VIEWPORT_RATIO) * width);
    setUpdatedData({ ...baseDoc, title, theme, width, height, slides: nextSlides } as PPTDocument);
    releaseForm.setFieldsValue({
      templateName: templateDetail.templateName,
      styleId: templateDetail.styleId,
      sceneId: templateDetail.sceneId,
    });
    setReleaseModalVisible(true);
  }, [templateDetail, releaseForm]);

  const handleReleaseOk = useCallback(async () => {
    try {
      const values = await releaseForm.validateFields();
      setReleaseLoading(true);
      if (!updatedData || !templateDetail) return;
      const safeDocument = DocumentSerializer.serialize(updatedData);
      pptTemplateService.updateClassicPublished({
        ...templateDetail,
        document: safeDocument as any,
        templateName: values.templateName,
        styleId: values.styleId,
        sceneId: values.sceneId,
      } as PptTemplatePo).subscribe({
        next: () => {
          message.success('模板发布成功');
          setReleaseLoading(false);
          setReleaseModalVisible(false);
          releaseForm.resetFields();
          navigate('/ppt/my-templates');
        },
        error: () => {
          message.error('模板发布失败');
          setReleaseLoading(false);
        },
      });
    } catch {
      setReleaseLoading(false);
    }
  }, [message, navigate, releaseForm, templateDetail, updatedData]);

  const { data: stylesData = [] } = useQuery<PptStylePo[]>({
    queryKey: ['templateStyles'],
    queryFn: () => lastValueFrom(pptTemplateStyleService.list({ pageSize: 1000 } as PptStylePo).pipe(map((res) => res.data || []))),
  });

  const { data: scenesData = [] } = useQuery<PptScenePo[]>({
    queryKey: ['templateScenes'],
    queryFn: () => lastValueFrom(pptTemplateSceneService.list({ pageSize: 1000 } as PptScenePo).pipe(map((res) => res.data || []))),
  });

  return (
    <div className="h-full w-full relative flex flex-col">
      {loadingDetail && <LoadingComponent />}
      {!loadingDetail && (
        <>
          <div className="flex-1 overflow-hidden">
            <div className={styles['ppt-editor']}>
              <div className={styles['layout-header']}>
                <TopToolbar
                  title={templateDetail?.templateName || '未命名模板'}
                  onBack={() => window.history.back()}
                  onSave={handleSaveSlide}
                  centerSlot={null}
                  buttonText={{ save: '保存' }}
                />
              </div>
              <div className={styles['layout-content']}>
                <div className={styles['layout-content-left']}>
                  <Thumbnails />
                </div>
                <div className={styles['layout-content-center']} style={{ paddingTop: '100px', position: 'relative' }}>
                  <AnnotationPanel
                    selectedElements={selectedElements as any}
                    currentSlide={currentSlide as any}
                    lastSelectedElement={lastSelectedElement as any}
                    loadingSave={loadingSave}
                    onElementAnnotationSave={(element) => {
                      const { id, ...rest } = element as any;
                      if (!id) return;
                      updateElement({ id, props: rest });
                    }}
                    onSlideLabelTypeChange={(slideType) => {
                      if (!currentSlide?.id) return;
                      if (slideType) updateSlide({ type: slideType }, currentSlide.id);
                      else removeSlideProps({ id: currentSlide.id, propName: 'type' });
                    }}
                    onClose={() => setActiveElementIdList([])}
                    onElementHover={handleElementHover}
                    onSlideSave={handleSaveSlide}
                  />
                  <div className={`${styles['center-body']} ${styles['center-body-annotate']}`} style={{ height: '100%' }}>
                    <Canvas />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-6 top-20 z-[1200]">
            <button className="px-4 py-2 rounded bg-primary text-white" onClick={handleRelease}>
              发布模板
            </button>
          </div>

          <Modal
            title="发布模板"
            open={releaseModalVisible}
            onOk={handleReleaseOk}
            onCancel={() => {
              setReleaseModalVisible(false);
              releaseForm.resetFields();
            }}
            confirmLoading={releaseLoading}
            width={500}
          >
            <Form form={releaseForm} layout="vertical">
              <Form.Item label="模板名称" name="templateName" rules={[{ required: true, message: '请输入模板名称' }]}>
                <Input placeholder="请输入模板名称" />
              </Form.Item>
              <Form.Item label="风格" name="styleId" rules={[{ required: true, message: '请选择风格' }]}>
                <Select placeholder="请选择风格">
                  {stylesData.map((style) => (
                    <Select.Option key={style.styleId} value={style.styleId}>
                      {style.styleName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="场景" name="sceneId" rules={[{ required: true, message: '请选择场景' }]}>
                <Select placeholder="请选择场景">
                  {scenesData.map((scene) => (
                    <Select.Option key={scene.sceneId} value={scene.sceneId}>
                      {scene.sceneName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default PptAnnotateTemplatePage;
