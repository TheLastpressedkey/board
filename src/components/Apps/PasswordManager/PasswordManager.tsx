import React, { useState, useMemo } from 'react';
import { Key, GripHorizontal, X, Plus, Search, Star, Filter } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { usePasswordManager } from './usePasswordManager';
import { PasswordCard } from './PasswordCard';
import { PasswordForm } from './PasswordForm';
import { PasswordEntry, PasswordFormData } from './types';

interface PasswordManagerProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

type ViewMode = 'list' | 'add' | 'edit';
type FilterMode = 'all' | 'favorites' | PasswordEntry['category'];

export function PasswordManager({ onClose, onDragStart }: PasswordManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const {
    passwords,
    isLoading,
    error,
    addPassword,
    updatePassword,
    deletePassword,
    toggleFavorite,
    copyPassword
  } = usePasswordManager();

  const filteredPasswords = useMemo(() => {
    let filtered = passwords;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.serviceName.toLowerCase().includes(query) ||
          p.username.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query)
      );
    }

    if (filterMode === 'favorites') {
      filtered = filtered.filter(p => p.isFavorite);
    } else if (filterMode !== 'all') {
      filtered = filtered.filter(p => p.category === filterMode);
    }

    return filtered;
  }, [passwords, searchQuery, filterMode]);

  const handleSavePassword = async (data: PasswordFormData) => {
    try {
      if (editingPassword) {
        await updatePassword(editingPassword.id, data);
      } else {
        await addPassword(data);
      }
      setViewMode('list');
      setEditingPassword(null);
    } catch (err) {
      console.error('Error saving password:', err);
    }
  };

  const handleEdit = (password: PasswordEntry) => {
    setEditingPassword(password);
    setViewMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce mot de passe ?')) {
      await deletePassword(id);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingPassword(null);
  };

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgInput = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(31, 41, 55)';
  const bgCard = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgb(31, 41, 55)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(75, 85, 99, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;
  const bgHover = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 65, 81, 0.5)';

  const stats = {
    total: passwords.length,
    favorites: passwords.filter(p => p.isFavorite).length,
    byCategory: passwords.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      {/* Header */}
      <div
        className="p-4"
        style={{ backgroundColor: bgHeader, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5" style={{ color: textMuted }} />
            <Key className="w-5 h-5" style={{ color: primaryColor }} />
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>
              1PSWD
            </h2>
            {viewMode === 'list' && (
              <span
                className="px-2 py-1 rounded text-xs"
                style={{ backgroundColor: bgHover, color: textMuted }}
              >
                {filteredPasswords.length} mot{filteredPasswords.length > 1 ? 's' : ''} de passe
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {viewMode === 'list' && (
              <button
                onClick={() => setViewMode('add')}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: bgHover }}
                title="Ajouter"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Plus className="w-4 h-4" style={{ color: textMuted }} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: bgHover }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X className="w-4 h-4" style={{ color: textMuted }} />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        {viewMode === 'list' && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: textMuted }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: bgInput,
                    color: textColor,
                    border: `1px solid ${borderColor}`
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  filterMode === 'all' ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: filterMode === 'all' ? primaryColor : bgHover,
                  color: filterMode === 'all' ? 'white' : textMuted
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Tous ({stats.total})
              </button>
              <button
                onClick={() => setFilterMode('favorites')}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  filterMode === 'favorites' ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: filterMode === 'favorites' ? primaryColor : bgHover,
                  color: filterMode === 'favorites' ? 'white' : textMuted
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                ⭐ Favoris ({stats.favorites})
              </button>
              {(['social', 'email', 'banking', 'work', 'shopping', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterMode(cat)}
                  className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    filterMode === cat ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: filterMode === cat ? primaryColor : bgHover,
                    color: filterMode === cat ? 'white' : textMuted
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {cat === 'social' && '👥'}
                  {cat === 'email' && '✉️'}
                  {cat === 'banking' && '🏦'}
                  {cat === 'work' && '💼'}
                  {cat === 'shopping' && '🛒'}
                  {cat === 'other' && '📝'}
                  {' '}({stats.byCategory[cat] || 0})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 card-scrollbar">
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
          >
            {error}
          </div>
        )}

        {viewMode === 'list' ? (
          isLoading ? (
            <div className="text-center mt-8" style={{ color: textMuted }}>
              Chargement...
            </div>
          ) : filteredPasswords.length === 0 ? (
            <div className="text-center mt-8" style={{ color: textMuted }}>
              {searchQuery || filterMode !== 'all'
                ? 'Aucun mot de passe trouvé'
                : 'Aucun mot de passe. Cliquez sur + pour en ajouter un.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPasswords.map((password) => (
                <PasswordCard
                  key={password.id}
                  password={password}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFavorite={toggleFavorite}
                  onCopy={copyPassword}
                  textColor={textColor}
                  textMuted={textMuted}
                  bgCard={bgCard}
                  borderColor={borderColor}
                  primaryColor={primaryColor}
                  bgHover={bgHover}
                />
              ))}
            </div>
          )
        ) : (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
              {viewMode === 'add' ? 'Nouveau mot de passe' : 'Modifier le mot de passe'}
            </h3>
            <PasswordForm
              password={editingPassword}
              onSave={handleSavePassword}
              onCancel={handleCancel}
              textColor={textColor}
              textMuted={textMuted}
              bgInput={bgInput}
              borderColor={borderColor}
              primaryColor={primaryColor}
              bgHover={bgHover}
            />
          </div>
        )}
      </div>
    </div>
  );
}
