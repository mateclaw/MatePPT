import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, history } from 'umi';
import { Spin, Button, Avatar, Dropdown } from 'antd';
import { LeftOutlined, PlayCircleOutlined, HomeOutlined, FolderOutlined, LogoutOutlined } from '@ant-design/icons';
import { usePptProjectStore } from '@/stores/pptProjectStore';
import useUserStore from '@/stores/userStore';
import { useSlidesStore } from '@/ppt/store/useSlidesStore';
import { useScreenStore } from '@/ppt/store/useScreenStore';
import { useShallow } from 'zustand/react/shallow';
import type { PPTSlide } from '@/ppt/core';
import type { PptProjectSlidePo } from '@/models/pptProjectSlidePo';
import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide';
import Screen from '@/ppt/classic/Screen';
import useScreening from '@/ppt/hooks/useScreening';
import { generateId } from '@/ppt/core/utils/id-generator';

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
    return { ...slide, id };
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
    } as PPTSlide & { slideId?: string; slideNo?: number; slideType?: string };
  });

const PptDetailViewerPage: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const {
    verifyAndLoadProject,
    displayPptData,
    projectDetail,
  } = usePptProjectStore();

  const {
    slides,
    setSlides,
    setTheme,
    setTitle,
    setViewportSize,
    setViewportRatio,
    updateSlideIndex,
  } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      setSlides: state.setSlides,
      setTheme: state.setTheme,
      setTitle: state.setTitle,
      setViewportSize: state.setViewportSize,
      setViewportRatio: state.setViewportRatio,
      updateSlideIndex: state.updateSlideIndex,
    })),
  );

  const screening = useScreenStore((state) => state.screening);
  const { enterScreening } = useScreening();
  const { userInfo } = useUserStore();

  // 加载项目和 slides 数据
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    setSlides([]);
    updateSlideIndex(0);

    verifyAndLoadProject(id)
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setError('项目加载失败');
        setLoading(false);
      });
  }, [id]);

  // 当 displayPptData 更新时，同步到 slides store
  useEffect(() => {
    if (!displayPptData?.slides?.length) return;

    setTitle(projectDetail?.projectName || displayPptData.title || '未命名演示文稿');
    if (projectDetail?.theme) setTheme(projectDetail.theme);
    else if (displayPptData.theme) setTheme(displayPptData.theme);

    const pptWidth = projectDetail?.width || displayPptData.width;
    const pptHeight = projectDetail?.height || displayPptData.height;
    if (pptWidth) setViewportSize(pptWidth);
    if (pptWidth && pptHeight) {
      setViewportRatio(pptHeight / pptWidth);
    } else {
      setViewportRatio(DEFAULT_VIEWPORT_RATIO);
    }

    const classicSlides = normalizeSlides(toClassicSlides(displayPptData.slides || []));
    setSlides(classicSlides);
  }, [displayPptData, projectDetail]);

  // 监听容器宽度 — containerRef 始终挂载，所以观察器一定能建立
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const slideWidth = useMemo(() => {
    return Math.max(containerWidth - 24, 200);
  }, [containerWidth]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      history.push('/ppt/my-works');
    }
  };

  const handlePlay = (index: number = 0) => {
    updateSlideIndex(index);
    enterScreening();
  };

  // 全屏放映模式
  if (screening) {
    return <Screen />;
  }

  // 始终渲染完整布局结构，loading/error 状态在容器内部显示
  // 这样 containerRef 在首次挂载时就存在，ResizeObserver 能正确建立
  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* 顶栏 */}
      <div
        className="flex items-center justify-between px-3 flex-shrink-0"
        style={{
          height: '44px',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-2">
          <LeftOutlined className="text-base cursor-pointer p-1" onClick={handleBack} />
          <span className="text-sm font-medium truncate" style={{ maxWidth: '200px' }}>
            {projectDetail?.projectName || '演示文稿'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePlay(0)}
            disabled={loading || slides.length === 0}
          >
            播放
          </Button>
          {userInfo?.userId && (
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  { key: 'home', icon: <HomeOutlined />, label: '首页' },
                  { key: 'works', icon: <FolderOutlined />, label: '我的作品' },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'home') history.push('/ppt/new');
                  else if (key === 'works') history.push('/ppt/my-works');
                  else if (key === 'logout') history.push('/login');
                },
              }}
            >
              {userInfo.avatarUrl ? (
                <Avatar size={28} src={userInfo.avatarUrl} className="cursor-pointer" />
              ) : (
                <Avatar size={28} className="cursor-pointer" style={{ backgroundColor: 'rgb(106, 94, 245)', color: '#fff', fontSize: 12 }}>
                  {userInfo.userName ? userInfo.userName.charAt(0).toUpperCase() : ''}
                </Avatar>
              )}
            </Dropdown>
          )}
        </div>
      </div>

      {/* 幻灯片列表 — containerRef 始终挂载 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto py-3 px-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" tip="加载中..." />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-gray-500">{error}</div>
            <Button onClick={handleBack}>返回</Button>
          </div>
        ) : slides.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Spin tip="加载幻灯片..." />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="relative cursor-pointer"
                onClick={() => handlePlay(index)}
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    zIndex: 2,
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    lineHeight: '18px',
                  }}
                >
                  {index + 1}
                </div>
                <ThumbnailSlide
                  slide={slide}
                  size={slideWidth}
                  visible={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PptDetailViewerPage;
