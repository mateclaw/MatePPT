import React from 'react';
import { PageTypeRule } from './types';
import { RULE_ICONS } from './constants';

export const AnnotationRule: React.FC<{ rule: PageTypeRule }> = ({ rule }) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E8EEFB] hover:border-[#6366F1]/40 transition-all">
      <div className="flex items-center gap-3 mb-2">
        {RULE_ICONS[rule.icon]}
        <h3 className="font-bold text-[#1E293B] text-[14px]">{rule.type}</h3>
      </div>
      <p className="text-[#64748B] text-[11px] leading-relaxed mb-3 line-clamp-2">{rule.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {rule.annotations.map((tag, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-[#F8FAFF] text-[#6366F1] text-[10px] font-bold rounded border border-[#E0E7FF]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
