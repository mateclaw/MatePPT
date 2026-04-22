import React from 'react';
import { GuideItem } from './types';

interface Props {
  item: GuideItem;
}

export const GuideCard: React.FC<Props> = ({ item }) => {
  return (
    <div className="p-3.5 bg-[#FFFDF7] rounded-xl border border-[#FDE68A]/30 flex items-start gap-3 transition-colors">
      <div className="w-6 h-6 rounded-lg bg-[#F59E0B] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black shadow-sm">
        {item.id}
      </div>
      <div className="pt-0.5">
        <h4 className="font-bold text-[#92400E] text-[12px] mb-0.5">{item.title}</h4>
        <p className="text-[#B45309]/80 text-[10px] leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
};
