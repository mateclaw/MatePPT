/**
 * PPT图片URL处理工具
 * 统一处理来自Minio的图片资源
 */
import { MinIOService } from './minIO';

/**
 * 获取图片的可访问URL
 * 如果是Minio路径，通过MinIO服务获取完整URL
 * 如果已是完整HTTP URL，直接返回
 * 
 * @param imagePath - 图片路径 (可能是相对路径或HTTP URL)
 * @param minioService - MinIO服务实例 (可选，不传则无法处理Minio路径)
 * @returns 完整的可访问URL或原路径
 */
export const getImageUrl = (imagePath: string | undefined, minioService?: MinIOService): string => {
  if (!imagePath) return '';
  
  // 如果已是HTTP/HTTPS URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 如果有MinIO服务实例，使用其获取完整URL
  if (minioService) {
    return minioService.getFileUrl(imagePath);
  }
  
  // 降级处理：返回原路径
  return imagePath;
};

/**
 * 异步获取图片URL (推荐用于需要初始化MinIO服务的场景)
 * 
 * @param imagePath - 图片路径
 * @param getMinioService - 获取MinIO服务的函数
 * @returns Promise<完整URL>
 */
export const getImageUrlAsync = async (
  imagePath: string | undefined,
  getMinioService?: () => Promise<MinIOService>
): Promise<string> => {
  if (!imagePath) return '';
  
  // 如果已是HTTP/HTTPS URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 获取MinIO服务并获取完整URL
  if (getMinioService) {
    try {
      const minioService = await getMinioService();
      return minioService.getFileUrl(imagePath);
    } catch (error) {
      console.error('Failed to get MinIO service:', error);
      return imagePath;
    }
  }
  
  return imagePath;
};

/**
 * 批量处理多个图片URL
 * 用于处理包含多个图片字段的对象
 * 
 * @param data - 包含图片路径的对象
 * @param imageFields - 图片字段名数组
 * @param minioService - MinIO服务实例
 * @returns 处理后的对象
 */
export const processImageUrls = <T extends Record<string, any>>(
  data: T,
  imageFields: (keyof T)[],
  minioService?: MinIOService
): T => {
  const result = { ...data } as any;
  
  imageFields.forEach(field => {
    if (result[field]) {
      result[field] = getImageUrl(result[field] as string, minioService);
    }
  });
  
  return result as T;
};
