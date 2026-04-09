import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Drawer, Spin, Button, message as AntMessage, Empty, Row, Col } from 'antd';
import { PptThemeService } from '@/services/pptTheme.service';
import { PptThemePo } from '@/models/pptThemePo';
import { useInfiniteQuery } from '@tanstack/react-query';
import { lastValueFrom, map } from 'rxjs';

interface ThemeDrawerProps {
  isOpen: boolean;
  projectId?: number;
  onClose: () => void;
  onThemeSelect?: (PptClassicThemePo) => void;
}

const pptClassicThemeService = PptThemeService.getInstance();

const ThemeDrawer: React.FC<ThemeDrawerProps> = ({
  isOpen,
  projectId,
  onClose,
  onThemeSelect,

}) => {
  const [selectedTheme, setSelectedTheme] = useState<number | undefined>();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastThemeElementRef = useRef<HTMLDivElement>(null);

  // 当Drawer关闭Time，重置选中状态
  useEffect(() => {
    if (!isOpen) {
      setSelectedTheme(undefined);
    }
  }, [isOpen]);

  // 获取主题列表（支持无限滚动）
  const {
    data: themesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: themesLoading
  } = useInfiniteQuery<{ data: PptThemePo[]; total: number; hasMore: boolean }>({
    queryKey: ['classicThemes'],
    enabled: isOpen,
    initialPageParam: 1,
    queryFn: async ({ pageParam }: { pageParam: unknown }) => {
      const currentPage = typeof pageParam === 'number' ? pageParam : 1;
      const response = await lastValueFrom(
        pptClassicThemeService.list({
          pageNum: currentPage,
          pageSize: 10
        } as PptThemePo).pipe(
          map(res => ({
            data: res.data || [],
            total: res.total || 0,
            hasMore: (res.total || 0) > currentPage * 10
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
  const themes = themesData?.pages.flatMap(page => page.data) || [];

  // 处理主题切换确认
  const handleConfirm = (themeId) => {
    if (themeId === undefined) return;

    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    onThemeSelect?.(theme);
    AntMessage.success('主题已切换');
    setSelectedTheme(themeId);
    onClose();
  };

  return (
    <Drawer
      title="选择主题"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={380}
    // footer={
    //   <div className="flex gap-2 justify-end">
    //     <Button onClick={onClose}>
    //       取消
    //     </Button>
    //     <Button
    //       type="primary"
    //       loading={loading}
    //       disabled={tempSelectedTheme === undefined}
    //       onClick={handleConfirm}
    //     >
    //       确认
    //     </Button>
    //   </div>
    // }
    >
      <Spin spinning={themesLoading || isFetchingNextPage}>
        <div className="space-y-3">
          {themes && themes.length > 0 ? (
            <Row gutter={[16, 16]}>
              {themes.map((theme, index) => {
                let colors: string[] = [];
                try {
                  colors = typeof theme.themeColors === 'string'
                    ? JSON.parse(theme.themeColors)
                    : Array.isArray(theme.themeColors)
                      ? theme.themeColors
                      : typeof theme.themeColors === 'object' ?
                        Object.entries(theme.themeColors).filter(color => {
                          return color[0].includes('accent')
                        }).map(color => color[1]) : [];
                } catch (e) {
                  colors = [];
                }

                return (
                  <Col span={12} key={theme.id}>
                    <div
                      ref={themes.length === index + 1 ? lastElemetObserver : null}
                      className={`p-3 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${selectedTheme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                        }`}
                      onClick={() => {
                        handleConfirm(theme.id);
                      }}
                    >
                      <div className="mb-1 flex justify-between items-center">
                        <span className="font-medium text-sm">{theme.themeName}</span>
                      </div>
                      <div className="flex ">
                        {colors.length > 0 ? (
                          colors.map((color, index) => (
                            <div
                              key={index}
                              className="flex-1 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: color || '#f0f0f0' }}
                              title={color}
                            />
                          ))
                        ) : (
                          <div className="w-full h-8 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                            无颜色信息
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
          )}
        </div>
      </Spin>
    </Drawer>
  );
};

export default ThemeDrawer;
