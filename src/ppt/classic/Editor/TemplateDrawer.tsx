import { Drawer, Spin, Select, Button, message as AntMessage, Empty, Tabs } from 'antd';
import { ClassicService } from '@/services/classic.service';
import { PptTemplateService } from '@/services/pptTemplate.service';
import { PptStyleService } from '@/services/pptStyle.service';
import { PptSceneService } from '@/services/pptScene.service';
import { PptTemplatePo } from '@/models/pptTemplatePo';
import { PptStylePo } from '@/models/pptStylePo';
import { PptScenePo } from '@/models/pptScenePo';
import { PptProjectPo } from '@/models/pptProjectPo';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { lastValueFrom, map } from 'rxjs';
import { getImageUrl } from '@/utils/imageUrl';
import useAuthStore from '@/stores/authStore';

const { Option } = Select;
interface TemplateCategory {
  key: string;
  label: string;
}
interface TemplateDrawerProps {
  isOpen: boolean;
  projectId?: string;
  createMode?: string;
  onClose: () => void;
  onDataReload?: (pptData: any, source?: 'layout' | 'template' | 'theme') => void;
  selectType?: 'switch' | 'select'
}

interface TemplatesPage {
  data: PptTemplatePo[];
  total: number;
  page: number;
  hasMore: boolean;
}

const normalizePagedResult = (response: any) => ({
  data: response?.data?.data || response?.data || [],
  total: response?.data?.total || response?.total || 0,
});

const pptSlideClassicService = ClassicService.getInstance();
const pptTemplateService = PptTemplateService.getInstance();
const pptTemplateStyleService = PptStyleService.getInstance();
const pptTemplateSceneService = PptSceneService.getInstance();

const TemplateDrawer: React.FC<TemplateDrawerProps> = ({
  isOpen,
  projectId,
  createMode = 'classic',
  onClose,
  onDataReload,
  selectType = 'switch'
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PptTemplatePo | null>(null);
  const [categories] = useState<TemplateCategory[]>([
    { key: 'system', label: '系统' },
    { key: 'custom', label: '自定义' }
  ])
  const [activeCategory, setActiveCategory] = useState('system')
  const [tempSelectedTemplate, setTempSelectedTemplate] = useState<PptTemplatePo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<number | undefined>(undefined);
  const [selectedScene, setSelectedScene] = useState<number | undefined>(undefined);
  const [minioService, setMinioService] = useState<any>(null);
  const getMinioService = useAuthStore((state) => state.getMinioService);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTemplateElementRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;

  // 初始化MinIO服务
  useEffect(() => {
    const initMinioService = async () => {
      const service = await getMinioService('');
      setMinioService(service);
    };
    if (isOpen) {
      initMinioService();
    }
  }, [isOpen, getMinioService]);

  // 当Drawer打开时，清除临时选中状态和皮选条件（每次打开都重新开始选择）
  useEffect(() => {
    if (isOpen) {
      setTempSelectedTemplate(null);
      setSelectedStyle(undefined);
      setSelectedScene(undefined);
    }
  }, [isOpen]);

  // 当Drawer关闭时，重置选中状态
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null);
    }
  }, [isOpen]);

  // 获取风格分类
  const { data: stylesData } = useQuery<PptStylePo[]>({
    queryKey: ['templateStyles'],
    initialData: [],
    queryFn: () => {
      return lastValueFrom(pptTemplateStyleService.list({ pageSize: 1000 } as PptStylePo).pipe(
        map(res => res.data)
      ));
    },
  });

  // 获取场景分类
  const { data: scenesData } = useQuery<PptScenePo[]>({
    queryKey: ['templateScenes'],
    initialData: [],
    queryFn: () => {
      return lastValueFrom(pptTemplateSceneService.list({ pageSize: 1000 } as PptScenePo).pipe(
        map(res => res.data)
      ));
    },
  });

  // 获取模板列表（支持无限滚动）
  const {
    data: templatesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: templatesLoading,
    refetch
  } = useInfiniteQuery<TemplatesPage>({
    queryKey: ['templates', createMode, activeCategory, selectedStyle, selectedScene],
    enabled: isOpen,
    initialPageParam: 1,
    queryFn: async ({ pageParam }: { pageParam: unknown }) => {
      const currentPage = typeof pageParam === 'number' ? pageParam : 1;



      const filters: any = {
        createMode: createMode,

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
        pageSize: pageSize
      });

      if (activeCategory === 'custom') {
        req = pptTemplateService.myTemplate({
          ...filters,
          pageNum: currentPage,
          published: true,
          pageSize: pageSize
        });
      }

      const response = await lastValueFrom(req);
      const normalized = normalizePagedResult(response);

      return {
        data: normalized.data,
        total: normalized.total,
        page: currentPage,
        hasMore: normalized.total > currentPage * pageSize
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
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
  const templates = templatesData?.pages.flatMap(page => page.data) || [];

  const handleConfirm = async (template: PptTemplatePo) => {
    if (!template) return;

    setLoading(true);
    try {
      const result = await lastValueFrom(
        pptSlideClassicService.switchTemplate({
          projectId,
          templateId: template.templateId
        } as PptProjectPo)
      );

      if (result.code === 0 && result.data) {
        AntMessage.success('模板已切换');
        setSelectedTemplate(template);
        onDataReload?.(result.data, 'template');
        onClose();
      }
    } catch (error) {
      AntMessage.error('模板切换失败');
      console.error('模板切换失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="选择模板"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={400}
      styles={{ body: { padding: 0 } }}
    // footer={
    //   <div className="flex gap-2 justify-end">
    //     <Button onClick={onClose}>
    //       取消
    //     </Button>
    //     <Button
    //       type="primary"
    //       loading={loading}
    //       disabled={!tempSelectedTemplate}
    //       onClick={handleConfirm}
    //     >
    //       确认
    //     </Button>
    //   </div>
    // }
    >

      <div className='p-4'>

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
        <div className="h-full flex flex-col">
          {/* 筛选条件 */}
          <div className="  bg-white sticky top-0 z-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">风格</label>
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
                <label className="block text-sm font-medium mb-2">场景</label>
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
          </div>

          <Spin spinning={templatesLoading || isFetchingNextPage || loading}>
            {/* 模板网格 */}
            <div className="flex-1 overflow-y-auto py-4">
              {templates && templates.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template, index) => (
                    <div
                      ref={templates.length === index + 1 ? lastElemetObserver : null}
                      key={template.templateId}
                      className={`border rounded-lg p-2 cursor-pointer hover:border-blue-500 transition-colors ${tempSelectedTemplate?.templateId === template.templateId
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200'
                        }`}
                      onClick={() => {

                        handleConfirm(template);
                      }}
                    >
                      <div className="aspect-video bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                        {template.coverImage && minioService ? (
                          <img
                            src={getImageUrl(template.coverImage, minioService)}
                            alt={template.templateName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">模板预览</span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
                </div>
              )}
            </div>

          </Spin>
        </div>
      </div>

    </Drawer>
  );
};

export default TemplateDrawer;
