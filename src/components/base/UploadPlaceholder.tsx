import React, { useMemo, useState } from 'react';
import { autoConvert } from '@/utils/file-util';

interface UploadPlaceholderProps {
  /** 颜色，如 'rose', 'blue' 或 16进制 '#FF0000' */
  color?: string;
  /** 提示文字，如 '上传音频' */
  text?: string;
  /** 格式，如 'MP3、WAV' */
  format?: string;
  /** 大小，支持数字（字节）或带单位的字符串，如 1024*1024*10 或 '10MB' */
  size?: string | number;
}

const UploadPlaceholder: React.FC<UploadPlaceholderProps> = ({
  color = 'rose',
  text = '上传音频',
  format = 'MP3、WAV',
  size = '10MB',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isHex = useMemo(() => color.startsWith('#'), [color]);

  const displaySize = useMemo(() => {
    if (typeof size === 'number') {
      return autoConvert(size);
    }
    return size;
  }, [size]);

  const themeStyle = isHex ? { color } : {};
  const hoverStyle = (isHex && isHovered) ? {
    borderColor: color,
    backgroundColor: `${color}0D`, // 约 5% 透明度的背景色，模拟 Tailwind 的 -50 效果
  } : {};

  return (
    <div className="absolute inset-0 p-6 px-8 flex flex-col transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto">
      <div
        className={`flex-1 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-white cursor-pointer transition-colors ${!isHex ? `hover:border-${color}-400 hover:bg-${color}-50` : ''}`}
        style={hoverStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg
          className={`mb-3 ${!isHex ? `text-${color}-500` : ''}`}
          style={themeStyle}
          width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <div className="text-[15px] font-semibold text-slate-700">{text}</div>
        <div
          className={`text-[13px] mt-1.5 ${!isHex ? `text-${color}-500` : ''}`}
          style={themeStyle}
        >
          支持 {format} 格式，大小不超过 {displaySize}
        </div>
      </div>
    </div>
  );
};

export default UploadPlaceholder;
