/**
 * 服务器端视频生成组件
 * 提交任务到服务器，服务器自动生成视频
 */

import React from 'react';
import { Button, Space, Progress, Card, Tag, Descriptions, Modal } from 'antd';
import {
  CloudUploadOutlined,
  ReloadOutlined,
  DownloadOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useServerVideoGenerator } from '@/ppt/hooks/useServerVideoGenerator';
import { useSlidesStore } from '@/ppt/store';
import { useShallow } from 'zustand/react/shallow';
import { getTTSForSlide } from '@/services/tts/TTSService';

export interface ServerVideoGeneratorProps {
  pptId: string;
}

/**
 * 服务器端视频生成组件
 */
export const ServerVideoGenerator: React.FC<ServerVideoGeneratorProps> = ({ pptId }) => {
  const { slides } = useSlidesStore(useShallow(state => ({ slides: state.slides })));

  const {
    isGenerating,
    currentJobId,
    jobStatus,
    progress,
    videoUrl,
    generateVideo,
    cancelJob,
    refreshStatus,
    downloadVideo,
  } = useServerVideoGenerator();

  // 提交生成任务
  const handleGenerate = async () => {
    // 准备TTS音频数据
    const ttsAudios = slides.map(slide => {
      const ttsData = getTTSForSlide(slide.id);
      return {
        slideId: slide.id,
        audioUrl: ttsData?.audioUrl,
        audioDuration: ttsData?.duration || 5,
      };
    });

    try {
      await generateVideo(pptId, slides, ttsAudios, {
        width: 1920,
        height: 1080,
        fps: 30,
        quality: 'high',
        format: 'mp4',
      });
    } catch (error) {
      console.error('提交任务失败:', error);
    }
  };

  // 状态标签
  const getStateTag = () => {
    if (!jobStatus) return null;

    const stateConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      waiting: {
        color: 'default',
        icon: <SyncOutlined spin />,
        text: '等待中',
      },
      active: {
        color: 'processing',
        icon: <SyncOutlined spin />,
        text: '生成中',
      },
      completed: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: '已完成',
      },
      failed: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: '失败',
      },
    };

    const config = stateConfig[jobStatus.state];

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  return (
    <Card
      title="🖥️ 服务器端视频生成"
      style={{ margin: '20px', maxWidth: '800px' }}
      extra={
        jobStatus && (
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => refreshStatus()}
          >
            刷新状态
          </Button>
        )
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 说明信息 */}
        {!isGenerating && !videoUrl && (
          <div
            style={{
              padding: '16px',
              background: '#f0f0f0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666',
            }}
          >
            <div style={{ marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              💡 服务器端生成优势：
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>✅ 无需浏览器权限，服务器自动录制</li>
              <li>✅ 后台处理，关闭浏览器也继续生成</li>
              <li>✅ 支持批量处理多个PPT</li>
              <li>✅ 高性能，速度更快</li>
              <li>✅ 可定时任务，自动化生成</li>
            </ul>
          </div>
        )}

        {/* 任务信息 */}
        {jobStatus && (
          <Descriptions
            column={1}
            size="small"
            bordered
            items={[
              {
                label: '任务ID',
                children: currentJobId,
              },
              {
                label: '状态',
                children: getStateTag(),
              },
              {
                label: '幻灯片数',
                children: `${slides.length} 页`,
              },
              {
                label: '创建时间',
                children: jobStatus.createdAt
                  ? new Date(jobStatus.createdAt).toLocaleString()
                  : '-',
              },
              ...(jobStatus.finishedAt
                ? [
                    {
                      label: '完成时间',
                      children: new Date(jobStatus.finishedAt).toLocaleString(),
                    },
                  ]
                : []),
              ...(jobStatus.error
                ? [
                    {
                      label: '错误信息',
                      children: (
                        <span style={{ color: '#ff4d4f' }}>{jobStatus.error}</span>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}

        {/* 进度条 */}
        {isGenerating && (
          <div>
            <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
              生成进度: {progress}%
            </div>
            <Progress
              percent={progress}
              status={progress === 100 ? 'success' : 'active'}
              strokeColor={{
                from: '#108ee9',
                to: '#87d068',
              }}
            />
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#999',
                textAlign: 'center',
              }}
            >
              {progress < 10 && '正在启动无头浏览器...'}
              {progress >= 10 && progress < 90 && '正在逐页录制幻灯片...'}
              {progress >= 90 && progress < 100 && '正在合并视频片段...'}
              {progress === 100 && '处理完成！'}
            </div>
          </div>
        )}

        {/* 视频下载 */}
        {videoUrl && (
          <div
            style={{
              padding: '20px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <CheckCircleOutlined
              style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }}
            />
            <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
              视频生成成功！
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
              视频地址: {videoUrl}
            </div>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => downloadVideo(videoUrl, `${pptId}_presentation.mp4`)}
            >
              下载视频
            </Button>
          </div>
        )}

        {/* 操作按钮 */}
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          {!isGenerating && !videoUrl && (
            <Button
              type="primary"
              size="large"
              icon={<CloudUploadOutlined />}
              onClick={handleGenerate}
              disabled={slides.length === 0}
            >
              提交到服务器生成
            </Button>
          )}

          {isGenerating && (
            <Button danger icon={<StopOutlined />} onClick={() => cancelJob()}>
              取消任务
            </Button>
          )}

          {videoUrl && (
            <Button
              onClick={() => {
                window.location.reload();
              }}
            >
              生成新视频
            </Button>
          )}
        </Space>

        {/* 提示信息 */}
        {slides.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', fontSize: '13px' }}>
            ⚠️ 当前PPT没有幻灯片，无法生成视频
          </div>
        )}
      </Space>
    </Card>
  );
};
