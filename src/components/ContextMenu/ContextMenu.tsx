import React, { useState } from 'react';
import { Type, Monitor, Box, Cpu, Command } from 'lucide-react';
import { ContentType } from '../../types';
import { AppStore } from '../AppStore/AppStore';

// Constants pour éviter la sidebar - augmentés
const SIDEBAR_WIDTH = 100;
const MIN_MENU_X = 150; // Position minimale pour le menu contextuel

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

  // Forcer la position du menu contextuel pour éviter qu'il soit trop près de la sidebar
  const adjustedX = x < MIN_MENU_X ? MIN_MENU_X : x;

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="fixed bg-gray-800 rounded-lg shadow-xl py-2 w-64"
        style={{ left: adjustedX, top: y }}
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
