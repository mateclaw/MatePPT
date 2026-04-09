import React from 'react';
import { Icon } from 'umi';
import PptGeneratePanel from '@/ppt/components/PptGeneratePanel';
import type { MetaDataVo } from '@/models/metaDataVo';

interface HeroSectionProps {
  isLoading: boolean;
  onQuery: (userInput: string, metaData: MetaDataVo) => void;
}

export default function HeroSection({ isLoading, onQuery }: HeroSectionProps) {
  return (
    <section
      className="hero-bg-gradient relative flex w-full flex-col items-center pb-20 pt-16 md:pb-[160px] md:pt-28"
      style={{ minHeight: '90vh' }}
    >
      <div className="animate-fade-in-down mb-8 max-w-3xl px-5 text-center md:mb-14">
        <h1 className="brand-title-gradient mb-4 text-[26px] font-[900] leading-[1.1] tracking-tight text-slate-900 md:mb-6 md:text-[44px]">
          不止是文字，万物皆可PPT
        </h1>
        <div className="text-base font-normal leading-relaxed text-slate-600">
          告别图片拼接，生成真正
          <span className="relative inline-block font-bold text-brand-600 after:absolute after:bottom-[1px] after:left-0 after:-z-10 after:h-[3px] after:w-full after:bg-brand-500/20">
            100% 可编辑
          </span>
          的演示文稿
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2 md:mt-8 md:gap-4">
          <div className="flex cursor-default items-center gap-1.5 rounded-full border border-white/80 bg-white/60 px-3 py-1 text-[13px] text-slate-600 transition-all hover:border-brand-200 hover:bg-white hover:text-brand-600 hover:shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-brand-500">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" />
              <line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" />
              <line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" />
              <line x1="20" y1="14" x2="23" y2="14" />
              <line x1="1" y1="9" x2="4" y2="9" />
              <line x1="1" y1="14" x2="4" y2="14" />
            </svg>
            独创双引擎
          </div>
          <div className="flex cursor-default items-center gap-1.5 rounded-full border border-white/80 bg-white/60 px-3 py-1 text-[13px] text-slate-600 transition-all hover:border-brand-200 hover:bg-white hover:text-brand-600 hover:shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-brand-500">
              <path d="M15.6 11.6L22 7v10l-6.4-4.5v-1zM4 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            </svg>
            视频一键生成
          </div>
          <div className="flex cursor-default items-center gap-1.5 rounded-full border border-white/80 bg-white/60 px-3 py-1 text-[13px] text-slate-600 transition-all hover:border-brand-200 hover:bg-white hover:text-brand-600 hover:shadow-sm">
            <Icon icon="local:ppt/icon-screen-shot-simple" width="16" height="16" className="text-brand-500" />
            截图即时复刻
          </div>
        </div>
      </div>

      <div className="main-card-glass relative z-20 mx-5 w-full max-w-[800px] rounded-3xl border border-white/80 transition-all duration-300">
        <PptGeneratePanel isLoading={isLoading} onQuery={onQuery} variant="mateppt" />
      </div>
    </section>
  );
}
