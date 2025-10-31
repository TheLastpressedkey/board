import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { PasswordEntry, PasswordCategory } from './types';
import { PasswordGenerator } from './PasswordGenerator';

interface PasswordFormProps {
  entry?: PasswordEntry;
  masterKey: string;
  themeColor: string;
  onSave: (data: {
    service_name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    category: PasswordCategory;
  }) => void;
  onClose: () => void;
}

const categories: { value: PasswordCategory; label: string; icon: string }[] = [
  { value: 'social', label: 'Réseaux sociaux', icon: '👥' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'banking', label: 'Banque', icon: '🏦' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'work', label: 'Travail', icon: '💼' },
  { value: 'entertainment', label: 'Divertissement', icon: '🎮' },
  { value: 'other', label: 'Autre', icon: '🔒' }
];

export function PasswordForm({ entry, masterKey, themeColor, onSave, onClose }: PasswordFormProps) {
  const [serviceName, setServiceName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<PasswordCategory>('other');
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    if (entry) {
      setServiceName(entry.service_name);
      setUsername(entry.username);
      setUrl(entry.url || '');
      setNotes(entry.notes || '');
      setCategory(entry.category);
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      service_name: serviceName,
      username,
      password,
      url: url || undefined,
      notes: notes || undefined,
      category
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {entry ? 'Modifier le mot de passe' : 'Nouveau mot de passe'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom du service *
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              placeholder="Ex: Google, Facebook, GitHub..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Identifiant / Email *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              placeholder="utilisateur@exemple.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Mot de passe {!entry && '*'}
              </label>
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-sm hover:underline"
                style={{ color: themeColor }}
              >
                {showGenerator ? 'Saisir manuellement' : 'Générer un mot de passe'}
              </button>
            </div>

            {showGenerator ? (
              <PasswordGenerator
                onPasswordGenerated={(pwd) => setPassword(pwd)}
                themeColor={themeColor}
              />
            ) : (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 font-mono"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                placeholder={entry ? 'Laisser vide pour ne pas modifier' : 'Entrez un mot de passe'}
                required={!entry}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL du site
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              placeholder="https://exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    category === cat.value
                      ? 'border-current bg-gray-800'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  style={category === cat.value ? { borderColor: themeColor } : {}}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs text-gray-300">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: themeColor }}
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
