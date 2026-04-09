import React from 'react';
import { FileUp, Link, Keyboard, Play } from 'lucide-react';
import { RiBilibiliFill } from '@remixicon/react';

export type SourceType = 'user_input' | 'user_upload' | 'bilibili' | 'link' | 'local_media' | 'brand' | 'brand_letter';

interface DefaultThumbnailProps {
  sourceType?: SourceType;
  title?: string;
  className?: string;
}

/**
 * 默认缩略图组件
 * 根据不同的 sourceType 显示不同的默认缩略图样式
 */
const DefaultThumbnail: React.FC<DefaultThumbnailProps> = ({
  sourceType = 'brand',
  title = '',
  className = ''
}) => {
  const initials = title ? title.substring(0, 1).toUpperCase() : 'M';

  const renderContent = () => {
    switch (sourceType) {
      case 'bilibili':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-[#fb7299]/5">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(#fb7299 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#fb7299]/10">
              <RiBilibiliFill className="w-8 h-8 text-[#fb7299]" />
            </div>
          </div>
        );

      case 'user_upload':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-slate-50/50">
            <div className="relative w-16 h-20">
              <div className="absolute top-0 left-0 w-full h-full bg-white border border-slate-200 rounded shadow-sm rotate-3 translate-x-1 translate-y-1" />
              <div className="absolute top-0 left-0 w-full h-full bg-white border border-slate-200 rounded shadow-sm flex flex-col p-2">
                <div className="w-full h-1 bg-slate-100 rounded mb-1" />
                <div className="w-3/4 h-1 bg-slate-100 rounded mb-2" />
                <div className="flex-1 bg-slate-50 rounded flex items-center justify-center">
                  <FileUp className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'local_media':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-[#00050a] overflow-hidden">
            <div className="absolute inset-0 flex justify-around opacity-30 select-none pointer-events-none px-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col font-mono text-2xl font-black text-emerald-500 leading-none"
                  style={{ marginTop: `${Math.random() * -100}px` }}
                >
                  {"10100110101101010010110".split('').map((char, j) => (
                    <span key={j} className={j % 3 === 0 ? "opacity-100" : "opacity-40"}>{char}</span>
                  ))}
                </div>
              ))}
            </div>
            <div className="relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] transform transition-transform duration-300 group-hover:scale-110">
              <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                <Play className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-emerald-50/30">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-center">
                <Link className="w-7 h-7 text-emerald-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white shadow-md rounded-full border border-emerald-50 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
            </div>
          </div>
        );

      case 'brand':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-white">
            <div className="relative flex flex-col items-center group">
              {/* Floating Soft Shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-indigo-900/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-x-75" />

              {/* The Letter M */}
              <div className="relative transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                <span className="text-[100px] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700 select-none leading-none">
                  M
                </span>
              </div>

              {/* Brand Text */}
              <div className="mt-3 flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="text-[10px] font-bold tracking-[0.5em] text-indigo-950 uppercase pl-[0.5em]">
                  Mate AI
                </span>
              </div>
            </div>
          </div>
        );

      case 'brand_letter':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-white" style={{ containerType: 'size' }}>
            <div className="relative transform -translate-y-[3cqh] transition-transform duration-500 ease-out">
              <span className="text-[min(80cqw,80cqh)] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700 select-none leading-none">
                M
              </span>
            </div>
          </div>
        );

      case 'user_input':
      default:
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#fdfaff]">
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h20v20H0z\" fill=\"none\"/%3E%3Cpath d=\"M0 10h20M10 0v20\" stroke=\"%23000\" stroke-width=\"0.5\" opacity=\"0.1\"/%3E%3C/svg%3E')"
              }}
            />
            <div className="relative flex flex-col items-center">
              <div className="text-indigo-200 font-bold text-7xl select-none mb-2 transform -rotate-6">
                {initials}
              </div>
              <div className="px-3 py-1 bg-white/80 border border-indigo-100 rounded-lg shadow-sm flex items-center gap-1">
                <Keyboard className="w-3 h-3 text-indigo-300" />
                <span className="text-[10px] text-indigo-300 font-bold tracking-tighter uppercase">
                  Smart Input
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full h-full overflow-hidden relative group-hover:opacity-95 transition-opacity ${className}`}>
      {renderContent()}
    </div>
  );
};

export default DefaultThumbnail;
