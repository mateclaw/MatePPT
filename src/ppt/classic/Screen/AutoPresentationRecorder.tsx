import React, { useState, useEffect } from 'react';
import { Button, Space, Modal, Form, InputNumber, message, Progress } from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  VideoCameraOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useAutoPresentation, SpeechConfig } from '@/ppt/hooks/useAutoPresentation';
import { useScreenRecorder } from '@/ppt/hooks/useScreenRecorder';
import { useSlidesStore } from '@/ppt/store';
import { useShallow } from 'zustand/react/shallow';

export interface AutoPresentationRecorderProps {
  /** 录制目标元素ID */
  targetElementId: string;
  /** 每页的宣讲文本配置 */
  getSpeechConfigs?: () => SpeechConfig[];
}

/**
 * 自动演示+录制组件
 * 支持TTS音频同步播放+自动录制
 */
export const AutoPresentationRecorder: React.FC<AutoPresentationRecorderProps> = ({
  targetElementId,
  getSpeechConfigs,
}) => {
  const { slides, updateSlideIndex } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      updateSlideIndex: state.updateSlideIndex,
    })),
  );

  const {
    isPlaying: isPresentationPlaying,
    currentSlideIndex,
    startPresentation,
    stopPresentation,
  } = useAutoPresentation();

  const {
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    downloadRecording,
  } = useScreenRecorder();

  const [showConfig, setShowConfig] = useState(false);
  const [defaultSlideDuration, setDefaultSlideDuration] = useState(5); // 默认每页5秒

  // 计算总时长
  const totalDuration = React.useMemo(() => {
    if (!getSpeechConfigs) {
      return slides.length * defaultSlideDuration;
    }
    const configs = getSpeechConfigs();
    return configs.reduce((sum, config) => {
      return sum + (config.audioDuration || defaultSlideDuration);
    }, 0);
  }, [slides.length, defaultSlideDuration, getSpeechConfigs]);

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始自动演示并录制
  const handleStartAutoRecord = async () => {
    // 1. 准备宣讲配置
    let speechConfigs: SpeechConfig[];

    if (getSpeechConfigs) {
      speechConfigs = getSpeechConfigs();
    } else {
      // 没有提供配置，使用默认时长
      speechConfigs = slides.map((slide) => ({
        text: slide.remark || '',
        audioDuration: defaultSlideDuration,
      }));
    }

    if (speechConfigs.length === 0) {
      message.warning('没有可演示的内容');
      return;
    }

    // 2. 开始录制
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
      message.error('找不到录制目标');
      return;
    }

    await startRecording(targetElement, {
      videoBitsPerSecond: 8000000, // 8Mbps
    });

    // 3. 延迟500ms后开始演示（等待录制稳定）
    setTimeout(() => {
      startPresentation({
        speeches: speechConfigs,
        onSlideChange: (index) => {
          updateSlideIndex(index);
        },
        onComplete: () => {
          // 演示完成，延迟1秒停止录制
          setTimeout(() => {
            stopRecording();
            message.success('视频录制完成！');
          }, 1000);
        },
      });
    }, 500);
  };

  // 停止演示和录制
  const handleStop = () => {
    stopPresentation();
    if (isRecording) {
      stopRecording();
    }
  };

  // 下载视频
  const handleDownload = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    downloadRecording(`PPT宣讲视频-${timestamp}.webm`);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '280px',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 标题 */}
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
            🎬 自动宣讲录制
          </div>

          {/* 状态显示 */}
          {isPresentationPlaying && (
            <div>
              <div style={{ marginBottom: '8px', color: '#595959' }}>
                当前进度: {currentSlideIndex + 1} / {slides.length}
              </div>
              <Progress
                percent={Math.floor(((currentSlideIndex + 1) / slides.length) * 100)}
                status={isRecording ? 'active' : 'normal'}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              />
            </div>
          )}

          {/* 信息显示 */}
          {!isPresentationPlaying && !recordedBlob && (
            <div style={{ fontSize: '13px', color: '#8c8c8c' }}>
              <div>📄 幻灯片: {slides.length} 页</div>
              <div>⏱️ 预计时长: {formatDuration(totalDuration)}</div>
            </div>
          )}

          {/* 控制按钮 */}
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {!isPresentationPlaying && !recordedBlob && (
              <>
                <Button
                  type="primary"
                  icon={<VideoCameraOutlined />}
                  onClick={handleStartAutoRecord}
                  block
                  size="large"
                >
                  开始自动录制
                </Button>

                <Button
                  type="default"
                  onClick={() => setShowConfig(true)}
                  block
                  size="small"
                >
                  设置默认时长
                </Button>
              </>
            )}

            {isPresentationPlaying && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={handleStop}
                block
                size="large"
              >
                停止录制
              </Button>
            )}

            {recordedBlob && !isPresentationPlaying && (
              <>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  block
                  size="large"
                >
                  下载视频
                </Button>
                <Button
                  type="default"
                  onClick={() => window.location.reload()}
                  block
                  size="small"
                >
                  重新录制
                </Button>
              </>
            )}
          </Space>

          {/* 提示信息 */}
          {!isPresentationPlaying && !recordedBlob && (
            <div
              style={{
                fontSize: '12px',
                color: '#8c8c8c',
                padding: '8px',
                background: '#f5f5f5',
                borderRadius: '4px',
              }}
            >
              💡 点击"开始自动录制"后，系统会自动播放PPT并录制。每页的停留时间由音频时长决定（无音频则使用默认时长）。
            </div>
          )}
        </Space>
      </div>

      {/* 配置Modal */}
      <Modal
        title="设置默认停留时长"
        open={showConfig}
        onOk={() => setShowConfig(false)}
        onCancel={() => setShowConfig(false)}
      >
        <Form layout="vertical">
          <Form.Item label="每页默认停留时长（秒）">
            <InputNumber
              min={1}
              max={60}
              value={defaultSlideDuration}
              onChange={(value) => setDefaultSlideDuration(value || 5)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
            此设置仅在幻灯片没有配置音频时生效。预计总时长: {formatDuration(slides.length * defaultSlideDuration)}
          </div>
        </Form>
      </Modal>
    </>
  );
};
