export interface SystemConfig{
    appName?: string;
    logoUrl?: string;
    author?:string;
    plainLogoUrl?: string;
}

declare interface Window {
    runtimeConfig?: SystemConfig;
}