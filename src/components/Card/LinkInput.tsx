import React, { useState, useRef, useEffect } from 'react';
import { isValidUrl } from '../../utils/linkUtils';

interface LinkInputProps {
  onSubmit: (url: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function LinkInput({ onSubmit, onClose, position }: LinkInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    onSubmit(url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="fixed bg-gray-800 rounded-lg shadow-xl p-4 w-96"
        style={{ left: position.x, top: position.y }}
      >
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
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
              className="px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </>
  );
}