import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Eye, EyeOff, RefreshCw, Settings } from 'lucide-react';
import { llmProviderService, LLMProviderType, LLMProviderConfig } from '../../services/llmProvider';
import { llmModelsService, LLMModel } from '../../services/llmModels';

interface LLMProviderManagerProps {
  themeColors: any;
  onSave: () => void;
  onError: (message: string) => void;
}

const providerInfo = {
  openai: {
    name: 'OpenAI',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    placeholder: 'sk-...'
  },
  anthropic: {
    name: 'Anthropic',
    icon: 'https://www.anthropic.com/favicon.ico',
    placeholder: 'sk-ant-...'
  },
  google: {
    name: 'Google Gemini',
    icon: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png',
    placeholder: 'AIza...'
  }
};

export function LLMProviderManager({ themeColors, onSave, onError }: LLMProviderManagerProps) {
  const [providers, setProviders] = useState<LLMProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [managingModels, setManagingModels] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [newProvider, setNewProvider] = useState<{
    provider: LLMProviderType;
    apiKey: string;
  }>({
    provider: 'openai',
    apiKey: ''
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await llmProviderService.getAllConfigs();
      setProviders(data);
    } catch (error) {
      console.error('Error loading LLM providers:', error);
      onError('Failed to load LLM providers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProvider.apiKey.trim()) {
      onError('API key is required');
      return;
    }

    try {
      // Check if provider already exists
      const existingProvider = providers.find(p => p.provider === newProvider.provider);
      if (existingProvider) {
        onError(`${providerInfo[newProvider.provider].name} is already configured`);
        return;
      }

      // Verify API key by loading models
      setLoadingModels(true);
      const models = await llmModelsService.fetchModels(newProvider.provider, newProvider.apiKey);

      if (models.length === 0) {
        onError('No models found. Please check your API key.');
        return;
      }

      // Add provider with empty available_models (user will select later)
      await llmProviderService.addConfig({
        provider: newProvider.provider,
        apiKey: newProvider.apiKey,
        available_models: [],
        isActive: providers.length === 0 // First provider is active by default
      });

      await loadProviders();
      setShowAddForm(false);
      setNewProvider({
        provider: 'openai',
        apiKey: ''
      });
      onSave();
    } catch (error: any) {
      console.error('Error adding provider:', error);
      onError(error.message || 'Failed to add provider. Please check your API key.');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleManageModels = async (provider: LLMProviderConfig) => {
    setManagingModels(provider.id!);
    setLoadingModels(true);
    setSelectedModels(provider.available_models || []);

    try {
      const models = await llmModelsService.fetchModels(provider.provider, provider.apiKey);
      setAvailableModels(models);
    } catch (error: any) {
      console.error('Error loading models:', error);
      onError(error.message || 'Failed to load models');
      setManagingModels(null);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleToggleModel = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const handleSaveModels = async () => {
    if (!managingModels) return;

    try {
      await llmProviderService.updateConfig(managingModels, {
        available_models: selectedModels
      });

      await loadProviders();
      setManagingModels(null);
      setAvailableModels([]);
      setSelectedModels([]);
      onSave();
    } catch (error) {
      console.error('Error saving models:', error);
      onError('Failed to save models');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await llmProviderService.setActiveProvider(id);
      await loadProviders();
      onSave();
    } catch (error) {
      console.error('Error setting active provider:', error);
      onError('Failed to set active provider');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) {
      return;
    }

    try {
      await llmProviderService.deleteConfig(id);
      await loadProviders();
      onSave();
    } catch (error) {
      console.error('Error deleting provider:', error);
      onError('Failed to delete provider');
    }
  };

  const toggleShowApiKey = (id: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: `${themeColors.primary} transparent` }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">LLM Providers</h3>
        <p className="text-sm text-gray-400 mb-4">
          Configure your AI provider API keys. Your keys are stored securely and used only for your requests.
        </p>

        {providers.length > 0 && (
          <div className="space-y-3 mb-4">
            {providers.map(provider => (
              <div
                key={provider.id}
                className={`bg-gray-800/50 rounded-lg p-4 border-2 transition-colors ${
                  provider.isActive
                    ? 'border-green-500/50'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={providerInfo[provider.provider].icon}
                    alt={providerInfo[provider.provider].name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">
                        {providerInfo[provider.provider].name}
                      </h4>
                      {provider.isActive && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">API Key:</span>
                        <code className="text-xs text-gray-300 font-mono">
                          {showApiKeys[provider.id!] ? provider.apiKey : maskApiKey(provider.apiKey)}
                        </code>
                        <button
                          onClick={() => toggleShowApiKey(provider.id!)}
                          className="text-gray-400 hover:text-white"
                        >
                          {showApiKeys[provider.id!] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {provider.available_models && provider.available_models.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Models:</span>
                          <span className="text-xs text-gray-300">
                            {provider.available_models.length} active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleManageModels(provider)}
                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 bg-gray-700"
                    >
                      <Settings className="w-3 h-3 inline mr-1" />
                      Manage Models
                    </button>
                    {!provider.isActive && (
                      <button
                        onClick={() => handleSetActive(provider.id!)}
                        className="px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90"
                        style={{ backgroundColor: themeColors.primary }}
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProvider(provider.id!)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Provider</span>
          </button>
        )}

        {showAddForm && (
          <form onSubmit={handleAddProvider} className="bg-gray-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Add New Provider</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Provider
              </label>
              <select
                value={newProvider.provider}
                onChange={(e) => {
                  const provider = e.target.value as LLMProviderType;
                  setNewProvider({
                    provider,
                    apiKey: ''
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              >
                {Object.entries(providerInfo).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={newProvider.apiKey}
                onChange={(e) => setNewProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                placeholder={providerInfo[newProvider.provider].placeholder}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Your API key will be verified and you can configure models after adding the provider.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingModels}
                className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: themeColors.primary }}
              >
                {loadingModels ? 'Verifying...' : 'Add Provider'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Model Management Modal */}
      {managingModels && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold">Manage Models</h3>
              <p className="text-sm text-gray-400 mt-1">
                Select which models you want to use with this provider
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingModels ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: `${themeColors.primary} transparent` }} />
                </div>
              ) : availableModels.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No models available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableModels.map(model => (
                    <label
                      key={model.id}
                      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.id)}
                        onChange={() => handleToggleModel(model.id)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: themeColors.primary }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{model.name}</div>
                        {model.description && (
                          <div className="text-xs text-gray-400 mt-0.5">{model.description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setManagingModels(null);
                    setAvailableModels([]);
                    setSelectedModels([]);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModels}
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  Save Models
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {providers.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No LLM providers configured yet.</p>
          <p className="text-xs mt-2">Add a provider to start using AI features.</p>
        </div>
      )}
    </div>
  );
}
