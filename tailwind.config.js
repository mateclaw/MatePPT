
// const { extend } = require("lodash");
// --ant-color-primary: #1677ff;
//     --ant-color-success: #52c41a;
//     --ant-color-warning: #faad14;
//     --ant-color-error: #ff4d4f;
//     --ant-color-info: #1677ff;
//     --ant-color-link: #1677ff;
//     --ant-color-text-base: #000;
//     --ant-color-bg-base: #fff;
import { Component } from 'lucide-react'
import tailwindThemeVarDefine from './src/styles/theme/tailwind-theme-var-define.ts'
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/layouts/**/*.tsx',
    './src/layouts/sidebars/*.tsx',
    './src/pages/**/components/*.tsx',
    './src/ppt/**/*.tsx',
  ],
  safelist: [
    'h-80', // 强制生成
    'break-before-all',
    'pr-16',
    "text-warning",
    "text-success-500",
    "text-info",
    "text-error",
    'text-purple-500',
    'bg-[rgba(32, 41, 89, 1)]',
    'bg-blue-500',
    'bg-[#03C9F3]',
    'bg-yellow-500',
    'bg-green-500',
    'bg-red-500',
    'bg-gray-500',
    'top-4'

  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        blue: {
          450: '#03C9F3'
        },
        warning: {
          DEFAULT: 'var(--ant-color-warning)',
          500: 'var(--ant-color-warning)',
        },
        primary: {
          // --ant-color-primary-bg: #f0f5ff;
          // --ant-color-primary-bg-hover: #e8efff;
          // --ant-color-primary-border: #bfd0ff;
          // --ant-color-primary-border-hover: #96afff;
          // --ant-color-primary-hover: #6e8bff;
          // --ant-color-primary-active: #2f45d6;
          // --ant-color-primary-text-hover: #6e8bff;
          // --ant-color-primary-text: #4462fc;
          // --ant-color-primary-text-active: #2f45d6;
          DEFAULT: 'var(--ant-color-primary)',
          500: 'var(--ant-color-primary)',
          100: 'var(--ant-color-primary-bg)',
          150: 'var(--ant-color-primary-bg-hover)',
          200: 'var(--ant-color-primary-border)',
          250: 'var(--ant-color-primary-border-hover)',
          300: 'var(--ant-color-primary-hover)',
          400: 'var(--ant-color-primary-text-hover)',
          600: 'var(--ant-color-primary-active)',
          700: 'var(--ant-color-primary-text)',
          800: 'var(--ant-color-primary-text-active)',
        },
        creative: {
          DEFAULT: 'var(--ant-color-creative)',
        },
        error: {
          DEFAULT: 'var(--ant-color-error)',
          500: 'var(--ant-color-error)',
        },
        success: {
          DEFAULT: 'var(--ant-color-success)',
          500: 'var(--ant-color-success)',
        },
        info: {
          DEFAULT: 'var(--ant-color-info)',
          500: 'var(--ant-color-info)',
        },
        link: {
          DEFAULT: 'var(--ant-color-link)',
          500: 'var(--ant-color-link)',

        },
        textcolor: {
          DEFAULT: 'var(--ant-color-text-base)',
          500: 'var(--ant-color-text-base)',
          400: 'var(--ant-color-text-secondary)',
          300: 'var(--ant-color-text-tertiary)',
          200: 'var(--ant-color-text-quaternary)',
          100: 'var(--ant-color-text-light-solid)',


        },
        bordercolor: {
          DEFAULT: 'var(--ant-color-border)',
          500: 'var(--ant-color-border)',
          400: 'var(--ant-color-border-secondary)',


        },

        fill: {
          DEFAULT: 'var(--ant-color-bg-text-hover)',
          100: 'var(--ant-color-fill-quaternary)',
          200: 'var(--ant-color-fill-tertiary)',
          300: 'var(--ant-color-fill-secondary)',
          400: 'var(--ant-color-fill)',
          500: 'var(--ant-color-bg-text-hover)',
          'container': 'var(--ant-color-bg-container)',
          'layout': 'var(--ant-color-bg-layout)',
          'base': 'var(--ant-color-bg-base)',
        },

        ...tailwindThemeVarDefine,
        footer: {
          'dark-bg': 'rgba(32, 41, 89, 1)',
          'link': 'rgba(123, 123, 123, 1)',
        },
      },
      backgroundImage: {
        'primary-gradient': 'var(--primary-gradient)',
        'creative-gradient': 'var(--creative-gradient)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'pop-in': 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1600px',
      // => @media (min-width: 1600px) { ... }
      '3xl': '2000px',
      // => @media (min-width: 2000px) { ... }
    }
  }

}
