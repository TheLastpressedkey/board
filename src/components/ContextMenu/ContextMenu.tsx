import React from 'react';
import { Type, Monitor, Box, Cpu, Palette, Command } from 'lucide-react';
import { ContentType } from '../../types';

interface ContextMenuProps {
  x: number;
  y: number;
  onSelect: (type: ContentType) => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, onSelect, onClose }: ContextMenuProps) {
  const menuItems = [
    { type: 'text' as ContentType, icon: Type, label: 'Text' },
    { type: 'embed' as ContentType, icon: Monitor, label: 'Web Embed' },
    { type: 'app' as ContentType, icon: Box, label: 'Installed App' },
    { type: 'ai' as ContentType, icon: Cpu, label: 'Create an App with AI' },
    { type: 'theme' as ContentType, icon: Palette, label: 'Theme' },
    { type: 'shortcut' as ContentType, icon: Command, label: 'Shortcut' },
  ];

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
            onClick={() => onSelect(type)}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}