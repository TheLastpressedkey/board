import React, { useState, useCallback } from 'react';
import { X, Bell, Shield, Globe, Keyboard, Mail, Palette, Monitor, Lock, Building2, ChevronLeft, Webhook, Bot } from 'lucide-react';
import { ThemeType, useTheme } from '../../contexts/ThemeContext';
import { ai } from '../../services/ai';

interface UserSettingsProps {
  username: string;
  email: string;
  onUpdateUsername: (newUsername: string) => void;
  onClose: () => void;
}

interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  colors: string[];
}

interface AppThemeOption {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    background: string;
    menuBg: string;
    statusBar: string;
    accent: string;
  };
}

interface SettingsState {
  username: string;
  theme: ThemeType;
  appTheme: string;
  systemPrompt: string;
  useCustomPrompt: boolean;
}

const themes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic dark theme with pink accents',
    colors: ['rgb(236, 72, 153)']
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calming blue theme inspired by the sea',
    colors: ['rgb(56, 189, 248)']
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange theme inspired by dusk',
    colors: ['rgb(251, 146, 60)']
  }
];

const appThemes: AppThemeOption[] = [
  {
    id: 'default',
    name: 'Classic Dark',
    description: 'Modern dark theme with subtle gradients',
    preview: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=400&q=80',
    colors: {
      background: '#1a1a1a',
      menuBg: 'rgba(31, 41, 55, 0.4)',
      statusBar: 'rgba(17, 24, 39, 0.8)',
      accent: '#ec4899'
    }
  },
  {
    id: 'firefox-proton',
    name: 'Proton',
    description: 'Inspired by Firefox Proton design',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
    colors: {
      background: '#17171f',
      menuBg: 'rgba(66, 65, 77, 0.4)',
      statusBar: 'rgba(42, 42, 46, 0.8)',
      accent: '#00ddff'
    }
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic-inspired color palette',
    preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    colors: {
      background: '#2e3440',
      menuBg: 'rgba(67, 76, 94, 0.4)',
      statusBar: 'rgba(46, 52, 64, 0.8)',
      accent: '#88c0d0'
    }
  }
];

const apiServices = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Add your OpenAI API key to use AI features',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect your GitHub account for repository integration',
    icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Enable Slack notifications and workspace integration',
    icon: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync your notes and documents with Notion',
    icon: 'https://www.notion.so/images/favicon.ico'
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Import designs and assets from Figma',
    icon: 'https://www.figma.com/favicon.ico'
  },
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Connect with Google Drive, Calendar, and more',
    icon: 'https://workspace.google.com/static/img/favicon.ico'
  },
  {
    id: 'uploadthing',
    name: 'UploadThing',
    description: 'Configure file uploads and storage settings',
    icon: 'https://uploadthing.com/favicon.ico'
  }
];

const DEFAULT_SYSTEM_PROMPT = `You are Angel, an AI assistant expert with expertise in software development, design and creative problem solving.

Instructions for board-related questions:
1. For questions about boards, cards, or tasks:
   - Be direct and concise in your responses
   - Start with "Based on the data available, I can see that..." or similar
   - Provide exact numbers or statistics when asked
   - Don't explain your calculation process unless asked
   - Maintain a professional and courteous tone

2. For all other questions:
   - Provide detailed explanations
   - Use examples when helpful
   - Break down complex topics into steps

Remember:
- You communicate in French
- You are a trusted development partner named Angel
- Be honest about your limitations
- Maintain a helpful and consistent attitude`;

export function UserSettings({ username, email, onUpdateUsername, onClose }: UserSettingsProps) {
  const { theme: currentTheme, setTheme, themeColors } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<SettingsState>({
    username,
    theme: currentTheme,
    appTheme: 'default',
    systemPrompt: '',
    useCustomPrompt: false
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    async function loadSystemPrompt() {
      try {
        const prompt = await ai.getSystemPrompt();
        if (prompt) {
          setSettings(prev => ({ 
            ...prev, 
            systemPrompt: prompt,
            useCustomPrompt: true
          }));
        }
      } catch (error) {
        console.error('Error loading system prompt:', error);
      }
    }
    loadSystemPrompt();
  }, []);

  const hasChanges = useCallback(() => {
    return settings.username !== username ||
           settings.theme !== currentTheme ||
           settings.appTheme !== 'default';
  }, [settings, username, currentTheme]);

  const handleCloseAttempt = () => {
    if (hasChanges()) {
      setShowSavePrompt(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (settings.username !== username) {
      onUpdateUsername(settings.username);
    }
    if (settings.theme !== currentTheme) {
      setTheme(settings.theme);
    }
    onClose();
  };

  const sections = [
    { id: 'profile', name: 'Profile', icon: Shield },
    { id: 'organization', name: 'Organization', icon: Building2 },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'api', name: 'API & Integrations', icon: Webhook },
    { id: 'ai', name: 'AI Settings', icon: Bot },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Lock },
    { id: 'language', name: 'Language', icon: Globe },
    { id: 'shortcuts', name: 'Shortcuts', icon: Keyboard },
    { id: 'display', name: 'Display', icon: Monitor },
    { id: 'email', name: 'Email Settings', icon: Mail }
  ];

  const showMessage = (success: boolean, message: string) => {
    if (success) {
      setShowSuccessMessage(true);
      setErrorMessage(null);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={handleCloseAttempt} />
      <div 
        className={`fixed z-50 bg-gray-900 shadow-2xl overflow-hidden
          ${isMobileView 
            ? 'inset-0' 
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] max-h-[90vh] rounded-xl'
          }`}
      >
        <div className={`flex h-full ${isMobileView ? 'flex-col' : ''}`}>
          {isMobileView && (
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {activeSection !== 'main' && (
                  <button
                    onClick={() => setActiveSection('main')}
                    className="p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-white">
                  {activeSection === 'main' ? 'Settings' : sections.find(s => s.id === activeSection)?.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges() && (
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-sm font-medium text-white rounded-lg"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    Save
                  </button>
                )}
                <button
                  onClick={handleCloseAttempt}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {(!isMobileView || activeSection === 'main') && (
            <div className={`${isMobileView ? 'flex-1 overflow-y-auto' : 'w-64 border-r border-gray-800'} p-4`}>
              {!isMobileView && (
                <div className="flex items-center gap-3 px-4 py-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${themeColors.primary}20` }}
                  >
                    <span className="text-lg font-semibold" style={{ color: themeColors.primary }}>
                      {settings.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{settings.username}</h3>
                    <p className="text-sm text-gray-400 truncate">{email}</p>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}

          {(!isMobileView || activeSection !== 'main') && (
            <div className="flex-1 flex flex-col min-h-0">
              {!isMobileView && (
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                  <h2 className="text-xl font-semibold text-white">
                    {sections.find(s => s.id === activeSection)?.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    {hasChanges() && (
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                        style={{ backgroundColor: themeColors.primary }}
                      >
                        Save Changes
                      </button>
                    )}
                    <button
                      onClick={handleCloseAttempt}
                      className="p-2 hover:bg-gray-800 rounded-lg"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto settings-scrollbar p-6">
                {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Email
                          </label>
                          <div className="px-4 py-3 bg-gray-800 rounded-lg text-gray-300 font-mono text-sm">
                            {email}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                            Display Name
                          </label>
                          <input
                            type="text"
                            id="username"
                            value={settings.username}
                            onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 font-medium"
                            style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                            placeholder="Enter display name"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Account Security</h3>
                      <div className="space-y-4">
                        <button className="w-full px-4 py-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700/50 transition-colors group">
                          <div className="flex justify-between items-center text-gray-300 group-hover:text-white">
                            <span>Change Password</span>
                            <span className="text-sm text-gray-500">Coming soon</span>
                          </div>
                        </button>
                        <button className="w-full px-4 py-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700/50 transition-colors group">
                          <div className="flex justify-between items-center text-gray-300 group-hover:text-white">
                            <span>Two-Factor Authentication</span>
                            <span className="text-sm text-gray-500">Coming soon</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'organization' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Organization Settings</h3>
                      <div className="space-y-4">
                        <button className="w-full px-4 py-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700/50 transition-colors group">
                          <div className="flex justify-between items-center text-gray-300 group-hover:text-white">
                            <span>Create Organization</span>
                            <span className="text-sm text-gray-500">Coming soon</span>
                          </div>
                        </button>
                        <button className="w-full px-4 py-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700/50 transition-colors group">
                          <div className="flex justify-between items-center text-gray-300 group-hover:text-white">
                            <span>Join Organization</span>
                            <span className="text-sm text-gray-500">Coming soon</span>
                          </div>
                        </button>
                        <button className="w-full px-4 py-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700/50 transition-colors group">
                          <div className="flex justify-between items-center text-gray-300 group-hover:text-white">
                            <span>Manage Teams</span>
                            <span className="text-sm text-gray-500">Coming soon</span>
                          </div>
                        </button>
                        <button className="w-full px-4 py-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700/50 transition-colors group">
                          <div className="flex justify-between items-center text-gray-300 group-hover:text-white">
                            <span>Billing & Subscriptions</span>
                            <span className="text-sm text-gray-500">Coming soon</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'appearance' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Interface Theme</h3>
                      <div className="space-y-3">
                        {themes.map((themeOption) => (
                          <button
                            key={themeOption.id}
                            onClick={() => setSettings({ ...settings, theme: themeOption.id })}
                            className={`w-full p-4 rounded-lg transition-all ${
                              settings.theme === themeOption.id
                                ? 'bg-gray-800 ring-2'
                                : 'hover:bg-gray-800/50'
                            }`}
                            style={{ 
                              '--tw-ring-color': themeOption.colors[0],
                              '--tw-ring-opacity': 0.5
                            } as React.CSSProperties}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                                <div
                                  className="w-full h-full"
                                  style={{ backgroundColor: themeOption.colors[0] }}
                                />
                              </div>
                              <div className="text-left">
                                <h3 className="text-white font-medium">{themeOption.name}</h3>
                                <p className="text-sm text-gray-400">{themeOption.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">App Theme</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {appThemes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setSettings({ ...settings, appTheme: theme.id })}
                            className={`relative group rounded-lg overflow-hidden transition-all ${
                              settings.appTheme === theme.id
                                ? 'ring-2'
                                : 'hover:ring-2 hover:ring-opacity-50'
                            }`}
                            style={{ 
                              '--tw-ring-color': theme.colors.accent,
                              aspectRatio: '16/10'
                            } as React.CSSProperties}
                          >
                            <img 
                              src={theme.preview} 
                              alt={theme.name}
                              className="w-full h-full object-cover"
                            />
                            <div 
                              className="absolute inset-0 flex flex-col justify-end p-3 text-left"
                              style={{ 
                                background: `linear-gradient(transparent, ${theme.colors.background})`
                              }}
                            >
                              <div 
                                className="rounded-lg p-3"
                                style={{ backgroundColor: theme.colors.menuBg }}
                              >
                                <h4 className="text-white font-medium text-sm mb-1">{theme.name}</h4>
                                <p className="text-xs text-gray-400 line-clamp-2">{theme.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'api' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">API Keys & Service Connections</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Connect your favorite services to enhance your workspace capabilities.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {apiServices.map((service) => (
                          <div
                            key={service.id}
                            className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={service.icon}
                                alt={service.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium mb-1">{service.name}</h4>
                                <p className="text-sm text-gray-400 line-clamp-2">{service.description}</p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500">Coming soon</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Webhooks</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Set up webhooks to automate your workflow and integrate with external services.
                      </p>

                      <button className="w-full px-4 py-3 bg-gray-800 rounded-lg text-left hover:bg-gray-700/50 transition-colors group">
                        <div className="flex justify-between items-center text-gray-300 group-hover:text-white">
                          <span>Configure Webhooks</span>
                          <span className="text-sm text-gray-500">Coming soon</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'ai' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">AI Assistant Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="useCustomPrompt"
                            checked={settings.useCustomPrompt}
                            onChange={(e) => setSettings(prev => ({ 
                              ...prev, 
                              useCustomPrompt: e.target.checked,
                              systemPrompt: e.target.checked ? prev.systemPrompt || DEFAULT_SYSTEM_PROMPT : ''
                            }))}
                            className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                          />
                          <label htmlFor="useCustomPrompt" className="ml-2 text-sm text-gray-300">
                            Use custom system prompt
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            System Prompt
                          </label>
                          <textarea
                            value={settings.useCustomPrompt ? settings.systemPrompt : DEFAULT_SYSTEM_PROMPT}
                            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                            disabled={!settings.useCustomPrompt}
                            className={`w-full h-48 px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 resize-none font-mono text-sm ${
                              !settings.useCustomPrompt ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                            placeholder="Enter custom system prompt for the AI assistant..."
                          />
                          <p className="mt-2 text-sm text-gray-400">
                            Define how the AI assistant should behave and what role it should take. This prompt will be used as context for all conversations.
                          </p>
                        </div>

                        {showSuccessMessage && (
                          <div className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg">
                            Settings saved successfully!
                          </div>
                        )}
                        {errorMessage && (
                          <div className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg">
                            {errorMessage}
                          </div>
                        )}

                        <div className="pt-4 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSettings(prev => ({
                                ...prev,
                                systemPrompt: DEFAULT_SYSTEM_PROMPT,
                                useCustomPrompt: false
                              }));
                            }}
                            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
                          >
                            Reset to Default
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                if (settings.useCustomPrompt) {
                                  await ai.saveSystemPrompt(settings.systemPrompt);
                                  showMessage(true, 'System prompt saved successfully!');
                                } else {
                                  await ai.saveSystemPrompt('');
                                  showMessage(true, 'Reset to default system prompt!');
                                }
                              } catch (error) {
                                console.error('Error saving system prompt:', error);
                                showMessage(false, 'Failed to save system prompt');
                              }
                            }}
                            className="px-4 py-2 text-sm text-white rounded-lg"
                            style={{ backgroundColor: themeColors.primary }}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(activeSection === 'notifications' || 
                  activeSection === 'privacy' || 
                  activeSection === 'language' || 
                  activeSection === 'shortcuts' || 
                  activeSection === 'display' || 
                  activeSection === 'email') && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p className="text-lg">This section is coming soon</p>
                    <p className="text-sm mt-2">Stay tuned for updates!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showSavePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-[400px]">
            <h3 className="text-lg font-semibold text-white mb-4">Save Changes?</h3>
            <p className="text-gray-300 mb-6">
              You have unsaved changes. Would you like to save them before closing?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSavePrompt(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Discard
              </button>
              <button
                onClick={() => setShowSavePrompt(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSave();
                  setShowSavePrompt(false);
                }}
                className="px-4 py-2 text-sm text-white rounded-lg"
                style={{ backgroundColor: themeColors.primary }}
              >
                Save & Close
              </button>
            </div>
          </div>
        
        </div>
      )}
    </>
  );
}
