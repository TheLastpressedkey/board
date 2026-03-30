import React, { useState, useEffect } from 'react';
import { Bot, Plus, MessageSquare, Trash2, Settings, Database } from 'lucide-react';
import { ragClient, Agent, RAGCollection } from '../../../services/ragClient';
import { llmProviderService } from '../../../services/llmProvider';

interface AgentsSectionProps {
  themeColors: any;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function AgentsSection({ themeColors, onError, onSuccess }: AgentsSectionProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [collections, setCollections] = useState<RAGCollection[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [loading, setLoading] = useState(true);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string; sources?: any[] }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadAgents();
    loadCollections();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await ragClient.getAgents();
      setAgents(data);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const data = await ragClient.getCollections();
      setCollections(data);
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleCreateAgent = async (
    name: string,
    description: string,
    model: string,
    systemPrompt: string,
    collectionIds: string[],
    config: any
  ) => {
    try {
      await ragClient.createAgent(name, model, description, systemPrompt, collectionIds, config);
      await loadAgents();
      setShowCreateAgent(false);
      onSuccess('Agent created successfully');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleUpdateAgent = async (
    id: string,
    name: string,
    description: string,
    model: string,
    systemPrompt: string,
    collectionIds: string[],
    config: any
  ) => {
    try {
      await ragClient.updateAgent(id, {
        name,
        description,
        model,
        system_prompt: systemPrompt,
        collection_ids: collectionIds,
        config,
      });
      await loadAgents();
      setEditingAgent(null);
      onSuccess('Agent updated successfully');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await ragClient.deleteAgent(id);
      await loadAgents();
      if (selectedAgent?.id === id) {
        setSelectedAgent(null);
        setView('list');
      }
      onSuccess('Agent deleted successfully');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setChatMessages([]);
    setView('chat');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || sendingMessage) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setSendingMessage(true);

    try {
      const conversationHistory = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await ragClient.chatWithAgent(selectedAgent.id, userMessage, conversationHistory);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        sources: response.sources
      }]);
    } catch (err: any) {
      onError(err.message);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: `${themeColors.primary} transparent` }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          {view === 'list' ? (
            <h3 className="text-lg font-semibold">Agents</h3>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setView('list');
                  setSelectedAgent(null);
                  setChatMessages([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                ← Back
              </button>
              <h3 className="text-lg font-semibold">Chat with {selectedAgent?.name}</h3>
            </div>
          )}
        </div>

        {view === 'list' && (
          <button
            onClick={() => setShowCreateAgent(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Plus className="w-4 h-4" />
            New Agent
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {view === 'list' && (
          <AgentsList
            agents={agents}
            onSelect={handleSelectAgent}
            onEdit={setEditingAgent}
            onDelete={handleDeleteAgent}
            themeColors={themeColors}
          />
        )}

        {view === 'chat' && selectedAgent && (
          <ChatView
            messages={chatMessages}
            inputMessage={inputMessage}
            onInputChange={setInputMessage}
            onSend={handleSendMessage}
            sending={sendingMessage}
            themeColors={themeColors}
          />
        )}
      </div>

      {/* Dialogs */}
      {showCreateAgent && (
        <CreateAgentDialog
          onClose={() => setShowCreateAgent(false)}
          onCreate={handleCreateAgent}
          collections={collections}
          themeColors={themeColors}
        />
      )}

      {editingAgent && (
        <EditAgentDialog
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
          onUpdate={handleUpdateAgent}
          collections={collections}
          themeColors={themeColors}
        />
      )}
    </div>
  );
}

// Agents List Component
function AgentsList({ agents, onSelect, onEdit, onDelete, themeColors }: any) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg mb-2">No agents yet</p>
        <p className="text-sm">Create your first AI agent to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent: Agent) => (
        <div
          key={agent.id}
          className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors"
          onClick={() => onSelect(agent)}
        >
          <div className="flex items-start justify-between mb-3">
            <Bot className="w-8 h-8" style={{ color: themeColors.primary }} />
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(agent);
                }}
                className="text-gray-400 hover:text-blue-400"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(agent.id);
                }}
                className="text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
          {agent.description && (
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{agent.description}</p>
          )}
          <div className="flex flex-col gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>{agent.model}</span>
            </div>
            {agent.collections && agent.collections.length > 0 && (
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3" />
                <span>{agent.collections.length} collection{agent.collections.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Chat View Component
function ChatView({ messages, inputMessage, onInputChange, onSend, sending, themeColors }: any) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Start a conversation</p>
            <p className="text-sm">Ask questions based on the agent's knowledge</p>
          </div>
        )}

        {messages.map((msg: any, idx: number) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${
              msg.role === 'user'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-100'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  <p className="font-semibold mb-2">Sources:</p>
                  {msg.sources.map((source: any, i: number) => (
                    <div key={i} className="mb-1">
                      • {source.document_title} ({(source.similarity * 100).toFixed(1)}%)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2" style={{ borderColor: `${themeColors.primary} transparent` }} />
                <span className="text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Ask a question..."
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          disabled={sending}
        />
        <button
          onClick={onSend}
          disabled={sending || !inputMessage.trim()}
          className="px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: themeColors.primary }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Create Agent Dialog
function CreateAgentDialog({ onClose, onCreate, collections, themeColors }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [topK, setTopK] = useState(5);
  const [threshold, setThreshold] = useState(0.7);
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const configs = await llmProviderService.getAllConfigs();
      setProviders(configs);
      // Auto-select first available model
      const firstModelAvailable = configs
        .flatMap(p => (p.available_models || []).map(m => ({ provider: p.provider, model: m })))
        .find(Boolean);

      if (firstModelAvailable) {
        setModel(firstModelAvailable.model);
      }
    } catch (err) {
      console.error('Error loading providers:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, description, model, systemPrompt, selectedCollections, {
      temperature,
      max_tokens: maxTokens,
      top_k: topK,
      threshold,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold">Create New Agent</h3>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              required
              placeholder="My AI Assistant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              rows={2}
              placeholder="A helpful assistant for..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            {loadingProviders ? (
              <div className="text-sm text-gray-400">Loading models...</div>
            ) : providers.length === 0 ? (
              <div className="text-sm text-red-400">No LLM providers configured. Please add a provider in AI Settings.</div>
            ) : providers.every(p => !p.available_models || p.available_models.length === 0) ? (
              <div className="text-sm text-yellow-400">No models enabled. Please configure models in AI Settings.</div>
            ) : (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                required
              >
                <option value="">Select a model</option>
                {providers.map((provider) =>
                  provider.available_models && provider.available_models.length > 0 ? (
                    <optgroup key={provider.id} label={provider.provider.toUpperCase()}>
                      {provider.available_models.map((modelId) => (
                        <option key={`${provider.id}-${modelId}`} value={modelId}>
                          {modelId}
                        </option>
                      ))}
                    </optgroup>
                  ) : null
                )}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Collections</label>
            {collections.length === 0 ? (
              <div className="text-sm text-gray-400">No collections available. Create a collection first.</div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-800 rounded-lg p-3">
                {collections.map((collection: RAGCollection) => (
                  <label key={collection.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-750 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(collection.id)}
                      onChange={() => handleToggleCollection(collection.id)}
                      className="form-checkbox"
                      style={{ accentColor: themeColors.primary }}
                    />
                    <span className="text-sm">{collection.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">System Prompt (optional)</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              rows={3}
              placeholder="Additional instructions for the agent..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Temperature: {temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: themeColors.primary }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Tokens: {maxTokens}</label>
              <input
                type="number"
                min="100"
                max="4000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Top K: {topK}</label>
              <input
                type="number"
                min="1"
                max="20"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Threshold: {threshold}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: themeColors.primary }}
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: themeColors.primary }}
            disabled={!model || selectedCollections.length === 0}
          >
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Agent Dialog
function EditAgentDialog({ agent, onClose, onUpdate, collections, themeColors }: any) {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description || '');
  const [model, setModel] = useState(agent.model);
  const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt || '');
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    agent.collections?.map((c: any) => c.id) || []
  );
  const [temperature, setTemperature] = useState(agent.config.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(agent.config.max_tokens || 2000);
  const [topK, setTopK] = useState(agent.config.top_k || 5);
  const [threshold, setThreshold] = useState(agent.config.threshold || 0.7);
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const configs = await llmProviderService.getAllConfigs();
      setProviders(configs);
    } catch (err) {
      console.error('Error loading providers:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(agent.id, name, description, model, systemPrompt, selectedCollections, {
      temperature,
      max_tokens: maxTokens,
      top_k: topK,
      threshold,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold">Edit Agent: {agent.name}</h3>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              required
              placeholder="My AI Assistant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              rows={2}
              placeholder="A helpful assistant for..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            {loadingProviders ? (
              <div className="text-sm text-gray-400">Loading models...</div>
            ) : providers.length === 0 ? (
              <div className="text-sm text-red-400">No LLM providers configured. Please add a provider in AI Settings.</div>
            ) : providers.every(p => !p.available_models || p.available_models.length === 0) ? (
              <div className="text-sm text-yellow-400">No models enabled. Please configure models in AI Settings.</div>
            ) : (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                required
              >
                <option value="">Select a model</option>
                {providers.map((provider) =>
                  provider.available_models && provider.available_models.length > 0 ? (
                    <optgroup key={provider.id} label={provider.provider.toUpperCase()}>
                      {provider.available_models.map((modelId) => (
                        <option key={`${provider.id}-${modelId}`} value={modelId}>
                          {modelId}
                        </option>
                      ))}
                    </optgroup>
                  ) : null
                )}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Collections</label>
            {collections.length === 0 ? (
              <div className="text-sm text-gray-400">No collections available. Create a collection first.</div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-800 rounded-lg p-3">
                {collections.map((collection: RAGCollection) => (
                  <label key={collection.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-750 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(collection.id)}
                      onChange={() => handleToggleCollection(collection.id)}
                      className="form-checkbox"
                      style={{ accentColor: themeColors.primary }}
                    />
                    <span className="text-sm">{collection.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">System Prompt (optional)</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              rows={4}
              placeholder="You are a helpful assistant..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Temperature: {temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: themeColors.primary }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Tokens</label>
              <input
                type="number"
                min="100"
                max="8000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Top K: {topK}</label>
              <input
                type="number"
                min="1"
                max="20"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Threshold: {threshold}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: themeColors.primary }}
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: themeColors.primary }}
            disabled={!model || selectedCollections.length === 0}
          >
            Update Agent
          </button>
        </div>
      </div>
    </div>
  );
}
