import React from 'react';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ onClick, style, className }) => {
  return (
    <button
      type="button"
      className={'button-to-bottom' + (className ? ` ${className}` : '')}
      style={style}
      onClick={onClick}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="m-1 text-black dark:text-white">
        <path
          d="M17 13L12 18L7 13M12 6L12 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </button>
  );
};

export default ScrollToBottomButton;
