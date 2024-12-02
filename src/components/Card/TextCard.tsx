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
    <div className="h-full p-3">
      <textarea
        className="w-full h-full resize-none border-none focus:outline-none focus:ring-1 focus:ring-pink-500 rounded p-2 text-gray-800 bg-transparent"
        value={content}
        onChange={handleChange}
        placeholder="Enter your text here..."
        onMouseDown={handleMouseDown}
        style={{ minHeight: 'calc(100% - 16px)' }}
      />
    </div>
  );
}