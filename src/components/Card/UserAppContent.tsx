import React, { useCallback } from 'react';
import { useUserApp } from '../../hooks/useUserApp';

interface UserAppContentProps {
  content: string;
  onChange: (content: string) => void;
  isEditing: boolean;
}

export function UserAppContent({ content, onChange, isEditing }: UserAppContentProps) {
  const { renderedContent } = useUserApp(content);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="h-full flex flex-col">
      {isEditing ? (
        /* Code Editor */
        <textarea
          className="w-full h-full resize-none p-4 font-mono text-sm text-gray-700
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
            bg-gray-50 card-scrollbar"
          value={content}
          onChange={handleChange}
          placeholder="Enter your HTML code here..."
          spellCheck={false}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        /* Preview */
        <div 
          className="w-full h-full overflow-auto card-scrollbar"
          style={{ padding: '16px' }}
        >
          <div 
            className="preview-container w-full h-full"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>
      )}
    </div>
  );
}