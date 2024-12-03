import React, { useState, useEffect } from 'react';
import { X, Settings, RefreshCcw } from 'lucide-react';
import { RSSFeed } from './types';
import { RSSSettings } from './RSSSettings';
import { RSSFeedList } from './RSSFeedList';
import { useRSSFeeds } from './useRSSFeeds';
import { useTheme } from '../../../contexts/ThemeContext';

interface RSSReaderProps {
  onClose: () => void;
  metadata?: { feeds?: string[] };
  onDataChange?: (data: { feeds: string[] }) => void;
}

export function RSSReader({ onClose, metadata, onDataChange }: RSSReaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { themeColors } = useTheme();
  const { feeds, addFeed, removeFeed, refreshFeeds } = useRSSFeeds(
    metadata?.feeds || ['https://www.lemonde.fr/rss/une.xml']
  );

  const handleAddFeed = async (url: string) => {
    await addFeed(url);
    if (onDataChange) {
      onDataChange({ feeds: [...feeds.map(f => f.url), url] });
    }
  };

  const handleRemoveFeed = (url: string) => {
    removeFeed(url);
    if (onDataChange) {
      onDataChange({ feeds: feeds.map(f => f.url).filter(u => u !== url) });
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshFeeds();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex justify-between items-center px-4 py-2"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <span className="text-sm font-medium text-gray-300">RSS Reader</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-1 hover:bg-gray-700 rounded-full ${isLoading ? 'animate-spin' : ''}`}
            disabled={isLoading}
          >
            <RefreshCcw className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <RSSFeedList 
          feeds={feeds}
          themeColors={themeColors}
        />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <RSSSettings
          feeds={feeds.map(f => f.url)}
          onAddFeed={handleAddFeed}
          onRemoveFeed={handleRemoveFeed}
          onClose={() => setShowSettings(false)}
          themeColors={themeColors}
        />
      )}
    </div>
  );
}