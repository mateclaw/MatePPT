// useTextFormatPainter.ts
import { useMemoizedFn } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'
import { useMainStore } from '../store/useMainStore'

/**
 * 文本格式刷 Hook
 * 对应原来的：
 *  - richTextAttrs
 *  - textFormatPainter
 *  - toggleTextFormatPainter
 */
const useTextFormatPainter = () => {
  const {
    richTextAttrs,
    textFormatPainter,
    setTextFormatPainter,
  } = useMainStore(
    useShallow((state) => ({
      richTextAttrs: state.richTextAttrs,
      textFormatPainter: state.textFormatPainter,
      setTextFormatPainter: state.setTextFormatPainter,
    })),
  )

  /**
   * 切换文本格式刷：
   *  - 已开启 -> 关闭（设为 null）
   *  - 未开启 -> 从当前 richTextAttrs 读取样式，开启格式刷
   */
  const toggleTextFormatPainter = useMemoizedFn((keep = false) => {
    // 已经有格式刷，直接关闭
    if (textFormatPainter) {
      setTextFormatPainter(null)
      return
    }

    // 没有格式刷时，如果当前没有富文本属性，就不开启
    if (!richTextAttrs) return

    setTextFormatPainter({
      keep,
      bold: richTextAttrs.bold,
      em: richTextAttrs.em,
      underline: richTextAttrs.underline,
      strikethrough: richTextAttrs.strikethrough,
      color: richTextAttrs.color,
      backcolor: richTextAttrs.backcolor,
      fontname: richTextAttrs.fontname,
      fontsize: richTextAttrs.fontsize,
      align: richTextAttrs.align as 'left' | 'center' | 'right',
    })
  })

  return {
    toggleTextFormatPainter,
  }
}

export default useTextFormatPainter
