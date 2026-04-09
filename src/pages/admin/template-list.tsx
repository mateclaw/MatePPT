import React, { useState } from 'react';
import { Empty, Spin, Form, Input, Dropdown, Button, Card } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { PptTemplateService } from '@/services/pptTemplate.service';
import { PptTemplatePo } from '@/models/pptTemplatePo';
import { useShowDeleteConfirm, useTranslate } from '@/hooks/common-hooks';
import useBreakpoints from '@/hooks/use-breakpoints';
import { history, Icon } from 'umi';

import PageHead from '@/components/base/page-head';
import { ProjectCard, TemplateCard } from '@/components/base/cards';
import MatePager from '@/components/base/mate-pager';
import { lastValueFrom } from 'rxjs';
import { nanoid } from 'nanoid';
import { pptProjectStatus, pptProjectSortOrder, pptCreateMode } from '@/constants/dict-ppt';
import { registerDictionary, useDictionary } from "@/utils/dictionary";
import { cloneDeep } from 'lodash';

const pptTemplateService = PptTemplateService.getInstance();

const TemplateList: React.FC = () => {
  const { t } = useTranslate();
  const media = useBreakpoints();
  const [queryParams, setQueryParams] = useState<Record<string, any>>({});
  const [selectedCreateMode, setSelectedCreateMode] = useState<string | undefined>(undefined);
  const [selectedSortOrder, setSelectedSortOrder] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageNum: 1, pageSize: 20 });
  const [total, setTotal] = useState(0);

  const showDeleteConfirm = useShowDeleteConfirm();

  const [queryForm] = Form.useForm();

  const updateQueryParams = (values: Record<string, any>) => {
    setQueryParams(values);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
  };

  // 使用 @tanstack/react-query 的 useQuery
  const {
    data,
    isFetching,
    isLoading,
    error,
    refetch,
    
  } = useQuery<PptTemplatePo[]>({
    queryKey: ['pptMyTemplates', queryParams, pagination.pageNum, pagination.pageSize],
    queryFn: async () => {
      const response = await lastValueFrom(pptTemplateService.myTemplate({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        ...queryParams,
      } as any));

      setTotal(response.total || 0);
      return response.data || [];
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

  const rawData = data as any;
  const templates: PptTemplatePo[] = Array.isArray(rawData)
    ? rawData
    : (rawData?.data || []);


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
  const handleTemplateEdit = (item: PptTemplatePo) => {
    history.push(`/admin/template-detail/${item.templateId}`);
  };

  const handleTemplateDelete = (item: PptTemplatePo) => {
        // 实现删除逻辑
    showDeleteConfirm({
      title: '确定要删除该记录吗？',
      onOk: () => {
        pptTemplateService.delete(item).subscribe(() => {
          refetch();
        });
      },
      onCancel() {

      }
    })
  };

  return (
    <div className="h-full w-full bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className='px-8 py-4'>
        <PageHead pageTitle={t?.('ppt.myTemplates.title')} goBack={null} pageDesc={t?.('ppt.myTemplates.subtitle')} />
      </div>

      <div className="mate-searchbar flex justify-between items-center pl-4 sm:pl-6 lg:pl-8 pr-5 sm:pr-7 lg:pr-10 gap-4">
        <div className="flex gap-4 flex-wrap filter">
          <div className="flex items-center gap-2">

            <Dropdown
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
            </Dropdown>
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
        {isFetching ? (
          <div className="flex items-center justify-center h-full">
            <Spin />
          </div>
        ) : (
          <>

            {/* Templates Grid - Tailwind Responsive Grid */}
            <div className="grid sm:gap-4 xl:gap-x-6 xl:gap-y-20 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 w-full">
              <div className="transition-transform duration-300 hover:scale-105">

                <Card className='h-[226px] ' style={{
                  padding: 15,
                  borderRadius: 20,
                  boxShadow: '0px 18px 40px 0px rgba(212, 217, 232, 1)',
                }} hoverable styles={{ body: { padding: '16px' } }} onClick={() => history.push('/ppt/my-templates/new')}>
                  <div className='flex flex-col gap-2 items-center'>
                    <div className='w-24 h-24 flex items-center justify-center text-primary-500 rounded-full shadow-md'>
                      <PlusOutlined className='text-4xl text-primary-500' />
                    </div>

                    <div className='text-xl font-bold'>
                      自定义模板
                    </div>


                  </div>
                </Card>
              </div>
              {templates.map((template) => (
                <div key={nanoid() || template.templateId} className="w-full" onClick={() => handleTemplateEdit(template)}>
                  <TemplateCard
                    item={template}
                 
                    onEdit={() => handleTemplateEdit(template)}
                    onDelete={() => handleTemplateDelete(template)}
                  />
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

export default TemplateList;
