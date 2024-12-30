import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { isYoutubeUrl, getYoutubeVideoId } from '../../utils/youtubeUtils';

interface LinkCardContentProps {
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export function LinkCardContent({ content, metadata }: LinkCardContentProps) {
  const [showVideo, setShowVideo] = useState(false);
  const isYoutube = isYoutubeUrl(content);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVideo(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showVideo) {
      window.open(content, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="h-full flex flex-col p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      {showVideo && isYoutube ? (
        <div className="flex-shrink-0 relative pb-[56.25%] mb-3">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${getYoutubeVideoId(content)}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : metadata?.image && (
        <div className="flex-shrink-0 relative pb-[50%] mb-3">
          <img 
            src={metadata.image} 
            alt={metadata.title || 'Link preview'} 
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            draggable={false}
          />
          {isYoutube && (
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors rounded-lg group"
            >
              <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="white" />
            </button>
          )}
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
