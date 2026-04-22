import React, { useMemo, useRef, useState } from 'react';
import { Card, Dropdown, Empty, Spin } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { history } from 'umi';
import { lastValueFrom } from 'rxjs';
import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash';
import PageHead from '@/components/base/page-head';
import { TemplateCard } from '@/components/base/cards';
import { PptTemplateService } from '@/services/pptTemplate.service';
import { PptTemplatePo } from '@/models/pptTemplatePo';
import { useShowDeleteConfirm, useTranslate } from '@/hooks/common-hooks';
import { pptCreateMode, pptProjectSortOrder } from '@/constants/dict-ppt';
import { registerDictionary, useDictionary } from '@/utils/dictionary';

const pptTemplateService = PptTemplateService.getInstance();

const normalizePagedResult = (response: any) => ({
  data: response?.data?.data || response?.data || [],
  total: response?.data?.total || response?.total || 0,
});

const MyTemplates: React.FC = () => {
  const { t } = useTranslate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [queryParams, setQueryParams] = useState<Record<string, any>>({});
  const [selectedSortOrder, setSelectedSortOrder] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 20;
  const showDeleteConfirm = useShowDeleteConfirm();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, refetch } = useInfiniteQuery({
    queryKey: ['pptMyTemplates', queryParams],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await lastValueFrom(
        pptTemplateService.myTemplate({
          pageNum: pageParam,
          pageSize,
          ...queryParams,
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

  registerDictionary(pptCreateMode.name, {
    ...cloneDeep(pptCreateMode),
    onDataLoaded(dataSource) {
      return [{ value: '', label: t?.('ppt.myWorks.selectAll') || '全部' }, ...dataSource];
    },
  });
  useDictionary(pptCreateMode.name);

  const handleTemplateEdit = (item: PptTemplatePo) => {
    history.push(`/ppt/my-templates/${item.templateId}`);
  };

  const handleTemplateDelete = (item: PptTemplatePo) => {
    showDeleteConfirm({
      title: '确定要删除该模板吗？',
      onOk: () => {
        pptTemplateService.delete(item).subscribe(() => {
          refetch();
        });
      },
      onCancel() {},
    });
  };

  return (
    <div className="h-full w-full bg-gray-50 overflow-hidden flex flex-col">
      <div className="px-8 py-4">
        <PageHead pageTitle={t?.('ppt.myTemplates.title') || '我的模板'} goBack={null} pageDesc={t?.('ppt.myTemplates.subtitle') || '我的专属 PPT 模板库'} />
      </div>

      <div className="mate-searchbar flex justify-between items-center pl-4 sm:pl-6 lg:pl-8 pr-5 sm:pr-7 lg:pr-10 gap-4">
        <div className="flex gap-4 flex-wrap filter text-textcolor-400">
          <Dropdown
            menu={{
              items: [
                {
                  key: 'clear',
                  label: t?.('ppt.myWorks.selectDefault') || '默认排序',
                  onClick: () => {
                    setSelectedSortOrder(undefined);
                    setQueryParams((prev) => ({ ...prev, sortord: undefined }));
                  },
                },
                ...pptProjectSortOrder.dataSource.map((item) => ({
                  key: item.value,
                  label: t?.(`ppt.sort.${item.value}`) || item.label,
                  onClick: () => {
                    setSelectedSortOrder(item.value);
                    setQueryParams((prev) => ({ ...prev, sortord: item.value }));
                  },
                })),
              ],
            }}
          >
            <div className="flex items-center mr-5 cursor-pointer">
              {selectedSortOrder ? t?.(`ppt.sort.${selectedSortOrder}`) : t?.('ppt.myWorks.selectDefault')}
              <DownOutlined className="text-xs ml-2" />
            </div>
          </Dropdown>
        </div>

        <div className="relative group">
          <input
            type="text"
            placeholder={t?.('common.operation.search') || '搜索...'}
            value={searchTerm}
            onChange={(event) => {
              const value = event.target.value;
              setSearchTerm(value);
              if (!value) setQueryParams((prev) => ({ ...prev, term: undefined }));
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                const value = searchTerm.trim();
                setQueryParams((prev) => ({ ...prev, term: value || undefined }));
              }
            }}
            className="pl-10 pr-4 py-2 bg-white border border-white/50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48 md:w-64 transition-all outline-none shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {isFetching ? (
          <div className="flex items-center justify-center h-full">
            <Spin />
          </div>
        ) : (
          <>
            <div className="grid sm:gap-4 xl:gap-x-6 xl:gap-y-20 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 w-full">
              <div className="transition-transform duration-300 hover:scale-105">
                <Card
                  className="h-[226px]"
                  style={{ padding: 15, borderRadius: 20, boxShadow: '0px 18px 40px 0px rgba(212, 217, 232, 1)' }}
                  hoverable
                  styles={{ body: { padding: '16px' } }}
                  onClick={() => history.push('/ppt/my-templates/new')}
                >
                  <div className="flex flex-col gap-2 items-center">
                    <div className="w-24 h-24 flex items-center justify-center text-primary-500 rounded-full shadow-md">
                      <PlusOutlined className="text-4xl text-primary-500" />
                    </div>
                    <div className="text-xl font-bold">自定义模板</div>
                  </div>
                </Card>
              </div>

              {templates.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-20">
                  <Empty description={t?.('common.pagination.noData') || 'No Data'} />
                </div>
              ) : (
                templates.map((template) => (
                  <div key={template.templateId || nanoid()} className="w-full" onClick={() => handleTemplateEdit(template)}>
                    <TemplateCard item={template} onEdit={() => handleTemplateEdit(template)} onDelete={() => handleTemplateDelete(template)} />
                  </div>
                ))
              )}
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
  );
};

export default MyTemplates;
