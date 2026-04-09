import { useCallback, useRef, useState } from 'react';
import { App } from 'antd';

export interface SpeechConfig {
  /** 每页的宣讲文本 */
  text: string;
  /** TTS音频URL（如果已生成） */
  audioUrl?: string;
  /** 音频时长（秒） */
  audioDuration?: number;
}

export interface AutoPresentationOptions {
  /** 每页的宣讲配置 */
  speeches: SpeechConfig[];
  /** 幻灯片切换回调 */
  onSlideChange: (index: number) => void;
  /** 演示完成回调 */
  onComplete: () => void;
  /** 起始页索引（默认0） */
  startIndex?: number;
}

/**
 * 自动宣讲Hook
 * 根据TTS音频自动切换幻灯片，支持录制
 */
export function useAutoPresentation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const optionsRef = useRef<AutoPresentationOptions | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { message } = App.useApp();
  /**
   * 播放指定幻灯片的音频
   */
  const playSlideAudio = useCallback(async (index: number) => {
    const options = optionsRef.current;
    if (!options || index >= options.speeches.length) {
      return;
    }

    const speech = options.speeches[index];

    // 停止当前音频
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // 切换幻灯片
    options.onSlideChange(index);
    setCurrentSlideIndex(index);

    // 播放音频
    if (speech.audioUrl) {
      const audio = new Audio(speech.audioUrl);
      audioRef.current = audio;
      setCurrentAudio(audio);

      // 音频播放结束后自动下一页
      audio.onended = () => {
        const nextIndex = index + 1;
        if (nextIndex < options.speeches.length) {
          playSlideAudio(nextIndex);
        } else {
          // 演示结束
          setIsPlaying(false);
          options.onComplete();
          message.success('演示完成！');
        }
      };

      audio.onerror = () => {
        message.error(`第${index + 1}页音频加载失败`);
        // 继续下一页
        const nextIndex = index + 1;
        if (nextIndex < options.speeches.length) {
          setTimeout(() => playSlideAudio(nextIndex), 1000);
        }
      };

      try {
        await audio.play();
      } catch (error) {
        console.error('音频播放失败:', error);
        message.error('音频播放失败，请检查浏览器权限');
      }
    } else {
      // 没有音频，使用默认时长（5秒）
      setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex < options.speeches.length) {
          playSlideAudio(nextIndex);
        } else {
          setIsPlaying(false);
          options.onComplete();
        }
      }, speech.audioDuration ? speech.audioDuration * 1000 : 5000);
    }
  }, []);

  /**
   * 开始自动演示
   */
  const startPresentation = useCallback((options: AutoPresentationOptions) => {
    if (options.speeches.length === 0) {
      message.warning('没有可演示的内容');
      return;
    }

    optionsRef.current = options;
    setIsPlaying(true);
    const nextIndex = Math.min(
      Math.max(options.startIndex ?? 0, 0),
      options.speeches.length - 1,
    );
    playSlideAudio(nextIndex);
  }, [playSlideAudio]);

  /**
   * 停止演示
   */
  const stopPresentation = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSlideIndex(0);
  }, []);

  /**
   * 暂停/继续
   */
  const togglePause = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, []);

  return {
    isPlaying,
    currentSlideIndex,
    currentAudio,
    startPresentation,
    stopPresentation,
    togglePause,
  };
}
