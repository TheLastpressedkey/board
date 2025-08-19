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
}

export function RSSSettings({ feeds, onAddFeed, onRemoveFeed, onClose, themeColors, onForceResetRateLimit }: RSSSettingsProps) {
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

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div 
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: themeColors.menuBg }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">RSS Feed Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Rate Limit Information */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Rate Limit Status</span>
            <button
              onClick={() => setShowRateLimitInfo(!showRateLimitInfo)}
              className="p-1 hover:bg-gray-700 rounded-full"
            >
              <Info className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="text-xs text-gray-400">
            {rateLimitStatus.requestsUsed}/{rateLimitStatus.maxRequests} requests used
            {rateLimitStatus.isRateLimited && (
              <span className="text-red-400 ml-2">
                (Reset in {rateLimitStatus.timeUntilReset}m)
              </span>
            )}
          </div>

          {showRateLimitInfo && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-500">
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
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-white flex items-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
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
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg group"
            >
              <span className="text-gray-300 text-sm truncate flex-1 mr-2">{feed}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFeed(feed);
                }}
                className="p-1 hover:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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