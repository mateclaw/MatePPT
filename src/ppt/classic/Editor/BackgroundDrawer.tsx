import React, { useMemo, useState, useRef } from 'react';
import { Drawer, Button, Space, Tabs, Input, Select, Divider, message, Row, Col, Slider } from 'antd';
import S3UploaderSimple, { S3UploaderSimpleRef } from "@/components/base/file-uploader/s3-uploader-simple";
import { usePptProjectStore } from "@/stores/pptProjectStore";
import { useSlidesStore } from '@/ppt/store/useSlidesStore';
import useHistorySnapshot from '@/ppt/hooks/useHistorySnapshot';
import { Background, GradientType, Gradient } from '@/ppt/core';
import { useMemoizedFn } from 'ahooks';
import { lastValueFrom } from 'rxjs';
import { S3Service } from '@/services/s3.service';
import { FileInfoVo } from '@/models/fileInfoVo';
import { buildDirectUploadTarget } from '@/hooks/s3uploader-hooks';
import PPTColorPicker from '@/ppt/classic/components/PPTColorPicker';
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor';
import { normalizePPTColor, resolvePPTColorValue } from '@/ppt/core/utils/pptColor';

interface BackgroundDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const s3service = S3Service.getInstance();

/**
 * 幻灯片背景设置抽屉
 */
const BackgroundDrawer: React.FC<BackgroundDrawerProps> = ({ isOpen, onClose }) => {
  const { projectId } = usePptProjectStore();
  const { slideIndex, slides, updateSlide, setSlides } = useSlidesStore();
  const { addHistorySnapshot } = useHistorySnapshot();

  const currentSlide = slides[slideIndex];


  // 当前页面的实际背景
  const currentBackground = currentSlide?.background || { type: 'solid', color: PPTColor.ofFixed('#ffffff') };

  // 临时背景状态（用于预览，点击按钮才真正应用）
  const [tempBackground, setTempBackground] = useState<Background>(currentBackground as Background);

  // 当切换页面或打开抽屉时，同步临时状态
  React.useEffect(() => {
    if (isOpen) {
      setTempBackground(currentBackground as Background);
    }
  }, [isOpen, slideIndex]);

  // 使用临时状态进行编辑
  const background = tempBackground;
  const backgroundSelectValue = background.type ?? 'none';


  const [tempSrc, setTempSrc] = useState('');
  const uploadPath = useMemo(() => `pptProject/${projectId}/background`, [projectId]);
  const uploaderRef = useRef<S3UploaderSimpleRef>(null);
  const [fileList, setFileList] = useState<any>([]);

  // 只更新临时状态，不立即应用到页面
  const handleBackgroundChange = (newBackground: Partial<Background>) => {
    setTempBackground({ ...background, ...newBackground } as Background);
  };

  // 应用到当前页面
  const handleApplyCurrent = () => {
    updateSlide({ background: { ...tempBackground } });
    addHistorySnapshot();
    message.success('已应用到当前页面');
  };

  const handleTypeChange = (type: 'solid' | 'image' | 'gradient' | 'none') => {
    if (type === 'none') {
      handleBackgroundChange({
        type: undefined,
        color: undefined,
        image: undefined,
        gradient: undefined,
      });
      return;
    }
    if (type === 'solid') {
      handleBackgroundChange({ type, color: normalizePPTColor(background.color) || PPTColor.ofFixed('#ffffff') });
    } else if (type === 'image') {
      handleBackgroundChange({
        type,
        image: background.image || { src: '', fillMode: 'cover' }
      });
    } else if (type === 'gradient') {
      const existingGradient = background.gradient;
      const defaultColors = [
        { pos: 0, color: normalizePPTColor(background.color) || PPTColor.ofFixed('#ffffff') },
        { pos: 100, color: PPTColor.ofFixed('#ffffff') }
      ];
      handleBackgroundChange({
        type,
        gradient: {
          type: existingGradient?.type || 'linear',
          rotate: existingGradient?.rotate ?? 0,
          colors: existingGradient?.colors?.length ? existingGradient.colors : defaultColors
        }
      });
    }
  };

  const updateGradient = (gradientProps: Partial<Gradient>) => {
    const next = { ...(background.gradient || { type: 'linear', rotate: 0, colors: [] }), ...gradientProps } as Gradient;
    handleBackgroundChange({ gradient: next });
  };

  const updateGradientColors = (index: number, color: PPTColor) => {
    if (!background.gradient || !background.gradient.colors) return;
    const colors = background.gradient.colors.map((item, idx) => {
      if (idx === index) return { ...item, color };
      return item;
    });
    updateGradient({ colors });
  };

  const handleImageSizeChange = (size: 'cover' | 'contain' | 'repeat') => {
    if (background.type !== 'image' || !background.image) return;
    handleBackgroundChange({
      image: { ...background.image, fillMode: size }
    });
  };

  // 应用到全部页面
  const handleApplyAll = () => {
    const newSlides = slides.map(slide => ({
      ...slide,
      background: { ...tempBackground },
      dirty: true
    }));
    setSlides(newSlides as any);
    addHistorySnapshot();
    message.success('已应用到全部页面');
  };

  const [isUploading, setIsUploading] = useState(false);

  const getUploadTarget = useMemoizedFn(async (file: File) => {
    const slideId = (currentSlide as any)?.slideId;
    if (!slideId) {
      throw new Error('当前页面缺少 slideId，无法获取上传地址');
    }
    const request = {
      fileName: file.name,
      projectId,
      slideId,
    } as FileInfoVo;
    const response = await lastValueFrom(s3service.getPptSlideUploadUrl(request));
    if (!response || response.code !== 0 || !response.data) {
      throw new Error(response?.msg || '获取上传地址失败');
    }
    return buildDirectUploadTarget(String(response.data));
  });

  return (
    <Drawer
      title="页面背景设置"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={350}
    >
      <div className="space-y-6">
        <section>
          <div className="mb-2 text-sm font-medium text-gray-700">背景类型</div>
          <Select
            value={backgroundSelectValue}
            onChange={handleTypeChange}
            style={{ width: '100%' }}
            options={[
              { label: '无填充', value: 'none' },
              { label: '纯色填充', value: 'solid' },
              { label: '图片背景', value: 'image' },
              { label: '渐变填充', value: 'gradient' },
            ]}
          />
        </section>

        {background.type === 'solid' && (
          <section>
            <div className="mb-2 text-sm font-medium text-gray-700">选择颜色</div>
            <PPTColorPicker
              value={background.color}
              onChange={(color) => handleBackgroundChange({ color: normalizePPTColor(color) })}
            >
              <button
                type="button"
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#fff',
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: '1px solid #d1d5db',
                    backgroundColor: resolvePPTColorValue(background.color) || '#ffffff',
                  }}
                />
                <span style={{ fontSize: 12, color: '#374151' }}>
                  {resolvePPTColorValue(background.color) || '#FFFFFF'}
                </span>
              </button>
            </PPTColorPicker>
          </section>
        )}

        {background.type === 'image' && (
          <section>
            <div className="mb-2 text-sm font-medium text-gray-700">图片设置</div>
            <Tabs
              size="small"
              type="card"
              items={[
                {
                  key: 'upload',
                  label: '本地上传',
                  children: (
                    <div className="pt-2 space-y-3">
                      <div className="border border-dashed border-gray-300 rounded-md p-2">
                        <S3UploaderSimple
                          ref={uploaderRef}
                          uploadPath={uploadPath}
                          showFileList={false}
                          onSuccess={(data: any) => {
                            const url = data.response.result.httpUrl;
                            setIsUploading(false);
                            handleBackgroundChange({
                              image: { ...(background.image || { fillMode: 'cover' }), src: url }
                            });
                          }}
                          onError={() => setIsUploading(false)}
                          uploadTypes="preset:pic"
                          manualUpload={true}
                          fileList={fileList}
                          setFileList={setFileList}
                          getUploadTarget={getUploadTarget}
                        />
                      </div>
                      <Button
                        type="primary"
                        block
                        loading={isUploading}
                        disabled={fileList.length === 0}
                        onClick={() => {
                          setIsUploading(true);
                          uploaderRef.current?.upload()
                        }}

                      >
                        上传并应用
                      </Button>
                    </div>
                  )
                },
                {
                  key: 'url',
                  label: '网络图片',
                  children: (
                    <div className="pt-2 space-y-3">
                      <Input
                        placeholder="请输入图片 URL 地址"
                        value={tempSrc}
                        onChange={(e) => setTempSrc(e.target.value)}
                      />
                      <Button
                        type="primary"
                        block
                        disabled={!tempSrc.trim()}
                        onClick={() => {
                          handleBackgroundChange({
                            image: { ...(background.image || { fillMode: 'cover' }), src: tempSrc }
                          });
                          setTempSrc('');
                        }}
                      >
                        应用链接
                      </Button>
                    </div>
                  )
                }
              ]}
            />

            {background.type === 'image' && (
              <div className="mt-6">
                <div className="mb-2 text-sm font-medium text-gray-700">填充方式</div>
                <Select
                  value={background.image.fillMode}
                  onChange={handleImageSizeChange}
                  style={{ width: '100%' }}
                  options={[
                    { label: '铺满 (Cover)', value: 'cover' },
                    { label: '包含 (Contain)', value: 'contain' },
                    { label: '平铺 (Repeat)', value: 'repeat' },
                  ]}
                />
              </div>
            )}
          </section>
        )}

        {background.type === 'gradient' && background.gradient && (
          <section>
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <div className="mb-2 text-sm font-medium text-gray-700">渐变类型</div>
                <Select
                  style={{ width: '100%' }}
                  value={background.gradient.type}
                  onChange={(value) => updateGradient({ type: value as GradientType })}
                  options={[
                    { label: '线性渐变', value: 'linear' },
                    { label: '径向渐变', value: 'radial' },
                  ]}
                />
              </Col>

              <Col span={24}>
                <div className="mb-2 text-sm font-medium text-gray-700">渐变颜色</div>
                <Row gutter={[8, 8]}>
                  {background.gradient.colors.map((item, index) => (
                    <Col span={12} key={index}>
                      <PPTColorPicker
                        value={item.color}
                        onChange={(color) => updateGradientColors(index, color)}
                      >
                        <button
                          type="button"
                          style={{
                            width: '100%',
                            border: '1px solid #d1d5db',
                            borderRadius: 6,
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#fff',
                          }}
                        >
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              border: '1px solid #d1d5db',
                              backgroundColor: resolvePPTColorValue(item.color) || '#ffffff',
                            }}
                          />
                          <span style={{ fontSize: 12, color: '#374151' }}>
                            {resolvePPTColorValue(item.color) || '#FFFFFF'}
                          </span>
                        </button>
                      </PPTColorPicker>
                    </Col>
                  ))}
                </Row>
              </Col>

              {background.gradient.type === 'linear' && (
                <Col span={24}>
                  <div className="mb-2 text-sm font-medium text-gray-700">渐变角度</div>
                  <Slider
                    min={0}
                    max={360}
                    step={15}
                    value={background.gradient.rotate}
                    onChange={(value) => updateGradient({ rotate: value })}
                  />
                </Col>
              )}
            </Row>
          </section>
        )}

        <Divider className="my-4" />

        <Space style={{ width: '100%' }}>
          <Button onClick={handleApplyCurrent} size="large" type="primary">
            应用到当前页面
          </Button>
          <Button onClick={handleApplyAll} size="large">
            应用到全部页面
          </Button>
        </Space>
      </div>
    </Drawer>
  );
};

export default BackgroundDrawer;
