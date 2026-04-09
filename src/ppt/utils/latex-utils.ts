import { hfmath, CONFIG as hfmathConfig } from 'hfmath';

// Align superscript/subscript scaling with existing Vue implementation
hfmathConfig.SUB_SUP_SCALE = 0.5;

const LATEX_PADDING = 32;

export interface LatexMeasure {
  path: string;
  svg: string;
  width: number;
  height: number;
  viewBox: [number, number];
}

export function measureLatex(latex: string): LatexMeasure | null {
  const normalized = latex
    .replace(/\\\[/g, '')
    .replace(/\\\]/g, '')
    .replace(/\$/g, '')
    .trim()
  if (!normalized) {
    return null;
  }

  try {
    const equation = new hfmath(normalized);
    const path = equation.pathd({});
    const box = equation.box({}) ?? { w: 0, h: 0 };
    const width = (box.w || 0) + LATEX_PADDING;
    const height = (box.h || 0) + LATEX_PADDING;
    const svg = equation.svg({});

    return {
      path,
      svg,
      width,
      height,
      viewBox: [width, height],
    };
  } catch (error) {
    console.error('Failed to measure latex:', error);
    return null;
  }
}

export { LATEX_PADDING };
