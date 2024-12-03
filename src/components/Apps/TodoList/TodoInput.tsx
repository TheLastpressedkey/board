import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface TodoInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TodoInput({ value, onChange, onSubmit }: TodoInputProps) {
  const { themeColors } = useTheme();

  return (
    <form onSubmit={onSubmit} className="p-4" style={{ backgroundColor: themeColors.menuBg }}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg 
            placeholder-gray-500 focus:outline-none focus:ring-2"
          style={{ 
            '--tw-ring-color': themeColors.primary,
            '--tw-ring-opacity': 0.5
          } as React.CSSProperties}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-3 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: themeColors.primary }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}