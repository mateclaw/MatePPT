import React, { ReactNode, forwardRef } from 'react';
import styles from './ContentWrapper.module.scss';

interface ContentWrapperProps {
  /** 标题 */
  title?: string | ReactNode;
  /** 内容 */
  children: ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 引用 */
  ref?: React.Ref<HTMLDivElement>;
  /** 内容自定义类名 */
  contentClassName?: string;
  
}

/**
 * 内容包装器组件
 * 用于展示标题和内容的通用容器
 * 
 * @example
 * ```tsx
 * <ContentWrapper title="基本信息">
 *   <div>这是内容区域</div>
 * </ContentWrapper>
 * ```
 */
const ContentWrapper = forwardRef<HTMLDivElement, ContentWrapperProps>(({
  title,
  children,
  className = '',
  bordered = false,
  contentClassName = '',
  
  style,
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`${styles.wrapper} ${bordered ? styles.bordered : ''} ${className}`}
      style={style}
    >
      {title && (
        <div className={styles.title}>
          {title}
        </div>
      )}
      {children && <div className={`${styles.content} ${contentClassName}`}>
        {children}
      </div>}
    </div>
  );
});

ContentWrapper.displayName = 'ContentWrapper';

export default ContentWrapper;
