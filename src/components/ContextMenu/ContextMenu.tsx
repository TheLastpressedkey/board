import React, { useState } from 'react';
import { Type, Monitor, Box, Cpu, Palette, Command } from 'lucide-react';
import { ContentType } from '../../types';
import { AppStore } from '../AppStore/AppStore';

interface ContextMenuProps {
  x: number;
  y: number;
  onSelect: (type: ContentType) => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, onSelect, onClose }: ContextMenuProps) {
  const [showAppStore, setShowAppStore] = useState(false);

  const menuItems = [
    { type: 'text' as ContentType, icon: Type, label: 'Text' },
    { type: 'embed' as ContentType, icon: Monitor, label: 'Web Embed' },
    { type: 'app' as ContentType, icon: Box, label: 'Install App' },
    { type: 'userapp' as ContentType, icon: Cpu, label: 'Create an App' },
    { type: 'theme' as ContentType, icon: Palette, label: 'Theme' },
    { type: 'shortcut' as ContentType, icon: Command, label: 'Shortcut' },
  ];

  const handleItemClick = (type: ContentType) => {
    if (type === 'app') {
      setShowAppStore(true);
    } else {
      onSelect(type);
      onClose();
    }
  };

  const handleAppSelect = (appType: string) => {
    onSelect(`app-${appType}` as ContentType);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="fixed bg-gray-800 rounded-lg shadow-xl py-2 w-64"
        style={{ left: x, top: y }}
      >
        {menuItems.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-700 text-white text-left"
            onClick={() => handleItemClick(type)}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      {showAppStore && (
        <AppStore
          onSelect={handleAppSelect}
          onClose={() => setShowAppStore(false)}
        />
      )}
    </>
  );
}
