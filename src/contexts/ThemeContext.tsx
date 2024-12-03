import React, { createContext, useContext, useState, useEffect } from 'react';
import { userProfile } from '../services/userProfile';

export type ThemeType = 'default' | 'ocean' | 'sunset';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeColors: {
    primary: string;
    scrollbar: string;
    menuBg: string;
    menuHover: string;
  };
}

const themeColors = {
  default: {
    primary: 'rgb(236, 72, 153)', // pink-500
    scrollbar: 'rgb(236, 72, 153)', // pink-500
    menuBg: 'bg-gray-800/40',
    menuHover: 'hover:bg-gray-700/50'
  },
  ocean: {
    primary: 'rgb(56, 189, 248)', // sky-400
    scrollbar: 'rgb(56, 189, 248)', // sky-400
    menuBg: 'bg-sky-900/40',
    menuHover: 'hover:bg-sky-800/50'
  },
  sunset: {
    primary: 'rgb(251, 146, 60)', // orange-400
    scrollbar: 'rgb(251, 146, 60)', // orange-400
    menuBg: 'bg-orange-900/40',
    menuHover: 'hover:bg-orange-800/50'
  }
};

const DEFAULT_THEME: ThemeType = 'default';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(DEFAULT_THEME);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const { theme: savedTheme } = await userProfile.getPreferredUsername();
        if (savedTheme && Object.keys(themeColors).includes(savedTheme)) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsInitialized(true);
      }
    }
    loadTheme();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    document.documentElement.setAttribute('data-theme', theme);
    
    Object.entries(themeColors[theme]).forEach(([key, value]) => {
      if (typeof value === 'string') {
        document.documentElement.style.setProperty(`--theme-${key}-color`, value);
      }
    });
  }, [theme, isInitialized]);

  const setTheme = async (newTheme: ThemeType) => {
    try {
      await userProfile.updateTheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
      setThemeState(DEFAULT_THEME);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      themeColors: themeColors[theme]
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}