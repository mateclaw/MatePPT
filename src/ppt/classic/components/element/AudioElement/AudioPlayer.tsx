import { App } from 'antd'
import React, { type FC, useRef, useState, useMemo, useEffect } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import styles from './AudioPlayer.module.scss'

interface AudioPlayerProps {
  src: string
  loop: boolean
  scale?: number
  className?: string
  style?: React.CSSProperties
  onMouseDown?: (e: React.MouseEvent) => void
}

const AudioPlayer: FC<AudioPlayerProps> = ({
  src,
  loop,
  scale = 1,
  className = '',
  style = {},
  onMouseDown,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const playBarWrapRef = useRef<HTMLDivElement>(null)
  const volumeBarRef = useRef<HTMLDivElement>(null)

  const { message } = App.useApp()

  const [volume, setVolume] = useState(0.5)
  const [paused, setPaused] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [playBarTimeVisible, setPlayBarTimeVisible] = useState(false)
  const [playBarTime, setPlayBarTime] = useState('00:00')
  const [playBarTimeLeft, setPlayBarTimeLeft] = useState('0')

  const secondToTime = useMemoizedFn((second = 0) => {
    if (second === 0 || isNaN(second)) {
      return '00:00'
    }

    const add0 = (num: number) => (num < 10 ? '0' + num : '' + num)
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
  const playedBarWidth = useMemo(() => (currentTime / duration * 100) + '%', [currentTime, duration])
  const loadedBarWidth = useMemo(() => (loaded / duration * 100) + '%', [loaded, duration])
  const volumeBarWidth = useMemo(() => (volume * 100) + '%', [volume])

  const seek = useMemoizedFn((time: number) => {
    if (!audioRef.current) {
      return
    }

    time = Math.max(time, 0)
    time = Math.min(time, duration)

    audioRef.current.currentTime = time
    setCurrentTime(time)
  })

  const play = useMemoizedFn(() => {
    if (!audioRef.current) {
      return
    }

    setPaused(false)
    audioRef.current.play()
  })

  const pause = useMemoizedFn(() => {
    if (!audioRef.current) {
      return
    }

    setPaused(true)
    audioRef.current.pause()
  })

  const toggle = useMemoizedFn(() => {
    if (paused) {
      play()
    }
    else {
      pause()
    }
  })

  const setVolumeValue = useMemoizedFn((percentage: number) => {
    if (!audioRef.current) {
      return
    }

    percentage = Math.max(percentage, 0)
    percentage = Math.min(percentage, 1)

    audioRef.current.volume = percentage
    setVolume(percentage)
    if (audioRef.current.muted && percentage !== 0) {
      audioRef.current.muted = false
    }
  })

  const handleDurationchange = useMemoizedFn(() => {
    setDuration(audioRef.current?.duration || 0)
  })

  const handleTimeupdate = useMemoizedFn(() => {
    setCurrentTime(audioRef.current?.currentTime || 0)
  })

  const handlePlayed = useMemoizedFn(() => {
    setPaused(false)
  })

  const handleEnded = useMemoizedFn(() => {
    if (!loop) {
      pause()
    }
    else {
      seek(0)
      play()
    }
  })

  const handleProgress = useMemoizedFn(() => {
    const buffered = audioRef.current?.buffered
    if (buffered && buffered.length) {
      setLoaded(buffered.end(buffered.length - 1))
    }
  })

  const handleError = useMemoizedFn(() => {
    message.error('音频加载失败')
  })

  const thumbMove = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (!audioRef.current || !playBarWrapRef.current) {
      return
    }
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    let percentage = (clientX - getBoundingClientRectViewLeft(playBarWrapRef.current)) / playBarWrapRef.current.clientWidth
    percentage = Math.max(percentage, 0)
    percentage = Math.min(percentage, 1)
    const time = percentage * duration

    audioRef.current.currentTime = time
    setCurrentTime(time)
  })

  const thumbUp = useMemoizedFn((e: MouseEvent | TouchEvent) => {
    if (!audioRef.current || !playBarWrapRef.current) {
      return
    }

    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    let percentage = (clientX - getBoundingClientRectViewLeft(playBarWrapRef.current)) / playBarWrapRef.current.clientWidth
    percentage = Math.max(percentage, 0)
    percentage = Math.min(percentage, 1)
    const time = percentage * duration

    audioRef.current.currentTime = time
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
    if (!volumeBarRef.current) {
      return
    }
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    const percentage = (clientX - getBoundingClientRectViewLeft(volumeBarRef.current)) / 45
    setVolumeValue(percentage)
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
    if (!volumeBarRef.current) {
      return
    }
    const percentage = (e.clientX - getBoundingClientRectViewLeft(volumeBarRef.current)) / 45
    setVolumeValue(percentage)
  })

  const handleMousemovePlayBar = useMemoizedFn((e: React.MouseEvent) => {
    if (duration && playBarWrapRef.current) {
      const px = playBarWrapRef.current.getBoundingClientRect().left
      const tx = e.clientX - px
      if (tx < 0 || tx > playBarWrapRef.current.offsetWidth) {
        return
      }

      const time = duration * (tx / playBarWrapRef.current.offsetWidth)
      setPlayBarTimeLeft(`${tx - (time >= 3600 ? 25 : 20)}px`)
      setPlayBarTime(secondToTime(time))
    }
  })

  const toggleVolume = useMemoizedFn(() => {
    if (!audioRef.current) {
      return
    }

    if (audioRef.current.muted) {
      audioRef.current.muted = false
      setVolumeValue(0.5)
    }
    else {
      audioRef.current.muted = true
      setVolumeValue(0)
    }
  })

  useEffect(() => {
    if (!audioRef.current) {
      return
    }
    audioRef.current.volume = volume
  }, [volume])

  const playerStyle: React.CSSProperties = {
    width: '280px',
    height: '50px',
    position: 'relative',
    userSelect: 'none',
    lineHeight: '1',
    transformOrigin: '0 0',
    background: '#000',
    transform: `scale(${1 / scale})`,
  }

  return (
    <div
      className={clsx(styles.audioPlayer, className)}
      style={{ ...playerStyle, ...style }}
      onMouseDown={onMouseDown}
    >
      <audio
        ref={audioRef}
        src={src}
        onDurationChange={handleDurationchange}
        onTimeUpdate={handleTimeupdate}
        onPlay={handlePlayed}
        onEnded={handleEnded}
        onProgress={handleProgress}
        onError={handleError}
      />

      <div className="controller" style={controllerStyle}>
        <div style={iconsStyle}>
          <div
            style={{ ...iconStyle, fontSize: '26px' }}
            onClick={toggle}
          >
            <span style={iconContentStyle}>
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

          <div style={volumeStyle}>
            <div style={iconStyle} onClick={toggleVolume}>
              <span style={iconContentStyle}>
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
            <div style={volumeBarWrapStyle}>
              <div
                ref={volumeBarRef}
                style={volumeBarStyle}
                onMouseDown={handleMousedownVolumeBar}
                onTouchStart={handleMousedownVolumeBar}
                onClick={handleClickVolumeBar}
              >
                <div style={{ ...volumeBarInnerStyle, width: volumeBarWidth }}>
                  <span style={thumbStyle} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <span style={timeStyle}>
          <span style={timeTextStyle}>{ptime}</span> / <span style={timeTextStyle}>{dtime}</span>
        </span>

        <div
          ref={playBarWrapRef}
          style={barWrapStyle}
          onMouseDown={handleMousedownPlayBar}
          onTouchStart={handleMousedownPlayBar}
          onMouseMove={handleMousemovePlayBar}
          onMouseEnter={() => setPlayBarTimeVisible(true)}
          onMouseLeave={() => setPlayBarTimeVisible(false)}
        >
          <div
            style={{
              ...barTimeStyle,
              opacity: playBarTimeVisible ? 1 : 0,
              left: playBarTimeLeft,
            }}
          >
            {playBarTime}
          </div>
          <div style={barStyle}>
            <div style={{ ...loadedStyle, width: loadedBarWidth }} />
            <div style={{ ...playedStyle, width: playedBarWidth }}>
              <span style={thumbStyle} />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

const controllerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '41px',
  padding: '0 20px',
  userSelect: 'none',
  transition: 'all 0.3s ease',
}

const iconsStyle: React.CSSProperties = {
  height: '38px',
  position: 'absolute',
  bottom: 0,
  left: '14px',
  display: 'flex',
  alignItems: 'center',
}

const iconStyle: React.CSSProperties = {
  width: '36px',
  height: '100%',
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  fontSize: '20px',
}

const iconContentStyle: React.CSSProperties = {
  transition: 'all .2s ease-in-out',
  opacity: 0.8,
  color: '#fff',
}

const volumeStyle: React.CSSProperties = {
  height: '100%',
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
}

const volumeBarWrapStyle: React.CSSProperties = {
  display: 'inline-block',
  margin: '0 15px 0 -5px',
  verticalAlign: 'middle',
  height: '100%',
}

const volumeBarStyle: React.CSSProperties = {
  position: 'relative',
  top: '17px',
  width: '45px',
  height: '3px',
  background: '#aaa',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
}

const volumeBarInnerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: '100%',
  transition: 'all 0.1s ease',
  willChange: 'width',
  backgroundColor: '#fff',
}

const thumbStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: '-5px',
  marginTop: '-4px',
  marginRight: '-10px',
  height: '11px',
  width: '11px',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  transform: 'scale(0)',
  backgroundColor: '#fff',
}

const timeStyle: React.CSSProperties = {
  height: '38px',
  position: 'absolute',
  right: '20px',
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  lineHeight: '38px',
  color: '#eee',
  textShadow: '0 0 2px rgba(0, 0, 0, 0.5)',
  verticalAlign: 'middle',
  fontSize: '13px',
  cursor: 'default',
}

const timeTextStyle: React.CSSProperties = {
  margin: '0 2px',
}

const barWrapStyle: React.CSSProperties = {
  padding: '5px 0',
  cursor: 'pointer',
  position: 'absolute',
  bottom: '35px',
  width: 'calc(100% - 40px)',
  height: '3px',
}

const barTimeStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '-20px',
  borderRadius: '4px',
  padding: '5px 7px',
  backgroundColor: 'rgba(0, 0, 0, 0.62)',
  color: '#fff',
  fontSize: '12px',
  textAlign: 'center',
  transition: 'opacity 0.1s ease-in-out',
  wordWrap: 'normal',
  wordBreak: 'normal',
  zIndex: 2,
  pointerEvents: 'none',
}

const barStyle: React.CSSProperties = {
  position: 'relative',
  height: '3px',
  width: '100%',
  background: 'rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
}

const loadedStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.4)',
  height: '3px',
  transition: 'all 0.5s ease',
  willChange: 'width',
}

const playedStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  height: '3px',
  willChange: 'width',
  backgroundColor: '#fff',
}

export default AudioPlayer
