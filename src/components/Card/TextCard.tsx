import React, { useCallback } from 'react';

interface TextCardContentProps {
  content: string;
  onChange: (content: string) => void;
}

export function TextCardContent({ content, onChange }: TextCardContentProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    onChange(e.target.value);
  }, [onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <textarea
        className="w-full h-full resize-none p-4 text-gray-700 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
          bg-white card-scrollbar"
        value={content}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        placeholder="Enter your text here..."
        style={{ 
          minHeight: '100%',
          lineHeight: '1.5',
          fontSize: '0.95rem'
        }}
      />
    </div>
  );
}
