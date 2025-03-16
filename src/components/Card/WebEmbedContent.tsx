import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface WebEmbedContentProps {
  url: string;
}

export function WebEmbedContent({ url }: WebEmbedContentProps) {
  return (
    <div className="h-full overflow-hidden">
      <div className="w-full h-full overflow-auto settings-scrollbar">
        <iframe
          src={url}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          loading="lazy"
        />
      </div>
    </div>
  );
}
