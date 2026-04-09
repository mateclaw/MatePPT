import { FileMimeType } from '@/constants/common';
// import fileManagerService from '@/services/file-manager-service';
import { UploadFile } from 'antd';

export const transformFile2Base64 = (val: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(val);
    reader.onload = (): void => {
      // Create image object
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate compressed dimensions, set max width/height to 800px
        let width = img.width;
        let height = img.height;
        const maxSize = 100;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64, maintain original format and transparency
        const compressedBase64 = canvas.toDataURL('image/png');
        resolve(compressedBase64);
      };

      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const transformBase64ToFile = (
  dataUrl: string,
  filename: string = 'file',
) => {
  let arr = dataUrl.split(','),
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  const mime = arr[0].match(/:(.*?);/);
  const mimeType = mime ? mime[1] : 'image/png';

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
};

export const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export const getUploadFileListFromBase64 = (avatar: string) => {
  let fileList: UploadFile[] = [];

  if (avatar) {
    fileList = [{ uid: '1', name: 'file', thumbUrl: avatar, status: 'done' }];
  }

  return fileList;
};

export const getBase64FromUploadFileList = async (fileList?: UploadFile[]) => {
  if (Array.isArray(fileList) && fileList.length > 0) {
    const file = fileList[0];
    const originFileObj = file.originFileObj;
    if (originFileObj) {
      const base64 = await transformFile2Base64(originFileObj);
      return base64;
    } else {
      return file.thumbUrl;
    }
    // return fileList[0].thumbUrl; TODO: Even JPG files will be converted to base64 parameters in png format
  }

  return '';
};

export const downloadFileFromBlob = (blob: Blob, name?: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  if (name) {
    a.download = name;
  }
  a.click();
  window.URL.revokeObjectURL(url);
};

// export const downloadDocument = async ({
//   id,
//   filename,
// }: {
//   id: string;
//   filename?: string;
// }) => {
//   const response = await fileManagerService.getDocumentFile({}, id);
//   const blob = new Blob([response.data], { type: response.data.type });
//   downloadFileFromBlob(blob, filename);
// };

const Units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export const formatBytes = (x: string | number) => {
  let l = 0,
    n = (typeof x === 'string' ? parseInt(x, 10) : x) || 0;

  while (n >= 1024 && ++l) {
    n = n / 1024;
  }

  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + Units[l];
};

export const downloadJsonFile = async (
  data: Record<string, any>,
  fileName: string,
) => {
  const blob = new Blob([JSON.stringify(data)], { type: FileMimeType.Json });
  downloadFileFromBlob(blob, fileName);
};


// 定义支持的单位类型及其对应的字节换算基数
export const UNIT_MAP = {
  'B': 1,
  'KB': 1024,
  'MB': 1024 ** 2,
  'GB': 1024 ** 3,
  'TB': 1024 ** 4,
  'PB': 1024 ** 5,
};
export type UNIT_TYPE = keyof typeof UNIT_MAP;

// 类型守卫验证
const isValidUnit = (unit: string): boolean => {
  return unit in UNIT_MAP;
};

/**
 * 将文件大小转换为字节单位
 * @param input 数字或带单位的字符串（如 1024 或 "2MB"）
 * @returns 转换后的字节数
 * @throws 当输入格式无效时抛出错误
 */
export const convertToBytes = (input: string | number): number => {
  // 处理数字类型输入
  if (typeof input === 'number') {
    if (Number.isNaN(input) || input < 0) {
      throw new Error('无效的数字输入');
    }
    return input;
  }

  // 处理字符串类型输入
  const trimmedInput = input.trim().toUpperCase();

  // 使用正则表达式解析数值和单位
  let match = trimmedInput.match(/^(\d+\.?\d*)\s*([KMGT]?B)?$/i);

  if (!match) {
    // trimmedInput.concat('B');
    match = (trimmedInput+'B').match(/^(\d+\.?\d*)\s*([KMGT]?B)?$/i);
    if (!match) {
      throw new Error(`无效的输入格式: "${input}"`);
    }
  }


  const [, valueStr, unit = 'B'] = match;
  const numericValue = parseFloat(valueStr);
  const normalizedUnit = unit.toUpperCase();

  // 验证单位有效性
  if (!isValidUnit(normalizedUnit)) {
    throw new Error(`不支持的单位: "${unit}"`);
  }

  // 计算最终结果
  return numericValue * UNIT_MAP[normalizedUnit];
};

// 扩展方法：转换为指定单位
export const convertFileSize = (
  input: string | number,
  targetUnit: keyof typeof UNIT_MAP = 'B'
): string => {
  const bytes = convertToBytes(input);

  if (!isValidUnit(targetUnit)) {
    throw new Error(`不支持的目标单位: "${targetUnit}"`);
  }

  const value = bytes / UNIT_MAP[targetUnit];
  return `${value.toFixed(2)} ${targetUnit}`;
};

// 转换为自动适配的最佳单位
export function autoConvert(input: string | number): string {
  if(!input){
    return '';
  }
  const bytes = convertToBytes(input);
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const targetUnit = units[Math.min(unitIndex, units.length - 1)] as keyof typeof UNIT_MAP;
  return convertFileSize(bytes, targetUnit);
}

