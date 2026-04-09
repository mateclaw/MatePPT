import React from 'react';
import { Button } from 'antd';

export interface PricePlan {
  level: string; // 会员等级
  price: number | string; // 价格
  originalPrice?: number | string; // 原价（用于展示折扣）
  buttonText?: string; // 按钮文本
  permissions: string[]; // 权限列表
  onButtonClick?: () => void; // 按钮点击事件
  isPopular?: boolean; // 是否为热门套餐
  planId?: number; // 套餐id
  payCycle?: 'monthly' | 'yearly' | 'lifetime'; // 支付周期
  // 新增字段，对应 ProductPlanPo
  aiGenerationLimit?: number; // AI生成次数上限（按日）
  aiImageLimit?: number; // AI图片额度上限（按月）
  maxSlidesLimit?: number; // 最大幻灯片页数上限
  importLocalFile?: boolean; // 是否支持本地文件导入
  importFromUrl?: boolean; // 是否支持通过URL导入
  importGoogleDrive?: boolean; // 是否支持GoogleDrive导入
  watermarkFree?: boolean; // 导出是否无水印
  exportPptx?: boolean; // 是否允许导出PPTX
  exportPdf?: boolean; // 是否允许导出PDF
  userDefineTemplate?: boolean; // 是否支持用户自定义模板
  customerSupport?: boolean; // 是否提供客服/优先支持
  planDesc?: string; // 套餐描述


}

interface PriceCardProps {
  plan: PricePlan;
  className?: string;
  backgroundColor?: 'white' | 'dark'; // 背景色主题
  paymentLoading?: boolean; // 支付加载中
}

interface PermissionItemProps {
  text: string;
  isDarkBg?: boolean;
}

const PermissionItem: React.FC<PermissionItemProps> = ({ text, isDarkBg = false }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '8px 0',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          lineHeight: '16px',
          textAlign: 'center',
          color: isDarkBg ? '#FFFFFF' : '#000',
        }}
      >
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
};

const PriceCard: React.FC<PriceCardProps> = ({ plan, className = '', backgroundColor = 'white',
  paymentLoading}) => {
  const {
    level,
    price,
    originalPrice,
    buttonText = '立即体验',
    permissions = [],
    onButtonClick,
    isPopular = false,
    planId,
    payCycle = 'monthly',
    aiGenerationLimit,
    aiImageLimit,
    maxSlidesLimit,
    importLocalFile,
    importFromUrl,
    importGoogleDrive,
    watermarkFree,
    exportPptx,
    exportPdf,
    userDefineTemplate,
    customerSupport,
    planDesc
  } = plan;

  // 根据背景色确定样式
  const isDarkBg = backgroundColor === 'dark';
  const bgColor = isDarkBg ? 'rgba(43, 54, 116, 1)' : 'rgba(255, 255, 255, 1)';
  const textColor = isDarkBg ? '#FFFFFF' : '#141427';
  const borderColor = isDarkBg ? 'rgba(255, 255, 255, 0.2)' : 'rgba(239, 240, 247, 1)';
  const subtextColor = isDarkBg ? 'rgba(255, 255, 255, 0.7)' : '#666';
  const buttonType = isDarkBg ? 'primary' : 'default';
  const buttonStyle = isDarkBg
    ? { background: '#FFFFFF', color: '#2B3674', border: 'none' }
    : { background: '#2B3674', color: '#FFFFFF', border: 'none' };

  return (
    <div
      className={`${className}`}
      style={{
        padding: '40px',
        boxSizing: 'border-box',
        border: `1px solid ${borderColor}`,
        borderRadius: '24px',
        boxShadow: isDarkBg ? 'none' : '0px 2px 12px 0px rgba(20, 20, 43, 0.08)',
        background: bgColor,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* 热门标签 */}
      {isPopular && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            background: 'linear-gradient(90deg, rgba(221.31, 125.42, 255, 1), rgba(224.91, 204.81, 133.56, 1) 29%, rgba(139.49, 202.98, 145.84, 1) 51%, rgba(112.61, 193.58, 239.12, 1) 76%, rgba(58.89, 255, 255, 1) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Inter',
            fontSize: '13px',
            fontWeight: '500',
            lineHeight: '31px',
            letterSpacing: '-2.5%',
            textAlign: 'left',
            margin: 0,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            width: '106px',
            padding: '0 16px',
          } as React.CSSProperties}
        >
          大多数选择
        </div>
      )}

      {/* 会员等级和描述 */}
      <div>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: textColor,
          }}
        >
          {level}
        </h3>
        {planDesc && (
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: subtextColor,
            }}
          >
            {planDesc}
          </p>
        )}
      </div>

      {/* 价格区域 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontSize: '54px',
            fontWeight: '700',
            color: textColor,
          }}
        >
          {price}
          <label htmlFor="" className='text-lg ml-2'
            style={{ color: subtextColor }}
          >
            元/月
          </label>
        </span>
        {originalPrice && (
          <span
            style={{
              fontSize: '14px',
              color: isDarkBg ? 'rgba(255, 255, 255, 0.5)' : '#999',
              textDecoration: 'line-through',
            }}
          >
            ¥{originalPrice}
          </span>
        )}
      </div>

      {/* 体验按钮 */}
      <Button
        size="large"
        style={{
          width: '100%',
          height: '40px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          ...buttonStyle,
        }}
        disabled={paymentLoading}
        onClick={onButtonClick}
      >
        {buttonText}
      </Button>

      {/* 权限列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            fontSize: '12px',
            color: subtextColor,
            paddingTop: '12px',
          }}
        >
          {/* 自定义权限列表 */}
          {permissions.length > 0 &&
            permissions.map((permission, index) => (
              <PermissionItem key={`custom-${index}`} text={permission} isDarkBg={isDarkBg} />
            ))}

          {/* 数据库字段自动生成 */}
          {aiGenerationLimit !== undefined && (
            <PermissionItem
              text={`AI生成次数${aiGenerationLimit > 0 ? `${aiGenerationLimit}/日` : '不限'}`}
              isDarkBg={isDarkBg}
            />
          )}

          {aiImageLimit !== undefined && (
            <PermissionItem
              text={`AI图片额度${aiImageLimit > 0 ? `${aiImageLimit}张/月` : '不限'}`}
              isDarkBg={isDarkBg}
            />
          )}

          {maxSlidesLimit !== undefined && (
            <PermissionItem
              text={`最大幻灯片数${maxSlidesLimit > 0 ? `${maxSlidesLimit}页` : '不限'}`}
              isDarkBg={isDarkBg}
            />
          )}

          {importLocalFile && <PermissionItem text="本地文件导入" isDarkBg={isDarkBg} />}

          {importFromUrl && <PermissionItem text="URL导入" isDarkBg={isDarkBg} />}

          {importGoogleDrive && <PermissionItem text="Google Drive导入" isDarkBg={isDarkBg} />}

          {watermarkFree && <PermissionItem text="导出无水印" isDarkBg={isDarkBg} />}

          {exportPptx && <PermissionItem text="导出PPTX格式" isDarkBg={isDarkBg} />}

          {exportPdf && <PermissionItem text="导出PDF格式" isDarkBg={isDarkBg} />}

          {userDefineTemplate && <PermissionItem text="自定义模板" isDarkBg={isDarkBg} />}

          {customerSupport && <PermissionItem text="客服支持" isDarkBg={isDarkBg} />}
        </div>
      </div>
    </div>
  );
};

export default PriceCard;