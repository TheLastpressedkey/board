import { useTheme } from '../contexts/ThemeContext';

export function useAppTheme() {
  const { themeColors } = useTheme();

  return {
    headerBg: 'bg-gray-800',
    contentBg: 'bg-gray-900',
    primaryButton: `bg-[${themeColors.primary}] hover:bg-opacity-90`,
    primaryText: `text-[${themeColors.primary}]`,
    primaryBorder: `border-[${themeColors.primary}]`,
    primaryBg: `bg-[${themeColors.primary}]`,
    primaryRing: `ring-[${themeColors.primary}]`,
    scrollbarColor: themeColors.scrollbar
  };
}