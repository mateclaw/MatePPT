import React, { useMemo, useState } from 'react';
import { Empty, Spin, Form, Input, Dropdown, Button, Card, Tabs } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { LayoutService } from '@/services/layout.service';
import { LayoutPo } from '@/models/layoutPo';
import { useTranslate } from '@/hooks/common-hooks';
import useBreakpoints from '@/hooks/use-breakpoints';
import { history, Icon } from 'umi';

import PageHead from '@/components/base/page-head';
import { ProjectCard } from '@/components/base/cards';
import MatePager from '@/components/base/mate-pager';
import { lastValueFrom } from 'rxjs';
import { pptProjectStatus, pptProjectSortOrder, pptCreateMode } from '@/constants/dict-ppt';
import { registerDictionary, useDictionary } from "@/utils/dictionary";
import { cloneDeep } from 'lodash';
import type { PPTSlide } from '@/ppt/core';
import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide';
import { ThemeChanger } from '@/ppt/core/color/ThemeChanger';
import type { ThemeColors } from '@/ppt/core/entity/presentation/ThemeColors';

const layoutService = LayoutService.getInstance();
const defaultThemeColors = {
  accent1: '#5B9BD5',
  accent2: '#ED7D31',
  accent3: '#A5A5A5',
  accent4: '#FFC000',
  accent5: '#4472C4',
  accent6: '#70AD47',
};

interface LayoutCardProps {
  item: LayoutPo;
  themeMap?: Record<string, string> | ThemeColors | null;
}

const LayoutCard: React.FC<LayoutCardProps> = ({ item, themeMap }) => {
  const slide = useMemo(() => {
    if (!item.documentJson) return null;
    try {
      const slideData = typeof item.documentJson === 'string'
        ? JSON.parse(item.documentJson)
        : item.documentJson;
      const themedData = themeMap
        ? ThemeChanger.changeTheme(JSON.parse(JSON.stringify(slideData)), themeMap as Record<string, string>)
        : slideData;
      if (themedData?.slides?.[0]) {
        return themedData.slides[0] as PPTSlide;
      }
      return themedData as PPTSlide;
    } catch (error) {
      console.error('解析 slideJson 失败:', error);
      return null;
    }
  }, [item.documentJson, themeMap]);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-white flex items-center justify-center">
        {slide ? (
          <ThumbnailSlide slide={slide} size={280} />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>layout #{String(BigInt(item.layoutId)) }</span>
        <span>{item.slideType || '-'}</span>
      </div>
    </div>
  );
};

const LayoutList: React.FC = () => {
  const { t } = useTranslate();
  const media = useBreakpoints();
  const [queryParams, setQueryParams] = useState<Record<string, any>>({});
  const [selectedCreateMode, setSelectedCreateMode] = useState<string | undefined>(undefined);
  const [selectedSortOrder, setSelectedSortOrder] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20 });
  const [selectedGroupCount, setSelectedGroupCount] = useState<number | null>(null);


  const [queryForm] = Form.useForm();

  const updateQueryParams = (values: Record<string, any>) => {
    setQueryParams(values);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
  };

  // 使用 @tanstack/react-query 的 useQuery
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['layoutList', queryParams, pagination.pageNum, pagination.pageSize],
    queryFn: async () => {
      const response = await lastValueFrom(layoutService.list({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        themeColors: defaultThemeColors,
        ...queryParams,
      } as LayoutPo));
      return response;
    },
    
  });

  registerDictionary(pptCreateMode.name, {
    ...cloneDeep(pptCreateMode), onDataLoaded(data) {
      console.log('Data loaded:', data);
      const res = [{
        value: '',
        label: t?.('ppt.myWorks.selectAll'),
      }, ...data]
      return res

    },
  });

  const typeDictionary = useDictionary(pptCreateMode.name);

  const rawData = data?.data as any;
  const templates: LayoutPo[] = Array.isArray(rawData)
    ? rawData
    : (rawData?.data || []);
  const total = typeof data?.total === 'number'
    ? data?.total
    : (rawData?.total || 0);
  const themeMap = defaultThemeColors as ThemeColors;

  // 处理编辑模板
  const handleEdit = (templateId: string) => {
    // 实现编辑逻辑
  };

  // 处理删除模板
  const handleDelete = (templateId: string) => {
    console.log('Delete:', templateId);
  };

  const handleSearch = () => {
    const values = queryForm.getFieldsValue();
    setQueryParams(values);
  };

  // 模板卡片处理
  const handleTemplateEdit = (item: LayoutPo) => {
    // console.log('Layout click:', item.layoutId);
    history.push(`/admin/layout-detail/${String(BigInt(item.layoutId))}`);
  };

  return (
    <div className="h-full w-full bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className='px-8 py-4'>
        <PageHead pageTitle={'布局列表'} goBack={null} pageDesc={'我的布局列表'} />
      </div>

      <div className="mate-searchbar flex justify-between items-center pl-4 sm:pl-6 lg:pl-8 pr-5 sm:pr-7 lg:pr-10 gap-4">
        <div className="flex gap-4 flex-wrap filter">
          <div className="flex items-center gap-2">
            <Tabs
              size="small"
              activeKey={selectedGroupCount ? String(selectedGroupCount) : 'all'}
              onChange={(key) => {
                const next = key === 'all' ? null : Number(key);
                const nextValue = Number.isNaN(next as number) ? null : (next as number);
                setSelectedGroupCount(nextValue);
                updateQueryParams({ ...queryParams, groupCount: nextValue ?? undefined });
              }}
              items={[
                { key: 'all', label: '全部' },
                { key: '2', label: 'groupCount:2' },
                { key: '3', label: 'groupCount:3' },
                { key: '4', label: 'groupCount:4' },
                { key: '5', label: 'groupCount:5' },
                { key: '6', label: 'groupCount:6' },
              ]}
            />

            {/* <Dropdown
              menu={{
                items: [
                  {
                    key: 'clear',
                    label: t?.('ppt.myWorks.selectDefault'),
                    onClick: () => {
                      setSelectedSortOrder(undefined);
                      const values = queryForm.getFieldsValue();
                      values.sortord = undefined;
                      updateQueryParams(values);
                      queryForm.setFieldValue('sortord', undefined);
                    },
                  },

                  ...pptProjectSortOrder.dataSource.map((item) => ({
                    key: item.value,
                    label: t?.(`ppt.sort.${item.value}`),
                    onClick: () => {
                      setSelectedSortOrder(item.value);
                      const values = queryForm.getFieldsValue();
                      values.sortord = item.value;
                      updateQueryParams(values);

                      queryForm.setFieldValue('sortord', item.value);
                    },
                  })),
                ],
              }}
            >

              <div className="flex items-center mr-5 cursor-pointer">
                {selectedSortOrder ? t?.(`ppt.sort.${selectedSortOrder}`) : t?.('ppt.myWorks.selectDefault')}
                <DownOutlined className='text-xs ml-2' />
              </div>
            </Dropdown> */}
          </div>
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder={t?.('common.operation.search') || '搜索...'}
            value={searchTerm}
            onChange={(event) => {
              const value = event.target.value;
              setSearchTerm(value);
              if (!value) {
                updateQueryParams({ ...queryParams, term: undefined });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                const value = searchTerm.trim();
                updateQueryParams({ ...queryParams, term: value || undefined });
              }
            }}
            className="pl-10 pr-4 py-2 bg-white border border-white/50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48 md:w-64 transition-all outline-none shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Content Container */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spin />
          </div>
        ) : (
          <>

            {/* Templates Grid - Tailwind Responsive Grid */}
            <div className="grid sm:gap-4 xl:gap-x-6 xl:gap-y-20 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 w-full">
     
              {templates.map((layout) => (
                <div key={String(BigInt(layout.layoutId))} className="w-full cursor-pointer" onClick={() => handleTemplateEdit(layout)}>
                  <LayoutCard item={layout} themeMap={themeMap} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end py-6">
              <MatePager
                current={pagination.pageNum}
                pageSize={pagination.pageSize}
                total={total}
                onChange={(page, pageSize) => {
                  setPagination({ pageNum: page, pageSize });
                }}
                onShowSizeChange={(_, pageSize) => {
                  setPagination({ pageNum: 1, pageSize });
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LayoutList;
