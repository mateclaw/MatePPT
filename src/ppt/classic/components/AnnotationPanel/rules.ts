import type { PPTElement } from '@/ppt/core';

// import type { Slide, SlideType } from '@/types/slides';

/**
 * 标注模式业务规则
 *
 * 规则概述:
 * R1: 只有文本类型元素可以标注文本类型
 * R2: 只有图片类型元素可以标注图片内容
 * R3: 不同类型元素不能分到同一组
 * R4: 相同类型元素可以分到同一组
 * R5: 文本类型元素如果已有文本类型标注,必须取消后才能分组
 * R6: 图片元素如果已有图片内容标注,必须取消后才能分组
 * R7: 创建分组时,同类型未标注元素自动加入
 */

/**
 * 检查是否可以标注文本类型
 * 支持已分组的单个元素
 */
export function canAnnotateTextType(element: PPTElement): boolean {
  return element.type === 'text' || element.type === 'shape';
}

/**
 * R2: 检查是否可以标注图片内容
 */
export function canAnnotateImageContent(element: PPTElement): boolean {
  return element.type === 'image';
}

/**
 * R3 & R4: 检查多个元素是否可以分到同一组
 */
export function canGroupElements(elements: PPTElement[]): {
  canGroup: boolean;
  reason?: string;
} {
  if (elements.length !== 2) {
    return { canGroup: false, reason: '只能选择2个元素进行组合' };
  }

  // const selectedLabelTypes = elements
  //   .map((el) => String((el as any).labelType || '').trim())
  //   .filter(Boolean);

  // if (selectedLabelTypes.length !== 2) {
  //   return { canGroup: false, reason: '组合前请先将两个元素分别标注为 itemTitle 与 item' };
  // }

  // const hasItemTitle = selectedLabelTypes.includes('itemTitle');
  // const hasItem = selectedLabelTypes.includes('item');
  // if (!hasItemTitle || !hasItem) {
  //   return { canGroup: false, reason: '仅支持 itemTitle 与 item 组合' };
  // }

  return { canGroup: true };
}

/**
 * R7: 获取可以自动加入分组的元素
 * @param slideElements 幻灯片的所有元素
 * @param groupType 分组类型 (元素类型)
 * @returns 未标注的同类型元素列表
 */
export function getAutoGroupableElements(
  slideElements: PPTElement[],
  groupType: string
): PPTElement[] {
  return slideElements.filter(el =>
    el.type === groupType 
  );
}

/**
 * 检查是否可以标注幻灯片类型
 */
export function canAnnotateSlideType(slide: any): boolean {
  // 任何幻灯片都可以标注类型
  return true;
}




/**
 * 获取标注警告信息
 */
export function getAnnotationWarning(elements: PPTElement[]): string | null {
  if (elements.length === 0) {
    return null;
  }

  const { canGroup, reason } = canGroupElements(elements);
  if (!canGroup && elements.length >= 2) {
    return reason || null;
  }

  // 单个元素：允许标注，无需显示警告
  // （即使该元素已分组，仍然可以对其进行文本/图片标注）
  const firstType = elements[0].type;
  if (elements.length === 1) {
    return null; // 单个元素始终允许标注
  }

  return null;
}


/**
 * 生成唯一的分组ID
 */
export function generateGroupId(): string {
  return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}


/**
 * 检查是否可以取消元素的文本类型标注
 * 单个茅部程不粻止创作已分组元素的标注（只是取消不了分组）
 */
export function canCancelTextTypeAnnotation(element: PPTElement): boolean {
  // 支持已分组的元素进行文本标注修改
  // 不昡止已分组的元素进行标注修改
  // 稍不能删除文本标注，但可以修改其值
  return true; // 允许修改，但取消需要先取消分组
}

/**
 * 检查是否可以取消元素的图片标注
 * 单个茅部程不粻止创作已分组元素的标注（只是取消不了分组）
 */
export function canCancelImageAnnotation(element: PPTElement): boolean {
  // 支持已分组的元素进行图片标注修改
  // 不昡止已分组的元素进行标注修改
  // 稍不能删除图片标注，但可以修改其值
  return true; // 允许修改，但取消需要先取消分组
}

