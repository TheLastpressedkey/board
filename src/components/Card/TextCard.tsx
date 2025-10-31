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

  return (
    <div className="h-full flex flex-col bg-black">
      <textarea
        className="w-full h-full resize-none p-4 text-white placeholder-gray-600
          focus:outline-none bg-black card-scrollbar font-mono"
        value={content}
        onChange={handleChange}
        placeholder="Entrez votre texte ici..."
        style={{
          minHeight: '100%',
          lineHeight: '1.6',
          fontSize: '0.95rem'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}