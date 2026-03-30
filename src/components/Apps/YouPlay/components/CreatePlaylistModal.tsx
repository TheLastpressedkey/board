import React, { useState } from 'react';
import { X, Music, GraduationCap, Film, Trophy, MoreHorizontal, Check } from 'lucide-react';
import { Playlist } from '../../../../services/youtubePlaylistStorage';
import { LayoutSize } from '../hooks/useContainerSize';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useCardTheme } from '../../../../contexts/CardThemeContext';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string, category: Playlist['category'], color: string) => void;
  layoutSize: LayoutSize;
}

const CATEGORIES: Array<{ value: Playlist['category']; label: string; icon: React.ElementType }> = [
  { value: 'music', label: 'Music', icon: Music },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'entertainment', label: 'Entertainment', icon: Film },
  { value: 'sports', label: 'Sports', icon: Trophy },
  { value: 'other', label: 'Other', icon: MoreHorizontal }
];

const COLORS = [
  '#FF6B9D', '#C44569', '#F97F51', '#FEA47F',
  '#58B19F', '#0891B2', '#22D3EE', '#6D214F'
];

export function CreatePlaylistModal({ onClose, onCreate, layoutSize }: CreatePlaylistModalProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Playlist['category']>('music');
  const [selectedColor, setSelectedColor] = useState(COLORS[5]); // Default: cyan

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim(), category, selectedColor);
    }
  };

  // Adaptive sizing
  const maxWidth = layoutSize === 'compact' ? 'max-w-xs' : layoutSize === 'normal' ? 'max-w-md' : 'max-w-lg';
  const padding = layoutSize === 'compact' ? 'px-4 py-4' : layoutSize === 'normal' ? 'px-6 py-6' : 'px-8 py-8';
  const headerPadding = layoutSize === 'compact' ? 'px-4 pt-4 pb-3' : layoutSize === 'normal' ? 'px-6 pt-6 pb-4' : 'px-8 pt-8 pb-6';
  const titleSize = layoutSize === 'compact' ? 'text-xl' : layoutSize === 'normal' ? 'text-2xl' : 'text-3xl';
  const spacing = layoutSize === 'compact' ? 'space-y-3' : layoutSize === 'normal' ? 'space-y-4' : 'space-y-6';
  const gridCols = layoutSize === 'compact' ? 'grid-cols-2' : 'grid-cols-3';
  const colorSize = layoutSize === 'compact' ? 'w-9 h-9' : layoutSize === 'normal' ? 'w-10 h-10' : 'w-12 h-12';
  const buttonHeight = layoutSize === 'compact' ? 'py-2.5' : 'py-3.5';
  const fontSize = layoutSize === 'compact' ? 'text-sm' : 'text-base';

  // Theme colors from CardTheme and WeBoard theme
  const bgColor = currentCardTheme.headerStyle.background || 'rgba(31, 41, 55, 0.95)';
  const textColor = currentCardTheme.headerStyle.textColor || '#FFFFFF';
  const iconColor = currentCardTheme.headerStyle.iconColor || 'rgba(255,255,255,0.6)';
  const borderColor = currentCardTheme.headerStyle.border?.includes('rgba')
    ? currentCardTheme.headerStyle.border.match(/rgba\([^)]+\)/)?.[0] || 'rgba(255,255,255,0.1)'
    : 'rgba(255,255,255,0.1)';
  const inputBg = currentCardTheme.bodyStyle?.background || 'rgba(255,255,255,0.05)';
  const backdropFilter = currentCardTheme.headerStyle.backdropFilter || 'blur(10px)';
  const primaryColor = themeColors.primary;

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem)] ${maxWidth} rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col`}
        style={{
          backgroundColor: bgColor,
          backdropFilter: backdropFilter
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`relative ${headerPadding} flex-shrink-0`}
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
            style={{ color: iconColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = inputBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className={`${titleSize} font-bold`} style={{ color: textColor }}>Create Playlist</h2>
          {layoutSize !== 'compact' && (
            <p className="text-xs mt-1" style={{ color: iconColor }}>Organize your favorite videos</p>
          )}
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className={`${padding} ${spacing} overflow-y-auto card-scrollbar flex-1`}>
          {/* Name */}
          <div>
            <label className={`block text-xs font-semibold mb-2`} style={{ color: textColor }}>
              Playlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              className={`w-full px-3 ${buttonHeight} ${fontSize} rounded-lg focus:outline-none transition-all duration-200 font-medium`}
              style={{
                backgroundColor: inputBg,
                color: textColor,
                border: `2px solid transparent`,
                boxShadow: `0 2px 8px ${primaryColor}10`
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = primaryColor;
                e.currentTarget.style.boxShadow = `0 4px 16px ${primaryColor}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = `0 2px 8px ${primaryColor}10`;
              }}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          {layoutSize !== 'compact' && (
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: textColor }}>
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this playlist about?"
                rows={2}
                className={`w-full px-3 py-2.5 ${fontSize} rounded-lg focus:outline-none resize-none transition-all duration-200`}
                style={{
                  backgroundColor: inputBg,
                  color: textColor,
                  border: `2px solid transparent`,
                  boxShadow: `0 2px 8px ${primaryColor}10`
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                  e.currentTarget.style.boxShadow = `0 4px 16px ${primaryColor}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = `0 2px 8px ${primaryColor}10`;
                }}
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: textColor }}>
              Category
            </label>
            <div className={`grid ${gridCols} gap-2`}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                const iconSize = layoutSize === 'compact' ? 'w-5 h-5' : 'w-6 h-6';
                const btnPadding = layoutSize === 'compact' ? 'p-2.5' : 'p-3';

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-1.5 ${btnPadding} rounded-lg transition-all duration-200 cursor-pointer ${
                      isSelected ? 'scale-105' : ''
                    }`}
                    style={isSelected ? {
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                      boxShadow: `0 4px 12px ${primaryColor}40`,
                      color: '#FFFFFF'
                    } : {
                      backgroundColor: inputBg,
                      color: iconColor
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = `${inputBg}dd`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = inputBg;
                      }
                    }}
                  >
                    <Icon className={iconSize} />
                    <span className="text-xs font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: textColor }}>
              Color Theme
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`relative ${colorSize} rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer ${
                    selectedColor === color ? 'scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: color,
                    boxShadow: selectedColor === color ? `0 4px 12px ${color}50, 0 0 0 2px ${primaryColor}` : '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {selectedColor === color && (
                    <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Actions - Fixed at bottom */}
        <div className={`flex gap-2 ${padding} pt-3 flex-shrink-0`} style={{ borderTop: `1px solid ${borderColor}` }}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-4 ${buttonHeight} ${fontSize} rounded-lg transition-all duration-200 font-semibold cursor-pointer`}
            style={{
              backgroundColor: inputBg,
              color: textColor
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${inputBg}dd`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = inputBg;
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`flex-1 px-4 ${buttonHeight} ${fontSize} rounded-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
              boxShadow: `0 4px 12px ${primaryColor}40`,
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              if (name.trim()) {
                e.currentTarget.style.boxShadow = `0 6px 20px ${primaryColor}60`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 12px ${primaryColor}40`;
            }}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
}
