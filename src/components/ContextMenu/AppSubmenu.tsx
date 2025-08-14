import React from 'react';
import { Calculator, Table, FolderOpen } from 'lucide-react';

interface AppSubmenuProps {
  x: number;
  y: number;
  onSelect: (appType: string) => void;
  onClose: () => void;
}

export function AppSubmenu({ x, y, onSelect, onClose }: AppSubmenuProps) {
  const apps = [
    { id: 'calculator', icon: Calculator, label: 'Calculator' },
    { id: 'table', icon: Table, label: 'Table' },
    { id: 'file-manager', icon: FolderOpen, label: 'File Manager' }
  ];

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="fixed bg-gray-800 rounded-lg shadow-xl py-2 w-48"
        style={{ 
          left: x + 256, // Position next to main menu
          top: y 
        }}
      >
        {apps.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-700 text-white text-left"
            onClick={() => onSelect(id)}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}