declare module 'hfmath' {
  export interface HfmathBox {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  export interface HfmathOptions {
    [key: string]: unknown;
  }

  export class hfmath {
    constructor(latex: string);
    pathd(options?: HfmathOptions): string;
    box(options?: HfmathOptions): HfmathBox;
    svg(options?: HfmathOptions): string;
  }

  export const CONFIG: {
    SUB_SUP_SCALE: number;
    [key: string]: unknown;
  };
}
