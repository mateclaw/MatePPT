/**
 * 视频格式转换Hook
 * 支持WebM → MP4转换（使用FFmpeg.wasm）
 */

import { useState, useCallback } from 'react';
import { message } from 'antd';

export interface ConversionProgress {
  /** 当前进度（0-100） */
  progress: number;
  /** 当前状态 */
  status: 'idle' | 'loading' | 'converting' | 'completed' | 'error';
  /** 状态消息 */
  message: string;
}

export interface UseVideoConverterReturn {
  /** 转换进度 */
  conversionProgress: ConversionProgress;
  /** 转换后的视频Blob */
  convertedBlob: Blob | null;
  /** 开始转换 */
  convertToMP4: (webmBlob: Blob, filename?: string) => Promise<void>;
  /** 下载转换后的视频 */
  downloadConverted: (filename?: string) => void;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 视频转换Hook
 */
export function useVideoConverter(): UseVideoConverterReturn {
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress>({
    progress: 0,
    status: 'idle',
    message: '',
  });
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);

  /**
   * 方案1: 使用FFmpeg.wasm（前端转换）
   */
  const convertToMP4WithFFmpegWasm = useCallback(async (
    webmBlob: Blob,
    filename: string = 'video.mp4'
  ) => {
    try {
      setConversionProgress({
        progress: 0,
        status: 'loading',
        message: '正在加载FFmpeg...',
      });

      // 动态导入FFmpeg.wasm
      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');

      const ffmpeg = createFFmpeg({
        log: true,
        progress: ({ ratio }) => {
          setConversionProgress({
            progress: Math.floor(ratio * 100),
            status: 'converting',
            message: `转换中... ${Math.floor(ratio * 100)}%`,
          });
        },
      });

      // 加载FFmpeg核心
      await ffmpeg.load();

      setConversionProgress({
        progress: 0,
        status: 'converting',
        message: '开始转换...',
      });

      // 写入输入文件
      ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));

      // 执行转换（H.264编码）
      await ffmpeg.run(
        '-i', 'input.webm',
        '-c:v', 'libx264',     // 视频编码器
        '-preset', 'fast',      // 编码速度
        '-crf', '23',           // 质量 (18-28，越小越好)
        '-c:a', 'aac',          // 音频编码器
        '-b:a', '128k',         // 音频码率
        '-movflags', '+faststart', // 优化Web播放
        'output.mp4'
      );

      // 读取输出文件
      const data = ffmpeg.FS('readFile', 'output.mp4');
      const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });

      setConvertedBlob(mp4Blob);
      setConversionProgress({
        progress: 100,
        status: 'completed',
        message: '转换完成！',
      });

      message.success('视频转换完成！');
    } catch (error) {
      console.error('视频转换失败:', error);
      setConversionProgress({
        progress: 0,
        status: 'error',
        message: '转换失败: ' + (error as Error).message,
      });
      message.error('视频转换失败');
      throw error;
    }
  }, []);

  /**
   * 方案2: 使用后端API转换（推荐生产环境）
   */
  const convertToMP4WithAPI = useCallback(async (
    webmBlob: Blob,
    filename: string = 'video.mp4'
  ) => {
    try {
      setConversionProgress({
        progress: 0,
        status: 'converting',
        message: '正在上传视频...',
      });

      // 创建FormData
      const formData = new FormData();
      formData.append('video', webmBlob, 'input.webm');
      formData.append('outputFormat', 'mp4');
      formData.append('quality', 'high');

      // 上传并转换
      const response = await fetch('/api/video/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('转换失败');
      }

      setConversionProgress({
        progress: 50,
        status: 'converting',
        message: '服务器处理中...',
      });

      // 下载转换后的视频
      const mp4Blob = await response.blob();

      setConvertedBlob(mp4Blob);
      setConversionProgress({
        progress: 100,
        status: 'completed',
        message: '转换完成！',
      });

      message.success('视频转换完成！');
    } catch (error) {
      console.error('视频转换失败:', error);
      setConversionProgress({
        progress: 0,
        status: 'error',
        message: '转换失败',
      });
      message.error('视频转换失败');
      throw error;
    }
  }, []);

  /**
   * 自动选择转换方案
   */
  const convertToMP4 = useCallback(async (
    webmBlob: Blob,
    filename: string = 'video.mp4'
  ) => {
    // 检查文件大小，大于100MB使用后端转换
    const fileSizeMB = webmBlob.size / 1024 / 1024;

    if (fileSizeMB > 100) {
      message.info('视频较大，使用服务器转换...');
      return convertToMP4WithAPI(webmBlob, filename);
    } else {
      // 检查是否支持FFmpeg.wasm
      if (typeof SharedArrayBuffer === 'undefined') {
        message.warning('浏览器不支持前端转换，使用服务器转换...');
        return convertToMP4WithAPI(webmBlob, filename);
      }
      return convertToMP4WithFFmpegWasm(webmBlob, filename);
    }
  }, [convertToMP4WithAPI, convertToMP4WithFFmpegWasm]);

  /**
   * 下载转换后的视频
   */
  const downloadConverted = useCallback((filename: string = 'video.mp4') => {
    if (!convertedBlob) {
      message.warning('没有可下载的视频');
      return;
    }

    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    message.success('视频下载成功');
  }, [convertedBlob]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setConversionProgress({
      progress: 0,
      status: 'idle',
      message: '',
    });
    setConvertedBlob(null);
  }, []);

  return {
    conversionProgress,
    convertedBlob,
    convertToMP4,
    downloadConverted,
    reset,
  };
}

/**
 * 工具函数：直接转换并下载
 */
export async function convertAndDownload(
  webmBlob: Blob,
  filename: string = 'video.mp4'
): Promise<void> {
  const converter = useVideoConverter();
  await converter.convertToMP4(webmBlob, filename);
  if (converter.convertedBlob) {
    converter.downloadConverted(filename);
  }
}
