import React, { useMemo, useRef, useState } from 'react';
import { Empty, Form, Input, Spin, Tabs } from 'antd';
import { useInfiniteQuery } from '@tanstack/react-query';
import { history, Icon } from 'umi';
import { lastValueFrom } from 'rxjs';
import { nanoid } from 'nanoid';
import { PptTemplateService } from '@/services/pptTemplate.service';
import { PptTemplatePo } from '@/models/pptTemplatePo';
import { PptSceneService } from '@/services/pptScene.service';
import { PptScenePo } from '@/models/pptScenePo';
import { useTranslate } from '@/hooks/common-hooks';
import { registerDictionary, useDictionary } from '@/utils/dictionary';
import { TemplateCard } from '@/components/base/cards';

const pptTemplateService = PptTemplateService.getInstance();
const pptTemplateSceneService = PptSceneService.getInstance();

type CreateModeType = 'all' | 'classic';

const normalizePagedResult = (response: any) => ({
  data: response?.data?.data || response?.data || [],
  total: response?.data?.total || response?.total || 0,
});

const TemplateMarket: React.FC = () => {
  const { t } = useTranslate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [queryParams, setQueryParams] = useState<Record<string, any>>({});
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [modeType, setModeType] = useState<CreateModeType>('all');
  const [queryForm] = Form.useForm();
  const pageSize = 20;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['pptTemplateMarket', queryParams, modeType],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await lastValueFrom(
        pptTemplateService.list({
          pageNum: pageParam,
          pageSize,
          published: true,
          ...queryParams,
          ...(modeType === 'all' ? {} : { createMode: modeType }),
        } as PptTemplatePo),
      );
      return normalizePagedResult(response);
    },
    getNextPageParam: (lastPage, pages) => {
      const totalLoaded = pages.length * pageSize;
      return totalLoaded < (lastPage.total || 0) ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const templates: PptTemplatePo[] = useMemo(
    () => data?.pages.flatMap((page: any) => page.data || []) || [],
    [data],
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 200;
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleUseTemplate = (templateId: string) => {
    history.push('/ppt/new', { templateId });
  };

  registerDictionary('pptTemplateScene', {
    keyName: 'sceneId',
    valueName: 'sceneName',
    dataSource: pptTemplateSceneService.list({ pageSize: 1000 } as PptScenePo),
    onDataLoaded(dataSource) {
      return [{ sceneId: '', sceneName: t?.('ppt.myWorks.selectAll') || '全部' }, ...dataSource];
    },
  });

  const sceneDictionary = useDictionary('pptTemplateScene');

  const handleSceneTabChange = (key: string) => {
    setSelectedScene(key);
    setQueryParams((prev) => ({
      ...prev,
      sceneId: key || undefined,
    }));
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mt-24 text-4xl font-bold text-center flex-none">模板广场</div>
      <div className="text-xl font-normal text-center py-4 flex-none">汇聚高质量 PPT 模板，支持直接选用并进入创建流程。</div>

      <div className="flex flex-col items-center justify-center flex-none">
        <Form form={queryForm} className="w-[450px]">
          <Form.Item name="term" noStyle>
            <Input
              className="rounded-full"
              size="large"
              onPressEnter={() => setQueryParams(queryForm.getFieldsValue())}
              prefix={<Icon icon="ant-design:search-outline" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder={t?.('common.operation.search') || 'Search'}
            />
          </Form.Item>
        </Form>
      </div>

      <div className="p-6 flex-1 overflow-hidden flex flex-col relative">
        <Tabs
          activeKey={selectedScene}
          onChange={handleSceneTabChange}
          items={(sceneDictionary.data || []).map((scene) => ({
            key: String(scene.value),
            label: scene.label,
          }))}
          tabBarExtraContent={
            <Tabs
              size="small"
              activeKey={modeType}
              onChange={(key) => setModeType(key as CreateModeType)}
              items={[
                { key: 'all', label: '全部' },
                { key: 'classic', label: '经典' },
              ]}
            />
          }
        />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spin />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Empty description={t?.('common.pagination.noData') || 'No Data'} />
            </div>
          ) : (
            <>
              <div className="grid sm:gap-4 xl:gap-x-6 xl:gap-y-20 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 w-full">
                {templates.map((template) => (
                  <div key={template.templateId || nanoid()} className="w-full" onClick={() => handleUseTemplate(template.templateId)}>
                    <TemplateCard item={template} />
                  </div>
                ))}
              </div>
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-8">
                  <Spin size="small" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateMarket;
