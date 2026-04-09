// src/features/dictionary/dictionary.ts
import { RSResult } from '@/models/common/rSResult';
import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Observable, isObservable, lastValueFrom } from 'rxjs';

// 1. 类型定义
type DictionaryKey = string | number;

interface DictionaryItem<T = any> {
  value: DictionaryKey;
  label: string;
  raw: T; // 保留原始数据
  [key: string]: any;
}

interface DictionaryFetchers {
  [dictName: string]: () => Promise<DictionaryItem[]>;
}
interface DictionaryOptions {
  [dictName: string]: DictionaryOptionConfig
}

interface DictionaryConfig {
  staleTime?: number;
  gcTime?: number;
  retry?: number;
}

// 2. 全局配置（可选）
const defaultConfig: DictionaryConfig = {
  staleTime: 30 * 60 * 1000, // 30分钟缓存
  gcTime: 60 * 60 * 1000,    // 1小时垃圾回收
  retry: 0,
};

export interface DictionaryOptionConfig<T = any> {
  // name: string;
  keyName?: string;
  valueName?: string;
  fetcher?: () => Promise<DictionaryItem[]>;
  dataSource?: Observable<RSResult<any>> | Array<T>;
  outputKeyName?: string;
  outputValueName?: string;
  onDataLoaded?: (data: any[]) => any[];
  forceUpdate?: boolean;
}

// 3. 创建字典注册中心
const dictionaryFetchers: DictionaryFetchers = {};
const dictionaryOptions: DictionaryOptions = {};

export function registerDictionary(
  name: string,
  // fetcher: (params?: any) => Promise<DictionaryItem[]>,
  // config?: DictionaryConfig
  // name: string,
  // fetcher: (params?: any) => Promise<DictionaryItem[]>,
  config: DictionaryOptionConfig
) {
  // dictionaryFetchers[name] = fetcher;
  dictionaryOptions[name] = config;
  if (config.fetcher) {
    dictionaryFetchers[name] = config.fetcher;
    return;
  }

  const { keyName = 'value', valueName = 'label', outputKeyName = 'value', outputValueName = 'label' } = config;
  dictionaryOptions[name].keyName = keyName;
  dictionaryOptions[name].valueName = valueName;
  dictionaryOptions[name].outputKeyName = outputKeyName;
  dictionaryOptions[name].outputValueName = outputValueName;

  if (isObservable(config.dataSource)) {

    dictionaryFetchers[name] = async () => {
      const res = await lastValueFrom(config.dataSource as Observable<RSResult<any>>)

      let arr = res.data as Array<any> || [];
      if (config.onDataLoaded) {
        arr = config.onDataLoaded(arr);
      }
      const resArr = arr.map((item: any) => {
        const v = {} as DictionaryItem<any>;
        const tempKey = item[keyName];
        const tempValue = item[valueName];
        v[outputKeyName] = tempKey;
        v[outputValueName] = tempValue;
        v.raw = item;
        return v;
      });

      return resArr;
    }
  }
  else if (Array.isArray(config.dataSource)) {
    dictionaryFetchers[name] = async () => {
      const data = config.dataSource as Array<any>;
      let arr = data as Array<any> || [];
      if (config.onDataLoaded) {
        arr = config.onDataLoaded(data);
      }
      const resArr = data.map((item: any) => {
        const v = {} as DictionaryItem<any>;
        const tempKey = item[keyName];
        const tempValue = item[valueName];
        v[outputKeyName] = tempKey;
        v[outputValueName] = tempValue;
        v.raw = item;
        return v;
      });

      return resArr;
    }
  }
  // 可扩展：存储配置信息
}



// 4. 核心 Hook
/**
 * 
 * @param name 字典名称
 * @returns  
 */
export function useDictionary(name: string) {
  const queryKey = ['dictionary', name];
  const options = dictionaryOptions[name];

  const { data, isLoading, isError, error, refetch, isFetched, isFetchedAfterMount, isFetching } = useQuery<DictionaryItem[]>({
    queryKey,
    queryFn: async () => {

      const fetcher = dictionaryFetchers[name];
      if (!fetcher) {
        throw new Error(`Dictionary ${name} not registered`);
      }
      return fetcher();
    },
    ...defaultConfig,
    

    // 自动重试逻辑

    retryDelay: attempt => Math.min(attempt * 1000, 30 * 1000),
  });

  const queryClient = useQueryClient();
  useEffect(() => {
    if (!options?.forceUpdate) return;
    if (isFetching || isFetchedAfterMount) return;
    queryClient.invalidateQueries({
      queryKey: ['dictionary', name],
    });
  }, [queryClient, name, options?.forceUpdate, isFetching, isFetchedAfterMount]);

  // 5. 值获取方法
  const getValue = (key: DictionaryKey): string => {
    if (!data) return String(key);


    const item = data.find(i => i[options.outputKeyName] === key);
    return item?.label || String(key);
  };

  const getRawData = <T>(key: DictionaryKey): T => {
    if (!data) return null;
    const item = data.find(i => i[options.outputKeyName] === key);
    return item?.raw || null;
  };

  // 6. 增强返回对象
  return {
    data: data || [],
    isLoading,
    isError,
    error,
    getValue,
    getRawData,
    // 扩展方法
    getRawDataList: <T>() => data?.map(i => i.raw as T) || [],
    isEmpty: !isLoading && data?.length === 0,
  };
}

// 7. 字典管理 Hook
export function useDictionaryManager() {
  const queryClient = useQueryClient();

  // 预加载字典
  const prefetchDictionary = async (name: string) => {
    if (!dictionaryFetchers[name]) return;

    await queryClient.prefetchQuery({
      queryKey: ['dictionary', name],
      queryFn: dictionaryFetchers[name],
      ...defaultConfig,
    });
  };

  // 刷新字典
  const refreshDictionary = async (name: string) => {
    await queryClient.invalidateQueries({
      queryKey: ['dictionary', name],
    });
  };

  // 批量操作
  const refreshAllDictionaries = () => {
    Object.keys(dictionaryFetchers).forEach(name => {
      queryClient.invalidateQueries({
        queryKey: ['dictionary', name],
      });
    });
  };

  return {
    prefetchDictionary,
    refreshDictionary,
    refreshAllDictionaries,
  };
}

// 8. 快捷 Hook
export function useDictionaryValue(name: string, key: DictionaryKey) {
  const { getValue } = useDictionary(name);
  return getValue(key);
}
