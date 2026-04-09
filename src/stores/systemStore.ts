import { createStore, create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
// import { SysConfigService } from "@/services/sysConfig.service";

import useUserStore from "@/stores/userStore";
import { secureStorage } from '@/utils/secStorage-util'

import type { SystemConfig } from "@/types/runtime-config";

import LogoBase from "@/assets/mateai/logo.svg";
import { config } from "@/config/index";
import { lastValueFrom } from "rxjs";
// const configService = SysConfigService.getInstance();
const logoKey = 'MateAIPPT-logoUrl';
const plainLogoKey = 'MateAIPPT-plainLogo';
const nameKey = 'MateAIPPT-appName';
const storageLogo = secureStorage.getItem(logoKey)
const storagePlainLogo = secureStorage.getItem(plainLogoKey)
const storageAppName = secureStorage.getItem(nameKey)

type systemState = SystemConfig & {
    // appName?: string;
    // logoUrl?: string;
    // author?: string;
    setAppName: (appName: string) => void;
    setLogoUrl: (logoUrl: string) => void;
    setPlainLogoUrl: (logoUrl: string) => void;
    setDocumentServerUrl: (documentServerUrl: string) => void;
    isConfigLoaded: boolean;
    clear: () => void;
    loadConfig: () => Promise<void>;
    submenuName: string;
    submenuIcon: string;
    documentServer: string;

    setSubmenuName: (submenuName: string) => void;
    setSubmenuIcon: (submenuIcon: string) => void;
};

const useSystemStore = create(
    devtools(

        immer<systemState>((set, get) => (
            {
                appName: storageAppName || config.appName,
                logoUrl: storageLogo || config.logoUrl,
                plainLogoUrl: storagePlainLogo || config.plainLogoUrl,
                author: config.author,
                isConfigLoaded: false,
                documentServer: '',
                submenuName: '',
                submenuIcon: '',
                setSubmenuName: (submenuName: string) => {
                    set((state) => {
                        state.submenuName = submenuName
                    })
                },
                setSubmenuIcon: (submenuIcon: string) => {
                    set((state) => {
                        state.submenuIcon = submenuIcon
                    })
                },
                setAppName: (appName: string) => {
                    set((state) => {
                        state.appName = appName
                    })
                },
                setLogoUrl: (logoUrl: string) => {
                    set((state) => {
                        state.logoUrl = logoUrl
                    })
                },
                setDocumentServerUrl: (documentServerUrl: string) => {
                    set((state) => {
                        state.documentServer = documentServerUrl
                    })
                },
                setPlainLogoUrl: (logoUrl: string) => {
                    set((state) => {
                        state.plainLogoUrl = logoUrl
                    })
                },
                clear: () => {
                    set((state) => { })
                },
                loadConfig: async () => {
                    const accessToken = useUserStore.getState().accessToken;
                    if (!accessToken) {
                        return;
                    }
                    try {
                        // const configRes = await lastValueFrom(configService.list({} as any));
                        const configRes = {
                            data:[
                                {
                                    itemKey: 'sys_logo',
                                    itemValue: LogoBase,
                                },
                                {
                                    itemKey: 'sys_plainlogo',
                                    itemValue: LogoBase,
                                },
                                {
                                    itemKey: 'sys_name',
                                    itemValue: config.appName,
                                },

                            ]
                        } as any;
                        let logoUrl = '';
                        let plainLogoUrl = '';
                        let appName = '';
                        let documentServerUrl = '';
                        if (configRes.data && configRes.data.length > 0) {
                            logoUrl = configRes.data.find(item => item.itemKey === 'sys_logo')?.itemValue || config.logoUrl;
                            plainLogoUrl = configRes.data.find(item => item.itemKey === 'sys_plainlogo')?.itemValue || config.plainLogoUrl;
                            appName = configRes.data.find(item => item.itemKey === 'sys_name')?.itemValue || config.appName;
                            documentServerUrl = configRes.data.find(item => item.itemKey === 'documentServer')?.itemValue || '';
                        }

                        if (logoUrl) {
                            secureStorage.setItem(logoKey, logoUrl);
                        }
                        if (plainLogoUrl) {
                            secureStorage.setItem(plainLogoKey, plainLogoUrl);
                        }
                        if (appName) {
                            secureStorage.setItem(nameKey, appName);
                        }
                        if (documentServerUrl) {
                            secureStorage.setItem('documentServer', documentServerUrl);
                        }


                        set({ isConfigLoaded: true, logoUrl: logoUrl, appName: appName, plainLogoUrl: plainLogoUrl, documentServer: documentServerUrl })

                        // set({ users: data, loading: false });
                    } catch (err) {
                        // set({ error: 'Failed to fetch users', loading: false });
                    }
                },
            })),



    )


);



export default useSystemStore;