import React, { createContext, useContext, useState, useEffect } from 'react';
import { userProfile } from '../services/userProfile';

export type ThemeType = 'default' | 'ocean' | 'sunset' | 'forest' | 'purple' | 'cyberpunk' | 'minimal' | 'dark-blue' | 'emerald' | 'rose';

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
    primary: 'rgb(236, 72, 153)',
    scrollbar: 'rgb(236, 72, 153)',
    menuBg: 'rgba(31, 41, 55, 0.4)',
    menuHover: 'hover:bg-gray-700/50'
  },
  ocean: {
    primary: 'rgb(56, 189, 248)',
    scrollbar: 'rgb(56, 189, 248)',
    menuBg: 'rgba(12, 74, 110, 0.4)',
    menuHover: 'hover:bg-sky-800/50'
  },
  sunset: {
    primary: 'rgb(251, 146, 60)',
    scrollbar: 'rgb(251, 146, 60)',
    menuBg: 'rgba(124, 45, 18, 0.4)',
    menuHover: 'hover:bg-orange-800/50'
  },
  forest: {
    primary: 'rgb(34, 197, 94)',
    scrollbar: 'rgb(34, 197, 94)',
    menuBg: 'rgba(20, 83, 45, 0.4)',
    menuHover: 'hover:bg-green-800/50'
  },
  purple: {
    primary: 'rgb(168, 85, 247)',
    scrollbar: 'rgb(168, 85, 247)',
    menuBg: 'rgba(88, 28, 135, 0.4)',
    menuHover: 'hover:bg-purple-800/50'
  },
  cyberpunk: {
    primary: 'rgb(0, 255, 255)',
    scrollbar: 'rgb(0, 255, 255)',
    menuBg: 'rgba(0, 20, 40, 0.6)',
    menuHover: 'hover:bg-cyan-900/50'
  },
  minimal: {
    primary: 'rgb(75, 85, 99)',
    scrollbar: 'rgb(75, 85, 99)',
    menuBg: 'rgba(55, 65, 81, 0.3)',
    menuHover: 'hover:bg-gray-600/50'
  },
  'dark-blue': {
    primary: 'rgb(59, 130, 246)',
    scrollbar: 'rgb(59, 130, 246)',
    menuBg: 'rgba(30, 58, 138, 0.4)',
    menuHover: 'hover:bg-blue-800/50'
  },
  emerald: {
    primary: 'rgb(16, 185, 129)',
    scrollbar: 'rgb(16, 185, 129)',
    menuBg: 'rgba(6, 78, 59, 0.4)',
    menuHover: 'hover:bg-emerald-800/50'
  },
  rose: {
    primary: 'rgb(244, 63, 94)',
    scrollbar: 'rgb(244, 63, 94)',
    menuBg: 'rgba(136, 19, 55, 0.4)',
    menuHover: 'hover:bg-rose-800/50'
  }
};

const DEFAULT_THEME: ThemeType = 'default';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(DEFAULT_THEME);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from local storage first for immediate visual feedback
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme && Object.keys(themeColors).includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    setIsInitialized(true);
  }, []);

  // Then load from database and update if different
  useEffect(() => {
    async function loadTheme() {
      try {
        const { theme: dbTheme } = await userProfile.getPreferredUsername();
        if (dbTheme && Object.keys(themeColors).includes(dbTheme)) {
          setThemeState(dbTheme as ThemeType);
          localStorage.setItem('theme', dbTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
    loadTheme();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    document.documentElement.setAttribute('data-theme', theme);
    
    Object.entries(themeColors[theme]).forEach(([key, value]) => {
      if (typeof value === 'string') {
        document.documentElement.style.setProperty(`--theme-${key}`, value);
      }
    });

    document.documentElement.className = `theme-${theme}`;
  }, [theme, isInitialized]);

  const setTheme = async (newTheme: ThemeType) => {
    try {
      // Update local storage immediately for fast feedback
      localStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
      
      // Then update database
      await userProfile.updateTheme(newTheme);
      
      // Apply theme changes
      document.documentElement.setAttribute('data-theme', newTheme);
      Object.entries(themeColors[newTheme]).forEach(([key, value]) => {
        if (typeof value === 'string') {
          document.documentElement.style.setProperty(`--theme-${key}`, value);
        }
      });
      document.documentElement.className = `theme-${newTheme}`;
    } catch (error) {
      console.error('Error saving theme:', error);
      // Revert to previous theme on error
      const savedTheme = localStorage.getItem('theme') as ThemeType;
      setThemeState(savedTheme || DEFAULT_THEME);
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