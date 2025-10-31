import React from 'react';
import { Search, X } from 'lucide-react';

interface FileSearchProps {
  query: string;
  onSearch: (query: string) => void;
  isTerminalTheme: boolean;
  textColor: string;
  textMuted: string;
  borderColor: string;
  primaryColor: string;
}

export const FileSearch: React.FC<FileSearchProps> = ({ query, onSearch, isTerminalTheme, textColor, textMuted, borderColor, primaryColor }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4" style={{ color: textMuted }} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Rechercher des fichiers..."
        className="block w-full pl-10 pr-10 py-2 rounded-md leading-5 focus:outline-none focus:ring-1 sm:text-sm"
        style={{
          backgroundColor: isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(55, 65, 81)',
          color: textColor,
          border: `1px solid ${borderColor}`,
          '--tw-ring-color': primaryColor
        } as React.CSSProperties}
      />
      {query && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={() => onSearch('')}
            style={{ color: textMuted }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};