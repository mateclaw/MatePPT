import { createStore, create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

import { STORAGE_KEYS } from "../constants/storageKeys";
import { type UserPo } from "@/models/userPo";
import { secureStorage } from '@/utils/secStorage-util'

import { history } from "umi";
export type userState = {
    accessToken: string;
    userInfo: UserPo;
    setAccessToken: (accessToken: string) => void;
    setUserInfo: (userInfo: UserPo) => void;
   
    // login: (userInfo: UserPo) => void;
    resetAll: () => void;
};


const useUserStore = create(
    devtools(
        persist(
            immer<userState>((set, get) => (
                {
                    accessToken: '',
                    userInfo: {} as UserPo,
                    userMenuList: [],
                    totalMenuList: [],
                    actionList: [],
                    userActionList: [],
              
                    setAccessToken: (accessToken: string) => {
                        set((state) => {
                            state.accessToken = accessToken;
                        });
                        secureStorage.setItem(STORAGE_KEYS.Access_Token, accessToken); // 单独存储 accessToken
                    },

                    setUserInfo: (userInfo: UserPo) => {
                        set((state) => {
                            state.userInfo = userInfo;
                        });
                    },
                    resetAll: () => {
                        set((state) => {
                            state.accessToken = '';
                            state.userInfo = {} as UserPo;
                            history.push("/login");
                        });
                        secureStorage.removeItem(STORAGE_KEYS.Access_Token); // 移除单独存储的 accessToken
                    }
                })),

            {
                name: STORAGE_KEYS.User_Info,
                storage: createJSONStorage(() => ({
                    getItem: secureStorage.getItem,
                    setItem: secureStorage.setItem,
                    removeItem: secureStorage.removeItem
                })),
                // partialize: (state) => ({
                //     user: state.userInfo // 只持久化用户数据
                // }),
                version: 1,
                migrate: (persistedState: any, version) => {
                    if (version === 0) {
                        // 处理旧版本数据迁移
                        return { ...persistedState, newField: 'default' }
                    }
                    return persistedState
                }
            }
        ),
        { name: 'auth' }
    )


)


// 初始化时从单独的 key 加载 accessToken
const initialAccessToken = secureStorage.getItem(STORAGE_KEYS.Access_Token);
if (initialAccessToken) {
    useUserStore.setState({ accessToken: initialAccessToken });
}

// 暴露一个订阅函数
export const subscribeToAccessToken = (callback: (token: string) => void) => {
    return useUserStore.subscribe((state, prevState) => {
        callback(state.accessToken)
    });
};

export default useUserStore;