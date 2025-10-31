import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';

interface TodoInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TodoInput({ value, onChange, onSubmit }: TodoInputProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgInput = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(55, 65, 81)';
  const textColor = isTerminalTheme ? 'rgb(0, 255, 0)' : 'white';
  const placeholderColor = isTerminalTheme ? 'rgba(0, 255, 0, 0.3)' : 'rgb(107, 114, 128)';
  const borderColor = isTerminalTheme ? 'rgba(0, 255, 0, 0.3)' : 'transparent';
  const primaryColor = isTerminalTheme ? 'rgb(0, 255, 0)' : themeColors.primary;

  return (
    <form onSubmit={onSubmit} className="p-4" style={{ backgroundColor: bgHeader }}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
          style={{
            backgroundColor: bgInput,
            color: textColor,
            border: `1px solid ${borderColor}`,
            '--tw-ring-color': primaryColor,
            '--tw-ring-opacity': 0.5
          } as React.CSSProperties}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: primaryColor,
            color: isTerminalTheme ? 'rgb(0, 0, 0)' : 'white',
            border: isTerminalTheme ? `1px solid ${primaryColor}` : 'none'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}