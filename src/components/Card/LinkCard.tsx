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
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(content, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="h-full flex flex-col p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      {metadata?.image && (
        <div className="flex-shrink-0 relative pb-[50%] mb-3">
          <img 
            src={metadata.image} 
            alt={metadata.title || 'Link preview'} 
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            draggable={false}
          />
        </div>
      )}
      <div className="flex-1 min-h-0 flex flex-col">
        {metadata?.title && (
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
            {metadata.title}
          </h3>
        )}
        {metadata?.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {metadata.description}
          </p>
        )}
        <span className="text-sm text-pink-500 hover:text-pink-600 truncate mt-auto">
          {content}
        </span>
      </div>
    </div>
  );
}
