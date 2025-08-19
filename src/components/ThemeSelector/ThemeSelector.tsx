import React from 'react';
import { X } from 'lucide-react';
import { ThemeType, useTheme } from '../../contexts/ThemeContext';

interface ThemeSelectorProps {
  onClose: () => void;
}

interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  colors: string[];
}

const themes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic dark theme with pink accents',
    colors: ['rgb(236, 72, 153)']
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calming blue theme inspired by the sea',
    colors: ['rgb(56, 189, 248)']
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange theme inspired by dusk',
    colors: ['rgb(251, 146, 60)']
  }
];

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-gray-800 rounded-lg shadow-xl z-50">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Select Theme</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => {
                setTheme(themeOption.id);
                onClose();
              }}
              className={`w-full p-4 rounded-lg transition-all ${
                currentTheme === themeOption.id
                  ? 'bg-gray-700 ring-2 ring-gray-600'
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: themeOption.colors[0] }}
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-medium">{themeOption.name}</h3>
                  <p className="text-sm text-gray-400">{themeOption.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}