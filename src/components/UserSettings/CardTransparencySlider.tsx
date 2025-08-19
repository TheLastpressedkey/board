import React from 'react';
import { useCardTheme } from '../../contexts/CardThemeContext';
import { useTheme } from '../../contexts/ThemeContext';

export function CardTransparencySlider() {
  const { cardTransparency, setCardTransparency } = useCardTheme();
  const { themeColors } = useTheme();

  const handleTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCardTransparency(value);
  };

  const transparencyPercentage = Math.round(cardTransparency * 100);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-white font-medium mb-2">Niveau de Transparence</h4>
        <p className="text-gray-400 text-sm mb-4">
          Ajustez la transparence des barres d'état des cartes (effet backdrop-filter).
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">Transparence</label>
          <span 
            className="text-sm font-medium px-2 py-1 rounded"
            style={{ 
              backgroundColor: `${themeColors.primary}20`,
              color: themeColors.primary 
            }}
          >
            {transparencyPercentage}%
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={cardTransparency}
            onChange={handleTransparencyChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, ${themeColors.primary} 0%, ${themeColors.primary} ${transparencyPercentage}%, rgb(55, 65, 81) ${transparencyPercentage}%, rgb(55, 65, 81) 100%)`
            }}
          />
          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: ${themeColors.primary};
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              border: 2px solid white;
            }
            .slider::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: ${themeColors.primary};
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
          `}</style>
        </div>

        {/* Presets */}
        <div className="flex justify-between text-xs text-gray-500">
          <button
            onClick={() => setCardTransparency(0.2)}
            className="hover:text-gray-300 transition-colors"
          >
            Très transparent
          </button>
          <button
            onClick={() => setCardTransparency(0.5)}
            className="hover:text-gray-300 transition-colors"
          >
            Moyen
          </button>
          <button
            onClick={() => setCardTransparency(0.8)}
            className="hover:text-gray-300 transition-colors"
          >
            Peu transparent
          </button>
          <button
            onClick={() => setCardTransparency(1.0)}
            className="hover:text-gray-300 transition-colors"
          >
            Opaque
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h5 className="text-white font-medium mb-3">Aperçu</h5>
        <div className="relative">
          {/* Background pattern to show transparency effect */}
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=200&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Preview card header with current transparency */}
          <div 
            className="relative px-4 py-3 rounded-lg flex items-center justify-between"
            style={{
              background: `rgba(249, 250, 251, ${cardTransparency * 0.4})`,
              backdropFilter: `blur(${10 * cardTransparency}px) saturate(${100 + 80 * cardTransparency}%)`,
              WebkitBackdropFilter: `blur(${10 * cardTransparency}px) saturate(${100 + 80 * cardTransparency}%)`
            }}
          >
            <span className="text-gray-700 font-medium text-sm">Exemple de carte</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <div className="w-3 h-3 rounded-full bg-gray-500" />
            </div>
          </div>
        </div>
        
        <p className="text-gray-400 text-xs mt-2">
          Transparence actuelle : {transparencyPercentage}% - L'effet s'applique en temps réel sur toutes vos cartes.
        </p>
      </div>
    </div>
  );
}
