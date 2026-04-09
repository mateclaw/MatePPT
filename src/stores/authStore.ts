import { createStore, create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

import { STORAGE_KEYS } from "../constants/storageKeys";
import { type UserPo } from "@/models/userPo";
import { secureStorage } from '@/utils/secStorage-util'
import { UserService } from "@/services/user.service";
import { firstValueFrom } from "rxjs";
import { SysRightPo } from "@/models/sysRightPo";
export type authState = {

    minioService: any;
    userMenuList: any[];
    totalMenuList: any[];
    userMenuTree: any[];
    totalMenuTree: any[];
    totalActionList: any[];
    userActionList: any[];
    userRightList: any[];
    totalRightList: any[];
    isLoaded: boolean;
    getMinioService: (path: string) => Promise<any>,
    setTotalMenuList: (menus: SysRightPo[]) => void;
    setUserMenuList: (menus: SysRightPo[]) => void;
    setTotalMenuTree: (menus: SysRightPo[]) => void;
    setUserMenuTree: (menus: SysRightPo[]) => void;
    setTotalActionList: (actions: SysRightPo[]) => void;
    setUserActionList: (actions: SysRightPo[]) => void;
    setTotalRightList: (actions: SysRightPo[]) => void;
    setUserRightList: (actions: SysRightPo[]) => void;
    setIsLoaded: (isLoaded: boolean) => void;
};


const useAuthStore = create(
    devtools(

        immer<authState>((set, get) => (
            {
                accessToken: '',
                userInfo: {} as UserPo,
                userMenuList: [],
                totalMenuList: [],
                totalActionList: [],
                userActionList: [],
                minioService: {},
                userMenuTree: [],
                totalMenuTree: [],
                userRightList: [],
                totalRightList: [],
                isLoaded: false,
                setIsLoaded: (isLoaded) => set({ isLoaded }),
                setTotalMenuList: (menus) => set({ totalMenuList: menus }),
                setUserMenuList: (menus) => {

                    set({ userMenuList: menus })
                },
                setTotalMenuTree: (menus) => set({ totalMenuTree: menus }),
                setUserMenuTree: (menus) => {

                    set({ userMenuTree: menus })
                },
                setUserActionList: (menus) => set({ userActionList: menus }),
                setTotalActionList: (menus) => set({ totalActionList: menus }),
                setUserRightList: (menus) => set({ userRightList: menus }),
                setTotalRightList: (menus) => set({ totalRightList: menus }),
                clear: () => {
                    set((state) => { })
                },
                getMinioService: async (path: string) => {
                    const state = get();


                    // 如果已经有实例，直接返回
                    if (state.minioService[path] && !(state.minioService[path] instanceof Promise)) {
                        return state.minioService[path];
                    }

                    // 如果正在加载中，返回同一个 Promise
                    if (state.minioService[path] instanceof Promise) {
                        return state.minioService[path];
                    }

                    // 创建初始化 Promise 并缓存
                    const initPromise = (async () => {
                        try {
                            const MinIOService = (await import('@/utils/minIO')).MinIOService;
                            const serviceInstance = new MinIOService({ path } as any);
                            if (!serviceInstance.config.endPoint || !String(serviceInstance.config.endPoint).trim()) {
                                set(state => {
                                    if (!state.minioService) {
                                        state.minioService = {};
                                    }
                                    state.minioService[path] = serviceInstance;
                                    delete state.minioService[`${path}_promise`];
                                });
                                return serviceInstance;
                            }
                            await serviceInstance.initMateaiMinio();

                            // 更新状态，存储实际实例
                            set(state => {
                                if (!state.minioService) {
                                    state.minioService = {};
                                }
                                state.minioService[path] = serviceInstance;
                                delete state.minioService[`${path}_promise`];
                            });

                            return serviceInstance;
                        } catch (error) {
                            // 出错时清理状态
                            set(state => {
                                if (state.minioService) {
                                    delete state.minioService[path];
                                    delete state.minioService[`${path}_promise`];
                                }
                            });
                            throw error;
                        }
                    })();

                    // 缓存 Promise
                    set(state => {
                        if (!state.minioService) {
                            state.minioService = {};
                        }
                        state.minioService[path] = initPromise;
                        state.minioService[`${path}_promise`] = true;
                    });

                    return initPromise;
                }
            })),

        // {
        //     name: 'secure-user-store',
        //     storage: createJSONStorage(() => ({
        //         getItem: secureStorage.getItem,
        //         setItem: secureStorage.setItem,
        //         removeItem: secureStorage.removeItem
        //     })),
        //     // partialize: (state) => ({
        //     //     user: state.userInfo // 只持久化用户数据
        //     // }),
        //     version: 1,
        //     migrate: (persistedState: any, version) => {
        //         if (version === 0) {
        //             // 处理旧版本数据迁移
        //             return { ...persistedState, newField: 'default' }
        //         }
        //         return persistedState
        //     }
        // }

    )


)


export default useAuthStore;
