import React, { useState, useEffect } from 'react';
import { Save, X, Wand2 } from 'lucide-react';
import { PasswordFormData, PasswordEntry } from './types';
import { PasswordGenerator } from './PasswordGenerator';
import { passwordService } from '../../../services/passwords';

interface PasswordFormProps {
  password?: PasswordEntry | null;
  onSave: (data: PasswordFormData) => void;
  onCancel: () => void;
  textColor: string;
  textMuted: string;
  bgInput: string;
  borderColor: string;
  primaryColor: string;
  bgHover: string;
}

export function PasswordForm({
  password,
  onSave,
  onCancel,
  textColor,
  textMuted,
  bgInput,
  borderColor,
  primaryColor,
  bgHover
}: PasswordFormProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    serviceName: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: 'other',
    isFavorite: false
  });

  useEffect(() => {
    if (password) {
      setFormData({
        serviceName: password.serviceName,
        username: password.username,
        password: passwordService.decryptPassword(password.encryptedPassword),
        url: password.url || '',
        notes: password.notes || '',
        category: password.category,
        isFavorite: password.isFavorite
      });
    }
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.serviceName.trim() && formData.username.trim() && formData.password.trim()) {
      onSave(formData);
    }
  };

  const handleGeneratedPassword = (generatedPassword: string) => {
    setFormData(prev => ({ ...prev, password: generatedPassword }));
    setShowGenerator(false);
  };

  const strength = formData.password
    ? passwordService.calculatePasswordStrength(formData.password)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
          Service / Site web *
        </label>
        <input
          type="text"
          value={formData.serviceName}
          onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
          placeholder="Ex: Gmail, Facebook..."
          required
          className="w-full px-3 py-2 rounded-lg"
          style={{
            backgroundColor: bgInput,
            color: textColor,
            border: `1px solid ${borderColor}`
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
          Nom d'utilisateur / Email *
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="user@example.com"
          required
          className="w-full px-3 py-2 rounded-lg"
          style={{
            backgroundColor: bgInput,
            color: textColor,
            border: `1px solid ${borderColor}`
          }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium" style={{ color: textColor }}>
            Mot de passe *
          </label>
          <button
            type="button"
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
            style={{
              backgroundColor: bgHover,
              color: primaryColor
            }}
          >
            <Wand2 className="w-3 h-3" />
            Générer
          </button>
        </div>

        {showGenerator ? (
          <div className="p-3 rounded-lg mb-2" style={{ backgroundColor: bgHover }}>
            <PasswordGenerator
              onGenerate={handleGeneratedPassword}
              textColor={textColor}
              textMuted={textMuted}
              bgInput={bgInput}
              borderColor={borderColor}
              primaryColor={primaryColor}
              bgHover={bgHover}
            />
          </div>
        ) : (
          <>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 rounded-lg font-mono"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`
              }}
            />
            {strength && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs" style={{ color: textMuted }}>
                  <span>Force</span>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: bgInput }}>
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${strength.score}%`,
                      backgroundColor: strength.color
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
          URL (optionnel)
        </label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://example.com"
          className="w-full px-3 py-2 rounded-lg"
          style={{
            backgroundColor: bgInput,
            color: textColor,
            border: `1px solid ${borderColor}`
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
          Catégorie
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
          className="w-full px-3 py-2 rounded-lg"
          style={{
            backgroundColor: bgInput,
            color: textColor,
            border: `1px solid ${borderColor}`
          }}
        >
          <option value="social">👥 Social</option>
          <option value="email">✉️ Email</option>
          <option value="banking">🏦 Banque</option>
          <option value="work">💼 Travail</option>
          <option value="shopping">🛒 Shopping</option>
          <option value="other">📝 Autre</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>
          Notes (optionnel)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notes supplémentaires..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg resize-none"
          style={{
            backgroundColor: bgInput,
            color: textColor,
            border: `1px solid ${borderColor}`
          }}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isFavorite}
          onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
          className="rounded"
          style={{ accentColor: primaryColor }}
        />
        <span className="text-sm" style={{ color: textColor }}>
          ⭐ Marquer comme favori
        </span>
      </label>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: primaryColor, color: 'white' }}
        >
          <Save className="w-4 h-4" />
          {password ? 'Mettre à jour' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: bgHover,
            color: textMuted
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
