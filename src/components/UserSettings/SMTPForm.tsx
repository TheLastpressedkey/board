import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { email } from '../../services/email';

interface SMTPFormProps {
  onSave: () => void;
  onError: (message: string) => void;
  themeColors: any;
}

export function SMTPForm({ onSave, onError, themeColors }: SMTPFormProps) {
  const [config, setConfig] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    sender_name: '',
    sender_email: ''
  });
  const [loading, setLoading] = useState(true);

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
      console.error('Error loading SMTP config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await email.saveConfig(config);
      onSave();
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      onError('Failed to save SMTP configuration');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: `${themeColors.primary} transparent` }} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          SMTP Host
        </label>
        <input
          type="text"
          value={config.smtp_host}
          onChange={(e) => setConfig(prev => ({ ...prev, smtp_host: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          required
          placeholder="smtp.example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          SMTP Port
        </label>
        <input
          type="number"
          value={config.smtp_port}
          onChange={(e) => setConfig(prev => ({ ...prev, smtp_port: parseInt(e.target.value) }))}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          required
          min="1"
          max="65535"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          SMTP Username
        </label>
        <input
          type="text"
          value={config.smtp_username}
          onChange={(e) => setConfig(prev => ({ ...prev, smtp_username: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          SMTP Password
        </label>
        <input
          type="password"
          value={config.smtp_password}
          onChange={(e) => setConfig(prev => ({ ...prev, smtp_password: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Sender Name
        </label>
        <input
          type="text"
          value={config.sender_name}
          onChange={(e) => setConfig(prev => ({ ...prev, sender_name: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          required
          placeholder="Your Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Sender Email
        </label>
        <input
          type="email"
          value={config.sender_email}
          onChange={(e) => setConfig(prev => ({ ...prev, sender_email: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          required
          placeholder="your@email.com"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white rounded-lg"
          style={{ backgroundColor: themeColors.primary }}
        >
          Save Configuration
        </button>
      </div>
    </form>
  );
}