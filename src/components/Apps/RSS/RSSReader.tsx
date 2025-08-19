import { useState } from 'react';
import { Settings, RefreshCcw, AlertCircle, Clock } from 'lucide-react';
import { RSSSettings } from './RSSSettings';
import { RSSFeedList } from './RSSFeedList';
import { useRSSFeeds } from './useRSSFeeds';
import { useTheme } from '../../../contexts/ThemeContext';

interface RSSReaderProps {
  onClose: () => void;
  metadata?: { feeds?: string[] };
  onDataChange?: (data: { feeds: string[] }) => void;
}

export function RSSReader({ metadata, onDataChange }: RSSReaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { themeColors } = useTheme();
  const { feeds, addFeed, removeFeed, refreshFeeds, isRateLimited, getRateLimitInfo, forceResetRateLimit } = useRSSFeeds(
    metadata?.feeds || ['https://www.lemonde.fr/rss/une.xml']
  );

  const rateLimitInfo = getRateLimitInfo();

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
    if (isRateLimited) {
      return;
    }
    
    setIsLoading(true);
    try {
      await refreshFeeds();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header with controls and rate limit info */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-medium">RSS Reader</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-1 hover:bg-gray-700 rounded-full transition-colors ${
                isLoading ? 'animate-spin' : ''
              } ${isRateLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading || isRateLimited}
              title={isRateLimited ? 'Rate limit exceeded' : 'Refresh feeds'}
            >
              <RefreshCcw className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Rate limit indicator */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isRateLimited ? (
              <div className="flex items-center gap-1 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span>Rate limited</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-400">
                <Clock className="w-3 h-3" />
                <span>{rateLimitInfo.requestsRemaining} requests left</span>
              </div>
            )}
          </div>
          <div className="text-gray-500">
            {rateLimitInfo.requestsUsed}/{rateLimitInfo.maxRequests}
            {isRateLimited && (
              <span className="ml-2">
                Reset in {rateLimitInfo.timeUntilReset}m
              </span>
            )}
          </div>
        </div>

        {/* Rate limit warning */}
        {isRateLimited && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded text-xs text-red-300">
            Too many requests. Please wait {rateLimitInfo.timeUntilReset} minutes before making new requests.
          </div>
        )}
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
          onForceResetRateLimit={forceResetRateLimit}
        />
      )}
    </div>
  );
}