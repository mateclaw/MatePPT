import React, { useRef, useState } from 'react';
import { Button, Card, Empty, Spin, Space, Tag, Dropdown, Form, Input } from 'antd';
import { DeleteOutlined, DownOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PptProjectService } from '@/services/pptProject.service';
import { PptProjectPo } from '@/models/pptProjectPo';
import { useTranslate } from '@/hooks/common-hooks';
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints';
import dayjs from 'dayjs';
import { history, Icon } from 'umi';
import './ppt-my-works.css';

import PageHead from "@/components/base/page-head";
import { ProjectCard } from '@/components/base/cards';
import { formatRelativeTime } from '@/utils/date-util';
import { lastValueFrom } from 'rxjs';
import { nanoid } from 'nanoid';
import { pptProjectStatus, pptProjectSortOrder } from '@/constants/dict-ppt';
import { useShowDeleteConfirm } from "@/hooks/common-hooks";

const pptProjectService = PptProjectService.getInstance();

const MyWork: React.FC = () => {
  const { t } = useTranslate();
  const media = useBreakpoints();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [queryParams, setQueryParams] = useState<Record<string, any>>({});
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedSortOrder, setSelectedSortOrder] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 20;



  const [queryForm] = Form.useForm();

  // 使用 @tanstack/react-query 的 useInfiniteQuery
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,

  } = useInfiniteQuery({
    queryKey: ['pptProjects', queryParams],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await lastValueFrom(pptProjectService.myProject({
        pageNum: pageParam,
        pageSize: pageSize,
        ...queryParams,
      } as any));
      return response;
    },
    getNextPageParam: (lastPage, pages) => {
      // 计算是否有更多数据
      const totalLoaded = pages.length * pageSize;
      const total = lastPage.total || 0;
      // 如果已加载的数据量小于总数，则返回下一页页码
      return totalLoaded < total ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // 处理无限滚动
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 200;
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // 合并所有分页的数据
  const projects: PptProjectPo[] = data?.pages.flatMap((page) => page.data || []) || [];



  // 处理编辑项目
  const handleEdit = (projectId: number) => {
    // history.push(`/ppt/${projectId}`);
  };

  // 处理查看项目
  const resolveEditorPath = (item: PptProjectPo, query: string = '') => {
    return `/ppt/detail/${item.projectId}/editor-classic${query}`;
  };

  const handleView = (projectId: number) => {
    const item = projects.find((project) => project.projectId === projectId);
    if (item) {
      history.push(resolveEditorPath(item, '?view=true'));
      return;
    }
    history.push(`/ppt/detail/${projectId}/editor?view=true`);
  };

  const showDeleteConfirm = useShowDeleteConfirm();




  const handleSearch = () => {
    const values = queryForm.getFieldsValue();
    setQueryParams(values);
  };

  const isMobile = media === MediaType.mobile || media === MediaType.tablet;

  // 项目卡片
  const handleProjectEdit = (item: PptProjectPo) => {
    if (isMobile) {
      // 移动端直接跳转到浏览页
      history.push(`/ppt/detail/${item.projectId}/viewer`);
      return;
    }
    if (item.status === 'pending') {
      history.push(`/ppt/detail/${item.projectId}/outline`);
    } else {
      history.push(resolveEditorPath(item));
    }
  };

  const handleProjectDelete = (item: PptProjectPo) => {
    // 实现删除逻辑
    showDeleteConfirm({
      title: '确定要删除该记录吗？',
      onOk: () => {
        pptProjectService.delete(item).subscribe(() => {
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
      <div className='px-4 sm:px-8 py-3 sm:py-4'>
        <PageHead pageTitle={t?.('ppt.myWorks.title')}  goBack={null} pageDesc={t?.('ppt.myWorks.subtitle')} />

      </div>
      <div className="mate-searchbar flex justify-between items-center pl-4 sm:pl-6 lg:pl-8 pr-5 sm:pr-7 lg:pr-10 gap-4">
        <div className="flex gap-4 flex-wrap filter text-textcolor-400">
          {/* 状态筛选 */}
          <div className="flex items-center gap-2 ">

            <Dropdown
              menu={{
                items: [
                  {
                    key: 'clear',
                    label: t?.('ppt.myWorks.selectAll') + t?.('ppt.myWorks.status'),
                    onClick: () => {
                      setSelectedStatus(undefined);
                      const values = queryForm.getFieldsValue();
                      values.status = undefined;
                      setQueryParams(values);
                      queryForm.setFieldValue('status', undefined);
                    },
                  },
                  // { type: 'divider' },
                  ...pptProjectStatus.dataSource.map((item) => ({
                    key: item.value,
                    label: t?.(`ppt.status.${item.value}`),
                    onClick: () => {
                      setSelectedStatus(item.value);
                      const values = queryForm.getFieldsValue();
                      values.status = item.value;
                      setQueryParams(values);
                      queryForm.setFieldValue('status', item.value);
                    },
                  })),
                ],
              }}
            >
              <div className="flex items-center mr-5 cursor-pointer">
                {selectedStatus ? t?.(`ppt.status.${selectedStatus}`) : t?.('ppt.myWorks.selectAll') + t?.('ppt.myWorks.status')}
                <DownOutlined className='text-xs ml-2' />
              </div>
            </Dropdown>
          </div>

          {/* 排序方式 */}
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
                      setQueryParams(values);
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
                      setQueryParams(values);

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
                setQueryParams({ ...queryParams, term: undefined });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                const value = searchTerm.trim();
                setQueryParams({ ...queryParams, term: value || undefined });
              }
            }}
            className="pl-10 pr-4 py-2 bg-white border border-white/50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48 md:w-64 transition-all outline-none shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      {/* Content Container with Infinite Scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
      >
        {isFetching ? (
          <div className="flex items-center justify-center h-full">
            <Spin />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Empty description={t?.('common.pagination.noData') || 'No Data'} />
          </div>
        ) : (
          <>
            {/* Projects Grid - Tailwind Responsive Grid */}
            <div className="grid gap-4 md:gap-[30px] grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 w-full">
              {projects.map((project) => (
                <div key={project.projectId} className="w-full" onClick={() => handleProjectEdit(project)}>

                  <ProjectCard
                    item={project}

                    onEdit={handleProjectEdit}
                    onDelete={handleProjectDelete}
                  />
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-8">
                <Spin size="small" />
              </div>
            )}

            {/* No More Data */}
            {/* {!hasNextPage && projects.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                {t?.('common.pagination.noMoreData') || 'No More Data'}
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  );
};

export default MyWork;
