import React, { useState } from 'react';
import PptChatSender from './PptChatSender';
import { cloneDeep } from 'lodash';
import { useTranslate } from '@/hooks/common-hooks';
import { pptLanguage, pptPageRange } from '@/constants/dict-ppt';
import { MetaDataVo } from '@/models/metaDataVo';
import { LabeledSelect } from '@/components/base/selects';
import { cn } from '@/utils/classnames';

interface PptGeneratePanelProps {
  isLoading: boolean;
  onQuery: (userInput: string, metaData: MetaDataVo) => void;
  className?: string;
  variant?: 'default' | 'mateppt';
}

const PptGeneratePanel: React.FC<PptGeneratePanelProps> = ({
  isLoading,
  onQuery,
  className,
  variant = 'default',
}) => {
  const [content, setContent] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
  const [selectedPageRange, setSelectedPageRange] = useState('10-15');
  const { t } = useTranslate();

  const languageList = cloneDeep(pptLanguage.dataSource).map(item => {
    return { ...item, label: t('languages.' + item.label) };
  });

  const pageSizeRangeList = cloneDeep(pptPageRange.dataSource).map(item => {
    return { ...item, label: item.label + t('common.pagination.page') };
  });

  const handleQuery = (value: string, metaData?: MetaDataVo) => {
    onQuery(value, { language: selectedLanguage, pageRange: selectedPageRange, ...metaData } as MetaDataVo);
    setContent('');
  };

  const isMatePpt = variant === 'mateppt';

  return (
    <div className={cn(className, isMatePpt && 'ppt-new-generate')}>
      <PptChatSender
        content={content}
        setContent={setContent}
        doQuery={handleQuery}
        isLoading={isLoading}
        variant={variant}
      />
      <div className={cn('absolute -bottom-14 w-full flex items-center gap-4', isMatePpt && 'flex-wrap justify-center')}>
        <div className='flex items-center'>
          <LabeledSelect
            className={cn('w-full', isMatePpt && 'mateppt-select-control')}
            wrapperClassName={isMatePpt ? 'mateppt-select bg-slate-200 text-slate-600 text-[13px] rounded-lg cursor-pointer hover:!bg-slate-300 relative' : undefined}
            labelClassName={isMatePpt ? 'mateppt-select-label' : undefined}
            label={t('common.pagination.pageSize')}
            value={selectedPageRange}
            options={pageSizeRangeList}
            onChange={setSelectedPageRange}
          />
        </div>
        <div className='flex items-center'>
          <LabeledSelect
            className={cn('w-full', isMatePpt && 'mateppt-select-control text-[13px] font-normal')}
            wrapperClassName={isMatePpt ? 'mateppt-select bg-slate-200 text-[13px] py-2.5 px-4 pr-8 rounded-lg cursor-pointer hover:!bg-slate-300 relative' : undefined}
            labelClassName={isMatePpt ? 'mateppt-select-label text-[13px] font-thin' : undefined}
            label={t('language')}
            value={selectedLanguage}
            options={languageList}
            onChange={setSelectedLanguage}
          />
        </div>
      </div>
    </div>
  );
};

export default PptGeneratePanel;
