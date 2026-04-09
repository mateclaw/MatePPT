import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useMemoizedFn } from 'ahooks'
import {
  pasteCustomClipboardString,
  pasteExcelClipboardString,
  pasteHTMLTableClipboardString,
} from '@/ppt/utils/clipboard'
import styles from './CustomTextarea.module.scss'

interface CustomTextareaProps {
  value?: string
  onUpdateValue: (value: string) => void
  onInsertExcelData: (value: string[][]) => void
  className?: string
  style?: React.CSSProperties
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  value = '',
  onUpdateValue,
  onInsertExcelData,
  className,
  style,
}) => {
  const textareaRef = useRef<HTMLDivElement>(null)
  const [isFocus, setIsFocus] = useState(false)

  useEffect(() => {
    if (isFocus) return
    if (!textareaRef.current) return
    textareaRef.current.innerHTML = value
  }, [value, isFocus])

  const handleInput = useMemoizedFn(() => {
    if (!textareaRef.current) return
    const text = textareaRef.current.innerHTML
    onUpdateValue(text)
  })

  const handleFocus = useMemoizedFn(() => {
    setIsFocus(true)
  })

  const handleBlur = useMemoizedFn(() => {
    setIsFocus(false)
  })

  const handlePaste = useMemoizedFn((event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const clipboardData = event.clipboardData
    if (!clipboardData) return

    const plainText = clipboardData.getData('text/plain')
    const htmlText = clipboardData.getData('text/html')

    if (plainText) {
      const clipboardDataValue = pasteCustomClipboardString(plainText)
      if (typeof clipboardDataValue === 'object') {
        return
      }

      const excelData = pasteExcelClipboardString(plainText)
      if (excelData) {
        onInsertExcelData(excelData)
        if (textareaRef.current) {
          textareaRef.current.innerHTML = excelData[0][0]
        }
        return
      }

      document.execCommand('insertText', false, plainText)
      return
    }

    if (htmlText) {
      const htmlData = pasteHTMLTableClipboardString(htmlText)
      if (htmlData) {
        onInsertExcelData(htmlData)
        if (textareaRef.current) {
          textareaRef.current.innerHTML = htmlData[0][0]
        }
      }
    }
  })

  return (
    <>
      <div
        ref={textareaRef}
        className={clsx(styles.customTextarea, className)}
        style={style}
        contentEditable
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onPaste={handlePaste}
      />
    </>
  )
}

export default CustomTextarea
