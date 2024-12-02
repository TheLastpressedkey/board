import React, { useState } from 'react';
import { X } from 'lucide-react';

interface UserSettingsProps {
  username: string;
  onUpdateUsername: (newUsername: string) => void;
  onClose: () => void;
}

export function UserSettings({ username, onUpdateUsername, onClose }: UserSettingsProps) {
  const [newUsername, setNewUsername] = useState(username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      onUpdateUsername(newUsername.trim());
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-lg p-6 shadow-xl z-50 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">User Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter username"
            />
          </div>

          <div className="flex justify-end gap-2">
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
