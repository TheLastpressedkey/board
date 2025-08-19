import React, { useState, useEffect } from 'react';
import { twilio } from '../../services/twilio';

interface TwilioFormProps {
  onSave: () => void;
  onError: (message: string) => void;
  themeColors: any;
}

export function TwilioForm({ onSave, onError, themeColors }: TwilioFormProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await twilio.getConfig();
      if (data?.token) {
        setToken(data.token);
      }
    } catch (error) {
      console.error('Error loading Twilio config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await twilio.saveConfig({ token });
      onSave();
    } catch (error) {
      console.error('Error saving Twilio config:', error);
      onError('Failed to save Twilio configuration');
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
          Twilio Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
          required
          placeholder="Enter your Twilio token"
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