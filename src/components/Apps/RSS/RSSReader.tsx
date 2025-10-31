import { useState } from 'react';
import { Settings, RefreshCcw, AlertCircle, Clock, GripHorizontal, X } from 'lucide-react';
import { RSSSettings } from './RSSSettings';
import { RSSFeedList } from './RSSFeedList';
import { useRSSFeeds } from './useRSSFeeds';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';

interface RSSReaderProps {
  onClose: () => void;
  metadata?: { feeds?: string[] };
  onDataChange?: (data: { feeds: string[] }) => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function RSSReader({ metadata, onDataChange, onClose, onDragStart }: RSSReaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';
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

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgb(55, 65, 81)';
  const iconColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;
  const hoverBg = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)';

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      {/* Header with controls and rate limit info */}
      <div
        className="p-3"
        style={{ backgroundColor: bgHeader, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex justify-between items-center mb-2">
          <div
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5" style={{ color: textMuted }} />
            <h3
              className="font-medium"
              style={{ color: iconColor }}
            >
              RSS Reader
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-1 rounded-full transition-colors ${
                isLoading ? 'animate-spin' : ''
              } ${isRateLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading || isRateLimited}
              title={isRateLimited ? 'Rate limit exceeded' : 'Refresh feeds'}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ color: textMuted }}
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1 rounded-full transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              style={{ color: textMuted }}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              style={{ color: textMuted }}
            >
              <X className="w-4 h-4" />
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
              <div className="flex items-center gap-1" style={{ color: isTerminalTheme ? 'rgb(255, 255, 255)' : 'rgb(34, 197, 94)' }}>
                <Clock className="w-3 h-3" />
                <span>{rateLimitInfo.requestsRemaining} requests left</span>
              </div>
            )}
          </div>
          <div style={{ color: textMuted }}>
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
          <div
            className="mt-2 p-2 rounded text-xs text-red-300"
            style={{
              backgroundColor: 'rgba(127, 29, 29, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            Too many requests. Please wait {rateLimitInfo.timeUntilReset} minutes before making new requests.
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <RSSFeedList
          feeds={feeds}
          themeColors={themeColors}
          isTerminalTheme={isTerminalTheme}
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
          isTerminalTheme={isTerminalTheme}
        />
      )}
    </div>
  );
}