let mathLivePromise: Promise<any> | null = null
const MATHLIVE_VERSION = '0.108.2'
const MATHLIVE_JS_URL = `https://unpkg.com/mathlive@${MATHLIVE_VERSION}/mathlive.min.js`
const MATHLIVE_CORE_CSS_URL = `https://unpkg.com/mathlive@${MATHLIVE_VERSION}/mathlive.core.css`
const MATHLIVE_CSS_URL = `https://unpkg.com/mathlive@${MATHLIVE_VERSION}/mathlive.css`
const MATHLIVE_Z_INDEX = 2000
const MATHLIVE_STYLE_ID = 'mathlive-zindex-style'

const loadStyle = (href: string) => {
  if (typeof document === 'undefined') return
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

const loadInlineStyle = () => {
  if (typeof document === 'undefined') return
  if (document.getElementById(MATHLIVE_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = MATHLIVE_STYLE_ID
  style.textContent = `

.ML__keyboard .MLK__backdrop {
  bottom: 0 !important;
  transform: none !important;
  opacity: 1 !important;
  height: 100% !important;
  visibility: visible !important;
}
`
  document.head.appendChild(style)
}



export const loadMathLive = async () => {
  if (typeof window === 'undefined') return null
  const globalAny = window as any
  if (globalAny.MathLive) return globalAny.MathLive
  if (!mathLivePromise) {
    loadStyle(MATHLIVE_CORE_CSS_URL)
    loadStyle(MATHLIVE_CSS_URL)
    loadInlineStyle()

    mathLivePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = MATHLIVE_JS_URL
      script.async = true
      script.onload = () => resolve(globalAny.MathLive)
      script.onerror = () => reject(new Error('Failed to load MathLive from CDN'))
      document.head.appendChild(script)
    })
  }
  return mathLivePromise
}

const ensureContainerPosition = (container: HTMLElement) => {
  const computed = window.getComputedStyle(container)
  if (computed.position === 'static') {
    container.style.position = 'relative'
  }
}

const resetKeyboardPosition = (vkEl: HTMLElement | null, container: HTMLElement | null) => {
  if (!vkEl) return
  if (container) {
    ensureContainerPosition(container)
    vkEl.style.position = 'absolute'
  } else {
    vkEl.style.position = 'fixed'
  }
  vkEl.style.transform = 'none'
  vkEl.style.bottom = '0'
  vkEl.style.top = 'auto'
  vkEl.style.left = '0'
  vkEl.style.right = '0'
  vkEl.style.margin = '0'
}

const resetBackdropStyle = (vkEl: HTMLElement | null) => {
  if (!vkEl) return
  const backdrop = vkEl.querySelector<HTMLElement>('.MLK__backdrop')
  if (!backdrop) return
  backdrop.style.bottom = '0'
  backdrop.style.transform = 'none'
  backdrop.style.opacity = '1'
  backdrop.style.visibility = 'visible'
}

export const attachVirtualKeyboard = async (container: HTMLElement | null, show = false) => {
  if (!container) return
  await loadMathLive()
  const globalKeyboard = (window as any).mathVirtualKeyboard
  if (!globalKeyboard) return
  globalKeyboard.container = container
  const vkEl = globalKeyboard.element || globalKeyboard._element
  const resetPosition = () => resetKeyboardPosition(vkEl || null, container)
  if (show && typeof globalKeyboard.hide === 'function') {
    globalKeyboard.hide()
  }
  resetPosition()
  resetBackdropStyle(vkEl || null)
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      resetPosition()
      resetBackdropStyle(vkEl || null)
      requestAnimationFrame(() => resetPosition())
    })
  }
  if (show && typeof globalKeyboard.show === 'function') {
    setTimeout(() => {
      globalKeyboard.show()
      resetPosition()
      resetBackdropStyle(vkEl || null)
    }, 0)
  }
}

export const forceKeyboardContainer = async (container: HTMLElement | null) => {
  if (!container) return
  await loadMathLive()
  const globalKeyboard = (window as any).mathVirtualKeyboard
  if (!globalKeyboard) return
  globalKeyboard.container = container
  const vkEl = globalKeyboard.element || globalKeyboard._element
  if (vkEl && container !== vkEl.parentElement) {
    container.appendChild(vkEl)
  }
  resetKeyboardPosition(vkEl || null, container)
  resetBackdropStyle(vkEl || null)
}

export const mathMLToLatex = async (mathML: string) => {
    if (!mathML.trim()) return ''
    const mathLive = await loadMathLive()
    const normalized = ensureMathMLRoot(mathML)
    if (mathLive?.convertMathMlToLatex) {
      return mathLive.convertMathMlToLatex(normalized)
    }
    if (mathLive?.convertMathMLToLatex) {
      return mathLive.convertMathMLToLatex(normalized)
    }
    if (mathLive?.convertMathMLToLaTeX) {
      return mathLive.convertMathMLToLaTeX(normalized)
    }
    if (typeof document === 'undefined') return ''
    const field = document.createElement('math-field') as any
    if (typeof field.setValue === 'function') {
      field.setValue(normalized, { format: 'math-ml' })
    } else {
      field.value = normalized
    }
    await new Promise((resolve) => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => resolve(null))
      } else {
        setTimeout(() => resolve(null), 0)
      }
    })
    const latex = typeof field.getValue === 'function' ? field.getValue('latex') : field.value
    const resolved = typeof latex === 'string' ? latex : ''
    if (/^<math[\s>]/i.test(resolved)) return ''
    return resolved
}

export const latexToMathML = async (latex: string) => {
  if (!latex.trim()) return ''
  const mathLive = await loadMathLive()
  if (mathLive?.convertLatexToMathMl) {
    const mathML = mathLive.convertLatexToMathMl(latex)
    return ensureMathMLRoot(mathML)
  }
  if (typeof document === 'undefined') return ''
  const field = document.createElement('math-field') as any
  field.value = latex
  const mathML = typeof field.getValue === 'function' ? field.getValue('math-ml') : ''
  return ensureMathMLRoot(typeof mathML === 'string' ? mathML : '')
}

const normalizeMathML = (mathML: string) => {
  if (!mathML) return ''
  let cleaned = mathML.replace(/^\uFEFF/, '').trim()
  cleaned = cleaned.replace(/<\?xml[\s\S]*?\?>/i, '').trim()
  return cleaned
}

const ensureMathMLRoot = (mathML: string) => {
  const trimmed = normalizeMathML(mathML)
  if (!trimmed) return ''
  if (/^<math[\s>]/i.test(trimmed)) return trimmed
  return `<math xmlns="http://www.w3.org/1998/Math/MathML">${trimmed}</math>`
}

export const setMathFieldValue = async (
  element: HTMLElement | null,
  mathML: string,
  options: Record<string, any> = {},
) => {
  if (!element) return
  const latex = await mathMLToLatex(mathML)
  const mathField = element as any
  mathField.value = latex
  mathField.mathVirtualKeyboardPolicy = 'off'
  mathField.readOnly = true
  Object.assign(mathField, options)
}

export const measureMathML = async (mathML: string) => {
  if (!mathML.trim() || typeof document === 'undefined') return null
  const latex = await mathMLToLatex(mathML)
  if (!latex) return null
  const field = document.createElement('math-field') as any
  field.value = latex
  field.mathVirtualKeyboardPolicy = 'off'
  field.readOnly = true
  field.style.position = 'absolute'
  field.style.visibility = 'hidden'
  field.style.left = '-9999px'
  field.style.top = '-9999px'
  field.style.display = 'inline-block'
  document.body.appendChild(field)
  const rect = field.getBoundingClientRect()
  const width = rect.width || field.scrollWidth
  const height = rect.height || field.scrollHeight
  document.body.removeChild(field)
  if (!width || !height) return null
  return { width, height }
}
