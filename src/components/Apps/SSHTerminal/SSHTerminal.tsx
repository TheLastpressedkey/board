import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Plus, Trash2, Settings, Server, Key, Lock, Edit2, X, Star } from 'lucide-react';
import { AppHeader } from '../../Common/Headers/AppHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { Toast, ToastType } from '../../Common/Toast';
import { TerminalView } from './TerminalView';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

interface SSHHost {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  authType: 'password' | 'key';
  isDefault?: boolean;
}

interface SSHTerminalProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

export function SSHTerminal({ onClose, onDragStart, onTogglePin, isPinned }: SSHTerminalProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const [hosts, setHosts] = useState<SSHHost[]>([]);
  const [selectedHost, setSelectedHost] = useState<SSHHost | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingHost, setEditingHost] = useState<SSHHost | null>(null);

  const [formHost, setFormHost] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    password: '',
    privateKey: '',
    authType: 'password' as 'password' | 'key'
  });

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({
    show: false,
    message: '',
    type: 'info',
  });

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgCard = isTerminalTheme ? 'rgb(20, 20, 20)' : 'rgb(31, 41, 55)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';

  // Charger les hosts depuis localStorage et se connecter automatiquement au serveur par défaut
  useEffect(() => {
    const saved = localStorage.getItem('ssh_hosts');
    if (saved) {
      const loadedHosts: SSHHost[] = JSON.parse(saved);
      setHosts(loadedHosts);

      // Connexion automatique au serveur par défaut
      const defaultHost = loadedHosts.find(h => h.isDefault);
      if (defaultHost) {
        setSelectedHost(defaultHost);
      }
    }
  }, []);

  // Sauvegarder les hosts
  const saveHosts = (newHosts: SSHHost[]) => {
    localStorage.setItem('ssh_hosts', JSON.stringify(newHosts));
    setHosts(newHosts);
  };

  // Reset form
  const resetForm = () => {
    setFormHost({
      name: '',
      host: '',
      port: 22,
      username: '',
      password: '',
      privateKey: '',
      authType: 'password'
    });
    setEditingHost(null);
    setShowForm(false);
  };

  // Ouvrir le formulaire d'édition
  const handleEditHost = (host: SSHHost) => {
    setEditingHost(host);
    setFormHost({
      name: host.name,
      host: host.host,
      port: host.port,
      username: host.username,
      password: host.password || '',
      privateKey: host.privateKey || '',
      authType: host.authType
    });
    setShowForm(true);
  };

  // Définir un serveur par défaut
  const handleSetDefault = (id: string) => {
    const updatedHosts = hosts.map(h => ({
      ...h,
      isDefault: h.id === id
    }));
    saveHosts(updatedHosts);
    setToast({
      show: true,
      message: 'Serveur par défaut modifié',
      type: 'success'
    });
  };

  // Sauvegarder un host (ajout ou modification)
  const handleSaveHost = () => {
    if (!formHost.name || !formHost.host || !formHost.username) {
      setToast({
        show: true,
        message: 'Veuillez remplir tous les champs requis',
        type: 'warning'
      });
      return;
    }

    if (editingHost) {
      // Mode édition
      const updatedHosts = hosts.map(h =>
        h.id === editingHost.id
          ? { ...editingHost, ...formHost }
          : h
      );
      saveHosts(updatedHosts);
      setToast({
        show: true,
        message: `Host "${formHost.name}" modifié avec succès`,
        type: 'success'
      });
    } else {
      // Mode ajout
      const host: SSHHost = {
        id: Date.now().toString(),
        ...formHost
      };
      saveHosts([...hosts, host]);
      setToast({
        show: true,
        message: `Host "${host.name}" ajouté avec succès`,
        type: 'success'
      });
    }

    resetForm();
    setShowSettings(false);
  };

  // Supprimer un host
  const handleDeleteHost = (id: string) => {
    saveHosts(hosts.filter(h => h.id !== id));
    if (selectedHost?.id === id) {
      setSelectedHost(null);
      setIsConnected(false);
    }
  };

  // Connexion à un host
  const handleConnect = (host: SSHHost) => {
    setSelectedHost(host);
  };

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      <AppHeader
        onClose={onClose}
        onDragStart={onDragStart}
        onTogglePin={onTogglePin}
        isPinned={isPinned}
        title="SSH Terminal"
        backgroundColor={bgMain}
        borderColor={borderColor}
        textColor={textColor}
        customButtons={[
          <TerminalIcon key="icon" className="w-5 h-5 mr-2" style={{ color: themeColors.primary }} />,
          <button
            key="settings"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            style={{ color: textColor }}
            title="Gérer les serveurs"
          >
            <Settings className="w-5 h-5" />
          </button>
        ]}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main content - Terminal View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedHost ? (
            <TerminalView
              host={selectedHost}
              backendUrl={BACKEND_URL}
              onDisconnect={() => {
                setSelectedHost(null);
              }}
              themeColors={themeColors}
              bgMain={bgMain}
              textColor={textColor}
              textMuted={textMuted}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4" style={{ color: textMuted }}>
              <div className="text-center max-w-md">
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                  onClick={() => {
                    setShowSettings(true);
                    setShowForm(true);
                  }}
                >
                  <Plus className="w-10 h-10" style={{ color: themeColors.primary }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                  Configurer un serveur SSH
                </h3>
                <p className="text-sm">
                  Ajoutez un serveur SSH pour commencer
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 border-l shadow-xl flex flex-col z-10"
            style={{ backgroundColor: bgMain, borderColor }}
          >
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between" style={{ borderColor }}>
              <h3 className="text-sm font-semibold" style={{ color: textColor }}>
                Serveurs SSH
              </h3>
              <button
                onClick={() => {
                  setShowSettings(false);
                  resetForm();
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                style={{ color: textMuted }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Liste des serveurs */}
              {!showForm && (
                <div className="p-3">
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:opacity-90 transition-opacity mb-3"
                    style={{ backgroundColor: themeColors.primary, color: 'white' }}
                  >
                    <Plus className="w-4 h-4" />
                    Nouveau serveur
                  </button>

                  {hosts.length === 0 ? (
                    <div className="text-center py-8" style={{ color: textMuted }}>
                      <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Aucun serveur configuré</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {hosts.map((host) => (
                        <div
                          key={host.id}
                          className="group p-2.5 rounded-lg transition-colors hover:bg-white/5"
                          style={{ border: `1px solid ${borderColor}` }}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <button
                              onClick={() => handleSetDefault(host.id)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                              style={{ color: host.isDefault ? themeColors.primary : textMuted }}
                              title={host.isDefault ? "Serveur par défaut" : "Définir par défaut"}
                            >
                              <Star className="w-4 h-4" fill={host.isDefault ? "currentColor" : "none"} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs truncate" style={{ color: textColor }}>
                                {host.name}
                              </p>
                              <p className="text-xs truncate" style={{ color: textMuted }}>
                                {host.username}@{host.host}
                              </p>
                            </div>
                            <button
                              onClick={() => handleEditHost(host)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                              style={{ color: textMuted }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteHost(host.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                              style={{ color: 'rgb(239, 68, 68)' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              handleConnect(host);
                              setShowSettings(false);
                            }}
                            className="w-full px-2.5 py-1.5 rounded text-xs hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}
                          >
                            Connecter
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Formulaire */}
              {showForm && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-medium" style={{ color: textMuted }}>
                      {editingHost ? 'Modifier' : 'Nouveau serveur'}
                    </h4>
                    <button
                      onClick={resetForm}
                      className="text-xs hover:underline"
                      style={{ color: textMuted }}
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>Nom</label>
                      <input
                        type="text"
                        value={formHost.name}
                        onChange={(e) => setFormHost({ ...formHost, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg focus:outline-none text-xs"
                        style={{ backgroundColor: bgCard, color: textColor, border: `1px solid ${borderColor}` }}
                        placeholder="Mon serveur"
                      />
                    </div>

                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>Host</label>
                      <input
                        type="text"
                        value={formHost.host}
                        onChange={(e) => setFormHost({ ...formHost, host: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg focus:outline-none text-xs"
                        style={{ backgroundColor: bgCard, color: textColor, border: `1px solid ${borderColor}` }}
                        placeholder="localhost"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: textMuted }}>Port</label>
                        <input
                          type="number"
                          value={formHost.port}
                          onChange={(e) => setFormHost({ ...formHost, port: parseInt(e.target.value) || 22 })}
                          className="w-full px-2.5 py-1.5 rounded-lg focus:outline-none text-xs"
                          style={{ backgroundColor: bgCard, color: textColor, border: `1px solid ${borderColor}` }}
                        />
                      </div>
                      <div>
                        <label className="text-xs mb-1 block" style={{ color: textMuted }}>Username</label>
                        <input
                          type="text"
                          value={formHost.username}
                          onChange={(e) => setFormHost({ ...formHost, username: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg focus:outline-none text-xs"
                          style={{ backgroundColor: bgCard, color: textColor, border: `1px solid ${borderColor}` }}
                          placeholder="user"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs mb-1 block" style={{ color: textMuted }}>Auth</label>
                      <div className="flex gap-1.5 mb-1.5">
                        <button
                          onClick={() => setFormHost({ ...formHost, authType: 'password' })}
                          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                          style={{
                            backgroundColor: formHost.authType === 'password' ? themeColors.primary : bgCard,
                            color: formHost.authType === 'password' ? 'white' : textColor,
                            border: `1px solid ${borderColor}`
                          }}
                        >
                          Password
                        </button>
                        <button
                          onClick={() => setFormHost({ ...formHost, authType: 'key' })}
                          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                          style={{
                            backgroundColor: formHost.authType === 'key' ? themeColors.primary : bgCard,
                            color: formHost.authType === 'key' ? 'white' : textColor,
                            border: `1px solid ${borderColor}`
                          }}
                        >
                          SSH Key
                        </button>
                      </div>

                      {formHost.authType === 'password' ? (
                        <input
                          type="password"
                          value={formHost.password}
                          onChange={(e) => setFormHost({ ...formHost, password: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg focus:outline-none text-xs"
                          style={{ backgroundColor: bgCard, color: textColor, border: `1px solid ${borderColor}` }}
                          placeholder="Mot de passe"
                        />
                      ) : (
                        <textarea
                          value={formHost.privateKey}
                          onChange={(e) => setFormHost({ ...formHost, privateKey: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg focus:outline-none text-xs font-mono"
                          style={{ backgroundColor: bgCard, color: textColor, border: `1px solid ${borderColor}` }}
                          placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                          rows={3}
                        />
                      )}
                    </div>

                    <button
                      onClick={handleSaveHost}
                      className="w-full px-3 py-2 rounded-lg text-xs hover:opacity-90 transition-opacity mt-2"
                      style={{ backgroundColor: themeColors.primary, color: 'white' }}
                    >
                      {editingHost ? 'Enregistrer' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
