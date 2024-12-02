import React from 'react';
import { Calculator, Table, X, Search, Plus, Clock } from 'lucide-react';

interface AppStoreProps {
  onSelect: (appType: string) => void;
  onClose: () => void;
}

interface AppInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  author: string;
}

export function AppStore({ onSelect, onClose }: AppStoreProps) {
  const apps: AppInfo[] = [
    {
      id: 'calculator',
      name: 'Calculator',
      description: 'A powerful calculator with basic and scientific functions',
      icon: Calculator,
      category: 'Tools',
      author: 'Core Apps'
    },
    {
      id: 'clock',
      name: 'Clock',
      description: 'Display current time and date with a beautiful interface',
      icon: Clock,
      category: 'Tools',
      author: 'Core Apps'
    },
    {
      id: 'table',
      name: 'Table',
      description: 'Create and manage data with customizable tables',
      icon: Table,
      category: 'Productivity',
      author: 'Core Apps'
    }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl h-[80vh] bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">App Store</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search apps..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onSelect(app.id);
                  onClose();
                }}
                className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors group text-left"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <app.icon className="w-6 h-6 text-pink-500" />
                  </div>
                  {/* Install button that appears on hover */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{app.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{app.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                      {app.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      by {app.author}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
