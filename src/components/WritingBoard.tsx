import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react'

export type WritingBoardModel = 'pen' | 'mark' | 'eraser' | 'shape'
export type WritingBoardShapeType = 'rect' | 'circle' | 'arrow'

export interface WritingBoardHandle {
  clearCanvas: () => void
  getImageDataURL: () => string
  setImageDataURL: (dataURL: string) => void
}

interface WritingBoardProps {
  color: string
  blackboard: boolean
  model: WritingBoardModel
  penSize: number
  markSize: number
  rubberSize: number
  shapeSize: number
  shapeType: WritingBoardShapeType
  onEnd?: () => void
}

const WritingBoard = forwardRef<WritingBoardHandle, WritingBoardProps>(
  (
    {
      color,
      blackboard,
      model,
      penSize,
      markSize,
      rubberSize,
      shapeSize,
      shapeType,
      onEnd,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const isDrawingRef = useRef(false)
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)
    const startPointRef = useRef<{ x: number; y: number } | null>(null)
    const snapshotRef = useRef<ImageData | null>(null)

    const getContext = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return null
      return canvas.getContext('2d')
    }, [])

    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const { width, height } = canvas.getBoundingClientRect()
      const nextWidth = Math.max(1, Math.round(width))
      const nextHeight = Math.max(1, Math.round(height))
      if (canvas.width === nextWidth && canvas.height === nextHeight) return

      const dataURL = canvas.toDataURL()
      canvas.width = nextWidth
      canvas.height = nextHeight

      if (dataURL && dataURL !== 'data:,') {
        const img = new Image()
        img.onload = () => {
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        img.src = dataURL
      }
    }, [])

    useLayoutEffect(() => {
      resizeCanvas()
    }, [resizeCanvas])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const observer = new ResizeObserver(() => resizeCanvas())
      observer.observe(canvas)
      return () => observer.disconnect()
    }, [resizeCanvas])

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const setupStroke = (ctx: CanvasRenderingContext2D) => {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = color
      ctx.globalAlpha = model === 'mark' ? 0.3 : 1
      ctx.globalCompositeOperation = model === 'eraser' ? 'destination-out' : 'source-over'
      if (model === 'pen') ctx.lineWidth = penSize
      if (model === 'mark') ctx.lineWidth = markSize
      if (model === 'eraser') ctx.lineWidth = rubberSize
      if (model === 'shape') ctx.lineWidth = shapeSize
    }

    const drawLine = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.closePath()
    }

    const drawShape = (
      ctx: CanvasRenderingContext2D,
      start: { x: number; y: number },
      end: { x: number; y: number },
    ) => {
      const width = end.x - start.x
      const height = end.y - start.y
      ctx.beginPath()

      if (shapeType === 'rect') {
        ctx.rect(start.x, start.y, width, height)
      } else if (shapeType === 'circle') {
        const centerX = start.x + width / 2
        const centerY = start.y + height / 2
        ctx.ellipse(centerX, centerY, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2)
      } else if (shapeType === 'arrow') {
        const angle = Math.atan2(height, width)
        const headLength = 12
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6),
        )
        ctx.moveTo(end.x, end.y)
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6),
        )
      }

      ctx.stroke()
      ctx.closePath()
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const ctx = getContext()
      if (!ctx) return
      const point = getPoint(e)
      isDrawingRef.current = true
      lastPointRef.current = point
      startPointRef.current = point
      setupStroke(ctx)

      if (model === 'shape') {
        snapshotRef.current = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
      } else {
        drawLine(ctx, point, point)
      }
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return
      const ctx = getContext()
      if (!ctx) return
      const point = getPoint(e)
      setupStroke(ctx)

      if (model === 'shape') {
        const snapshot = snapshotRef.current
        if (!snapshot || !startPointRef.current) return
        ctx.putImageData(snapshot, 0, 0)
        drawShape(ctx, startPointRef.current, point)
      } else {
        const last = lastPointRef.current || point
        drawLine(ctx, last, point)
        lastPointRef.current = point
      }
    }

    const handlePointerUp = () => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      lastPointRef.current = null
      startPointRef.current = null
      snapshotRef.current = null
      onEnd?.()
    }

    const clearCanvas = useCallback(() => {
      const ctx = getContext()
      if (!ctx) return
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }, [getContext])

    const getImageDataURL = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return ''
      return canvas.toDataURL('image/png')
    }, [])

    const setImageDataURL = useCallback((dataURL: string) => {
      const canvas = canvasRef.current
      if (!canvas || !dataURL) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = dataURL
    }, [])

    useImperativeHandle(ref, () => ({
      clearCanvas,
      getImageDataURL,
      setImageDataURL,
    }))

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: blackboard ? '#1d1d1d' : 'transparent',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
    )
  },
)

WritingBoard.displayName = 'WritingBoard'

export default WritingBoard
