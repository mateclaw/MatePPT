import { Modal, Spin, message as AntMessage, Empty, Tabs, Row, Col } from 'antd';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { lastValueFrom, map } from 'rxjs';
import { LayoutPo } from '@/models/layoutPo';
import { LayoutCategoryPo } from '@/models/layoutCategoryPo';
import { PPTDocument, SlideRenderer } from './slide-editor';
import { LayoutService } from '@/services/layout.service';
import { LayoutCategoryService } from '@/services/layoutCategory.service';
import type { ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors';

interface TemplateDrawerProps {
    isOpen: boolean;
    projectId?: string;
    createMode?: string;
    themeColors?: ThemeColors | null;

    onClose: () => void;
    onDataReload?: (pptData: any) => void;
    onConfirm: (
        layoutId: number
    ) => void;

}

interface ClassicLayoutsPage {
    data: LayoutPo[];
    total: number;
    page: number;
    hasMore: boolean;
}

const pageSize = 20;

const pptClassicLayoutService = LayoutService.getInstance();
const layoutCategoryService = LayoutCategoryService.getInstance();
// 布局项子组件
interface LayoutItemProps {
    layout: LayoutPo;
    index: number;
    total: number;
    isSelected: boolean;
    onSelect: (layoutId: number) => void;
    lastElementRef?: (node: HTMLDivElement | null) => void;
}

const LayoutItem: React.FC<LayoutItemProps> = ({
    layout,
    index,
    total,
    isSelected,
    onSelect,
    lastElementRef
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // 渲染 slideJson 到 SVG
    useEffect(() => {
        if (!svgRef.current) return;

        let slideData: any = null;
        try {
            slideData = typeof layout.documentJson === 'string'
                ? JSON.parse(layout.documentJson)
                : layout.documentJson;
        } catch (e) {
            console.error('解析 slideJson 失败:', e);
            return;
        }

        if (!slideData || !slideData.slides || !slideData.slides[0]) return;

        try {
            // 创建 SlideRenderer 实例进行渲染
            const renderer = new SlideRenderer(svgRef.current, {
                mode: 'readonly',
                width: slideData.width || 1280,
                height: slideData.height || 720
            });

            // 构造 PPTDocument 对象
            const docData = {
                ...slideData,
                slides: slideData.slides
            };

            // 使用 SlideRenderer 渲染
            const pptDoc = new PPTDocument(docData);
            renderer.renderDocument(pptDoc, 0);
        } catch (error) {
            console.error('渲染布局预览失败:', error);
        }
    }, [layout.documentJson]);

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
                <svg
                    ref={svgRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#fff'
                    }}
                />
            </div>

        </div>
    );
};


const TemplateDrawer: React.FC<TemplateDrawerProps> = ({
    isOpen,
    projectId,
    themeColors,
    onClose,
    onDataReload,
    onConfirm
}) => {
    const [loading, setLoading] = useState(false);
    const [tempSelectedLayout, setTempSelectedLayout] = useState<number | undefined>();
    const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>();
    const observer = useRef<IntersectionObserver | null>(null);

    // 当Drawer打开时，清除临时选中状态（每次打开都重新开始选择）
    useEffect(() => {
        if (isOpen) {
            setTempSelectedLayout(undefined);

        }
    }, [isOpen]);

    useEffect(() => {
        setTempSelectedLayout(undefined);
    }, [activeCategoryId]);

    const {
        data: categoriesData,
        isLoading: categoriesLoading
    } = useQuery({
        queryKey: ['layoutCategories'],
        enabled: isOpen,
        queryFn: async () => {
            const response = await lastValueFrom(
                layoutCategoryService.list({
                    pageNum: 1,
                    pageSize: 200
                } as LayoutCategoryPo).pipe(
                    map(res => {
                        const data = res.data;
                        if (Array.isArray(data)) {
                            return data;
                        }
                        if (data && Array.isArray((data as { list?: LayoutCategoryPo[] }).list)) {
                            return (data as { list?: LayoutCategoryPo[] }).list || [];
                        }
                        return [];
                    })
                )
            );
            return response as LayoutCategoryPo[];
        }
    });

    const categoryTabs = useMemo(() => {
        const categories = categoriesData || [];
        return categories.map(category => ({
            key: String(category.categoryId),
            label: category.categoryName
        }));
    }, [categoriesData]);

    useEffect(() => {
        if (!isOpen) return;
        if (!categoriesData || categoriesData.length === 0) return;
        if (activeCategoryId === undefined) {
            setActiveCategoryId(categoriesData[0].categoryId);
        }
    }, [activeCategoryId, categoriesData, isOpen]);

    // 获取布局列表（支持无限滚动）
    const {
        data: layoutsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: layoutsLoading
    } = useInfiniteQuery<{ data: LayoutPo[]; total: number; hasMore: boolean }>({
        queryKey: ['classicLayouts', projectId, themeColors, activeCategoryId],
        enabled: isOpen && activeCategoryId !== undefined,
        initialPageParam: 1,
        queryFn: async ({ pageParam }: { pageParam: unknown }) => {
            const currentPage = typeof pageParam === 'number' ? pageParam : 1;
            const params: LayoutPo = {
                pageNum: currentPage,
                pageSize: pageSize,
                projectId,
                themeColors: themeColors
            } as LayoutPo;
            if (activeCategoryId !== undefined) {
                params.category = activeCategoryId;
            }
            const response = await lastValueFrom(
                pptClassicLayoutService.list(params).pipe(
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
    const handleConfirm = async () => {
        if (!tempSelectedLayout) return;

        try {

            onConfirm(tempSelectedLayout)

        } catch (error) {
            AntMessage.error('布局切换失败');
            console.error('布局切换失败:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal
            title="选择模板"
            onOk={handleConfirm}
            open={isOpen}
            onCancel={onClose}
            width={850}
            styles={{ body: { padding: 0 } }}

        >

            <div className='p-4 '>

                <Spin spinning={layoutsLoading || isFetchingNextPage || loading || categoriesLoading}>
                    <Tabs
                        activeKey={activeCategoryId !== undefined ? String(activeCategoryId) : undefined}
                        items={categoryTabs}
                        onChange={(key) => {
                            const nextCategoryId = Number.parseInt(key, 10);
                            setActiveCategoryId(Number.isNaN(nextCategoryId) ? undefined : nextCategoryId);
                        }}
                    />
                    <div className="space-y-3 max-h-[600px] overflow-y-auto" style={
                        {
                            overflowX: 'hidden'
                        }
                    }>
                        {layouts && layouts.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                <>
                                    {layouts.map((layout, index) => (
                                        <Col span={6} key={layout.layoutId}>
                                            <LayoutItem
                                                key={layout.layoutId}
                                                layout={layout}
                                                index={index}
                                                total={layouts.length}
                                                isSelected={tempSelectedLayout === layout.layoutId}
                                                onSelect={() => {
                                                    setTempSelectedLayout(layout.layoutId);

                                                }}
                                                lastElementRef={layouts.length === index + 1 ? lastElemetObserver : undefined}
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
            </div>

        </Modal>
    );
};

export default TemplateDrawer;
