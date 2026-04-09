import { Button, Radio, Select, Spin, Empty, Tabs } from 'antd'
import { PptTemplatePo } from "@/models/pptTemplatePo";
import { PptScenePo } from '@/models/pptScenePo';
import { PptStylePo } from '@/models/pptStylePo';
import { LeftOutlined } from '@ant-design/icons';
import { PptTemplateService } from "@/services/pptTemplate.service";
import { PptStyleService } from "@/services/pptStyle.service";
import { PptSceneService } from "@/services/pptScene.service";
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { firstValueFrom, lastValueFrom, map } from "rxjs";
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { getImageUrl } from '@/utils/imageUrl';
import useAuthStore from '@/stores/authStore';

const { Option } = Select

interface CreateMode {
    key: string;
    label: string;
}

interface TemplateCategory {
    key: string;
    label: string;
}

export interface FilterCriteria {
    createMode: string;
    templateCategory: string;
    styleId?: number;
    sceneId?: number;
}

interface TemplatesPage {
    data: PptTemplatePo[];
    total: number;
    page: number;
    hasMore: boolean;
}

const pptTemplateService = PptTemplateService.getInstance();
const pptTemplateSceneService = PptSceneService.getInstance();
const pptTemplateStyleService = PptStyleService.getInstance();

export default function PptTemplateSelector({ nextStep, templates: propTemplates, preStep, createMode }: { nextStep: (id: string, criteria: FilterCriteria) => void, templates: PptTemplatePo[], preStep: () => void, createMode?: string }) {
    const [templateId, setTemplateId] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState<PptTemplatePo | null>(null)
    const [minioService, setMinioService] = useState<any>(null);
    const getMinioService = useAuthStore((state) => state.getMinioService);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [processedSelectedTemplate, setProcessedSelectedTemplate] = useState<PptTemplatePo | null>(null);
    const [createModes] = useState<CreateMode[]>([
        { key: 'classic', label: '经典' }
    ])
    const [activeType, setActiveType] = useState(createMode)
    const [categories] = useState<TemplateCategory[]>([
        { key: 'system', label: '系统' },
        { key: 'custom', label: '自定义' }
    ])
    const [activeCategory, setActiveCategory] = useState('system')
    const [selectedStyle, setSelectedStyle] = useState<number | undefined>(undefined)
    const [selectedScene, setSelectedScene] = useState<number | undefined>(undefined)

    // 初始化MinIO服务
    useEffect(() => {
        const initMinioService = async () => {
            const service = await getMinioService('');
            setMinioService(service);
        };
        initMinioService();
    }, [getMinioService]);

    // 处理模板的所有图片字段
    useEffect(() => {
        if (selectedTemplate && minioService) {
            const processedTemplate = {
                ...selectedTemplate,
                coverImage: getImageUrl(selectedTemplate.coverImage, minioService),
                catalogImage: getImageUrl(selectedTemplate.catalogImage, minioService),
                contentImage: getImageUrl(selectedTemplate.contentImage, minioService),
                endImage: getImageUrl(selectedTemplate.endImage, minioService),
            };
            setProcessedSelectedTemplate(processedTemplate);
        } else {
            setProcessedSelectedTemplate(selectedTemplate);
        }
    }, [selectedTemplate, minioService]);


    // useEffect(() => {
    //     // 获取风格分类
    //     pptTemplateService.list({

    //         pageNum: 1,
    //         pageSize: 8
    //     } as PptTemplatePo).subscribe(res => {
    //         // setStylesData(res.data)
    //         console.log('res:', res);
    //     })
    // }, [])

    // 获取风格分类
    const { data: stylesData } = useQuery<PptStylePo[]>(
        {
            queryKey: ['templateStyles'],
            initialData: [],
            queryFn: () => {
                return lastValueFrom(pptTemplateStyleService.list({ pageSize: 1000 } as PptStylePo).pipe(
                    map(res => res.data)
                ))
            },
        }

    );

    // 获取场景分类
    const { data: scenesData } = useQuery<PptScenePo[]>(
        {
            queryKey: ['templateScenes'],
            initialData: [],
            queryFn: () => {
                return lastValueFrom(pptTemplateSceneService.list({ pageSize: 1000 } as PptScenePo).pipe(
                    map(res => res.data)
                ))
            },
        }

    );

    // 获取模板列表（支持无限滚动）


    const {
        data: templatesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isLoading

    } = useInfiniteQuery<TemplatesPage>({
        queryKey: ['templates', activeType, activeCategory, selectedStyle, selectedScene],
        queryFn: async ({ pageParam }: { pageParam: unknown }) => {
            const currentPage = typeof pageParam === 'number' ? pageParam : 1;

            if (propTemplates && propTemplates.length > 0) {
                return {
                    data: propTemplates,
                    total: propTemplates.length,
                    page: 1,
                    hasMore: false
                };
            }

            const filters: any = {
                createMode: activeType,

            };

            if (selectedStyle) {
                filters.styleId = selectedStyle;
            }

            if (selectedScene) {
                filters.sceneId = selectedScene;
            }

            let req = pptTemplateService.list({
                ...filters,
                pageNum: currentPage,
                published: true,
                pageSize: 8
            });

            if (activeCategory === 'custom') {
                req = pptTemplateService.myTemplate({
                    ...filters,
                    pageNum: currentPage,
                    published: true,
                    pageSize: 8
                });
            }

            const response = await lastValueFrom(req);

            return {
                data: response.data || [],
                total: response.total || 0,
                page: currentPage,
                hasMore: response.total > currentPage * 8
            };
        },
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.page + 1 : undefined;
        },
        initialPageParam: 1
        // keepPreviousData: true
    });
    // 正确提取所有页面的数据
    const templates = templatesData?.pages.flatMap(page => page.data) || [];
    const hasMore = templatesData?.pages[templatesData.pages.length - 1]?.hasMore || false;

    // 处理无限滚动
    const observer = useRef<IntersectionObserver | null>(null)
    const lastTemplateElementRef = useRef<HTMLDivElement>(null)

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

    // 当筛选条件改变时重新加载
    // useEffect(() => {
    //     refetch();
    // }, [activeType, activeCategory, selectedStyle, selectedScene, refetch]);

    // 设置默认选中模板
    useEffect(() => {
        if (templates.length > 0 && !selectedTemplate) {
            setSelectedTemplate(templates[0]);
            setTemplateId(templates[0].templateId);
        }
    }, [templates, selectedTemplate]);

    const selectTemplate = useCallback((template: PptTemplatePo) => {
        setSelectedTemplate(template);
        setTemplateId(template.templateId);
    }, []);

    // 构建筛选条件对象
    const buildFilterCriteria = (): FilterCriteria => {
        const criteria: FilterCriteria = {
            createMode: activeType,
            templateCategory: activeCategory
        };

        if (selectedStyle !== undefined) {
            criteria.styleId = selectedStyle;
        }

        if (selectedScene !== undefined) {
            criteria.sceneId = selectedScene;
        }

        return criteria;
    };

    return (
        <div className="flex h-full w-full p-6">
            {/* 左侧预览区域 */}
            <div className="w-3/4 pr-6">
                {processedSelectedTemplate ? (
                    <div className="h-full bg-gray-100 rounded-lg p-4 flex flex-col">
                        <div className="font-bold text-xl mb-4 flex-none">
                            <Button type='text' className='cursor-pointer mr-2 p-2' onClick={() => {
                                preStep()
                            }} >
                                <LeftOutlined />
                            </Button>
                            模板预览</div>

                        <div ref={previewContainerRef} className='flex-1 overflow-auto bg-fill-layout rounded-lg flex justify-center items-center' style={{ padding: '100px' }}>
                            <div className='mainContent' style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                            }}>
                                {/* 大图：起始页 */}
                                <div style={{ aspectRatio: '16/9', flex: '1 1 auto', minHeight: 0 }}>
                                    {processedSelectedTemplate.coverImage ? (
                                        <img
                                            src={processedSelectedTemplate.coverImage}
                                            alt="Cover"
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                            起始页预览
                                        </div>
                                    )}
                                </div>
                                {/* 三个小图 */}
                                <div style={{ display: 'flex', gap: '20px', height: 'auto' }}>
                                    {[processedSelectedTemplate.catalogImage, processedSelectedTemplate.contentImage, processedSelectedTemplate.endImage].map((image, index) => (
                                        <div key={index} style={{ flex: '1 1 auto', aspectRatio: '16/9', minHeight: 0 }}>
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-contain rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs">
                                                    {['目录页', '内容页', '结束页'][index]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        请选择一个模板
                    </div>
                )}
            </div>

            {/* 右侧模板选择区域 */}
            <div className="w-1/4 flex flex-col">
                {/* 标题和类型切换按钮 */}
                <div className="flex items-center mb-6 justify-between">
                    <h2 className="text-2xl font-bold mr-4">选择模板</h2>
                    <div className="flex space-x-2">
                        {/* <Radio.Group buttonStyle="solid" value={activeType}>
                            {createModes.map(type => (
                                <Radio.Button
                                    key={type.key}
                                    value={type.key}
                                    // className={`px-4 py-2 rounded-md ${
                                    //   activeType === type.key 
                                    //     ? 'bg-blue-500 text-white' 
                                    //     : 'bg-gray-200 text-gray-700'
                                    // }`}

                                    // disabled={type.key !== activeType}
                                    onClick={() => setActiveType(type.key)}
                                >
                                    {type.label}
                                </Radio.Button>
                            ))}
                        </Radio.Group> */}
                    </div>
                </div>

                {/* 分类标签 */}
                <Tabs
                    activeKey={activeCategory}
                    onChange={(key) => setActiveCategory(key)}
                    className="mb-6"
                    items={categories
                        .map(category => ({
                            key: category.key,
                            label: category.label,
                        }))}
                />

                {/* 筛选条件 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">风格</label>
                        <Select
                            className="w-full"
                            placeholder="全部风格"
                            allowClear
                            value={selectedStyle}
                            onChange={(value) => setSelectedStyle(value !== undefined ? Number(value) : undefined)}
                        >
                            {stylesData.map(style => (
                                <Option key={style.styleId} value={style.styleId}>
                                    {style.styleName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">场景</label>
                        <Select
                            className="w-full"
                            placeholder="全部场景"
                            allowClear
                            value={selectedScene}
                            onChange={(value) => setSelectedScene(value !== undefined ? Number(value) : undefined)}
                        >
                            {scenesData.map(scene => (
                                <Option key={scene.sceneId} value={scene.sceneId}>
                                    {scene.sceneName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* 模板列表 */}
                <div className="flex-grow overflow-y-auto">

                    <Spin
                        spinning={isLoading}>
                        {templates.length === 0 && !isLoading ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    {templates.map((template, index) => (
                                        <div
                                            ref={templates.length === index + 1 ? lastElemetObserver : null}
                                            key={template.templateId}
                                            className={`border rounded-lg p-2 cursor-pointer hover:border-blue-500 ${templateId === template.templateId ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                                }`}
                                            onClick={() => selectTemplate(template)}
                                        >
                                            <div className="aspect-video bg-gray-200 rounded  flex items-center justify-center">
                                                {template.coverImage && minioService ? (
                                                    <img
                                                        src={getImageUrl(template.coverImage, minioService)}
                                                        alt={template.templateName}
                                                        className="w-full h-full object-contain rounded"
                                                    />
                                                ) : (
                                                    <span>模板预览</span>
                                                )}
                                            </div>
                                            {/* <div className="font-medium truncate">{template.templateName}</div> */}
                                        </div>
                                    ))}
                                </div>
                                {hasMore && (
                                    <div className="flex justify-center my-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                            </>
                        )}
                    </Spin>

                </div>

                {/* 下一步按钮 */}
                <div className="mt-6">
                    <button
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300"
                        disabled={!templateId}
                        onClick={() => {
                            if (templateId) {
                                const criteria = buildFilterCriteria();
                                nextStep(templateId, criteria);
                            }
                        }}
                    >
                        下一步: 生成PPT
                    </button>
                </div>
            </div>
        </div>
    )
}
