import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { useTodoList } from './useTodoList';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { AppHeader } from '../../Common/Headers/AppHeader';

interface TodoListProps {
  onClose: () => void;
  metadata?: { todos?: any[] };
  onDataChange?: (data: any) => void;
  cardId?: string;
  onDragStart?: (e: React.MouseEvent) => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

export function TodoList({ onClose, metadata, onDataChange, cardId, onDragStart, onTogglePin, isPinned }: TodoListProps) {
  const { todos, addTodo, toggleTodo, deleteTodo, isLoaded } = useTodoList(metadata?.todos, onDataChange, cardId);
  const [newTodo, setNewTodo] = useState('');
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(75, 85, 99, 0.5)';

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      <AppHeader
        onClose={onClose}
        onDragStart={onDragStart}
        onTogglePin={onTogglePin}
        isPinned={isPinned}
        title="Todo List"
        backgroundColor={bgHeader}
        borderColor={borderColor}
        textColor={textColor}
        className="p-4"
        customButtons={[
          <CheckSquare
            key="icon"
            className="w-5 h-5 mr-2"
            style={{ color: isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary }}
          />
        ]}
      />

      {/* Content */}
      <div className="flex flex-col h-full">
        {/* Todo Input */}
        <TodoInput
          value={newTodo}
          onChange={(value) => setNewTodo(value)}
          onSubmit={handleSubmit}
        />

        {/* Todo List */}
        <div className="flex-1 overflow-y-auto p-4 card-scrollbar">
          {todos.length === 0 ? (
            <div className="text-center mt-8" style={{ color: textMuted }}>
              No todos yet. Add one above!
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div
          className="px-4 py-3"
          style={{ backgroundColor: bgHeader, borderTop: `1px solid ${borderColor}` }}
        >
          <div className="text-sm" style={{ color: textMuted }}>
            {todos.filter(t => t.completed).length} of {todos.length} completed
          </div>
        </div>
      </div>
    </div>
  );
}