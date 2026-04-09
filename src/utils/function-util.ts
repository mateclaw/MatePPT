import { BigNumber } from 'bignumber.js';
import _ from 'lodash';

export const handleKeyword = (name: string) => {
  return `\`${handleEscape(name)}\``;
};

export const handleEscape = (name: string) => name.replace(/\\/gm, '\\\\').replace(/`/gm, '\\`');

export const handleVidStringName = (name: string, spaceVidType?: string) => {
  if (spaceVidType && spaceVidType === 'INT64') {
    return convertBigNumberToString(name);
  }
  // Add quotes to a string
  // If there is '\n' in the string, it needs to be escaped 
  return JSON.stringify(name);
};

export const convertBigNumberToString = (value: any) => {
  // int precision length in nebula is longer than in javascript
  return BigNumber.isBigNumber(value) ? value.toString() : value;
};

export const sortByFieldAndFilter = (payload: { field: string; searchVal: string; list: any[] }) => {
  const { searchVal, list, field } = payload;
  if (searchVal) {
    return _.orderBy(list, [field], ['asc']).filter((item: any) => item.name.includes(searchVal));
  } else {
    return _.orderBy(list, [field], ['asc']);
  }
};

export const removeNullCharacters = (data: string) => {
  return data.replace(/\u0000+$/, '');
};

export const safeParse = <T extends unknown>(
  data: string,
  options?: { paser?: (data: string) => T },
): T | undefined => {
  const { paser } = options || {};
  try {
    return paser ? paser(data) : JSON.parse(data);
  } catch (err) {
    console.error('JSON.parse error', err);
    return undefined;
  }
};

export const getByteLength = (str: string) => {
  const utf8Encode = new TextEncoder();
  return utf8Encode.encode(str).length;
};

export const isValidIP = (ip: string) => {
  const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
  return reg.test(ip);
}; 

export const isEmpty = (value: any) => {
  return !value && value !== 0;
};


// 类型定义层
export type MiddlewareContext<TArgs extends any[], TResult> = {
    originalArgs: TArgs;
    result?: TResult;
    startTime: number;
    [key: string]: any; // 允许扩展上下文
  };
  
 export type PreMiddleware<TArgs extends any[]> = (
    context: MiddlewareContext<TArgs, any>
  ) => void | Promise<void>;
  
  export type PostMiddleware<TResult> = (
    context: MiddlewareContext<any[], TResult>,
    result: TResult
  ) => TResult | Promise<TResult>;
  
  export interface FunctionController<TFn extends (...args: any[]) => any> {
    execute: (...args: Parameters<TFn>) => ReturnType<TFn>;
    override: <TNewFn extends (...args: Parameters<TFn>) => ReturnType<TFn>>(
      newFn: TNewFn
    ) => FunctionController<TNewFn>;
    restore: () => FunctionController<TFn>;
    before: (middleware: PreMiddleware<Parameters<TFn>>) => this;
    after: (middleware: PostMiddleware<ReturnType<TFn>>) => this;
  }
  
  // 实现层
  export function createFunctionController<TFn extends (...args: any[]) => any>(
    originalFn: TFn
  ): FunctionController<TFn> {
    let currentFn: TFn = originalFn;
    let name = 'originalFn'
    const preMiddlewares: PreMiddleware<Parameters<TFn>>[] = [];
    const postMiddlewares: PostMiddleware<ReturnType<TFn>>[] = [];
  
    const controller: FunctionController<TFn> = {
      execute(...args: Parameters<TFn>): ReturnType<TFn> {
        const context: MiddlewareContext<Parameters<TFn>, ReturnType<TFn>> = {
          originalArgs: args,
          startTime: Date.now(),
        };

        
  
        // 执行前置中间件
        preMiddlewares.forEach(middleware => middleware(context));
  
        // 执行核心函数
        const result = currentFn.apply(this, context.originalArgs);
  
        // 执行后置中间件
        const finalResult = postMiddlewares.reduce(
          (acc, middleware) => middleware(context, acc),
          result
        );
  
        return finalResult;
      },
  
      override<TNewFn extends (...args: Parameters<TFn>) => ReturnType<TFn>>(
        newFn: TNewFn
      ): FunctionController<TNewFn> {
        currentFn = newFn as unknown as TFn;
        name = 'newFn '+ Date.now();
    
        return this as unknown as FunctionController<TNewFn>;
      },
  
      restore() {
        currentFn = originalFn;
        return this;
      },
  
      before(middleware: PreMiddleware<Parameters<TFn>>) {
        preMiddlewares.push(middleware);
        return this;
      },
  
      after(middleware: PostMiddleware<ReturnType<TFn>>) {
        postMiddlewares.push(middleware);
        return this;
      },
    };
  
    return controller;
  }
  
  type AsyncFunctionController<TFn extends (...args: any[]) => any> = {
    execute: (...args: Parameters<TFn>) => Promise<Awaited<ReturnType<TFn>>>;
    // 其他方法保持同步...
  } & Omit<FunctionController<TFn>, 'execute'>;
  
  export function createAsyncController<TFn extends (...args: any[]) => Promise<any>>(
    originalFn: TFn
  ): AsyncFunctionController<TFn> {
    const baseController = createFunctionController(originalFn);
    
    return {
      ...baseController,
      async execute(...args: Parameters<TFn>): Promise<Awaited<ReturnType<TFn>>> {
        const context = {
          originalArgs: args,
          startTime: Date.now(),
        };
  
        // 异步前置中间件
        for (const middleware of baseController['preMiddlewares']) {
          await middleware(context);
        }
  
        // 执行核心函数
        const result = await baseController['currentFn'](...context.originalArgs);
  
        // 异步后置中间件
        let finalResult = result;
        for (const middleware of baseController['postMiddlewares']) {
          finalResult = await middleware(context, finalResult);
        }
  
        return finalResult;
      }
    };
  }
  
//   // 使用示例
//   const asyncProcessor = createAsyncController(async (data: number) => {
//     await new Promise(resolve => setTimeout(resolve, 100));
//     return data * 2;
//   });
  
//   asyncProcessor
//     .before(async (ctx) => {
//       ctx.originalArgs[0] += await Promise.resolve(10);
//     })
//     .after(async (_, result) => await result * 3);
  
//   asyncProcessor.execute(5).then(console.log); // (5+10)*2*3 = 90


//  // 使用示例
//   interface DataProcessor {
//     (data: number): number;
//   }
  
//   // 1. 定义原始函数
//   const dataProcessor: DataProcessor = (data) => {
//     console.log('核心处理逻辑');
//     return data * 2;
//   };
  
//   // 2. 创建控制器
//   const processor = createFunctionController(dataProcessor);
  
//   // 3. 类型安全的使用
//   processor
//     .before((ctx) => {
//       console.log(`输入值: ${ctx.originalArgs[0]}`);
//       ctx.originalArgs[0] += 1; // 修改参数
//     })
//     .after((ctx, result) => {
//       console.log(`处理耗时: ${Date.now() - ctx.startTime}ms`);
//       return result * 3;
//     });
  
//   const result = processor.execute(5); 
//   // 控制台输出：
//   // 输入值: 5
//   // 核心处理逻辑
//   // 处理耗时: 2ms
//   console.log(result); // (5+1)*2*3 = 36
  
//   // 4. 类型安全的覆盖
//   const newProcessor = processor
//     .override((data: number) => data ** 2) // 自动推断参数类型
//     .after((_, result) => result + 10);
  
//   console.log(newProcessor.execute(3)); // (3)^2 +10 = 19
  
//   // 5. 恢复初始函数
//   processor.restore().execute(5); // 返回 10