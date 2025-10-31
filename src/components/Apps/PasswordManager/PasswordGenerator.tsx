import React, { useState } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { passwordService } from '../../../services/passwords';

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void;
  textColor: string;
  textMuted: string;
  bgInput: string;
  borderColor: string;
  primaryColor: string;
  bgHover: string;
}

export function PasswordGenerator({
  onGenerate,
  textColor,
  textMuted,
  bgInput,
  borderColor,
  primaryColor,
  bgHover
}: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const password = passwordService.generatePassword({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols
    });
    setGeneratedPassword(password);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUsePassword = () => {
    if (generatedPassword) {
      onGenerate(generatedPassword);
    }
  };

  const strength = generatedPassword
    ? passwordService.calculatePasswordStrength(generatedPassword)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={generatedPassword}
          readOnly
          placeholder="Générer un mot de passe..."
          className="flex-1 px-3 py-2 rounded-lg font-mono text-sm"
          style={{
            backgroundColor: bgInput,
            color: textColor,
            border: `1px solid ${borderColor}`
          }}
        />
        <button
          onClick={handleCopy}
          disabled={!generatedPassword}
          className="p-2 rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: bgHover }}
          title="Copier"
        >
          {copied ? (
            <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
          ) : (
            <Copy className="w-4 h-4" style={{ color: textMuted }} />
          )}
        </button>
        <button
          onClick={generatePassword}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: bgHover }}
          title="Générer"
        >
          <RefreshCw className="w-4 h-4" style={{ color: textMuted }} />
        </button>
      </div>

      {strength && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs" style={{ color: textMuted }}>
            <span>Force du mot de passe</span>
            <span style={{ color: strength.color }}>{strength.label}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: bgInput }}>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm" style={{ color: textColor }}>
            Longueur: {length}
          </label>
        </div>
        <input
          type="range"
          min="8"
          max="32"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: primaryColor }}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
            className="rounded"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-sm" style={{ color: textColor }}>
            Majuscules (A-Z)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
            className="rounded"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-sm" style={{ color: textColor }}>
            Minuscules (a-z)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            className="rounded"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-sm" style={{ color: textColor }}>
            Chiffres (0-9)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            className="rounded"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-sm" style={{ color: textColor }}>
            Symboles (!@#$...)
          </span>
        </label>
      </div>

      {generatedPassword && (
        <button
          onClick={handleUsePassword}
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: primaryColor, color: 'white' }}
        >
          Utiliser ce mot de passe
        </button>
      )}
    </div>
  );
}
