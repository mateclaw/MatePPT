import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Space, Modal, message, Progress, Tooltip } from 'antd';
import {
  VideoCameraOutlined,
  StopOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useScreenRecorder } from '@/ppt/hooks/useScreenRecorder';
import useScreening from '@/ppt/hooks/useScreening';
import { useScreenStore } from '@/ppt/store/useScreenStore';
import { isFullscreen } from '@/ppt/utils/fullscreen';
import { TaskStatusConfig, VideoTaskStatus } from '@/types/AvatarStudio';
import { PptVideoTaskPo } from '@/models/pptVideoTaskPo';

export interface RecordingToolbarProps {
  /** 要录制的目标元素ID */
  targetElementId: string;
  /** 自定义录制目标元素 */
  getTargetElement?: () => HTMLElement | null;
  /** 开始录制后回调 */
  onAfterStart?: () => void | Promise<void>;
  /** 停止录制后回调 */
  onAfterStop?: () => void;
  /** 是否自动进入放映模式 */
  autoEnterScreening?: boolean;
  /** 录制完成回调 */
  onRecordComplete?: (blob: Blob) => void;
  /** 点击上传到云端回调 */
  onSave?: (blob: Blob) => void;
  /** 调用后端保存 */
  onSaveLocal?: (blob: Blob) => void;
  /** 自动合成 */
  onAutoSynthesis?: () => void | Promise<void>;
  /** 自动合成按钮加载态 */
  autoSynthesisLoading?: boolean;
  /** 自动合成按钮禁用 */
  autoSynthesisDisabled?: boolean;
  /** 自动合成任务状态 */
  autoTaskStatus?: VideoTaskStatus;
  /** 自动合成状态加载中 */
  autoTaskStatusLoading?: boolean;
  autoTaskDetail?: PptVideoTaskPo;
}

/**
 * PPT录制工具栏
 * 集成到播放界面的录制控制组件
 */
export const RecordingToolbar: React.FC<RecordingToolbarProps> = ({
  targetElementId,
  getTargetElement,
  onAfterStart,
  onAfterStop,
  autoEnterScreening = true,
  onRecordComplete,
  onSave,
  onAutoSynthesis,
  autoSynthesisLoading,
  autoSynthesisDisabled,
  autoTaskStatus,
  autoTaskStatusLoading,
  autoTaskDetail
}) => {
  const {
    isRecording,
    isPaused,
    recordedBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    clearRecording,
  } = useScreenRecorder();
  const { enterScreening } = useScreening();
  const { screening } = useScreenStore();

  const [showPreview, setShowPreview] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const wasRecordingRef = useRef(false);

  // 录制时间计时器
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, isPaused]);

  React.useEffect(() => {
    if (wasRecordingRef.current && !isRecording) {
      onAfterStop?.();
    }
    wasRecordingRef.current = isRecording;
  }, [isRecording, onAfterStop]);

  // 格式化录制时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始录制
  const handleStartRecording = async () => {
    const targetElement = getTargetElement?.() || document.getElementById(targetElementId);
    if (!targetElement) {
      message.error('找不到录制目标元素');
      return;
    }




    setRecordingTime(0);
    await startRecording(targetElement, {
      videoBitsPerSecond: 12000000, // 12Mbps 高质量
    });



    if (onAfterStart) await onAfterStart();

    if (autoEnterScreening) {
      message.info('autoEnterScreening开始录制，请稍候...');
      // 录屏权限弹窗可能导致全屏退出，延迟再进入放映
      setTimeout(() => {

        enterScreening(targetElement);

      }, 300);
    }
  };

  // 停止录制
  const handleStopRecording = () => {
    stopRecording();
    onAfterStop?.();
    if (recordedBlob && onRecordComplete) {
      onRecordComplete(recordedBlob);
    }
  };

  // 预览视频
  const handlePreview = () => {
    if (recordedBlob) {
      setShowPreview(true);
    }
  };

  // 下载视频
  const handleDownload = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    downloadRecording(`PPT演示-${timestamp}.webm`);
  };

  const toolbarNode = (
    <>
      <div
        style={{
          position: 'fixed',
          // bottom: isRecording ? 80 : 20,
          top: isRecording ? 4 : 4,
          right: 120,
          zIndex: 1,
          padding: '12px 16px',
          background: 'var(--ant-color-bg-layout)',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Space size="small">
          {/* 录制状态显示 */}
          {isRecording && (
            <div style={{ color: '#000', fontSize: '14px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isPaused ? '#faad14' : '#ff4d4f',
                    animation: isPaused ? 'none' : 'blink 1s infinite',

                  }}
                />
                <span>{formatTime(recordingTime)}</span>
              </div>
            </div>
          )}

          {/* 控制按钮 */}
          <Space>
            {!isRecording ? (
              <>
                {(autoTaskStatus || autoTaskStatusLoading) && (
                  // <div style={{ color: '#64748b', fontSize: '12px' }}>
                  //   {autoTaskStatusLoading ? '任务状态：加载中...' : `任务状态：${autoTaskStatus}`}
                  // </div>

                  <Tooltip title={autoTaskDetail?.errorMessage || ''}>
                    <div className={` px-2 py-[2px] ${TaskStatusConfig[autoTaskStatus]?.color} text-white text-[10px] font-bold rounded shadow-sm flex items-center gap-1 `}>
                      {autoTaskStatus == VideoTaskStatus.PROCESSING && <i className="fa-solid fa-spinner animate-spin"></i>} {TaskStatusConfig[autoTaskStatus]?.label}
                    </div>

                  </Tooltip>

                )}
                <Button
                  variant="solid"
                  color="blue"
                  icon={<VideoCameraOutlined />}
                  onClick={onAutoSynthesis ?? handleStartRecording}
                  loading={autoSynthesisLoading}
                  disabled={autoSynthesisDisabled}
                >
                  {'自动合成'}
                </Button>
                {/* 开始录制 */}
                <Button
                  variant="solid"
                  color="green"
                  icon={<VideoCameraOutlined />}
                  onClick={handleStartRecording}
                  disabled={autoSynthesisDisabled}
                >
                  {recordedBlob ? '重新录制' : '手动录制'}
                </Button>

                {/* 预览和下载（录制完成后显示） */}
                {recordedBlob && (
                  <>
                    <Button icon={<PlayCircleOutlined />} onClick={handlePreview}>
                      预览
                    </Button>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                    >
                      下载
                    </Button>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => onSave?.(recordedBlob)}
                    >
                      上传
                    </Button>
                    <Button
                      danger
                      type="primary"
                      icon={<DeleteOutlined />}
                      onClick={clearRecording}
                    >
                      删除
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                {/* 暂停/恢复 */}
                {isPaused ? (
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={resumeRecording}
                  >
                    继续
                  </Button>
                ) : (
                  <Button icon={<PauseOutlined />} onClick={pauseRecording}>
                    暂停
                  </Button>
                )}

                {/* 停止录制 */}
                <Button danger icon={<StopOutlined />} onClick={handleStopRecording}>
                  停止
                </Button>
              </>
            )}
          </Space>
        </Space>
      </div>

      {/* 视频预览Modal */}
      <Modal
        title="录制预览"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={[
          <Button key="download" type="primary" onClick={handleDownload}>
            下载视频
          </Button>,
          <Button key="close" onClick={() => setShowPreview(false)}>
            关闭
          </Button>,
        ]}
        width={1000}
      >
        {recordedBlob && (
          <video
            src={URL.createObjectURL(recordedBlob)}
            controls
            style={{ width: '100%', maxHeight: '70vh' }}
          />
        )}
      </Modal>

      {/* 闪烁动画 */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );

  const fullscreenContainer =
    (screening || isFullscreen()) ? (getTargetElement?.() || document.getElementById(targetElementId)) : null;

  if (fullscreenContainer) {
    return createPortal(toolbarNode, fullscreenContainer);
  }

  return toolbarNode;
};
