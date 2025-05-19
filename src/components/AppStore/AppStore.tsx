import React, { useState } from 'react';
import { Calculator, Table, X, Search, Plus, Clock, ListTodo, Calendar, Rss, Activity, Layout, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { themeColors } = useTheme();

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
      id: 'todolist',
      name: 'Todo List',
      description: 'Stay organized with a simple and elegant todo list',
      icon: ListTodo,
      category: 'Productivity',
      author: 'Core Apps'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Manage your schedule with a beautiful calendar interface',
      icon: Calendar,
      category: 'Productivity',
      author: 'Core Apps'
    },
    {
      id: 'rss',
      name: 'RSS Reader',
      description: 'Stay updated with your favorite news sources and blogs',
      icon: Rss,
      category: 'News',
      author: 'Core Apps'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View detailed statistics and insights about your workspace',
      icon: Activity,
      category: 'Analytics',
      author: 'Core Apps'
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      description: 'Organize and track tasks with a flexible Kanban board',
      icon: Layout,
      category: 'Productivity',
      author: 'Core Apps'
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Send emails using your configured SMTP settings',
      icon: Mail,
      category: 'Communication',
      author: 'Core Apps'
    }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl h-[80vh] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-white">App Store</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search apps..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              autoFocus
            />
          </div>
        </div>

        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto p-6 card-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onSelect(app.id);
                  onClose();
                }}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-700/50 transition-colors group text-left"
              >
                <div className="relative">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${themeColors.primary}20` }}
                  >
                    <app.icon 
                      className="w-6 h-6"
                      style={{ color: themeColors.primary }}
                    />
                  </div>
                  {/* Install button that appears on hover */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{app.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{app.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-800/50 rounded-full text-gray-300">
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
