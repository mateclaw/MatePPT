/**
 * 服务器端视频生成Hook
 * 调用后端API，服务器自动生成视频
 */

import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { request } from 'umi';

const API_BASE_URL = process.env.REACT_APP_VIDEO_API || 'http://localhost:3001';

export interface ServerVideoGeneratorOptions {
  width?: number;
  height?: number;
  fps?: number;
  quality?: 'low' | 'medium' | 'high';
  format?: 'mp4' | 'webm';
}

export interface VideoJobStatus {
  jobId: string;
  state: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
  createdAt?: string;
  finishedAt?: string;
}

export interface UseServerVideoGeneratorReturn {
  /** 是否正在生成 */
  isGenerating: boolean;
  /** 当前任务ID */
  currentJobId: string | null;
  /** 任务状态 */
  jobStatus: VideoJobStatus | null;
  /** 生成进度 (0-100) */
  progress: number;
  /** 生成的视频URL */
  videoUrl: string | null;
  /** 提交生成任务 */
  generateVideo: (
    pptId: string,
    slides: any[],
    ttsAudios: any[],
    options?: ServerVideoGeneratorOptions
  ) => Promise<string>; // 返回jobId
  /** 批量生成多个PPT */
  batchGenerateVideos: (
    ppts: Array<{
      pptId: string;
      slides: any[];
      ttsAudios: any[];
      options?: ServerVideoGeneratorOptions;
    }>
  ) => Promise<string[]>; // 返回jobIds数组
  /** 取消任务 */
  cancelJob: (jobId?: string) => Promise<void>;
  /** 手动刷新状态 */
  refreshStatus: (jobId?: string) => Promise<void>;
  /** 下载视频 */
  downloadVideo: (videoUrl: string, filename?: string) => void;
}

/**
 * 服务器端视频生成Hook
 */
export function useServerVideoGenerator(): UseServerVideoGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<VideoJobStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 提交视频生成任务
   */
  const generateVideo = useCallback(async (
    pptId: string,
    slides: any[],
    ttsAudios: any[],
    options?: ServerVideoGeneratorOptions
  ) => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setVideoUrl(null);

      message.loading('正在提交视频生成任务...', 0);

      const response = await request(`${API_BASE_URL}/api/video/generate`, {
        method: 'POST',
        data: {
          pptId,
          slides,
          ttsAudios,
          options,
        },
      });

      if (!response.success) {
        throw new Error(response.message || '提交任务失败');
      }

      const jobId = response.jobId;
      setCurrentJobId(jobId);

      message.destroy();
      message.success(`任务已提交！预计 ${response.estimatedTime} 完成`);

      // 开始轮询任务状态
      startPolling(jobId);

      return jobId;

    } catch (error: any) {
      console.error('提交任务失败:', error);
      message.destroy();
      message.error(error.message || '提交任务失败');
      setIsGenerating(false);
      throw error;
    }
  }, []);

  /**
   * 批量生成多个PPT视频
   */
  const batchGenerateVideos = useCallback(async (
    ppts: Array<{
      pptId: string;
      slides: any[];
      ttsAudios: any[];
      options?: ServerVideoGeneratorOptions;
    }>
  ) => {
    try {
      setIsGenerating(true);
      message.loading(`正在提交 ${ppts.length} 个视频生成任务...`, 0);

      const response = await request(`${API_BASE_URL}/api/video/batch-generate`, {
        method: 'POST',
        data: { ppts },
      });

      if (!response.success) {
        throw new Error(response.message || '批量提交失败');
      }

      message.destroy();
      message.success(`已成功提交 ${response.jobIds.length} 个任务！`);

      return response.jobIds;

    } catch (error: any) {
      console.error('批量提交失败:', error);
      message.destroy();
      message.error(error.message || '批量提交失败');
      setIsGenerating(false);
      throw error;
    }
  }, []);

  /**
   * 开始轮询任务状态
   */
  const startPolling = useCallback((jobId: string) => {
    // 清除旧的定时器
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    // 每2秒查询一次
    pollTimerRef.current = setInterval(async () => {
      try {
        const status = await request(`${API_BASE_URL}/api/video/status/${jobId}`);

        if (status.success) {
          setJobStatus(status);
          setProgress(status.progress || 0);

          // 任务完成
          if (status.state === 'completed') {
            setVideoUrl(status.result?.videoUrl || null);
            setIsGenerating(false);

            if (pollTimerRef.current) {
              clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }

            message.success('视频生成完成！');
          }

          // 任务失败
          if (status.state === 'failed') {
            setIsGenerating(false);

            if (pollTimerRef.current) {
              clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }

            message.error(`视频生成失败: ${status.error || '未知错误'}`);
          }
        }
      } catch (error) {
        console.error('查询任务状态失败:', error);
      }
    }, 2000);
  }, []);

  /**
   * 手动刷新状态
   */
  const refreshStatus = useCallback(async (jobId?: string) => {
    const targetJobId = jobId || currentJobId;
    if (!targetJobId) {
      message.warning('没有正在进行的任务');
      return;
    }

    try {
      const status = await request(`${API_BASE_URL}/api/video/status/${targetJobId}`);

      if (status.success) {
        setJobStatus(status);
        setProgress(status.progress || 0);

        if (status.state === 'completed') {
          setVideoUrl(status.result?.videoUrl || null);
          setIsGenerating(false);
        }
      }
    } catch (error) {
      console.error('刷新状态失败:', error);
      message.error('刷新状态失败');
    }
  }, [currentJobId]);

  /**
   * 取消任务
   */
  const cancelJob = useCallback(async (jobId?: string) => {
    const targetJobId = jobId || currentJobId;
    if (!targetJobId) {
      message.warning('没有可取消的任务');
      return;
    }

    try {
      await request(`${API_BASE_URL}/api/video/${targetJobId}`, {
        method: 'DELETE',
      });

      // 停止轮询
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }

      setIsGenerating(false);
      setCurrentJobId(null);
      setJobStatus(null);

      message.success('任务已取消');

    } catch (error) {
      console.error('取消任务失败:', error);
      message.error('取消任务失败');
    }
  }, [currentJobId]);

  /**
   * 下载视频
   */
  const downloadVideo = useCallback((url: string, filename?: string) => {
    const a = document.createElement('a');
    a.href = `${API_BASE_URL}${url}`;
    a.download = filename || `video_${Date.now()}.mp4`;
    a.click();
    message.success('视频下载开始');
  }, []);

  return {
    isGenerating,
    currentJobId,
    jobStatus,
    progress,
    videoUrl,
    generateVideo,
    batchGenerateVideos,
    cancelJob,
    refreshStatus,
    downloadVideo,
  };
}
