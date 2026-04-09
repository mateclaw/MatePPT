
export const ElementTextType = {
    NONE: '',
    TITLE: 'title',
    SUBTITLE: 'subtitle',
    PART_NUMBER: 'partNumber',
    ITEM_TITLE: 'itemTitle',
    ITEM: 'item'
} as const;

export type ElementTextType = (typeof ElementTextType)[keyof typeof ElementTextType];

export const textTypeOptions = [
  { value: ElementTextType.NONE, label: '未标记类型' },
  { value: ElementTextType.TITLE, label: '标题 (title)', hotkey:1 },
  { value: ElementTextType.SUBTITLE, label: '副标题 (subtitle)' },
  { value: ElementTextType.PART_NUMBER, label: '节编号 (partNumber)',  },
  { value: ElementTextType.ITEM_TITLE, label: '列表项标题 (itemTitle)', hotkey:2 },
  { value: ElementTextType.ITEM, label: '列表项 (item)',hotkey:3 }
];

export const DEFAULT_ANNOTATION_COLOR = '#1677FF';

export const annotationTypeColorMap: Record<string, string> = {
  [ElementTextType.TITLE]: '#E11D48',
  [ElementTextType.SUBTITLE]: '#F97316',
  [ElementTextType.PART_NUMBER]: '#A16207',
  [ElementTextType.ITEM_TITLE]: '#0891B2',
  [ElementTextType.ITEM]: '#2563EB',
};

export const annotationFallbackColors = ['#7C3AED', '#C026D3', '#0D9488', '#4F46E5', '#BE123C', '#0369A1'];

export const resolveAnnotationColor = (typeKey: string): string => {
  if (!typeKey) return DEFAULT_ANNOTATION_COLOR;
  if (annotationTypeColorMap[typeKey]) return annotationTypeColorMap[typeKey];

  let hash = 0;
  for (let i = 0; i < typeKey.length; i += 1) {
    hash = (hash * 31 + typeKey.charCodeAt(i)) | 0;
  }
  return annotationFallbackColors[Math.abs(hash) % annotationFallbackColors.length];
};

