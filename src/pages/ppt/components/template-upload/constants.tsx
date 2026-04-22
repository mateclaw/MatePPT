import React from 'react';
import { GuideItem, PageTypeRule, QuantityRule } from './types';

export const RULE_ICONS: Record<string, React.ReactNode> = {
  home: (
    <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6366F1]" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </div>
  ),
  list: (
    <div className="w-8 h-8 bg-[#F5F3FF] rounded-lg flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#8B5CF6]" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" />
      </svg>
    </div>
  ),
  transition: (
    <div className="w-8 h-8 bg-[#F0FDF4] rounded-lg flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  ),
  content: (
    <div className="w-8 h-8 bg-[#FFF1F2] rounded-lg flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#FB7185]" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" strokeLinecap="round" />
      </svg>
    </div>
  ),
  end: (
    <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center shrink-0 border border-[#E2E8F0]">
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  ),
};

export const GUIDE_ITEMS: GuideItem[] = [
  { id: 1, title: '资源清理', description: '删除隐藏音频和无效元素，控制模板体积。', category: 'check' },
  { id: 2, title: '母版设置', description: '背景图放在母版中，内容页只保留内容布局。', category: 'check' },
  { id: 3, title: '排版优化', description: '文本框尽量拉满可用宽度，减少后续改字溢出。', category: 'check' },
  { id: 4, title: '颜色统一', description: '页面配色保持一致，方便后续一键换主题。', category: 'check' },
  { id: 5, title: '极简原则', description: '过渡页尽量只保留核心元素，避免多余装饰。', category: 'check' },
  { id: 6, title: '成组标注', description: '列表项和标题需要成组，保证解析和复用稳定。', category: 'check' },
];

export const QUANTITY_RULES: QuantityRule[] = [
  { label: '3x2 布局', count: 6, highlight: true },
  { label: '4x2 布局', count: 6, highlight: true },
  { label: '2x2 布局', count: 2, highlight: false },
  { label: '5x2 布局', count: 2, highlight: false },
];

export const PAGE_TYPE_RULES: PageTypeRule[] = [
  {
    type: '首页',
    icon: 'home',
    description: '展示 PPT 的主题和核心信息，通常只需要 1 页。',
    annotations: ['title'],
  },
  {
    type: '目录页',
    icon: 'list',
    description: '建议提供 2-6 个目录项，方便生成目录结构。',
    annotations: ['item'],
  },
  {
    type: '过渡页',
    icon: 'transition',
    description: '用于章节切换和分段过渡。',
    annotations: ['partNum', 'title'],
  },
  {
    type: '内容页',
    icon: 'content',
    description: '包含多个内容模块，每组通常由标题和正文组成。',
    annotations: ['title', 'itemTitle', 'item'],
  },
  {
    type: '结束页',
    icon: 'end',
    description: '用于致谢、联系方式或总结收尾。',
    annotations: ['无需标注'],
  },
];
