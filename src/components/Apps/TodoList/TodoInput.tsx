import React from 'react';
import { Plus } from 'lucide-react';

interface TodoInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TodoInput({ value, onChange, onSubmit }: TodoInputProps) {
  return (
    <form onSubmit={onSubmit} className="p-4 border-b border-gray-800">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg 
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          onMouseDown={(e) => e.stopPropagation()}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
