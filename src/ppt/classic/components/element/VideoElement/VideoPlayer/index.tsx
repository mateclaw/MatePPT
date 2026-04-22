import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import useMSE from './useMSE'
import styles from './VideoPlayer.module.scss'

interface VideoPlayerProps {
  width: number
  height: number
  src: string
  poster?: string
  autoplay?: boolean
  scale?: number
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  width,
  height,
  src,
  poster = '',
  autoplay = false,
  scale = 1,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playBarWrapRef = useRef<HTMLDivElement>(null)
  const volumeBarRef = useRef<HTMLDivElement>(null)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  const [volume, setVolumeState] = useState(0.5)
  const [paused, setPaused] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [loop, setLoop] = useState(false)
  const [bezelTransition, setBezelTransition] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [playBarTimeVisible, setPlayBarTimeVisible] = useState(false)
  const [playBarTime, setPlayBarTime] = useState('00:00')
  const [playBarTimeLeft, setPlayBarTimeLeft] = useState('0')
  const [speedMenuVisible, setSpeedMenuVisible] = useState(false)
  const [hideController, setHideController] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const autoHideControllerTimerRef = useRef<number | null>(null)

  const secondToTime = useMemoizedFn((second = 0) => {
    if (second === 0 || isNaN(second)) return '00:00'

    const add0 = (num: number) => (num < 10 ? `0${num}` : `${num}`)
    const hour = Math.floor(second / 3600)
    const min = Math.floor((second - hour * 3600) / 60)
    const sec = Math.floor(second - hour * 3600 - min * 60)
    return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(':')
  })

  const getBoundingClientRectViewLeft = useMemoizedFn((element: HTMLElement) => {
    return element.getBoundingClientRect().left
  })

  const ptime = useMemo(() => secondToTime(currentTime), [currentTime, secondToTime])
  const dtime = useMemo(() => secondToTime(duration), [duration, secondToTime])
  const playedBarWidth = useMemo(() => {
    if (!duration) return '0%'
    return `${(currentTime / duration) * 100}%`
  }, [currentTime, duration])
  const loadedBarWidth = useMemo(() => {
    if (!duration) return '0%'
    return `${(loaded / duration) * 100}%`
  }, [loaded, duration])
  const volumeBarWidth = useMemo(() => `${volume * 100}%`, [volume])
  const showPosterOverlay = !!poster && (paused || currentTime === 0)

  const speedOptions = useMemo(() => {
    return [
      { label: '2x', value: 2 },
      { label: '1.5x', value: 1.5 },
      { label: '1.25x', value: 1.25 },
      { label: '1x', value: 1 },
      { label: '0.75x', value: 0.75 },
      { label: '0.5x', value: 0.5 },
    ]
  }, [])

  const seek = useMemoizedFn((time: number) => {
    if (!videoRef.current) return
    let next = Math.max(time, 0)
    next = Math.min(next, duration)
    videoRef.current.currentTime = next
    setCurrentTime(next)
  })

  const play = useMemoizedFn(() => {
    if (!videoRef.current) return
    setPaused(false)
    videoRef.current.play()
    setBezelTransition(true)
  })

  const pause = useMemoizedFn(() => {
    if (!videoRef.current) return
    setPaused(true)
    videoRef.current.pause()
    setBezelTransition(true)
  })

  const toggle = useMemoizedFn(() => {
    if (paused) play()
    else pause()
  })

  const setVolume = useMemoizedFn((percentage: number) => {
    if (!videoRef.current) return
    let next = Math.max(percentage, 0)
    next = Math.min(next, 1)
    videoRef.current.volume = next
    setVolumeState(next)
    if (videoRef.current.muted && next !== 0) videoRef.current.muted = false
  })

  const speed = useMemoizedFn((rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  })

  const handleDurationchange = useMemoizedFn(() => {
    setDuration(videoRef.current?.duration || 0)
  })

  const handleTimeupdate = useMemoizedFn(() => {
    setCurrentTime(videoRef.current?.currentTime || 0)
  })

  const handleEnded = useMemoizedFn(() => {
    if (!loop) pause()
    else {
      seek(0)
      play()
    }
  })

  const handleProgress = useMemoizedFn(() => {
    const buffered = videoRef.current?.buffered
    if (buffered && buffered.length) {
      setLoaded(buffered.end(buffered.length - 1))
    }
  })

  const handleError = useMemoizedFn(() => {
    setLoadError(true)
  })

  const thumbMove = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (!videoRef.current || !playBarWrapRef.current) return
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    let percentage =
      (clientX - getBoundingClientRectViewLeft(playBarWrapRef.current)) /
      playBarWrapRef.current.clientWidth
    percentage = Math.max(percentage, 0)
    percentage = Math.min(percentage, 1)
    const time = percentage * duration

    videoRef.current.currentTime = time
    setCurrentTime(time)
  })

  const thumbUp = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (!videoRef.current || !playBarWrapRef.current) return
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    let percentage =
      (clientX - getBoundingClientRectViewLeft(playBarWrapRef.current)) /
      playBarWrapRef.current.clientWidth
    percentage = Math.max(percentage, 0)
    percentage = Math.min(percentage, 1)
    const time = percentage * duration

    videoRef.current.currentTime = time
    setCurrentTime(time)

    document.removeEventListener('mousemove', thumbMove)
    document.removeEventListener('touchmove', thumbMove)
    document.removeEventListener('mouseup', thumbUp)
    document.removeEventListener('touchend', thumbUp)
  })

  const handleMousedownPlayBar = useMemoizedFn(() => {
    document.addEventListener('mousemove', thumbMove)
    document.addEventListener('touchmove', thumbMove)
    document.addEventListener('mouseup', thumbUp)
    document.addEventListener('touchend', thumbUp)
  })

  const volumeMove = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (!volumeBarRef.current) return
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    const percentage = (clientX - getBoundingClientRectViewLeft(volumeBarRef.current)) / 45
    setVolume(percentage)
  })

  const volumeUp = useMemoizedFn(() => {
    document.removeEventListener('mousemove', volumeMove)
    document.removeEventListener('touchmove', volumeMove)
    document.removeEventListener('mouseup', volumeUp)
    document.removeEventListener('touchend', volumeUp)
  })

  const handleMousedownVolumeBar = useMemoizedFn(() => {
    document.addEventListener('mousemove', volumeMove)
    document.addEventListener('touchmove', volumeMove)
    document.addEventListener('mouseup', volumeUp)
    document.addEventListener('touchend', volumeUp)
  })

  const handleClickVolumeBar = useMemoizedFn((e: React.MouseEvent) => {
    if (!volumeBarRef.current) return
    const percentage = (e.clientX - getBoundingClientRectViewLeft(volumeBarRef.current)) / 45
    setVolume(percentage)
  })

  const handleMousemovePlayBar = useMemoizedFn((e: React.MouseEvent) => {
    if (duration && playBarWrapRef.current) {
      const px = playBarWrapRef.current.getBoundingClientRect().left
      const tx = e.clientX - px
      if (tx < 0 || tx > playBarWrapRef.current.offsetWidth) return

      const time = duration * (tx / playBarWrapRef.current.offsetWidth)
      setPlayBarTimeLeft(`${tx - (time >= 3600 ? 25 : 20)}px`)
      setPlayBarTime(secondToTime(time))
      setPlayBarTimeVisible(true)
    }
  })

  const toggleVolume = useMemoizedFn(() => {
    if (!videoRef.current) return
    if (videoRef.current.muted) {
      videoRef.current.muted = false
      setVolume(0.5)
    }
    else {
      videoRef.current.muted = true
      setVolume(0)
    }
  })

  const toggleLoop = useMemoizedFn(() => {
    setLoop((prev) => !prev)
  })

  const autoHideController = useMemoizedFn(() => {
    setHideController(false)
    if (autoHideControllerTimerRef.current) {
      window.clearTimeout(autoHideControllerTimerRef.current)
    }
    autoHideControllerTimerRef.current = window.setTimeout(() => {
      if (videoRef.current?.played.length) {
        setHideController(true)
      }
    }, 3000)
  })

  useEffect(() => {
    if (!videoRef.current || !bgCanvasRef.current) return
    const ctx = bgCanvasRef.current.getContext('2d')
    if (!ctx) return

    const handleLoadedMetadata = () => {
      const canvas = bgCanvasRef.current
      const video = videoRef.current
      if (!canvas || !video) return
      const drawFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
      if ('requestVideoFrameCallback' in video) {
        ;(video as any).requestVideoFrameCallback(drawFrame)
      }
      else {
        drawFrame()
      }
    }

    videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, {
      once: true,
    })

    return () => {
      videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    return () => {
      if (autoHideControllerTimerRef.current) {
        window.clearTimeout(autoHideControllerTimerRef.current)
      }
    }
  }, [])

  useMSE(src, videoRef)

  return (
    <div
      className={clsx(styles.videoPlayer, hideController && styles.hideController)}
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        transform: `scale(${1 / scale})`,
      }}
      onMouseMove={autoHideController}
      onClick={autoHideController}
    >
      <div className={styles.videoWrap} onClick={toggle}>
        {loadError && <div className={styles.loadError}>视频加载失败</div>}

        <canvas ref={bgCanvasRef} className={styles.bgCanvas} />
        <video
          className={styles.video}
          ref={videoRef}
          src={src}
          autoPlay={autoplay}
          poster={poster}
          playsInline
          crossOrigin="anonymous"
          onDurationChange={handleDurationchange}
          onTimeUpdate={handleTimeupdate}
          onEnded={handleEnded}
          onProgress={handleProgress}
          onPlay={() => {
            autoHideController()
            setPaused(false)
          }}
          onPause={() => {
            autoHideController()
            setPaused(true)
          }}
          onError={handleError}
        />
        {showPosterOverlay && (
          <div
            className={styles.posterOverlay}
            style={{ backgroundImage: `url(${poster})` }}
          />
        )}
        <div className={styles.bezel}>
          <span
            className={clsx(styles.bezelIcon, bezelTransition && styles.bezelTransition)}
            onAnimationEnd={() => setBezelTransition(false)}
          >
            {paused ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </span>
        </div>
      </div>

      <div className={styles.controllerMask} />
      <div className={styles.controller}>
        <div className={clsx(styles.icons, styles.iconsLeft)}>
          <div className={clsx(styles.icon, styles.playIcon)} onClick={toggle}>
            <span className={styles.iconContent}>
              {paused ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </span>
          </div>
          <div className={styles.volume}>
            <div className={clsx(styles.icon, styles.volumeIcon)} onClick={toggleVolume}>
              <span className={styles.iconContent}>
                {volume === 0 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C23.16 15.04 24 13.16 24 11s-.84-4.04-2.24-5.64l-1.51 1.51c.34.82.54 1.7.54 2.64zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                    <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </span>
            </div>
            <div
              className={styles.volumeBarWrap}
              onMouseDown={handleMousedownVolumeBar}
              onTouchStart={handleMousedownVolumeBar}
              onClick={handleClickVolumeBar}
            >
              <div className={styles.volumeBar} ref={volumeBarRef}>
                <div className={styles.volumeBarInner} style={{ width: volumeBarWidth }}>
                  <span className={styles.thumb} />
                </div>
              </div>
            </div>
          </div>
          <span className={styles.time}>
            <span className={styles.ptime}>{ptime}</span> / <span className={styles.dtime}>{dtime}</span>
          </span>
        </div>

        <div className={clsx(styles.icons, styles.iconsRight)}>
          <div className={styles.speed}>
            <div className={clsx(styles.icon, styles.speedIcon)}>
              <span
                className={styles.iconContent}
                onClick={() => setSpeedMenuVisible(!speedMenuVisible)}
              >
                {playbackRate === 1 ? '倍速' : `${playbackRate}x`}
              </span>
              {speedMenuVisible && (
                <div className={styles.speedMenu} onMouseLeave={() => setSpeedMenuVisible(false)}>
                  {speedOptions.map((item) => (
                    <div
                      key={item.label}
                      className={clsx(
                        styles.speedMenuItem,
                        item.value === playbackRate && styles.active,
                      )}
                      onClick={() => speed(item.value)}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.loop} onClick={toggleLoop}>
            <div className={clsx(styles.icon, styles.loopIcon, loop && styles.active)}>
              <span className={styles.iconContent}>循环{loop ? '开' : '关'}</span>
            </div>
          </div>
        </div>

        <div
          className={styles.barWrap}
          ref={playBarWrapRef}
          onMouseDown={handleMousedownPlayBar}
          onTouchStart={handleMousedownPlayBar}
          onMouseMove={handleMousemovePlayBar}
          onMouseEnter={() => setPlayBarTimeVisible(true)}
          onMouseLeave={() => setPlayBarTimeVisible(false)}
        >
          <div
            className={clsx(styles.barTime, !playBarTimeVisible && styles.hidden)}
            style={{ left: playBarTimeLeft }}
          >
            {playBarTime}
          </div>
          <div className={styles.bar}>
            <div className={styles.loaded} style={{ width: loadedBarWidth }} />
            <div className={styles.played} style={{ width: playedBarWidth }}>
              <span className={styles.thumb} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer

