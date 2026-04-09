
import React, { ReactNode, useEffect, useState, useMemo } from "react";
import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';

import { App, ConfigProvider, ConfigProviderProps, theme, message, Spin } from 'antd';
import { XProvider } from "@ant-design/x";
import { UserPo } from "./models/userPo";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, useIsDarkTheme, useTheme } from './components/base/theme-provider';
import zhCN from 'antd/locale/zh_CN';
import { StyleProvider } from '@ant-design/cssinjs';
// import { loadRuntimeConfig } from '@/utils/config-util';
import { darkTheme, lightTheme } from "@/styles/token";
import useSystemStore from "@/stores/systemStore";
import useAuthStore from "@/stores/authStore";
import { useTitle, useFavicon } from "ahooks";
// 根组件中
import 'cherry-markdown/dist/cherry-markdown.css';
import '@/styles/fonts.scss';
import { initGlobalMessage } from '@/utils/message-utils';
import { useMenus } from "@/hooks/menu-hooks";
import "dayjs/locale/zh-cn";
import dayjs from "dayjs";
import useUserStore  from "@/stores/userStore";
import { config } from "@/config";

const redirectGitHubPagesEntry = () => {
    const isGitHubPages = window.location.hostname.endsWith('github.io');
    const basePath = config.publicPath.endsWith('/') ? config.publicPath : `${config.publicPath}/`;
    const basePathWithoutTrailingSlash = basePath.replace(/\/$/, '');
    const isBaseEntry =
        window.location.pathname === basePath ||
        window.location.pathname === basePathWithoutTrailingSlash;

    if (isGitHubPages && isBaseEntry && !window.location.hash) {
        window.location.replace(`${window.location.origin}${basePath}#/ppt/new${window.location.search}`);
    }
};

redirectGitHubPagesEntry();

/**
 * 动态加载微信扫码登录脚本
 */
const loadWxLoginScript = () => {
    if (document.getElementById('wx-login-script')) return;
    const script = document.createElement('script');
    script.id = 'wx-login-script';
    script.src = config.resolvePublicAsset('js/wxLogin.js');
    script.async = true;
    document.body.appendChild(script);
};

const loadFontAwesome = () => {
    if (document.getElementById('font-awesome-css')) return;
    const link = document.createElement('link');
    link.id = 'font-awesome-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);
};


dayjs.locale('zh-cn');
const host = window.location.origin;
(window as any)._AMapSecurityConfig = {
    // serviceHost: 'http://115.120.17.160:9090/_AMapService',
    serviceHost: host + '/_AMapService',
    // 例如 ：serviceHost:'http://1.1.1.1:80/_AMapService',
}
// const Root = () => {
//   const { message } = AntdApp.useApp();

//   // 初始化全局实例
//   useEffect(() => {
//     initGlobalMessage(message);
//   }, [message]);

//   return <MyApp />;
// };
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            // staleTime: 5 * 60 * 1000,
            // cacheTime: 5 * 60 * 1000,
        },
    }
} as QueryClientConfig);


function Root({ children }: React.PropsWithChildren) {
    // const { theme: themeName } = useTheme();
    // // const isDarkTheme = themeName === 'dark' || (themeName === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    // const isDarkTheme = useMemo(() => themeName === 'dark' || (themeName === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches), [
    //     themeName, window.matchMedia('(prefers-color-scheme: dark)').matches
    // ]);
    const isDarkTheme = useIsDarkTheme();
    const systemStore = useSystemStore();
    const authStore = useAuthStore();
    const { userInfo } = useUserStore();
    const [demoSessionReady, setDemoSessionReady] = useState(!config.demoAutoLogin);



    const [messageApi, contextHolder] = message.useMessage({
        getContainer() {
            return document.getElementById('root')!;
        },
        // duration: 0
    });
    useMenus();
    // 初始化全局实例
    useEffect(() => {




        initGlobalMessage(messageApi);
        // messageApi.success('登录成功');
    }, [message, useSystemStore]);

    useEffect(() => {
        /**
         * 初始化运行时配置
         */
        const initializeConfig = async () => {
            await systemStore.loadConfig();
        };
        initializeConfig();

        // 加载微信登录脚本
        loadWxLoginScript();
        loadFontAwesome();

        if(userInfo && userInfo.userId){
            authStore.getMinioService('').then(res => {
                console.log('minio loaded');
            });
        }
    }, []);

    useEffect(() => {
        const bootstrapDemoSession = async () => {
            if (!config.demoAutoLogin || !config.demoSessionUrl) {
                setDemoSessionReady(true);
                return;
            }

            const { accessToken, userInfo: currentUserInfo, setAccessToken, setUserInfo } = useUserStore.getState() as any;
            if (accessToken && currentUserInfo?.userId) {
                setDemoSessionReady(true);
                return;
            }

            try {
                const response = await fetch(config.demoSessionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        source: 'github-pages-bootstrap',
                    }),
                });
                const payload = await response.json();
                const resData = payload?.data?.userInfo
                    ? { ...payload.data.userInfo, token: payload.data.token }
                    : payload?.data?.token
                        ? payload.data
                        : payload?.token
                            ? payload
                            : null;

                if (response.ok && resData?.token && resData?.userId) {
                    setUserInfo(resData);
                    setAccessToken(resData.token);
                } else {
                    console.error('[Root] Demo session bootstrap failed', payload);
                }
            } catch (error) {
                console.error('[Root] Demo session bootstrap error', error);
            } finally {
                setDemoSessionReady(true);
            }
        };

        void bootstrapDemoSession();
    }, []);



    useTitle(systemStore.appName);
    useFavicon(systemStore.logoUrl);



    if (!demoSessionReady) {
        return (
            <div className="flex h-full min-h-screen w-full items-center justify-center bg-white">
                <Spin size="large" tip="演示账号登录中..." />
            </div>
        );
    }

    return (
        <>
            {/* <iframe src={docServerHost} style={{display:'none'}}></iframe> */}
            <StyleProvider >
                <XProvider
                    theme={isDarkTheme ? darkTheme : lightTheme}
                    locale={zhCN}
                >
                    <App style={{ height: '100%', width: '100%' }}>
                        
                        {children}

                        {contextHolder}
                    </App>

                </XProvider>
            </StyleProvider>
            <ReactQueryDevtools buttonPosition={'bottom-right'} />
        </>
    );
}

const RootProvider = ({ children }: React.PropsWithChildren) => {
    // useEffect(() => {
    //   // Because the language is saved in the backend, a token is required to obtain the api. However, the login page cannot obtain the language through the getUserInfo api, so the language needs to be saved in localstorage.
    //   const lng = storage.getLanguage();
    //   if (lng) {
    //     i18n.changeLanguage(lng);
    //   }
    // }, []);

    return (
        <QueryClientProvider client={queryClient}>

            <ThemeProvider defaultTheme="light" storageKey="mate-ui-theme">
                <Root>{children}</Root>
            </ThemeProvider>

        </QueryClientProvider>
    );
};
export function rootContainer(container: ReactNode) {
    return <RootProvider>{container}</RootProvider>;
}
