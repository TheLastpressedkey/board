import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Star, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { PasswordEntry } from './types';
import { copyToClipboard } from './passwordUtils';
import { passwordService } from './passwordService';

interface PasswordCardProps {
  entry: PasswordEntry;
  masterKey: string;
  themeColor: string;
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

const categoryIcons: Record<string, string> = {
  social: '👥',
  email: '📧',
  banking: '🏦',
  shopping: '🛍️',
  work: '💼',
  entertainment: '🎮',
  other: '🔒'
};

export function PasswordCard({
  entry,
  masterKey,
  themeColor,
  onEdit,
  onDelete,
  onToggleFavorite
}: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  const decryptedPassword = passwordService.decryptPassword(entry.encrypted_password, masterKey);

  const handleCopyPassword = async () => {
    await copyToClipboard(decryptedPassword);
    await passwordService.updateLastUsed(entry.id);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleCopyUsername = async () => {
    await copyToClipboard(entry.username);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryIcons[entry.category]}</span>
          <div>
            <h3 className="text-white font-medium">{entry.service_name}</h3>
            {entry.url && (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 mt-1"
              >
                {new URL(entry.url).hostname}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(entry.id, !entry.is_favorite)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title={entry.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star
              className={`w-4 h-4 ${entry.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
            />
          </button>
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title="Modifier"
          >
            <Pencil className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-gray-900 rounded-lg text-sm text-gray-300 font-mono">
            {entry.username}
          </div>
          <button
            onClick={handleCopyUsername}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Copier l'identifiant"
          >
            {copiedUsername ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-gray-900 rounded-lg text-sm text-gray-300 font-mono">
            {showPassword ? decryptedPassword : '••••••••••••'}
          </div>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={showPassword ? 'Masquer' : 'Afficher'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={handleCopyPassword}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Copier le mot de passe"
          >
            {copiedPassword ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {entry.notes && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400">{entry.notes}</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
        <span>Créé le {new Date(entry.created_at).toLocaleDateString()}</span>
        {entry.last_used_at && (
          <span>Utilisé le {new Date(entry.last_used_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
