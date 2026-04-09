import { ThemeConfig, theme } from "antd";

export const lightTheme: ThemeConfig = {
    algorithm: theme.defaultAlgorithm,
    cssVar: true,

    token: {
        colorPrimary: '#7c3aed',
        colorTextBase: '#1B2559',
        colorBgLayout: '#F2F5F8',
        
    },
    components: {
        Tooltip: {
            colorBgSpotlight: '#fff',
            colorTextLightSolid: '#000',
        },
    },

};