import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { PasswordGeneratorOptions } from './types';
import { generatePassword, calculatePasswordStrength, copyToClipboard } from './passwordUtils';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  themeColor: string;
}

export function PasswordGenerator({ onPasswordGenerated, themeColor }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  });

  const strength = password ? calculatePasswordStrength(password) : null;

  useEffect(() => {
    handleGenerate();
  }, [options]);

  const handleGenerate = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    if (onPasswordGenerated) {
      onPasswordGenerated(newPassword);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 pr-24 bg-gray-800 text-white rounded-lg font-mono text-sm focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
          placeholder="Mot de passe généré"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            onClick={handleGenerate}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Générer"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Copier"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {strength && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Force du mot de passe</span>
            <span className="font-medium" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${(strength.score / 10) * 100}%`,
                backgroundColor: strength.color
              }}
            />
          </div>
          {strength.suggestions.length > 0 && (
            <ul className="text-xs text-gray-500 space-y-1 mt-2">
              {strength.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Longueur: {options.length}</label>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            className="w-full accent-current"
            style={{ color: themeColor }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
              className="rounded border-gray-600 focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
            Majuscules (A-Z)
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
              className="rounded border-gray-600 focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
            Minuscules (a-z)
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
              className="rounded border-gray-600 focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
            Chiffres (0-9)
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
              className="rounded border-gray-600 focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
            Symboles (!@#$)
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
              className="rounded border-gray-600 focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
            Exclure similaires
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={(e) => setOptions({ ...options, excludeAmbiguous: e.target.checked })}
              className="rounded border-gray-600 focus:ring-2"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
            Exclure ambigus
          </label>
        </div>
      </div>
    </div>
  );
}
