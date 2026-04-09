import { useRef, useState, useCallback } from 'react';
import { message } from 'antd';

export interface RecordingOptions {
  /** 视频MIME类型 */
  mimeType?: string;
  /** 视频码率 (bits per second) */
  videoBitsPerSecond?: number;
  /** 音频码率 */
  audioBitsPerSecond?: number;
}

export interface UseScreenRecorderReturn {
  /** 是否正在录制 */
  isRecording: boolean;
  /** 是否暂停 */
  isPaused: boolean;
  /** 录制的Blob数据 */
  recordedBlob: Blob | null;
  /** 开始录制 */
  startRecording: (targetElement: HTMLElement, options?: RecordingOptions) => Promise<void>;
  /** 停止录制 */
  stopRecording: () => void;
  /** 暂停录制 */
  pauseRecording: () => void;
  /** 恢复录制 */
  resumeRecording: () => void;
  /** 下载录制的视频 */
  downloadRecording: (filename?: string) => void;
  /** 清除录制数据 */
  clearRecording: () => void;
}

/**
 * 屏幕录制Hook
 * 用于录制PPT播放过程
 */
export function useScreenRecorder(): UseScreenRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * 开始录制
   */
  const startRecording = useCallback(async (
    targetElement: HTMLElement,
    options: RecordingOptions = {}
  ) => {
    try {
      // 1. 获取屏幕流
      const rect = targetElement.getBoundingClientRect();
      
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // 使用 ideal 约束并考虑设备像素比以提升画质
          width: { ideal: rect.width * (window.devicePixelRatio || 1) },
          height: { ideal: rect.height * (window.devicePixelRatio || 1) },
          frameRate: { ideal: 30, max: 60 },
          // @ts-ignore
          resizeMode: 'none',
          displaySurface: 'window',
        },
        preferCurrentTab: false,
        audio: true, // 请求系统音频
      } as any);

      // 方案B: 如果需要捕获页面内音频，需要合并音频流
      // const audioContext = new AudioContext();
      // const audioElements = targetElement.querySelectorAll('audio');
      // ... 合并音频流

      streamRef.current = displayStream;

      // 2. 创建MediaRecorder
      const mimeType = options.mimeType || 'video/webm;codecs=vp9';

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        message.warning('浏览器不支持该视频格式，将使用默认格式');
      }

      const recorder = new MediaRecorder(displayStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: options.videoBitsPerSecond || 8000000, // 8Mbps
        audioBitsPerSecond: options.audioBitsPerSecond || 128000,  // 128kbps
      });

      chunksRef.current = [];

      // 3. 监听录制数据
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // 4. 录制结束处理
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setIsRecording(false);
        setIsPaused(false);

        // 清理流
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        message.success('录制完成！');
      };

      // 5. 开始录制
      recorder.start(100); // 每100ms收集一次数据
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      message.success('开始录制...');
    } catch (error) {
      console.error('录制失败:', error);
      message.error('录制失败，请检查浏览器权限');
    }
  }, []);

  /**
   * 停止录制
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  /**
   * 暂停录制
   */
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      message.info('录制已暂停');
    }
  }, [isRecording, isPaused]);

  /**
   * 恢复录制
   */
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      message.info('继续录制');
    }
  }, [isRecording, isPaused]);

  /**
   * 下载录制的视频
   */
  const downloadRecording = useCallback((filename = 'ppt-presentation.webm') => {
    if (!recordedBlob) {
      message.warning('没有可下载的录制内容');
      return;
    }

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    message.success('视频下载成功');
  }, [recordedBlob]);

  /**
   * 清除录制数据
   */
  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    isPaused,
    recordedBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    clearRecording,
  };
}
