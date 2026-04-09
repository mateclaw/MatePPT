import { ThemeConfig } from 'antd';


import { darkTheme as dark } from './dark';
import { lightTheme as light } from './light';
import { merge } from "lodash";

const baseTheme: ThemeConfig = {
    token: {
        // borderRadius: 20
        lineWidthFocus: 0,
        
    },
    
    components: {
        Button: {
            borderRadius: 8,
        },
        Splitter:{
            splitBarSize:1
        },
        Tree:{
            indentSize:16,
            paddingXS:2,
            nodeSelectedBg:"#bfd0ff",
            nodeSelectedColor:"#666666",
        }
    }

}

export const darkTheme =merge( baseTheme,
    dark)

export const lightTheme = merge({

}, baseTheme,
    light)