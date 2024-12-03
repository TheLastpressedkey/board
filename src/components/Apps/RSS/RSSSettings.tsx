import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { isValidUrl } from '../../../utils/linkUtils';

interface RSSSettingsProps {
  feeds: string[];
  onAddFeed: (url: string) => void;
  onRemoveFeed: (url: string) => void;
  onClose: () => void;
  themeColors: any;
}

export function RSSSettings({ feeds, onAddFeed, onRemoveFeed, onClose, themeColors }: RSSSettingsProps) {
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [error, setError] = useState('');

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