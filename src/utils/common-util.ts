// import { IFactory } from '@/interfaces/database/llm';
import isObject from 'lodash/isObject';
import snakeCase from 'lodash/snakeCase';

export const isFormData = (data: unknown): data is FormData => {
  return data instanceof FormData;
};

const excludedFields = ['img2txt_id'];

const isExcludedField = (key: string) => {
  return excludedFields.includes(key);
};

export const convertTheKeysOfTheObjectToSnake = (data: unknown) => {
  if (isObject(data) && !isFormData(data)) {
    return Object.keys(data).reduce<Record<string, any>>((pre, cur) => {
      const value = (data as Record<string, any>)[cur];
      pre[isFormData(value) || isExcludedField(cur) ? cur : snakeCase(cur)] =
        value;
      return pre;
    }, {});
  }
  return data;
};

export const getSearchValue = (key: string) => {
  const params = new URL(document.location as any).searchParams;
  return params.get(key);
};

// Formatize numbers, add thousands of separators
export const formatNumberWithThousandsSeparator = (numberStr: string) => {
  const formattedNumber = numberStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return formattedNumber;
};

const orderFactoryList = [
  'OpenAI',
  'Moonshot',
  'ZHIPU-AI',
  'Ollama',
  'Xinference',
];



export const filterOptionsByInput = (
  input: string,
  option: { label: string; value: string } | undefined,
) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

export const toFixed = (value: unknown, fixed = 2) => {
  if (typeof value === 'number') {
    return value.toFixed(fixed);
  }
  return value;
};

export const stringToUint8Array = (str: string) => {
  // const byteString = str.replace(/b'|'/g, '');
  const byteString = str.slice(2, -1);

  const uint8Array = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return uint8Array;
};

export const hexStringToUint8Array = (hex: string) => {
  const arr = hex.match(/[\da-f]{2}/gi);
  if (Array.isArray(arr)) {
    return new Uint8Array(
      arr.map(function (h) {
        return parseInt(h, 16);
      }),
    );
  }
};

export function hexToArrayBuffer(input: string) {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input.length % 2 !== 0) {
    throw new RangeError('Expected string to be an even number of characters');
  }

  const view = new Uint8Array(input.length / 2);

  for (let i = 0; i < input.length; i += 2) {
    view[i / 2] = parseInt(input.substring(i, i + 2), 16);
  }

  return view.buffer;
}


export interface TreeOptions<T> {
  rootParentId?: number | string | null;
  idKey?: string;
  parentIdKey?: string;
  childrenKey?: string;
  sortKey?: keyof T;                  // 新增：排序字段
  sortOrder?: 'asc' | 'desc';         // 新增：排序方向
  compareFn?: (a: T, b: T) => number; // 新增：自定义排序函数
}

export function listToTree<T extends Record<string, any>>(
  list: T[],
  options: TreeOptions<T> = {}
): (T & { [key: string]: any })[] {
  const {
    rootParentId = null,
    idKey = 'id',
    parentIdKey = 'parentId',
    childrenKey = 'children',
    sortKey,
    sortOrder = 'asc',
    compareFn
  } = options;

  const nodeMap = new Map<string | number, any>();
  const tree: any[] = [];

  // 创建节点映射
  for (const node of list) {
    const nodeId = node[idKey];
    nodeMap.set(nodeId, { ...node, [childrenKey]: [] });
  }

  // 构建树结构
  for (const node of list) {
    const parentId = node[parentIdKey];
    const currentNode = nodeMap.get(node[idKey]);

    if (parentId === rootParentId) {
      tree.push(currentNode);
    } else {
      const parentNode = nodeMap.get(parentId);
      parentNode ? parentNode[childrenKey].push(currentNode) : tree.push(currentNode);
    }
  }

  // 递归排序函数
  const sortChildren = (nodes: any[]) => {
    if (!sortKey && !compareFn) return nodes;

    return nodes.sort((a, b) => {
      if (compareFn) return compareFn(a, b);

      const valA = a[sortKey!];
      const valB = b[sortKey!];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return String(valA).localeCompare(String(valB)) * (sortOrder === 'asc' ? 1 : -1);
    }).map(node => ({
      ...node,
      [childrenKey]: sortChildren(node[childrenKey])
    }));
  };

  return sortChildren(tree);
}


export const generateRandomNumber = (size = 10) => {
  const min = Math.pow(10, size - 1);
  const max = Math.pow(10, size) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .map(key => encodeURIComponent(key) + '=' + obj[key])
    .join('&');
}
export const parseJsonWithValidation = (inputStr, isObjectOnly = false) => {
  try {
    const cleanedInput = inputStr.trim().replace(/\s+/g, " ");

    // 验证是否为JSON对象或数组
    const isObject = /^{.*}$/.test(cleanedInput);
    const isArray = /^\s*\[.*\]\s*$/.test(cleanedInput);
    let isOk = false;
    if (isObjectOnly) {
      isOk = isObject;
    } else {
      isOk = isObject || isArray;
    }
    if (isOk) {
      const jsonObj = JSON.parse(cleanedInput);
      return jsonObj;
    } else {
      throw new Error("Invalid JSON format");
    }
  } catch (error) {
    console.error("Failed to parse JSON:", error.message);
    return error; // 或者返回错误信息
  }
}

export const compareVersions = (a: string, b: string) => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    if (aParts[i] > bParts[i]) return 1;
    if (aParts[i] < bParts[i]) return -1;
  }

  return 0;
}