import { useEffect, useMemo, useState } from 'react'
import { RiCloseLine } from '@remixicon/react'
import { fillDigit } from '@/ppt/utils/common'
import MoveablePanel from '@/components/MoveablePanel'
import styles from './CountdownTimer.module.scss'

interface CountdownTimerProps {
  left?: number
  top?: number
  onClose: () => void
}

export default function CountdownTimer({ left = 5, top = 5, onClose }: CountdownTimerProps) {
  const [inTiming, setInTiming] = useState(false)
  const [isCountdown, setIsCountdown] = useState(false)
  const [time, setTime] = useState(0)
  const [minuteInput, setMinuteInput] = useState('00')
  const [secondInput, setSecondInput] = useState('00')
  const [editingMinute, setEditingMinute] = useState(false)
  const [editingSecond, setEditingSecond] = useState(false)

  const minute = useMemo(() => Math.floor(time / 60), [time])
  const second = useMemo(() => time % 60, [time])
  const inputEditable = !isCountdown || inTiming

  useEffect(() => {
    if (!editingMinute) setMinuteInput(fillDigit(minute, 2))
  }, [editingMinute, minute])

  useEffect(() => {
    if (!editingSecond) setSecondInput(fillDigit(second, 2))
  }, [editingSecond, second])

  useEffect(() => {
    if (!inTiming) return
    const timer = window.setInterval(() => {
      setTime((prev) => {
        if (isCountdown) {
          const next = prev - 1
          if (next <= 0) {
            setInTiming(false)
            return isCountdown ? 600 : 0
          }
          return next
        }

        const next = prev + 1
        if (next > 36000) {
          setInTiming(false)
          return prev
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [inTiming, isCountdown])

  const reset = () => {
    setInTiming(false)
    setTime(isCountdown ? 600 : 0)
  }

  const start = () => {
    setInTiming(true)
  }

  const toggle = () => {
    if (inTiming) setInTiming(false)
    else start()
  }

  const toggleCountdown = () => {
    setIsCountdown((prev) => !prev)
    setInTiming(false)
    setTime(!isCountdown ? 600 : 0)
  }

  const changeTime = (value: string, type: 'minute' | 'second') => {
    const isNumber = /^(\d)+$/.test(value)
    if (isNumber) {
      let nextValue = value
      if (type === 'second' && +value >= 60) nextValue = '59'
      const nextTime =
        type === 'minute' ? +nextValue * 60 + second : +nextValue + minute * 60
      setTime(nextTime)
    }
  }

  return (
    <MoveablePanel className={styles['countdown-timer']} width={180} height={110} left={left} top={top}>
      <div className={styles.header}>
        <span className={styles['text-btn']} onClick={toggle}>
          {inTiming ? '暂停' : '开始'}
        </span>
        <span className={styles['text-btn']} onClick={reset}>
          重置
        </span>
        <span
          className={`${styles['text-btn']} ${isCountdown ? styles.active : ''}`}
          onClick={toggleCountdown}
        >
          倒计时
        </span>
      </div>
      <div className={styles.content}>
        <div className={styles.timer}>
          <input
            type="text"
            value={minuteInput}
            maxLength={3}
            disabled={inputEditable}
            onFocus={() => setEditingMinute(true)}
            onBlur={(e) => {
              setEditingMinute(false)
              changeTime(e.target.value, 'minute')
            }}
            onChange={(e) => setMinuteInput(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') {
                setEditingMinute(false)
                changeTime((e.target as HTMLInputElement).value, 'minute')
              }
            }}
          />
        </div>
        <div className={styles.colon}>:</div>
        <div className={styles.timer}>
          <input
            type="text"
            value={secondInput}
            maxLength={3}
            disabled={inputEditable}
            onFocus={() => setEditingSecond(true)}
            onBlur={(e) => {
              setEditingSecond(false)
              changeTime(e.target.value, 'second')
            }}
            onChange={(e) => setSecondInput(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') {
                setEditingSecond(false)
                changeTime((e.target as HTMLInputElement).value, 'second')
              }
            }}
          />
        </div>
      </div>

      <div className={styles['close-btn']} onClick={onClose}>
        <RiCloseLine className={styles.icon} />
      </div>
    </MoveablePanel>
  )
}
