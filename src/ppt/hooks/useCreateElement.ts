/**
 * 创建（插入）各种元素 Hook (React + Zustand + ahooks)
 */

import { nanoid } from 'nanoid'
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'

import { useMainStore } from '../store/useMainStore'
import { useSlidesStore } from '../store/useSlidesStore'

import { getImageSize } from '../utils/image'
import {
  type LineElement,
  type PPTElement,
  type TableCell,
  type TableCellStyle,
  type ShapeElement,
  type ChartType,
  PPTElementType,
  ChartElement,
  ImageElement,
  TextElement,
  ShapeElement as ShapeElementClass,
  LineElement as LineElementClass,
  TableElement,
  MathElement,
  VideoElement,
  AudioElement,
} from '../core'
import { PPTColor } from '@/ppt/core/entity/presentation/PPTColor'
import { normalizePPTColor } from '@/ppt/core/utils/pptColor'
import { type ShapePoolItem, SHAPE_PATH_FORMULAS } from '../configs/shapes'
import type { LinePoolItem } from '../configs/lines'
import { CHART_DEFAULT_DATA } from '../configs/chart'
import useHistorySnapshot from '../hooks/useHistorySnapshot'
import { usePptProjectStore } from '@/stores/pptProjectStore'
import type { PPTSlide } from '@/ppt/core'

interface CommonElementPosition {
  top: number
  left: number
  width: number
  height: number
}

interface LineElementPosition {
  top: number
  left: number
  start: [number, number]
  end: [number, number]
}

interface CreateTextData {
  content?: string
  vertical?: boolean
}

const useCreateElement = () => {
  const {
    creatingElement,
    setActiveElementIdList,
    setCreatingElement,
    setEditorAreaFocus,
  } = useMainStore(
    useShallow((state) => ({
      creatingElement: state.creatingElement,
      setActiveElementIdList: state.setActiveElementIdList,
      setCreatingElement: state.setCreatingElement,
      setEditorAreaFocus: state.setEditorAreaFocus,
    })),
  )

  const { theme, viewportRatio, viewportSize, addElement } = useSlidesStore(
    useShallow((state) => ({
      theme: state.theme,
      viewportRatio: state.viewportRatio,
      viewportSize: state.viewportSize,
      addElement: state.addElement,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()

  const autoSaveCurrentSlide = useMemoizedFn(async () => {
    const { projectId, saveClassicSlidesToBackend } = usePptProjectStore.getState()
    if (!projectId) return
    const slidesStore = useSlidesStore.getState()
    const currentSlide = slidesStore.getCurrentSlide()
    if (!currentSlide) return

    try {
      await saveClassicSlidesToBackend(projectId, [currentSlide])
      const nextSlides = slidesStore.slides.map((slide) =>
        slide.id === currentSlide.id ? ({ ...slide, dirty: false } as PPTSlide) : slide
      )
      slidesStore.setSlides(nextSlides)
    } catch (error) {
      console.error('[classic] auto save media slide failed:', error)
    }
  })

  const resolveThemeColorList = (colors: unknown): string[] => {
    if (Array.isArray(colors)) {
      return colors.filter((item) => typeof item === 'string' && item)
    }
    if (colors && typeof colors === 'object') {
      const themeColors = colors as Record<string, unknown>
      return [
        themeColors.accent1,
        themeColors.accent2,
        themeColors.accent3,
        themeColors.accent4,
        themeColors.accent5,
        themeColors.accent6,
      ].filter((item) => typeof item === 'string' && item) as string[]
    }
    return []
  }

  const resolvePrimaryColor = (colors: unknown) => {
    const list = resolveThemeColorList(colors)
    if (list.length) return list[0]
    if (colors && typeof colors === 'object') {
      const themeColors = colors as Record<string, unknown>
      if (typeof themeColors.dk1 === 'string' && themeColors.dk1) return themeColors.dk1
    }
    return '#5b9bd5'
  }

  /**
   * 创建（插入）一个元素并将其设置为被选中元素
   */
  const createElement = useMemoizedFn(
    (element: PPTElement, callback?: () => void) => {
      addElement(element)
      setActiveElementIdList([element.id])

      if (creatingElement) {
        setCreatingElement(null)
      }

      setTimeout(() => {
        setEditorAreaFocus(true)
      }, 0)

      if (callback) callback()

      addHistorySnapshot()
    },
  )

  /**
   * 创建图片元素
   * @param src 图片地址
   */
  const createImageElement = useMemoizedFn((src: string) => {
    getImageSize(src).then(({ width: rawW, height: rawH }) => {
      let width = rawW
      let height = rawH

      const scale = height / width

      if (scale < viewportRatio && width > viewportSize) {
        width = viewportSize
        height = width * scale
      } else if (height > viewportSize * viewportRatio) {
        height = viewportSize * viewportRatio
        width = height / scale
      }

      createElement({
        type: 'image',
        id: nanoid(10),
        src,
        width: width,
        height: height,
        left: (viewportSize - width) / 2,
        top: (viewportSize * viewportRatio - height) / 2,
        fixedRatio: true,
        rotate: 0,
  
      } as PPTElement)
      autoSaveCurrentSlide()
    })
  })

  /**
   * 创建图表元素
   * @param type 图表类型
   */
  const createChartElement = useMemoizedFn((type: ChartType) => {
    let themeColors = resolveThemeColorList(theme.themeColors)
    if(!themeColors.length){
      themeColors = []
    }
    const chartThemeColors = themeColors.map((color) => PPTColor.ofFixed(color))
    const chartElement = new ChartElement({
      id: nanoid(10),
      chartType: type,
      left: 300,
      top: 81.25,
      width: 400,
      height: 400,
      rotate: 0,
      themeColors: chartThemeColors,
      // textColor: theme.fontColor,
      data: CHART_DEFAULT_DATA[type],
      type: PPTElementType.CHART,
    })
    createElement(chartElement)
  })

  /**
   * 创建表格元素
   * @param row 行数
   * @param col 列数
   */
  const createTableElement = useMemoizedFn((row: number, col: number) => {
    const style: TableCellStyle = {
      fontName: theme.fontName,
      color: normalizePPTColor(theme.themeColors?.dk1),
    }

    const data: TableCell[][] = []
    for (let i = 0; i < row; i++) {
      const rowCells: TableCell[] = []
      for (let j = 0; j < col; j++) {
        rowCells.push({
          id: nanoid(10),
          colspan: 1,
          rowspan: 1,
          text: '',
          style,
        })
      }
      data.push(rowCells)
    }

    const DEFAULT_CELL_WIDTH = 100
    const DEFAULT_CELL_HEIGHT = 36

    const colWidths: number[] = new Array(col).fill(1 / col)

    const width = col * DEFAULT_CELL_WIDTH
    const height = row * DEFAULT_CELL_HEIGHT

    const tableElement = new TableElement({
      id: nanoid(10),
      width: width,
      height: height,
      colWidths,
      rotate: 0,
      data,
      left: (viewportSize - width) / 2,
      top: (viewportSize * viewportRatio - height) / 2,
      cellMinHeight: 36,
      type: PPTElementType.TABLE,
      outline: { color: PPTColor.ofFixed(theme.themeColors?.dk1 || '#000000'), width: 2, style: 'solid' },
    })
    createElement(tableElement)
  })

  /**
   * 创建文本元素
   * @param position 位置大小信息
   * @param data 文本额外配置
   */
  const createTextElement = useMemoizedFn(
    (position: CommonElementPosition, data?: CreateTextData) => {
      const { left, top, width, height } = position
      const content = data?.content || ''
      const vertical = data?.vertical || false

      const id = nanoid(10)

      const normalizedFontColor = normalizePPTColor(theme.themeColors?.dk1)
      createElement(
        {
          type: 'text',
          id,
          left: left,
          top: top,
          width: width,
          height: height,
          content,
          rotate: 0,
          fontName: theme.fontName,
          color: normalizedFontColor,
          fontSize: 16,
          fontColor: normalizedFontColor,
          vertical,
        } as TextElement,
        () => {
          setTimeout(() => {
            const editorRef: HTMLElement | null = document.querySelector(
              `#editable-element-${id} .ProseMirror`,
            )
            if (editorRef) editorRef.focus()
          }, 0)
        },
      )
    },
  )

  /**
   * 创建形状元素
   * @param position 位置大小信息
   * @param data 形状路径信息
   * @param supplement 额外补充属性
   */
  const createShapeElement = useMemoizedFn(
    (
      position: CommonElementPosition,
      data: ShapePoolItem,
      supplement: Partial<ShapeElement> = {},
    ) => {
      const { left, top, width, height } = position
      const outlineColor = theme.themeColors?.dk1 || ''
      const newElement: Partial<ShapeElement> = {
        id: nanoid(10),
        left: left,
        top: top,
        width: width,
        height: height,
        viewBox: data.viewBox,
        path: data.path,
        // fill: 'transparent',
        fixedRatio: false,
        rotate: 0,
        type: PPTElementType.SHAPE,
        ...supplement,
      }

      newElement.outline = { color: PPTColor.ofFixed(outlineColor || '#000000'), width: 2, style: 'solid' }

      newElement.text = { content: '', }

      

      if (data.pathFormula) {
        newElement.pathFormula = data.pathFormula
        newElement.viewBox = [width, height]

        const pathFormula = SHAPE_PATH_FORMULAS[data.pathFormula]
        if ('editable' in pathFormula && pathFormula.editable) {
          newElement.path = pathFormula.formula(
            width,
            height,
            pathFormula.defaultValue!,
          )
          newElement.keypoints = pathFormula.defaultValue
        } else {
          newElement.path = pathFormula.formula(width, height)
        }
      }

      createElement(newElement as PPTElement)
    },
  )

  /**
   * 创建线条元素
   * @param position 位置大小信息
   * @param data 线条的路径和样式
   */
  const createLineElement = useMemoizedFn(
    (position: LineElementPosition, data: LinePoolItem) => {
      const { left, top, start, end } = position
      const primaryColor = resolvePrimaryColor(theme.themeColors)

      const newElement: Partial<LineElement> = {
        id: nanoid(10),
        left: left,
        top: top,
        start,
        end,
        points: data.points,
        color: PPTColor.ofFixed(primaryColor),
        style: data.style,
        width: 2,
        type: PPTElementType.LINE,
      }

      const mid: [number, number] = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
      ]

      if (data.isBroken) newElement.broken = mid
      if (data.isBroken2) newElement.broken2 = mid
      if (data.isCurve) newElement.curve = mid
      if (data.isCubic) newElement.cubic = [mid, mid]

      createElement(newElement as PPTElement)
    },
  )

  /**
   * 创建 LaTeX 元素
   * @param data 包含 SVG 路径和 latex 文本
   */
  const createLatexElement = useMemoizedFn(
    (data: { path?: string; latex: string; w: number; h: number; mathML?: string; viewBox?: [number, number] }) => {
      const mathElement = new MathElement({
        id: nanoid(10),
        width: data.w,
        height: data.h,
        rotate: 0,
        left: (viewportSize - data.w) / 2,
        top: (viewportSize * viewportRatio - data.h) / 2,
        path: data.path,
        latex: data.latex,
        mathML: data.mathML,
        color: normalizePPTColor(theme.themeColors?.dk1),
        strokeWidth: 2,
        viewBox: data.viewBox || [data.w, data.h],
        fixedRatio: true,
        type: PPTElementType.MATH,
      })
      createElement(mathElement)
    },
  )

  /**
   * 创建视频元素
   * @param src 视频地址
   */
  const createVideoElement = useMemoizedFn((src: string) => {
    const w = 500
    const h = 300

    const videoElement = new VideoElement({
      id: nanoid(10),
      width: w,
      height: h,
      rotate: 0,
      left: (viewportSize - w) / 2,
      top: (viewportSize * viewportRatio - h) / 2,
      src,
      autoplay: false,
      type: PPTElementType.VIDEO,
    })
    createElement(videoElement)
    autoSaveCurrentSlide()
  })

  /**
   * 创建音频元素
   * @param src 音频地址
   */
  const createAudioElement = useMemoizedFn((src: string) => {
    const primaryColor = resolvePrimaryColor(theme.themeColors)
    const size = 50

    const audioElement = new AudioElement({
      id: nanoid(10),
      width: size,
      height: size,
      rotate: 0,
      left: (viewportSize - size) / 2,
      top: (viewportSize * viewportRatio - size) / 2,
      loop: false,
      autoplay: false,
      fixedRatio: true,
      color: PPTColor.ofFixed(primaryColor),
      src,
      type: PPTElementType.AUDIO,
    })
    createElement(audioElement)
    autoSaveCurrentSlide()
  })

  return {
    createImageElement,
    createChartElement,
    createTableElement,
    createTextElement,
    createShapeElement,
    createLineElement,
    createLatexElement,
    createVideoElement,
    createAudioElement,
  }
}

export default useCreateElement
