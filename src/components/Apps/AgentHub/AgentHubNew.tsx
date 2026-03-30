import React, { useState } from 'react';
import { Database, Bot } from 'lucide-react';
import { AppHeader } from '../../Common/Headers/AppHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { CollectionsSection } from './CollectionsSection';
import { AgentsSection } from './AgentsSection';

interface AgentHubProps {
  onClose?: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

type TabType = 'collections' | 'agents';

export function AgentHub({ onClose, onDragStart, onTogglePin, isPinned }: AgentHubProps) {
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('agents');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const tabs = [
    { id: 'agents' as TabType, name: 'Agents', icon: Bot },
    { id: 'collections' as TabType, name: 'Collections', icon: Database },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <AppHeader
        title="Agent Hub"
        subtitle="Manage your AI agents and knowledge bases"
        icon={Database}
        onClose={onClose}
        onDragStart={onDragStart}
        onTogglePin={onTogglePin}
        isPinned={isPinned}
      />

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className={`px-4 py-3 text-sm ${
          error ? 'bg-red-500/10 text-red-400 border-b border-red-500/20' : 'bg-green-500/10 text-green-400 border-b border-green-500/20'
        }`}>
          {error || success}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {activeTab === 'collections' && (
          <CollectionsSection
            themeColors={themeColors}
            onError={(msg) => showMessage(msg, true)}
            onSuccess={(msg) => showMessage(msg, false)}
          />
        )}

        {activeTab === 'agents' && (
          <AgentsSection
            themeColors={themeColors}
            onError={(msg) => showMessage(msg, true)}
            onSuccess={(msg) => showMessage(msg, false)}
          />
        )}
      </div>
    </div>
  );
}
