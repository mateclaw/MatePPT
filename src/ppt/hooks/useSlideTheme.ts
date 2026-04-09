import tinycolor from 'tinycolor2'
import { useShallow } from 'zustand/react/shallow'
import { useMemoizedFn } from 'ahooks'
import cloneDeep from 'lodash/cloneDeep'

import type { PPTSlide } from '../core'
// import type { PresetTheme } from '@/ppt/slide-editor/configs/theme'
import { useSlidesStore } from '../store/useSlidesStore'
import useHistorySnapshot from '../hooks/useHistorySnapshot'
import { getLineElementLength } from '../utils/element'
import { resolvePPTColorValue } from '@/ppt/core/utils/pptColor'

interface ThemeValueWithArea {
  area: number
  value: string
}

const useSlideTheme = () => {
  const { slides, theme, setTheme, setSlides } = useSlidesStore(
    useShallow((state) => ({
      slides: state.slides,
      theme: state.theme,
      setTheme: state.setTheme,
      setSlides: state.setSlides,
    })),
  )

  const { addHistorySnapshot } = useHistorySnapshot()

  const getSlidesThemeStyles = useMemoizedFn((slide: PPTSlide | PPTSlide[]) => {
    const slideArr = Array.isArray(slide) ? slide : [slide]

    const backgroundColorValues: ThemeValueWithArea[] = []
    const themeColorValues: ThemeValueWithArea[] = []
    const fontColorValues: ThemeValueWithArea[] = []
    const fontNameValues: ThemeValueWithArea[] = []

    for (const s of slideArr) {
      if (!s) continue
      if (s.background) {
        if (s.background.type === 'solid' && s.background.color) {
          backgroundColorValues.push({ area: 1, value: s.background.color })
        } else if (s.background.type === 'gradient' && s.background.gradient) {
          const len = s.background.gradient.colors.length
          backgroundColorValues.push(
            ...s.background.gradient.colors.map((item) => ({
              area: 1 / len,
              value: item.color,
            })),
          )
        } else {
          backgroundColorValues.push({
            area: 1,
            value: theme?.themeColors?.lt1,
          })
        }
      }

      for (const el of s.elements) {
        const elWidth = el.width
        const elHeight = el.type === 'line' ? getLineElementLength(el) : el.height
        const area = elWidth * elHeight

        if (el.type === 'shape' || el.type === 'text') {
          if (el.fill) {
            themeColorValues.push({ area, value: el.fill })
          }

          if (el.type === 'shape' && el.gradient) {
            const len = el.gradient.colors.length
            themeColorValues.push(
              ...el.gradient.colors.map((item) => ({
                area: (1 / len) * area,
                value: item.color,
              })),
            )
          }

          const text =
            (el.type === 'shape' ? el.text?.content : el.content) || ''
          if (!text) continue

          const plainText = text
            .replace(/<[^>]+>/g, '')
            .replace(/\s*/g, '')

          const matchForColor = text.match(/<[^>]+color: .+?<\/.+?>/g)
          const matchForFont = text.match(/<[^>]+font-family: .+?<\/.+?>/g)

          let defaultColorPercent = 1
          let defaultFontPercent = 1

          if (matchForColor) {
            for (const item of matchForColor) {
              const ret = item.match(/color: (.+?);/)
              if (!ret) continue
              const txt = item
                .replace(/<[^>]+>/g, '')
                .replace(/\s*/g, '')
              const color = ret[1]
              const percentage = txt.length / plainText.length
              defaultColorPercent -= percentage

              fontColorValues.push({
                area: area * percentage,
                value: color,
              })
            }
          }

          if (matchForFont) {
            for (const item of matchForFont) {
              const ret = item.match(/font-family: (.+?);/)
              if (!ret) continue
              const txt = item
                .replace(/<[^>]+>/g, '')
                .replace(/\s*/g, '')
              const font = ret[1]
              const percentage = txt.length / plainText.length
              defaultFontPercent -= percentage

              fontNameValues.push({
                area: area * percentage,
                value: font,
              })
            }
          }

          if (defaultColorPercent) {
            const _defaultColor =
              el.type === 'shape' ? el.text?.fontColor : el.fontColor
            const defaultColor = resolvePPTColorValue(_defaultColor || theme.themeColors?.dk1, theme.themeColors)
            fontColorValues.push({
              area: area * defaultColorPercent,
              value: defaultColor,
            })
          }

          if (defaultFontPercent) {
            const _defaultFont =
              el.type === 'shape' ? el.text?.fontName : el.fontName
            const defaultFont = _defaultFont || theme.fontName
            fontNameValues.push({
              area: area * defaultFontPercent,
              value: defaultFont,
            })
          }
        } else if (el.type === 'table') {
          const cellCount = el.data.length * el.data[0].length
          let cellWithFillCount = 0

          for (const row of el.data) {
            for (const cell of row) {
              if (cell.style?.backColor) {
                cellWithFillCount += 1
                themeColorValues.push({
                  area: area / cellCount,
                  value: cell.style.backColor,
                })
              }
              if (cell.text) {
                const percent = cell.text.length >= 10 ? 1 : cell.text.length / 10
                if (cell.style?.color) {
                  fontColorValues.push({
                    area: (area / cellCount) * percent,
                    value: cell.style.color,
                  })
                }
                if (cell.style?.fontName) {
                  fontNameValues.push({
                    area: (area / cellCount) * percent,
                    value: cell.style.fontName,
                  })
                }
              }
            }
          }

          if (el.theme) {
            const percent = 1 - cellWithFillCount / cellCount
            themeColorValues.push({
              area: area * percent,
              value: el.theme.color,
            })
          }
        } else if (el.type === 'chart') {
          if (el.fill) {
            themeColorValues.push({ area: area * 0.6, value: el.fill })
          }
          if (el.themeColors?.[0]) {
            themeColorValues.push({
              area: area * 0.3,
              value: el.themeColors[0],
            })
          }
          if (el.themeColors) {
            for (const color of el.themeColors) {
              if (tinycolor(color).getAlpha() !== 0) {
                themeColorValues.push({
                  area: (area / el.themeColors.length) * 0.1,
                  value: color,
                })
              }
            }
          }
        } else if (el.type === 'line') {
          themeColorValues.push({ area, value: el.color })
        } else if (el.type === 'audio') {
          themeColorValues.push({ area, value: el.color })
        } else if (el.type === 'math') {
          fontColorValues.push({ area, value: el.color })
        }
      }
    }

    const backgroundColors: Record<string, number> = {}
    for (const item of backgroundColorValues) {
      const color = tinycolor(item.value).toRgbString()
      if (color === 'rgba(0, 0, 0, 0)') continue
      if (!backgroundColors[color]) backgroundColors[color] = item.area
      else backgroundColors[color] += item.area
    }

    const themeColors: Record<string, number> = {}
    for (const item of themeColorValues) {
      const color = tinycolor(item.value).toRgbString()
      if (color === 'rgba(0, 0, 0, 0)') continue
      if (!themeColors[color]) themeColors[color] = item.area
      else themeColors[color] += item.area
    }

    const fontColors: Record<string, number> = {}
    for (const item of fontColorValues) {
      const color = tinycolor(item.value).toRgbString()
      if (color === 'rgba(0, 0, 0, 0)') continue
      if (!fontColors[color]) fontColors[color] = item.area
      else fontColors[color] += item.area
    }

    const fontNames: Record<string, number> = {}
    for (const item of fontNameValues) {
      if (!fontNames[item.value]) fontNames[item.value] = item.area
      else fontNames[item.value] += item.area
    }

    return {
      backgroundColors: Object.keys(backgroundColors).sort(
        (a, b) => backgroundColors[b] - backgroundColors[a],
      ),
      themeColors: Object.keys(themeColors).sort(
        (a, b) => themeColors[b] - themeColors[a],
      ),
      fontColors: Object.keys(fontColors).sort(
        (a, b) => fontColors[b] - fontColors[a],
      ),
      fontNames: Object.keys(fontNames).sort(
        (a, b) => fontNames[b] - fontNames[a],
      ),
    }
  })

  const getSlideAllColors = useMemoizedFn((slide: PPTSlide) => {
    const colorMap: Record<string, number> = {}

    const record = (color: string, area: number) => {
      const _color = tinycolor(color).setAlpha(1).toRgbString()
      if (!colorMap[_color]) colorMap[_color] = area
      else colorMap[_color] += area
    }

    for (const el of slide.elements) {
      const width = el.width
      const height = el.type === 'line' ? getLineElementLength(el) : el.height
      const area = width * height

      if (el.type === 'shape' && tinycolor(el.fill).getAlpha() !== 0) {
        record(el.fill, area)
      }
      if (el.type === 'text' && el.fill && tinycolor(el.fill).getAlpha() !== 0) {
        record(el.fill, area)
      }
      if (el.type === 'image' && el.colorMask && tinycolor(el.colorMask).getAlpha() !== 0) {
        record(el.colorMask, area)
      }
      if (el.type === 'table' && el.theme && tinycolor(el.theme.color).getAlpha() !== 0) {
        record(el.theme.color, area)
      }
      if (el.type === 'chart') {
        for (const color of el.themeColors) {
          if (tinycolor(color).getAlpha() !== 0) {
            record(color, (area / el.themeColors.length) * 0.1)
          }
        }
        if (el.themeColors[0] && tinycolor(el.themeColors[0]).getAlpha() !== 0) {
          record(el.themeColors[0], area * 0.3)
        }
        if (el.fill && tinycolor(el.fill).getAlpha() !== 0) {
          record(el.fill, area * 0.6)
        }
      }
      if (el.type === 'line' && tinycolor(el.color).getAlpha() !== 0) {
        record(el.color, area)
      }
      if (el.type === 'audio' && tinycolor(el.color).getAlpha() !== 0) {
        record(el.color, area)
      }
    }

    const colors = Object.keys(colorMap).sort(
      (a, b) => colorMap[b] - colorMap[a],
    )
    return colors
  })

  const createSlideThemeColorMap = useMemoizedFn(
    (slide: PPTSlide, _newColors: string[]): Record<string, string> => {
      const newColors = [..._newColors]
      const oldColors = getSlideAllColors(slide)
      const themeColorMap: Record<string, string> = {}

      if (oldColors.length > newColors.length) {
        const analogous = tinycolor(newColors[0]).analogous(
          oldColors.length - newColors.length + 10,
        )
        const otherColors = analogous
          .map((item) => item.toHexString())
          .slice(1)
        newColors.push(...otherColors)
      }

      for (let i = 0; i < oldColors.length; i++) {
        themeColorMap[oldColors[i]] = newColors[i]
      }

      return themeColorMap
    },
  )

  // const setSlideTheme = useMemoizedFn((slide: PPTSlide, preset: PresetTheme) => {
  //   const colorMap = createSlideThemeColorMap(slide, preset.colors)

  //   const getColor = (color: string) => {
  //     const alpha = tinycolor(color).getAlpha()
  //     const mapped = colorMap[tinycolor(color).setAlpha(1).toRgbString()]
  //     return mapped ? tinycolor(mapped).setAlpha(alpha).toRgbString() : color
  //   }

  //   if (!slide.background || slide.background.type !== 'image') {
  //     slide.background = {
  //       type: 'solid',
  //       color: preset.background,
  //     }
  //   }

  //   for (const el of slide.elements) {
  //     if (el.type === 'shape') {
  //       if (el.fill) el.fill = getColor(el.fill)
  //       if (el.gradient) delete el.gradient
  //       if (el.text) {
  //         el.text.defaultColor = preset.fontColor
  //         el.text.defaultFontName = preset.fontname
  //         if (el.text.content) {
  //           el.text.content = el.text.content
  //             .replace(/color: .+?;/g, '')
  //             .replace(/font-family: .+?;/g, '')
  //         }
  //       }
  //     }

  //     if (el.type === 'text') {
  //       if (el.fill) el.fill = getColor(el.fill)
  //       el.defaultColor = preset.fontColor
  //       el.defaultFontName = preset.fontname
  //       if (el.content) {
  //         el.content = el.content
  //           .replace(/color: .+?;/g, '')
  //           .replace(/font-family: .+?;/g, '')
  //       }
  //     }

  //     if (el.type === 'image' && el.colorMask) {
  //       el.colorMask = getColor(el.colorMask)
  //     }

  //     if (el.type === 'table') {
  //       if (el.theme) el.theme.color = getColor(el.theme.color)
  //       for (const rowCells of el.data) {
  //         for (const cell of rowCells) {
  //           if (cell.style) {
  //             cell.style.color = preset.fontColor
  //             cell.style.fontName = preset.fontname
  //           }
  //         }
  //       }
  //     }

  //     if (el.type === 'chart') {
  //       el.themeColors = [...preset.colors]
  //       // el.textColor = preset.fontColor
  //     }

  //     if (el.type === 'line') el.color = getColor(el.color)
  //     if (el.type === 'audio') el.color = getColor(el.color)
  //     if (el.type === 'math') el.color = preset.fontColor

  //     if ('outline' in el && el.outline) {
  //       if (preset.outline) el.outline = { ...preset.outline }
  //       if (preset.borderColor) el.outline.color = preset.borderColor
  //     }
  //     if ('shadow' in el && el.shadow && preset.shadow) {
  //       el.shadow = preset.shadow
  //     }
  //   }
  // })

  // const applyPresetTheme = useMemoizedFn((preset: PresetTheme, resetSlides = false) => {
  //   setTheme({
  //     backgroundColor: preset.background,
  //     themeColors: preset.colors,
  //     fontColor: preset.fontColor,
  //     outline: {
  //       width: 2,
  //       style: 'solid',
  //       color: preset.borderColor,
  //     },
  //     fontName: preset.fontname,
  //   })

  //   if (resetSlides) {
  //     const newSlides: PPTSlide[] = cloneDeep(slides)
  //     for (const slide of newSlides) {
  //       setSlideTheme(slide, preset)
  //     }
  //     setSlides(newSlides)
  //     addHistorySnapshot()
  //   }
  // })

  // const applyThemeToAllSlides = useMemoizedFn((applyAll = false) => {
  //   const newSlides: PPTSlide[] = cloneDeep(slides)

  //   const preset: PresetTheme = {
  //     background: theme.backgroundColor,
  //     fontColor: theme.fontColor,
  //     borderColor: applyAll ? theme.outline?.color : undefined,
  //     fontname: theme.fontName,
  //     colors: theme.themeColors,
  //     outline: applyAll ? theme.outline : undefined,
  //     shadow: applyAll ? theme.shadow : undefined,
  //   }

  //   for (const slide of newSlides) {
  //     setSlideTheme(slide, preset)
  //   }

  //   setSlides(newSlides)
  //   addHistorySnapshot()
  // })

  return {
    // getSlidesThemeStyles,
    // applyPresetTheme,
    // applyThemeToAllSlides,
  }
}

export default useSlideTheme
