import React from 'react';
import { Search, X } from 'lucide-react';

interface VideoSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  themeColor: string;
}

export function VideoSearchBar({ value, onChange, placeholder = 'Search...', themeColor }: VideoSearchBarProps) {
  return (
    <div className="relative group">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3.5 bg-white/10 text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium"
        style={{ boxShadow: `0 2px 8px ${themeColor}10` }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 4px 16px ${themeColor}20`;
          e.currentTarget.style.borderColor = themeColor;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = `0 2px 8px ${themeColor}10`;
          e.currentTarget.style.borderColor = 'transparent';
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200 cursor-pointer"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      )}
    </div>
  );
}
