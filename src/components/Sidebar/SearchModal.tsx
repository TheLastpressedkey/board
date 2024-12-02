import React, { useState, useEffect } from 'react';
import { X, Search, Layout } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';

interface SearchModalProps {
  boards: { id: string; name: string }[];
  currentBoard: string;
  onClose: () => void;
  onBoardSelect: (boardId: string) => void;
}

export function SearchModal({ boards, currentBoard, onClose, onBoardSelect }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const { results, search } = useSearch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (query) {
      search(query, boards);
    }
  }, [query, boards, search]);

  const handleBoardSelect = (boardId: string) => {
    onBoardSelect(boardId);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] max-h-[80vh] bg-black/40 backdrop-blur-md rounded-lg shadow-2xl z-50 border border-white/10">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards..."
              className="w-full pl-10 pr-4 py-2 bg-black/20 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20"
              autoFocus
            />
          </div>
        </div>

        {query && (
          <div className="overflow-y-auto max-h-[60vh] p-2">
            {results.map((result) => (
              <button
                key={`${result.boardId}-${result.cardId}`}
                onClick={() => handleBoardSelect(result.boardId)}
                className="w-full p-3 hover:bg-white/5 rounded-lg mb-2 text-left group transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Layout className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {boards.find(b => b.id === result.boardId)?.name}
                  </span>
                </div>
                <div className="text-white font-medium mb-1">{result.title}</div>
                {result.preview && (
                  <div className="text-sm text-gray-300 line-clamp-2">{result.preview}</div>
                )}
              </button>
            ))}

            {results.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </>
  );
}
