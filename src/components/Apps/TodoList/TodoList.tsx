import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { useTodoList } from './useTodoList';
import { useTheme } from '../../../contexts/ThemeContext';

interface TodoListProps {
  onClose: () => void;
}

export function TodoList({ onClose }: TodoListProps) {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodoList();
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
        className="flex justify-between items-center px-4 py-2"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <span className="text-sm font-medium text-gray-300">Todo List</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

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
        className="px-4 py-3 border-t border-gray-800"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="text-sm text-gray-400">
          {todos.filter(t => t.completed).length} of {todos.length} completed
        </div>
      </div>
    </div>
  );
}