import React, { useState } from 'react';
import { CheckSquare, GripHorizontal, X } from 'lucide-react';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { useTodoList } from './useTodoList';
import { useTheme } from '../../../contexts/ThemeContext';

interface TodoListProps {
  onClose: () => void;
  metadata?: { todos?: any[] };
  onDataChange?: (data: any) => void;
  cardId?: string;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function TodoList({ onClose, metadata, onDataChange, cardId, onDragStart }: TodoListProps) {
  const { todos, addTodo, toggleTodo, deleteTodo, isLoaded } = useTodoList(metadata?.todos, onDataChange, cardId);
  const [newTodo, setNewTodo] = useState('');
  const { themeColors } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-700/50"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5 text-gray-500" />
            <CheckSquare 
              className="w-5 h-5"
              style={{ color: themeColors.primary }}
            />
            <h2 className="text-lg font-semibold text-white">Todo List</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

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
            <div className="text-center text-gray-500 mt-8">
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
          className="px-4 py-3 border-t border-gray-700/50"
          style={{ backgroundColor: themeColors.menuBg }}
        >
          <div className="text-sm text-gray-400">
            {todos.filter(t => t.completed).length} of {todos.length} completed
          </div>
        </div>
      </div>
    </div>
  );
}