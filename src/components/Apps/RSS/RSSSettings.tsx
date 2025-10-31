import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Info } from 'lucide-react';
import { isValidUrl } from '../../../utils/linkUtils';
import { rateLimitStorage } from './rateLimitStorage';

interface RSSSettingsProps {
  feeds: string[];
  onAddFeed: (url: string) => void;
  onRemoveFeed: (url: string) => void;
  onClose: () => void;
  themeColors: any;
  onForceResetRateLimit?: () => void;
  isTerminalTheme: boolean;
}

export function RSSSettings({ feeds, onAddFeed, onRemoveFeed, onClose, themeColors, onForceResetRateLimit, isTerminalTheme }: RSSSettingsProps) {
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [error, setError] = useState('');
  const [showRateLimitInfo, setShowRateLimitInfo] = useState(false);

  const rateLimitStatus = rateLimitStorage.getStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newFeedUrl.trim()) {
      setError('Please enter a URL');
      return;
    }
    if (!isValidUrl(newFeedUrl)) {
      setError('Please enter a valid URL');
      return;
    }
    onAddFeed(newFeedUrl);
    setNewFeedUrl('');
    setError('');
  };

  const handleResetRateLimit = () => {
    if (window.confirm('Are you sure you want to reset the rate limit? This will allow new requests immediately.')) {
      rateLimitStorage.forceReset();
      if (onForceResetRateLimit) {
        onForceResetRateLimit();
      }
      setShowRateLimitInfo(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const bgModal = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgInput = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(55, 65, 81)';
  const bgItem = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 65, 81, 0.5)';
  const bgSection = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 41, 55, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(209, 213, 219)';
  const textSecondary = isTerminalTheme ? 'rgba(255, 255, 255, 0.4)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;
  const hoverBg = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{
          backgroundColor: bgModal,
          border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: textColor }}>RSS Feed Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rate Limit Information */}
        <div
          className="mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: bgSection,
            border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: textMuted }}>Rate Limit Status</span>
            <button
              onClick={() => setShowRateLimitInfo(!showRateLimitInfo)}
              className="p-1 rounded-full"
              style={{ color: textMuted }}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs" style={{ color: textSecondary }}>
            {rateLimitStatus.requestsUsed}/{rateLimitStatus.maxRequests} requests used
            {rateLimitStatus.isRateLimited && (
              <span className="text-red-400 ml-2">
                (Reset in {rateLimitStatus.timeUntilReset}m)
              </span>
            )}
          </div>

          {showRateLimitInfo && (
            <div className="mt-3 space-y-2">
              <div className="text-xs" style={{ color: textSecondary }}>
                Window: {rateLimitStatus.windowStart.toLocaleTimeString()} - {rateLimitStatus.windowEnd.toLocaleTimeString()}
              </div>
              <button
                onClick={handleResetRateLimit}
                className="flex items-center gap-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Limit
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-4" onClick={e => e.stopPropagation()}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeedUrl}
              onChange={(e) => {
                e.stopPropagation();
                setNewFeedUrl(e.target.value);
                setError('');
              }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              placeholder="Enter RSS feed URL"
              className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg flex items-center gap-2"
              style={{
                backgroundColor: primaryColor,
                color: isTerminalTheme ? 'rgb(0, 0, 0)' : 'white'
              }}
              onClick={e => e.stopPropagation()}
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        <div className="space-y-2">
          {feeds.map((feed) => (
            <div
              key={feed}
              className="flex items-center justify-between p-3 rounded-lg group"
              style={{
                backgroundColor: bgItem,
                border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
              }}
            >
              <span className="text-sm truncate flex-1 mr-2" style={{ color: textMuted }}>{feed}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFeed(feed);
                }}
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}