import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Todo } from './types';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg group">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
          ${todo.completed 
            ? 'bg-pink-500 border-pink-500' 
            : 'border-gray-600 hover:border-pink-500'}`}
      >
        {todo.completed && <Check className="w-3 h-3 text-white" />}
      </button>
      
      <span className={`flex-1 text-sm ${todo.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
        {todo.text}
      </span>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all"
      >
        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
      </button>
    </div>
  );
}