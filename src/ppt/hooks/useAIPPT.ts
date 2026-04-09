// 这是生成AIPPT的方法，我们不需要

// import { useRef } from 'react'
// import { nanoid } from 'nanoid'
// import { useMemoizedFn } from 'ahooks'
// import { useShallow } from 'zustand/react/shallow'

// import { useSlidesStore } from '../store/useSlidesStore'
// import useAddSlidesOrElements from './useAddSlidesOrElements'
// import useSlideHandler from './useSlideHandler'

// import type {
//   ImageClipDataRange,
//   PPTElement,
//   ImageElement,
//   ShapeElement,
//   TextElement,
//   PPTSlide,
//   TextType,
// } from '../core'
// import type { AIPPTSlide } from '../types/AIPPT' // 按你的实际路径调整

// interface ImgPoolItem {
//   id: string
//   src: string
//   width: number
//   height: number
// }

// const useAIPPT = () => {
//   // slides store：只取用到的字段，避免无关重渲染
//   const { slides, updateSlideIndex, setSlides } = useSlidesStore(
//     useShallow((state) => ({
//       slides: state.slides,
//       updateSlideIndex: state.updateSlideIndex,
//       setSlides: state.setSlides,
//     })),
//   )

//   const { addSlidesFromData } = useAddSlidesOrElements()
//   const { isEmptySlide } = useSlideHandler()

//   // 原来的 ref
//   const imgPoolRef = useRef<ImgPoolItem[]>([])
//   const transitionIndexRef = useRef(0)
//   const transitionTemplateRef = useRef<PPTSlide | null>(null)

//   const checkTextType = (el: PPTElement, type: TextType) => {
//     return (
//       (el.type === 'text' && el.textType === type) ||
//       (el.type === 'shape' && el.text && el.text.type === type)
//     )
//   }

//   const getUseableTemplates = (
//     templates: PPTSlide[],
//     n: number,
//     type: TextType,
//   ) => {
//     if (n === 1) {
//       const list = templates.filter((slide) => {
//         const items = slide.elements.filter((el) => checkTextType(el, type))
//         const titles = slide.elements.filter((el) => checkTextType(el, 'title'))
//         const texts = slide.elements.filter((el) => checkTextType(el, 'content'))

//         return !items.length && titles.length === 1 && texts.length === 1
//       })

//       if (list.length) return list
//     }

//     let target: PPTSlide | null = null

//     const list = templates.filter((slide) => {
//       const len = slide.elements.filter((el) => checkTextType(el, type)).length
//       return len >= n
//     })

//     if (list.length === 0) {
//       const sorted = [...templates].sort((a, b) => {
//         const aLen = a.elements.filter((el) => checkTextType(el, type)).length
//         const bLen = b.elements.filter((el) => checkTextType(el, type)).length
//         return aLen - bLen
//       })
//       target = sorted[sorted.length - 1] ?? null
//     } else {
//       target = list.reduce((closest, current) => {
//         const currentLen = current.elements.filter((el) => checkTextType(el, type)).length
//         const closestLen = closest.elements.filter((el) => checkTextType(el, type)).length
//         return currentLen - n <= closestLen - n ? current : closest
//       })
//     }

//     if (!target) return templates

//     const targetLen = target.elements.filter((el) => checkTextType(el, type)).length

//     return templates.filter((slide) => {
//       const len = slide.elements.filter((el) => checkTextType(el, type)).length
//       return len === targetLen
//     })
//   }

//   const getAdaptedFontsize = ({
//     text,
//     fontSize,
//     fontFamily,
//     width,
//     maxLine,
//   }: {
//     text: string
//     fontSize: number
//     fontFamily: string
//     width: number
//     maxLine: number
//   }) => {
//     const canvas = document.createElement('canvas')
//     const context = canvas.getContext('2d')
//     if (!context) return fontSize

//     let newFontSize = fontSize
//     const minFontSize = 10

//     while (newFontSize >= minFontSize) {
//       context.font = `${newFontSize}px ${fontFamily}`
//       const textWidth = context.measureText(text).width
//       const line = Math.ceil(textWidth / width)

//       if (line <= maxLine) return newFontSize

//       const step = newFontSize <= 22 ? 1 : 2
//       newFontSize = newFontSize - step
//     }

//     return minFontSize
//   }

//   const getFontInfo = (htmlString: string) => {
//     const fontSizeRegex = /font-size:\s*(\d+(?:\.\d+)?)\s*px/i
//     const fontFamilyRegex = /font-family:\s*['"]?([^'";]+)['"]?\s*(?=;|>|$)/i

//     const defaultInfo = {
//       fontSize: 16,
//       fontFamily: 'Microsoft Yahei',
//     }

//     const fontSizeMatch = htmlString.match(fontSizeRegex)
//     const fontFamilyMatch = htmlString.match(fontFamilyRegex)

//     return {
//       fontSize: fontSizeMatch ? +fontSizeMatch[1].trim() : defaultInfo.fontSize,
//       fontFamily: fontFamilyMatch ? fontFamilyMatch[1].trim() : defaultInfo.fontFamily,
//     }
//   }

//   const getNewTextElement = ({
//     el,
//     text,
//     maxLine,
//     longestText,
//     digitPadding,
//   }: {
//     el: PPTTextElement | PPTShapeElement
//     text: string
//     maxLine: number
//     longestText?: string
//     digitPadding?: boolean
//   }): PPTTextElement | PPTShapeElement => {
//     const padding = 10
//     const width = el.width - padding * 2 - 2

//     let content = el.type === 'text' ? el.content : el.text!.content

//     const fontInfo = getFontInfo(content)
//     const size = getAdaptedFontsize({
//       text: longestText || text,
//       fontSize: fontInfo.fontSize,
//       fontFamily: fontInfo.fontFamily,
//       width,
//       maxLine,
//     })

//     const parser = new DOMParser()
//     const doc = parser.parseFromString(content, 'text/html')

//     const treeWalker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
//     const firstTextNode = treeWalker.nextNode()

//     if (firstTextNode) {
//       if (
//         digitPadding &&
//         firstTextNode.textContent &&
//         firstTextNode.textContent.length === 2 &&
//         text.length === 1
//       ) {
//         firstTextNode.textContent = '0' + text
//       } else {
//         firstTextNode.textContent = text
//       }
//     }

//     if (doc.body.innerHTML.indexOf('font-size') === -1) {
//       const p = doc.querySelector('p')
//       if (p) p.style.fontSize = '16px'
//     }

//     content = doc.body.innerHTML.replace(/font-size:(.+?)px/g, `font-size: ${size}px`)

//     if (el.type === 'text') {
//       return {
//         ...el,
//         content,
//         lineHeight: size < 15 ? 1.2 : el.lineHeight,
//       }
//     }

//     return {
//       ...el,
//       text: {
//         ...el.text!,
//         content,
//       },
//     }
//   }

//   const getUseableImage = (el: PPTImageElement): ImgPoolItem | null => {
//     const pool = imgPoolRef.current
//     if (!pool.length) return null

//     let imgs: ImgPoolItem[] = []

//     if (el.width === el.height) {
//       imgs = pool.filter((img) => img.width === img.height)
//     } else if (el.width > el.height) {
//       imgs = pool.filter((img) => img.width > img.height)
//     } else {
//       imgs = pool.filter((img) => img.width <= img.height)
//     }

//     if (!imgs.length) imgs = pool
//     if (!imgs.length) return null

//     const img = imgs[Math.floor(Math.random() * imgs.length)]
//     imgPoolRef.current = pool.filter((item) => item.id !== img.id)

//     return img
//   }

//   const getNewImgElement = (el: PPTImageElement): PPTImageElement => {
//     const img = getUseableImage(el)
//     if (!img) return el

//     let scale = 1
//     let w = el.width
//     let h = el.height
//     let range: ImageClipDataRange = [
//       [0, 0],
//       [0, 0],
//     ]

//     const radio = el.width / el.height

//     if (img.width / img.height >= radio) {
//       // 图片更宽
//       scale = img.height / el.height
//       w = img.width / scale
//       const diff = ((w - el.width) / 2 / w) * 100
//       range = [
//         [diff, 0],
//         [100 - diff, 100],
//       ]
//     } else {
//       // 图片更高
//       scale = img.width / el.width
//       h = img.height / scale
//       const diff = ((h - el.height) / 2 / h) * 100
//       range = [
//         [0, diff],
//         [100, 100 - diff],
//       ]
//     }

//     const clipShape = el.clip && el.clip.shape ? el.clip.shape : 'rect'

import { message } from 'antd'

const useAIPPT = () => {
  const AIPPT = () => {
    message.info('AIPPT 功能暂未接入')
  }

  const presetImgPool = () => {}

  const getMdContent = (content: string) => content

  return { AIPPT, presetImgPool, getMdContent }
}

export default useAIPPT
