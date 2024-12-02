import React from 'react';

interface LinkCardContentProps {
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export function LinkCardContent({ content, metadata }: LinkCardContentProps) {
  return (
    <div className="h-full flex flex-col p-3 overflow-hidden">
      {metadata?.image && (
        <div className="flex-shrink-0 relative pb-[50%] mb-3">
          <img 
            src={metadata.image} 
            alt={metadata.title || 'Link preview'} 
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {metadata?.title && (
          <h3 className="font-medium text-gray-900 line-clamp-2">{metadata.title}</h3>
        )}
        {metadata?.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{metadata.description}</p>
        )}
        <a 
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-pink-500 hover:text-pink-600 truncate block"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {content}
        </a>
      </div>
    </div>
  );
}