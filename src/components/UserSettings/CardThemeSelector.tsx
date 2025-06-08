import React from 'react';
import { Check } from 'lucide-react';
import { useCardTheme } from '../../contexts/CardThemeContext';
import { useTheme } from '../../contexts/ThemeContext';

export function CardThemeSelector() {
  const { currentCardTheme, setCardTheme, availableThemes } = useCardTheme();
  const { themeColors } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Thèmes de Cartes</h3>
        <p className="text-sm text-gray-400 mb-6">
          Personnalisez l'apparence des barres d'état de vos cartes avec des styles uniques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setCardTheme(theme.id)}
            className={`relative group rounded-xl overflow-hidden transition-all duration-200 ${
              currentCardTheme.id === theme.id
                ? 'ring-2 ring-offset-2 ring-offset-gray-900 transform scale-105'
                : 'hover:scale-102 hover:shadow-lg'
            }`}
            style={{ 
              '--tw-ring-color': themeColors.primary
            } as React.CSSProperties}
          >
            {/* Preview Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              {/* Card Header with Theme */}
              <div 
                className="px-4 py-3 border-b border-gray-200 flex items-center justify-between"
                style={{
                  ...theme.headerStyle,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div 
                  className="text-sm font-medium"
                  style={{ color: theme.headerStyle.textColor || 'rgb(75, 85, 99)' }}
                >
                  Exemple
                </div>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.headerStyle.iconColor || 'rgb(107, 114, 128)' }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.headerStyle.iconColor || 'rgb(107, 114, 128)' }}
                  />
                </div>
              </div>
              
              {/* Card Body */}
              <div 
                className="p-4 h-20"
                style={theme.bodyStyle || { backgroundColor: 'white' }}
              >
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            {/* Theme Info Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h4 className="font-semibold text-sm mb-1">{theme.name}</h4>
                <p className="text-xs opacity-90 line-clamp-2">{theme.description}</p>
              </div>
            </div>

            {/* Selection Indicator */}
            {currentCardTheme.id === theme.id && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                   style={{ backgroundColor: themeColors.primary }}>
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Current Theme Info */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Thème Actuel : {currentCardTheme.name}</h4>
        <p className="text-gray-400 text-sm">{currentCardTheme.description}</p>
      </div>
    </div>
  );
}
