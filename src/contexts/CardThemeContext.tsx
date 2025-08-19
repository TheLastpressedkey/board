import React, { createContext, useContext, useState, useEffect } from 'react';
import { CardTheme, cardThemes } from '../types/CardTheme';
import { userProfile } from '../services/userProfile';

interface CardThemeContextType {
  currentCardTheme: CardTheme;
  setCardTheme: (themeId: string) => void;
  availableThemes: CardTheme[];
}

const CardThemeContext = createContext<CardThemeContextType | undefined>(undefined);

export function CardThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<CardTheme>(cardThemes[0]);

  useEffect(() => {
    loadCardTheme();
  }, []);

  const loadCardTheme = async () => {
    try {
      const { cardTheme } = await userProfile.getPreferredUsername();
      if (cardTheme) {
        const theme = cardThemes.find(t => t.id === cardTheme) || cardThemes[0];
        setCurrentTheme(theme);
      }
    } catch (error) {
      console.error('Error loading card theme:', error);
    }
  };

  const setCardTheme = async (themeId: string) => {
    try {
      const theme = cardThemes.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        await userProfile.updateCardTheme(themeId);
        
        // Apply theme to localStorage for immediate feedback
        localStorage.setItem('cardTheme', themeId);
      }
    } catch (error) {
      console.error('Error saving card theme:', error);
    }
  };

  return (
    <CardThemeContext.Provider value={{
      currentCardTheme: currentTheme,
      setCardTheme,
      availableThemes: cardThemes
    }}>
      {children}
    </CardThemeContext.Provider>
  );
}

export function useCardTheme() {
  const context = useContext(CardThemeContext);
  if (context === undefined) {
    throw new Error('useCardTheme must be used within a CardThemeProvider');
  }
  return context;
}