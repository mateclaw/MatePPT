// useMouseSelection.ts (React, improved with refs)

import { useMemoizedFn } from 'ahooks'
import { useRef, useState, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useKeyboardStore, useMainStore } from '@/ppt/store'
import type { PPTElement } from '@/ppt/core'
import { getElementRange } from '@/ppt/utils/element'

type SelectionRect = {
  top: number
  left: number
  width: number
  height: number
}

function normalizeSelectionRect(selection: SelectionRect, quadrant: number) {
  // 将“起点(left/top)+宽高+象限”统一还原成真正的 left/top（左上角）
  let rectLeft = selection.left
  let rectTop = selection.top

  if (quadrant === 2) {
    rectLeft = selection.left - selection.width
    rectTop = selection.top - selection.height
  } else if (quadrant === 1) {
    rectLeft = selection.left
    rectTop = selection.top - selection.height
  } else if (quadrant === 3) {
    rectLeft = selection.left - selection.width
    rectTop = selection.top
  }
  return {
    left: rectLeft,
    top: rectTop,
    width: selection.width,
    height: selection.height,
  }
}

export default function useMouseSelection(params: {
  elementList: PPTElement[]
  viewportRef: React.RefObject<HTMLElement | null>
}) {
  const { elementList, viewportRef } = params

  const { canvasScale, hiddenElementIdList, setActiveElementIdList } = useMainStore(
    useShallow((s) => ({
      canvasScale: s.canvasScale,
      hiddenElementIdList: s.hiddenElementIdList,
      setActiveElementIdList: s.setActiveElementIdList,
    })),
  )

  const { ctrlOrShiftKeyActive } = useKeyboardStore(
    useShallow((s) => ({ ctrlOrShiftKeyActive: s.ctrlKeyState || s.shiftKeyState })),
  )

  // ===== 渲染用 state =====
  const [mouseSelectionVisible, setMouseSelectionVisible] = useState(false)
  const [mouseSelectionQuadrant, setMouseSelectionQuadrant] = useState(4)
  const [mouseSelection, setMouseSelection] = useState<SelectionRect>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })

  // ===== 逻辑用 refs（保证 mouseup 时读到最新值）=====
  const isMouseDownRef = useRef(false)
  const selectionRef = useRef<SelectionRect>(mouseSelection)
  const quadrantRef = useRef<number>(mouseSelectionQuadrant)
  const visibleRef = useRef<boolean>(mouseSelectionVisible)

  const setSelectionBoth = useCallback((next: SelectionRect) => {
    selectionRef.current = next
    setMouseSelection(next)
  }, [])

  const setQuadrantBoth = useCallback((q: number) => {
    quadrantRef.current = q
    setMouseSelectionQuadrant(q)
  }, [])

  const setVisibleBoth = useCallback((v: boolean) => {
    visibleRef.current = v
    setMouseSelectionVisible(v)
  }, [])

  const isIncludeByMode = useCallback(
    (args: {
      quadrant: number
      selection: SelectionRect
      elRange: { minX: number; maxX: number; minY: number; maxY: number }
      intersectMode: boolean
    }) => {
      const { quadrant, selection, elRange, intersectMode } = args
      const rect = normalizeSelectionRect(selection, quadrant)

      const rectLeft = rect.left
      const rectTop = rect.top
      const rectRight = rect.left + rect.width
      const rectBottom = rect.top + rect.height

      const { minX, maxX, minY, maxY } = elRange

      if (intersectMode) {
        // 相交
        return maxX > rectLeft && minX < rectRight && maxY > rectTop && minY < rectBottom
      }
      // 包含
      return minX > rectLeft && maxX < rectRight && minY > rectTop && maxY < rectBottom
    },
    [],
  )

  const updateMouseSelection = useMemoizedFn((e: MouseEvent) => {
    const viewportEl = viewportRef.current
    if (!viewportEl) return

    isMouseDownRef.current = true

    const viewportRect = viewportEl.getBoundingClientRect()
    const minSelectionRange = 5

    const startPageX = e.pageX
    const startPageY = e.pageY

    const left = (startPageX - viewportRect.x) / canvasScale
    const top = (startPageY - viewportRect.y) / canvasScale

    // 初始化
    setSelectionBoth({ top, left, width: 0, height: 0 })
    setVisibleBoth(false)
    setQuadrantBoth(4)

    const onMove = (ev: MouseEvent) => {
      if (!isMouseDownRef.current) return

      const currentPageX = ev.pageX
      const currentPageY = ev.pageY

      const offsetWidth = (currentPageX - startPageX) / canvasScale
      const offsetHeight = (currentPageY - startPageY) / canvasScale

      const width = Math.abs(offsetWidth)
      const height = Math.abs(offsetHeight)

      if (width < minSelectionRange || height < minSelectionRange) return

      let quadrant = 0
      if (offsetWidth > 0 && offsetHeight > 0) quadrant = 4
      else if (offsetWidth < 0 && offsetHeight < 0) quadrant = 2
      else if (offsetWidth > 0 && offsetHeight < 0) quadrant = 1
      else if (offsetWidth < 0 && offsetHeight > 0) quadrant = 3

      // 更新（ref + state 同步）
      const nextSelection: SelectionRect = {
        ...selectionRef.current,
        width,
        height,
      }
      setSelectionBoth(nextSelection)
      setVisibleBoth(true)
      setQuadrantBoth(quadrant)
    }

    const onUp = () => {
      isMouseDownRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)

      // ✅ 一定读到最新值
      const selection = selectionRef.current
      const quadrant = quadrantRef.current
      const intersectMode = ctrlOrShiftKeyActive

      // 计算范围内元素
      let inRangeElementList: PPTElement[] = []

      for (let i = 0; i < elementList.length; i++) {
        const element = elementList[i]
        const { minX, maxX, minY, maxY } = getElementRange(element)

        const isInclude = isIncludeByMode({
          quadrant,
          selection,
          elRange: { minX, maxX, minY, maxY },
          intersectMode,
        })

        if (isInclude && !element.lock && !hiddenElementIdList.includes(element.id)) {
          inRangeElementList.push(element)
        }
      }

      // 组合：组内必须全部在范围内才选中
      inRangeElementList = inRangeElementList.filter((it) => {
        if (!it.groupId) return true
        const inRangeIds = inRangeElementList.map((x) => x.id)
        const groupList = elementList.filter((el) => el.groupId === it.groupId)
        return groupList.every((g) => inRangeIds.includes(g.id))
      })

      setActiveElementIdList(inRangeElementList.map((it) => it.id))
      setVisibleBoth(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  })

  // ✅ 给渲染层直接用的“标准化矩形”
  const mouseSelectionRect = normalizeSelectionRect(mouseSelection, mouseSelectionQuadrant)

  return {
    // 原输出
    mouseSelection,
    mouseSelectionVisible,
    mouseSelectionQuadrant,
    updateMouseSelection,

    // 新增：直接给 UI 用的真实矩形（建议你用它渲染框）
    mouseSelectionRect,
  }
}
