import React, { useState } from 'react';
import { Copy, Eye, EyeOff, Star, Trash2, Edit, ExternalLink, Check } from 'lucide-react';
import { PasswordEntry } from './types';
import { passwordService } from '../../../services/passwords';

interface PasswordCardProps {
  password: PasswordEntry;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopy: (id: string) => void;
  textColor: string;
  textMuted: string;
  bgCard: string;
  borderColor: string;
  primaryColor: string;
  bgHover: string;
}

export function PasswordCard({
  password,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
  textColor,
  textMuted,
  bgCard,
  borderColor,
  primaryColor,
  bgHover
}: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy(password.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const decryptedPassword = showPassword
    ? passwordService.decryptPassword(password.encryptedPassword)
    : '••••••••';

  const categoryIcons: Record<PasswordEntry['category'], string> = {
    social: '👥',
    email: '✉️',
    banking: '🏦',
    work: '💼',
    shopping: '🛒',
    other: '📝'
  };

  const categoryLabels: Record<PasswordEntry['category'], string> = {
    social: 'Social',
    email: 'Email',
    banking: 'Banque',
    work: 'Travail',
    shopping: 'Shopping',
    other: 'Autre'
  };

  return (
    <div
      className="p-4 rounded-lg transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: bgCard,
        border: `1px solid ${borderColor}`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryIcons[password.category]}</span>
          <div>
            <h3 className="font-semibold" style={{ color: textColor }}>
              {password.serviceName}
            </h3>
            <p className="text-sm" style={{ color: textMuted }}>
              {password.username}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(password.id)}
          className="p-1 rounded transition-colors"
          style={{ color: password.isFavorite ? '#eab308' : textMuted }}
        >
          <Star className={`w-4 h-4 ${password.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={decryptedPassword}
            readOnly
            className="flex-1 px-2 py-1 rounded text-sm font-mono"
            style={{
              backgroundColor: bgHover,
              color: textColor,
              border: `1px solid ${borderColor}`
            }}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 rounded transition-colors"
            style={{ color: textMuted }}
            title={showPassword ? 'Masquer' : 'Afficher'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded transition-colors"
            style={{ color: textMuted }}
            title="Copier"
          >
            {copied ? (
              <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {password.url && (
          <a
            href={password.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm hover:underline"
            style={{ color: primaryColor }}
          >
            <ExternalLink className="w-3 h-3" />
            {new URL(password.url).hostname}
          </a>
        )}

        {password.notes && (
          <p className="text-xs" style={{ color: textMuted }}>
            {password.notes}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded text-xs"
            style={{
              backgroundColor: bgHover,
              color: textMuted
            }}
          >
            {categoryLabels[password.category]}
          </span>
          {password.lastUsedAt && (
            <span className="text-xs" style={{ color: textMuted }}>
              Utilisé {new Date(password.lastUsedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(password)}
            className="p-1 rounded transition-colors hover:bg-opacity-50"
            style={{ color: textMuted }}
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(password.id)}
            className="p-1 rounded transition-colors hover:bg-opacity-50"
            style={{ color: '#ef4444' }}
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
