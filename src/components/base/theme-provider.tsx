import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'mate-ai-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemTheme = () => {
      root.classList.remove('light', 'dark');
      if (darkModeMediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }

    };

    // 存储主题到localStorage（排除system情况）
    if (theme !== 'system') {
      localStorage.setItem(storageKey, theme);
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    } else {
      handleSystemTheme();
      // 监听系统主题变化
      const systemThemeHandler = (e: MediaQueryListEvent) => {
        handleSystemTheme();
      };
      darkModeMediaQuery.addEventListener('change', systemThemeHandler);

      return () => {
        darkModeMediaQuery.removeEventListener('change', systemThemeHandler);
      };
    }
  }, [storageKey, theme]);


  return (
    <ThemeProviderContext.Provider
      {...props}
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

export const useIsDarkTheme = () => {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(() => 
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const update = () => {
      setIsDark(theme === 'dark' || (theme === 'system' && mediaQuery.matches));
    };

    update(); // 立即更新
    
    if (theme === 'system') {
      mediaQuery.addEventListener('change', update);
    }
    
    return () => {
      // 无论theme如何变化，都执行清理
      mediaQuery.removeEventListener('change', update);
    };
  }, [theme]); // 仅依赖theme变化

  return isDark;
};
