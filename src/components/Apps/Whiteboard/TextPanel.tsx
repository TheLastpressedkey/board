import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TextPanelProps {
  isVisible: boolean;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onTextColorChange: (color: string) => void;
  bgColor: string;
  textColorTheme: string;
  textMuted: string;
  borderColor: string;
  hoverBg: string;
}

const COLOR_PALETTE = [
  { name: 'Blanc', value: '#ffffff' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Gris', value: '#6b7280' }
];

const FONT_FAMILIES = [
  { name: 'Arial', value: 'Arial' },
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Courier New', value: 'Courier New' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Verdana', value: 'Verdana' }
];

const FONT_SIZES = [12, 16, 20, 24, 32, 48, 64, 96];

export function TextPanel({
  isVisible,
  fontSize,
  fontFamily,
  textColor,
  onFontSizeChange,
  onFontFamilyChange,
  onTextColorChange,
  bgColor,
  textColorTheme,
  textMuted,
  borderColor,
  hoverBg
}: TextPanelProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute left-4 top-20 w-44 rounded-lg shadow-2xl backdrop-blur-sm overflow-hidden"
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b" style={{ borderColor }}>
        <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: textColorTheme }}>
          <Type className="w-4 h-4" />
          Texte
        </h3>
      </div>

      {/* Content */}
      <div className="p-3 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto card-scrollbar">
        {/* Couleur du texte */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textColorTheme }}>
            Couleur
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.value}
                onClick={() => onTextColorChange(color.value)}
                className="w-full aspect-square rounded transition-all hover:scale-110"
                style={{
                  backgroundColor: color.value,
                  border: textColor === color.value ? `2px solid ${textColorTheme}` : `1px solid ${borderColor}`
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Taille de police */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textColorTheme }}>
            Taille
          </label>
          <div className="grid grid-cols-4 gap-1">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => onFontSizeChange(size)}
                className="px-2 py-1.5 rounded text-xs transition-colors"
                style={{
                  backgroundColor: fontSize === size ? hoverBg : 'transparent',
                  color: fontSize === size ? textColorTheme : textMuted,
                  border: `1px solid ${borderColor}`
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Police */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textColorTheme }}>
            Police
          </label>
          <select
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-xs transition-colors"
            style={{
              backgroundColor: bgColor,
              color: textColorTheme,
              border: `1px solid ${borderColor}`
            }}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
