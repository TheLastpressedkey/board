import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Todo } from './types';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const bgItem = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 41, 55, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.4)' : 'rgb(107, 114, 128)';
  const borderColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;
  const borderDefault = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : '#4B5563';
  const hoverBg = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg group" style={{
      backgroundColor: bgItem,
      border: isTerminalTheme ? `1px solid ${borderDefault}` : 'none'
    }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
        style={{
          backgroundColor: todo.completed ? borderColor : 'transparent',
          borderColor: todo.completed ? borderColor : borderDefault
        }}
      >
        {todo.completed && <Check className="w-3 h-3" style={{ color: 'rgb(0, 0, 0)' }} />}
      </button>

      <span className="flex-1 text-sm" style={{
        color: todo.completed ? textMuted : textColor,
        textDecoration: todo.completed ? 'line-through' : 'none'
      }}>
        {todo.text}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
        style={{
          ':hover': { backgroundColor: hoverBg }
        }}
      >
        <Trash2 className="w-4 h-4" style={{ color: textMuted }} />
      </button>
    </div>
  );
}