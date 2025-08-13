import React, { useState } from 'react';
import { X } from 'lucide-react';
import { isValidUrl } from '../../utils/linkUtils';
import { useTheme } from '../../contexts/ThemeContext';

interface WebEmbedInputProps {
  onSubmit: (url: string, title?: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function WebEmbedInput({ onSubmit, onClose, position }: WebEmbedInputProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const { themeColors } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }
    onSubmit(url, title.trim() || undefined);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="fixed bg-gray-800 rounded-lg shadow-xl p-4 w-96"
        style={{ left: position.x, top: position.y }}
      >
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-white mb-4">Add Web Embed</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                placeholder="Enter website URL"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                autoFocus
              />
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter custom title"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white rounded-lg"
              style={{ backgroundColor: themeColors.primary }}
            >
              Add Embed
            </button>
          </div>
        </form>
      </div>
    </>
  );
}