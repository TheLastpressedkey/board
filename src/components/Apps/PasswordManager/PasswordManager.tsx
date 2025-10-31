import React, { useState, useEffect } from 'react';
import { Plus, Search, Lock, Star, Grid, List } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { passwordService } from './passwordService';
import { PasswordEntry, PasswordCategory } from './types';
import { PasswordCard } from './PasswordCard';
import { PasswordForm } from './PasswordForm';

const categories: { value: PasswordCategory | 'all' | 'favorites'; label: string; icon: string }[] = [
  { value: 'all', label: 'Tous', icon: '🔒' },
  { value: 'favorites', label: 'Favoris', icon: '⭐' },
  { value: 'social', label: 'Réseaux sociaux', icon: '👥' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'banking', label: 'Banque', icon: '🏦' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'work', label: 'Travail', icon: '💼' },
  { value: 'entertainment', label: 'Divertissement', icon: '🎮' },
  { value: 'other', label: 'Autre', icon: '📁' }
];

export function PasswordManager() {
  const { themeColors } = useTheme();
  const [masterKey, setMasterKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PasswordCategory | 'all' | 'favorites'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedKey = passwordService.getMasterKey();
    if (storedKey) {
      setMasterKey(storedKey);
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      loadPasswords();
    }
  }, [isUnlocked]);

  useEffect(() => {
    filterPasswords();
  }, [passwords, searchQuery, selectedCategory]);

  const loadPasswords = async () => {
    setLoading(true);
    try {
      const data = await passwordService.getAllPasswords();
      setPasswords(data);
    } catch (error) {
      console.error('Error loading passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPasswords = () => {
    let filtered = passwords;

    if (selectedCategory === 'favorites') {
      filtered = filtered.filter(p => p.is_favorite);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.service_name.toLowerCase().includes(query) ||
          p.username.toLowerCase().includes(query) ||
          p.url?.toLowerCase().includes(query)
      );
    }

    setFilteredPasswords(filtered);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey.length >= 8) {
      passwordService.setMasterKey(masterKey);
      setIsUnlocked(true);
    }
  };

  const handleLock = () => {
    passwordService.clearMasterKey();
    setMasterKey('');
    setIsUnlocked(false);
    setPasswords([]);
    setFilteredPasswords([]);
  };

  const handleSave = async (data: {
    service_name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    category: PasswordCategory;
  }) => {
    try {
      if (editingEntry) {
        await passwordService.updatePassword(editingEntry.id, data, data.password ? masterKey : undefined);
      } else {
        await passwordService.createPassword(
          data.service_name,
          data.username,
          data.password,
          masterKey,
          data.url,
          data.notes,
          data.category
        );
      }
      await loadPasswords();
      setShowForm(false);
      setEditingEntry(undefined);
    } catch (error) {
      console.error('Error saving password:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce mot de passe ?')) {
      try {
        await passwordService.deletePassword(id);
        await loadPasswords();
      } catch (error) {
        console.error('Error deleting password:', error);
      }
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await passwordService.toggleFavorite(id, isFavorite);
      await loadPasswords();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleEdit = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  if (!isUnlocked) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${themeColors.primary}20` }}
            >
              <Lock className="w-10 h-10" style={{ color: themeColors.primary }} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">1PSWD</h1>
            <p className="text-gray-400">Gestionnaire de mots de passe sécurisé</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clé principale
              </label>
              <input
                type="password"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
                placeholder="Entrez votre clé principale"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 8 caractères. Cette clé sera utilisée pour chiffrer vos mots de passe.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: themeColors.primary }}
            >
              Déverrouiller
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Lock className="w-6 h-6" style={{ color: themeColors.primary }} />
              1PSWD
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {passwords.length} mot{passwords.length > 1 ? 's' : ''} de passe enregistré{passwords.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingEntry(undefined);
                setShowForm(true);
              }}
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Plus className="w-4 h-4" />
              Nouveau
            </button>
            <button
              onClick={handleLock}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Verrouiller
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
            placeholder="Rechercher un service, identifiant..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors ${
              selectedCategory === cat.value
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            style={selectedCategory === cat.value ? { backgroundColor: `${themeColors.primary}30` } : {}}
          >
            <span>{cat.icon}</span>
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${themeColors.primary} transparent transparent transparent` }}
            />
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Lock className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">
              {searchQuery
                ? 'Aucun résultat trouvé'
                : selectedCategory === 'favorites'
                ? 'Aucun favori'
                : 'Aucun mot de passe enregistré'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: themeColors.primary }}
              >
                Créer votre premier mot de passe
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPasswords.map((entry) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                masterKey={masterKey}
                themeColor={themeColors.primary}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PasswordForm
          entry={editingEntry}
          masterKey={masterKey}
          themeColor={themeColors.primary}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingEntry(undefined);
          }}
        />
      )}
    </div>
  );
}
