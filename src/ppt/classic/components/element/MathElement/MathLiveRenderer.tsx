import React, { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { loadMathLive, mathMLToLatex } from '@/ppt/utils/mathlive'

interface MathLiveRendererProps {
  latex?: string
  mathML?: string
  width: number
  height: number
  color?: string
  fontName?: string
  fontSize?: number
  strokeWidth?: number
}

const MathLiveRenderer: FC<MathLiveRendererProps> = ({
  latex,
  mathML,
  width,
  height,
  color,
  fontName,
  fontSize,
  strokeWidth,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fieldRef = useRef<HTMLElement | null>(null)
  const [renderLatex, setRenderLatex] = useState('')
  const [renderMathML, setRenderMathML] = useState('')

  const normalizeMathML = (value: string) => {
    const cleaned = value
      .replace(/^\uFEFF/, '')
      .replace(/<\?xml[\s\S]*?\?>/i, '')
      .trim()
    if (!cleaned) return ''
    if (/^<math[\s>]/i.test(cleaned)) return cleaned
    return `<math xmlns="http://www.w3.org/1998/Math/MathML">${cleaned}</math>`
  }

  useEffect(() => {
    let active = true
    const resolveLatex = async () => {
      const trimmedMathML = mathML?.trim()
      const normalized = trimmedMathML ? normalizeMathML(trimmedMathML) : ''
      setRenderMathML(normalized)
      if (normalized) {
        const converted = await mathMLToLatex(normalized)
        if (!active) return
        setRenderLatex(converted || latex?.trim() || '')
        return
      }
      setRenderLatex(latex?.trim() || '')
    }
    resolveLatex()
    return () => {
      active = false
    }
  }, [latex, mathML])

  /** 
   * 非等比缩放：强制把公式拉伸到刚好占满父元素
   * 保证：不裁剪，只是会变形
   */
  const updateScale = () => {
    const container = containerRef.current
    const field = fieldRef.current as HTMLElement | null
    if (!container || !field) return

    // 1. 恢复成未缩放状态，避免叠加
    field.style.transform = 'none'
    field.style.left = '0px'
    field.style.top = '0px'

    const cw = container.clientWidth
    const ch = container.clientHeight
    if (!cw || !ch) return

    // 2. 获取公式内容的“自然尺寸”
    //   这里尽量用 scrollWidth/scrollHeight，必要时再用 rect
    const rect = field.getBoundingClientRect()
    const fw = field.scrollWidth || rect.width || field.offsetWidth
    const fh = field.scrollHeight || rect.height || field.offsetHeight

    if (!fw || !fh) return

    // 3. 非等比缩放：各方向单独算
    const scaleX = cw / fw
    const scaleY = ch / fh

    field.style.transformOrigin = '0 0'
    field.style.transform = `scale(${scaleX}, ${scaleY})`

    // 如果你想严格居中，也可以算一下偏移量：
    // const scaledW = fw * scaleX
    // const scaledH = fh * scaleY
    // const offsetX = (cw - scaledW) / 2
    // const offsetY = (ch - scaledH) / 2
    // field.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`
  }

  useEffect(() => {
    let active = true
    const render = async () => {
      await loadMathLive()
      if (typeof customElements !== 'undefined' && customElements.whenDefined) {
        await customElements.whenDefined('math-field')
      }
      if (!active) return
      const field = fieldRef.current as any
      if (!field) return

      if (renderLatex) {
        field.value = renderLatex
      }

      field.readOnly = true
      field.mathVirtualKeyboardPolicy = 'off'

      // ⭐ 让 math-field 用“自然尺寸”排版，后面用 transform 拉伸
      field.style.display = 'inline-block'
      field.style.width = 'auto'
      field.style.height = 'auto'
      field.style.minWidth = '0'
      field.style.minHeight = '0'

      field.style.position = 'absolute'
      field.style.left = '0'
      field.style.top = '0'
      field.style.background = 'transparent'
      field.style.lineHeight = '1'
      field.style.margin = '0'
      field.style.padding = '0'
      field.style.border = '0'
      field.style.boxShadow = 'none'
      field.style.setProperty('--math-field-padding', '0px')
      field.style.setProperty('--math-field-border-width', '0px')
      field.style.setProperty('--math-field-background', 'transparent')
      field.style.setProperty('--math-field-focus-background', 'transparent')

      field.style.color = color || '#000'
      if (fontName) field.style.fontFamily = fontName
      if (fontSize) field.style.fontSize = `${fontSize}px`
      if (strokeWidth) {
        const weight = Math.min(800, Math.max(300, Math.round(300 + strokeWidth * 150)))
        field.style.fontWeight = String(weight)
      }

      // 多次尝试是为了等 MathLive 完全渲染后再测量
      requestAnimationFrame(updateScale)
      requestAnimationFrame(updateScale)
      setTimeout(updateScale, 60)
    }
    render()
    return () => {
      active = false
    }
  }, [renderMathML, renderLatex, width, height, color, fontName, fontSize, strokeWidth])

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const field = document.createElement('math-field') as any

    container.innerHTML = ''
    container.appendChild(field)
    fieldRef.current = field

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateScale())
      observer.observe(container)
      return () => {
        observer.disconnect()
        if (fieldRef.current === field) {
          fieldRef.current = null
        }
        if (container.contains(field)) {
          container.removeChild(field)
        }
      }
    }

    return () => {
      if (fieldRef.current === field) {
        fieldRef.current = null
      }
      if (container.contains(field)) {
        container.removeChild(field)
      }
    }
  }, [])

  const containerStyle = useMemo<React.CSSProperties>(() => {
    return {
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden', // 防止极少数情况溢出
    }
  }, [])

  return <div ref={containerRef} style={containerStyle} />
}

export default MathLiveRenderer
