import React, { useCallback } from 'react';
import { useCardTheme } from '../../contexts/CardThemeContext';

interface TextCardContentProps {
  content: string;
  onChange: (content: string) => void;
}

export function TextCardContent({ content, onChange }: TextCardContentProps) {
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="h-full flex flex-col">
      <textarea
        className={`w-full h-full resize-none p-4 card-scrollbar
          focus:outline-none ${
            isTerminalTheme
              ? 'bg-black text-white placeholder-gray-600 font-mono'
              : 'bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50'
          }`}
        value={content}
        onChange={handleChange}
        placeholder={isTerminalTheme ? 'Entrez votre texte ici...' : 'Enter your text here...'}
        style={{
          minHeight: '100%',
          lineHeight: isTerminalTheme ? '1.6' : '1.5',
          fontSize: '0.95rem'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}