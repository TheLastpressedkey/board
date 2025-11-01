import React from 'react';
import { Copy, Trash2, Link, ChevronDown, ChevronUp } from 'lucide-react';

interface SelectionPanelProps {
  selectedElements: any[];
  onStrokeColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onOpacityChange: (opacity: number) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCreateLink: () => void;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  bgColor: string;
  textColor: string;
  textMuted: string;
  borderColor: string;
  hoverBg: string;
}

const COLOR_PALETTE = [
  { name: 'Transparent', value: 'transparent' },
  { name: 'Blanc', value: '#ffffff' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Gris', value: '#6b7280' }
];

const STROKE_WIDTHS = [
  { label: 'Fin', value: 1 },
  { label: 'Moyen', value: 3 },
  { label: 'Épais', value: 5 }
];

export function SelectionPanel({
  selectedElements,
  onStrokeColorChange,
  onFillColorChange,
  onStrokeWidthChange,
  onOpacityChange,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
  onCreateLink,
  strokeColor,
  fillColor,
  strokeWidth,
  opacity,
  bgColor,
  textColor,
  textMuted,
  borderColor,
  hoverBg
}: SelectionPanelProps) {
  if (selectedElements.length === 0) {
    return null;
  }

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
        <h3 className="text-sm font-medium" style={{ color: textColor }}>
          Propriétés
        </h3>
      </div>

      {/* Content */}
      <div className="p-3 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto card-scrollbar">
        {/* Trait (Stroke) */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Trait
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.value}
                onClick={() => onStrokeColorChange(color.value)}
                className="w-full aspect-square rounded transition-all hover:scale-110"
                style={{
                  backgroundColor: color.value === 'transparent' ? '#1f2937' : color.value,
                  border: strokeColor === color.value ? `2px solid ${textColor}` : `1px solid ${borderColor}`,
                  backgroundImage: color.value === 'transparent' ?
                    'linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151), linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151)' :
                    'none',
                  backgroundSize: color.value === 'transparent' ? '8px 8px' : 'auto',
                  backgroundPosition: color.value === 'transparent' ? '0 0, 4px 4px' : '0 0'
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Arrière-plan (Fill) */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Arrière-plan
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.value}
                onClick={() => onFillColorChange(color.value)}
                className="w-full aspect-square rounded transition-all hover:scale-110"
                style={{
                  backgroundColor: color.value === 'transparent' ? '#1f2937' : color.value,
                  border: fillColor === color.value ? `2px solid ${textColor}` : `1px solid ${borderColor}`,
                  backgroundImage: color.value === 'transparent' ?
                    'linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151), linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151)' :
                    'none',
                  backgroundSize: color.value === 'transparent' ? '8px 8px' : 'auto',
                  backgroundPosition: color.value === 'transparent' ? '0 0, 4px 4px' : '0 0'
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Largeur du contour */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Largeur du contour
          </label>
          <div className="flex gap-1">
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width.value}
                onClick={() => onStrokeWidthChange(width.value)}
                className="flex-1 px-2 py-1.5 rounded text-xs transition-colors"
                style={{
                  backgroundColor: strokeWidth === width.value ? hoverBg : 'transparent',
                  color: strokeWidth === width.value ? textColor : textMuted,
                  border: `1px solid ${borderColor}`
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <div
                    style={{
                      width: '16px',
                      height: `${width.value}px`,
                      backgroundColor: textMuted
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Transparence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: textColor }}>
              Transparence
            </label>
            <span className="text-xs" style={{ color: textMuted }}>
              {Math.round(opacity)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: textColor }}
          />
        </div>

        {/* Disposition */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Disposition
          </label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={onBringToFront}
              className="px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1"
              style={{
                backgroundColor: 'transparent',
                color: textMuted,
                border: `1px solid ${borderColor}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = textColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = textMuted;
              }}
              title="Premier plan"
            >
              <ChevronUp className="w-3 h-3" />
              <ChevronUp className="w-3 h-3 -ml-2" />
            </button>
            <button
              onClick={onBringForward}
              className="px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1"
              style={{
                backgroundColor: 'transparent',
                color: textMuted,
                border: `1px solid ${borderColor}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = textColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = textMuted;
              }}
              title="Avancer"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              onClick={onSendBackward}
              className="px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1"
              style={{
                backgroundColor: 'transparent',
                color: textMuted,
                border: `1px solid ${borderColor}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = textColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = textMuted;
              }}
              title="Reculer"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
            <button
              onClick={onSendToBack}
              className="px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1"
              style={{
                backgroundColor: 'transparent',
                color: textMuted,
                border: `1px solid ${borderColor}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = textColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = textMuted;
              }}
              title="Arrière-plan"
            >
              <ChevronDown className="w-3 h-3" />
              <ChevronDown className="w-3 h-3 -ml-2" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Actions
          </label>
          <div className="flex gap-1">
            <button
              onClick={onDuplicate}
              className="flex-1 p-2 rounded transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: textMuted,
                border: `1px solid ${borderColor}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = textColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = textMuted;
              }}
              title="Dupliquer"
            >
              <Copy className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={onDelete}
              className="flex-1 p-2 rounded transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: textMuted,
                border: `1px solid ${borderColor}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = textColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = textMuted;
              }}
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={onCreateLink}
              className="flex-1 p-2 rounded transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: textMuted,
                border: `1px solid ${borderColor}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.color = textColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = textMuted;
              }}
              title="Créer un lien"
            >
              <Link className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
