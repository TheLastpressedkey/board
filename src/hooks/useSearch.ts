import { useState, useCallback } from 'react';
import { Board } from '../types';

interface SearchResult {
  boardId: string;
  cardId: string;
  title: string;
  preview: string;
  type: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);

  const search = useCallback((query: string, boards: Board[]) => {
    const searchResults: SearchResult[] = [];
    const normalizedQuery = query.toLowerCase();

    boards.forEach(board => {
      board.cards?.forEach(card => {
        const content = card.content.toLowerCase();
        const title = card.metadata?.title?.toLowerCase() || '';
        const description = card.metadata?.description?.toLowerCase() || '';

        if (content.includes(normalizedQuery) || 
            title.includes(normalizedQuery) || 
            description.includes(normalizedQuery)) {
          
          let preview = '';
          let searchTitle = '';

          if (card.type === 'text') {
            preview = card.content;
            searchTitle = `Text Card`;
          } else if (card.type === 'link') {
            preview = card.metadata?.description || card.content;
            searchTitle = card.metadata?.title || card.content;
          }

          searchResults.push({
            boardId: board.id,
            cardId: card.id,
            title: searchTitle,
            preview: preview,
            type: card.type
          });
        }
      });
    });

    setResults(searchResults);
  }, []);

  return { results, search };
}