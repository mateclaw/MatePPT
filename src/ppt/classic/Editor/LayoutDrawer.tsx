import React, { useState, useEffect, useRef, useCallback, ReactNode, useMemo } from 'react';
import { Drawer, Spin, Button, message as AntMessage, Empty, Row, Col } from 'antd';
import { LayoutService } from '@/services/layout.service';

import { LayoutPo } from '@/models/layoutPo';
import { PptProjectPo } from '@/models/pptProjectPo';
import { useInfiniteQuery } from '@tanstack/react-query';
import { lastValueFrom, map } from 'rxjs';
import PptSlidePreview from '../components/PptSlidePreview';
import { DocumentParser } from '@/ppt/classic/parser/DocumentParser';
import { ThemeChanger } from '@/ppt/core/color/ThemeChanger';


interface LayoutDrawerProps {
  isOpen: boolean;
  slideId?: number;

  onClose: () => void;
  onDataReload?: (pptData: any, source?: 'layout' | 'template' | 'theme') => void;
  layoutAvailability?: { groupCount: number; elementCount: number; canClick: boolean };
  themeColors?: any;
}

const pptClassicLayoutService = LayoutService.getInstance();


// 布局项子组件
interface LayoutItemProps {
  layout: LayoutPo;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (layoutId: number) => void;
  lastElementRef?: (node: HTMLDivElement | null) => void;
  themeMap?: Record<string, string> | null;
}
const pageSize = 10;
const DEFAULT_PREVIEW_WIDTH = 160;
const DEFAULT_VIEWPORT_RATIO = 720/1280;
const LayoutItem: React.FC<LayoutItemProps> = ({
  layout,
  index,
  total,
  isSelected,
  onSelect,
  lastElementRef,
  themeMap
}) => {
  const previewData = useMemo(() => {
    let raw: any = null;
    try {
      raw = typeof layout.documentJson === 'string'
        ? JSON.parse(layout.documentJson)
        : layout.documentJson;
    } catch (e) {
      console.error('解析 layout.documentJson 失败:', e);
      return null;
    }
    if (!raw) return null;
    const themedRaw = themeMap
      ? ThemeChanger.changeTheme(JSON.parse(JSON.stringify(raw)), themeMap)
      : raw;
    const doc = DocumentParser.parse(themedRaw);
    const slide = doc.slides?.[0];
    if (!slide) return null;
    const viewportSize = doc.width || 1280;
    const viewportRatio = doc.height && doc.width ? doc.height / doc.width : DEFAULT_VIEWPORT_RATIO;
    const previewWidth = (raw?.frame?.width as number) || DEFAULT_PREVIEW_WIDTH;
    const previewHeight = (raw?.frame?.height as number) || Math.round(previewWidth * viewportRatio);
    
    return {
      slide,
      viewportSize,
      viewportRatio,
      previewWidth,
      previewHeight,
    };
  }, [layout.documentJson, themeMap]);


  return (
    <div
      ref={total === index + 1 ? lastElementRef : null}
      className={` border p-1 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200'
        }`}
      onClick={() => onSelect(layout.layoutId)}
    >
      <div className="aspect-video bg-white rounded-lg  flex items-center justify-center  ">
        {previewData ? (
          <PptSlidePreview
            slide={previewData.slide}
            viewportSize={previewData.viewportSize}
            viewportRatio={previewData.viewportRatio}
            width={previewData.previewWidth}
            height={previewData.previewHeight}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无预览" />
        )}
      </div>

    </div>
  );
};

const LayoutDrawer: React.FC<LayoutDrawerProps> = ({
  isOpen,
  slideId,
  onClose,
  onDataReload, layoutAvailability,
  themeColors
}) => {
  const resolveThemeMap = useMemo(() => {
    if (!themeColors) return null;
    if (typeof themeColors === 'string') {
      try {
        return JSON.parse(themeColors) as Record<string, string>;
      } catch (error) {
        console.warn('解析 themeColors 失败:', error);
        return null;
      }
    }
    if (typeof themeColors === 'object') {
      return themeColors as Record<string, string>;
    }
    return null;
  }, [themeColors]);
  const [selectedLayout, setSelectedLayout] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [tempSelectedLayout, setTempSelectedLayout] = useState<number | undefined>();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastLayoutElementRef = useRef<HTMLDivElement>(null);

  // 当Drawer打开时，清除临时选中状态（每次打开都重新开始选择）
  useEffect(() => {
    if (isOpen) {
      setTempSelectedLayout(undefined);
    }
  }, [isOpen]);

  // 获取布局列表（支持无限滚动）
  const {
    data: layoutsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: layoutsLoading
  } = useInfiniteQuery<{ data: LayoutPo[]; total: number; hasMore: boolean }>({
    queryKey: ['classicLayouts', slideId, layoutAvailability.elementCount, layoutAvailability.groupCount, themeColors],
    enabled: isOpen && !!slideId,
    initialPageParam: 1,
    queryFn: async ({ pageParam }: { pageParam: unknown }) => {
      const currentPage = typeof pageParam === 'number' ? pageParam : 1;
      const response = await lastValueFrom(
        pptClassicLayoutService.listByGroupCount({
          pageNum: currentPage,
          pageSize: pageSize,
          slideId,

          elementCount: layoutAvailability.elementCount,
          groupCount: layoutAvailability.groupCount,
          themeColors: themeColors
        } as LayoutPo).pipe(
          map(res => ({
            data: res.data || [],
            total: res.total || 0,
            hasMore: (res.total || 0) > currentPage * pageSize
          }))
        )
      );
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      // 根据已加载的页数计算下一页（而不是根据数据长度）
      const currentPageNum = allPages.length;
      return lastPage.hasMore ? currentPageNum + 1 : undefined;
    },
  });

  // 无限滚动观察器
  const lastElemetObserver = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (node) observer.current.observe(node);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 清理 IntersectionObserver
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // 合并所有页面的数据
  const layouts = layoutsData?.pages.flatMap(page => page.data) || [];

  // 处理布局切换确认
  const handleConfirm = async (id) => {
    if (id === undefined || !slideId) return;

    setLoading(true);
    try {
      const result = await lastValueFrom(
        pptClassicLayoutService.switchLayout({
          layoutId: id,
          slideId,

          elementCount: layoutAvailability.elementCount,
          groupCount: layoutAvailability.groupCount
        } as LayoutPo)
      );

      if (result.code === 0 && result.data) {
        AntMessage.success('布局已切换');
        setSelectedLayout(id);
        onDataReload?.(result.data, 'layout');
        onClose();
      }
    } catch (error) {
      AntMessage.error('布局切换失败');
      console.error('布局切换失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="选择布局"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={400}
    // footer={
    //   <div className="flex gap-2 justify-end">
    //     <Button onClick={onClose}>
    //       取消
    //     </Button>
    //     <Button
    //       type="primary"
    //       loading={loading}
    //       disabled={tempSelectedLayout === undefined}
    //       onClick={handleConfirm}
    //     >
    //       确认
    //     </Button>
    //   </div>
    // }
    >
      <Spin spinning={layoutsLoading || isFetchingNextPage || loading}>
        <div className="space-y-3">
          {layouts && layouts.length > 0 ? (
            <Row gutter={[16, 16]}>
              <>
                {layouts.map((layout, index) => (
                  <Col span={12} key={layout.layoutId}>
                    <LayoutItem
                      key={layout.layoutId}
                      layout={layout}
                      index={index}
                      total={layouts.length}
                      isSelected={tempSelectedLayout === layout.layoutId}
                      onSelect={() => {
                        setTempSelectedLayout(layout.layoutId);
                        handleConfirm(layout.layoutId);
                      }}
                      lastElementRef={layouts.length === index + 1 ? lastElemetObserver : undefined}
                      themeMap={resolveThemeMap}
                    />
                  </Col>
                ))}
              </>
            </Row>

          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
          )}
        </div>
      </Spin>
    </Drawer>
  );
};

export default LayoutDrawer;
