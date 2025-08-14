import React, { useState, useEffect } from 'react';
import { Save, Server, Mail, Lock, Settings } from 'lucide-react';
import { email } from '../../services/email';

interface EmailSettingsProps {
  themeColors: {
    primary: string;
    scrollbar: string;
    menuBg: string;
    menuHover: string;
  };
  onSave: () => void;
  onError: (message: string) => void;
}

interface SMTPConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  sender_name: string;
  sender_email: string;
}

export const EmailSettings: React.FC<EmailSettingsProps> = ({
  themeColors,
  onSave,
  onError
}) => {
  const [config, setConfig] = useState<SMTPConfig>({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    sender_name: '',
    sender_email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await email.getConfig();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading email config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!config.smtp_host || !config.smtp_username || !config.smtp_password) {
      onError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!config.sender_email || !config.sender_name) {
      onError('Veuillez remplir l\'adresse email et le nom d\'affichage');
      return;
    }

    setSaving(true);
    try {
      await email.saveConfig(config);
      onSave();
    } catch (error) {
      console.error('Error saving email config:', error);
      onError('Erreur lors de la sauvegarde de la configuration email');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SMTPConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-2 border-transparent"
          style={{ borderTopColor: themeColors.primary }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
        <Mail className="w-6 h-6" style={{ color: themeColors.primary }} />
        <h2 className="text-xl font-semibold text-white">Configuration Email</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuration SMTP */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5" style={{ color: themeColors.primary }} />
            <h3 className="text-lg font-medium text-white">Serveur SMTP</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Serveur SMTP *
              </label>
              <input
                type="text"
                value={config.smtp_host}
                onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as any}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Port
              </label>
              <input
                type="number"
                value={config.smtp_port}
                onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value) || 587)}
                placeholder="587"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as any}
              />
              <p className="text-xs text-gray-400 mt-1">Port par défaut : 587 (TLS) ou 465 (SSL)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom d'utilisateur *
              </label>
              <input
                type="text"
                value={config.smtp_username}
                onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                placeholder="votre@email.com"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as any}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={config.smtp_password}
                  onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 pr-10"
                  style={{ '--tw-ring-color': themeColors.primary } as any}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <Lock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Préférences email */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" style={{ color: themeColors.primary }} />
            <h3 className="text-lg font-medium text-white">Préférences Email</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email sortante *
              </label>
              <input
                type="email"
                value={config.sender_email}
                onChange={(e) => handleInputChange('sender_email', e.target.value)}
                placeholder="noreply@votredomaine.com"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as any}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Adresse qui apparaîtra comme expéditeur</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom à afficher *
              </label>
              <input
                type="text"
                value={config.sender_name}
                onChange={(e) => handleInputChange('sender_name', e.target.value)}
                placeholder="WeBoard Notifications"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as any}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Nom qui apparaîtra comme expéditeur</p>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: themeColors.primary }}
          >
            {saving ? (
              <div 
                className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-white"
              />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
          </button>
        </div>
      </form>

      {/* Aide */}
      <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium text-white mb-2">💡 Conseils de configuration</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Gmail : smtp.gmail.com, port 587, utilisez un mot de passe d'application</li>
          <li>• Outlook : smtp-mail.outlook.com, port 587</li>
          <li>• Yahoo : smtp.mail.yahoo.com, port 587</li>
          <li>• Pour Gmail, activez l'authentification à 2 facteurs et créez un mot de passe d'application</li>
        </ul>
      </div>
    </div>
  );
};
