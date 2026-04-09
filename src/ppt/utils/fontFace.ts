import { FONT_FACE_SOURCES, FONT_SERVER_PATH } from '@/ppt/configs/font';

export const buildFontFaceCss = (basePath = FONT_SERVER_PATH) => {
  return FONT_FACE_SOURCES.map((font) => {
    const src = `${basePath.replace(/\/+$/, '')}/${font.file}.woff2`;
    const localSources = (font.localNames || [])
      .filter((name) => name && name.trim())
      .map((name) => `local('${name.replace(/'/g, "\\'")}')`)
      .join(', ');
    const srcParts = [localSources, `url('${src}') format('woff2')`].filter(Boolean).join(', ');
    return `@font-face { font-display: swap; font-family: ${font.family}; src: ${srcParts}; font-weight: ${font.weight}; font-style: normal; }`;
  }).join('\n');
};

export const injectFontFaceStyle = (html: string, styleId: string, basePath = FONT_SERVER_PATH) => {
  if (!html) return html;
  const fontFaceCss = buildFontFaceCss(basePath);
  const injectStyle = `<style data-se-inject="font-face" id="${styleId}">${fontFaceCss}</style>`;

  if (html.includes(`id="${styleId}"`)) return html;
  if (html.includes('</head>')) return html.replace('</head>', injectStyle + '</head>');
  if (html.includes('<head>')) return html.replace('<head>', '<head>' + injectStyle);
  if (html.includes('</body>')) return html.replace('</body>', injectStyle + '</body>');
  if (html.includes('</html>')) return html.replace('</html>', injectStyle + '</html>');
  return injectStyle + html;
};
