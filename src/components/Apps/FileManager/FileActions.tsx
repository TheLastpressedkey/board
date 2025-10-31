import React from 'react';
import { Download, Trash2, X } from 'lucide-react';

interface FileActionsProps {
  selectedFiles: string[];
  onDelete: () => void;
  onDownload: () => void;
  onDeselect: () => void;
  themeColors: {
    primary: string;
    scrollbar: string;
    menuBg: string;
    menuHover: string;
  };
  isTerminalTheme: boolean;
  bgHeader: string;
  textColor: string;
  primaryColor: string;
  bgButtonText: string;
  borderColor: string;
}

export const FileActions: React.FC<FileActionsProps> = ({
  selectedFiles,
  onDelete,
  onDownload,
  onDeselect,
  themeColors,
  isTerminalTheme,
  bgHeader,
  textColor,
  primaryColor,
  bgButtonText,
  borderColor
}) => {
  return (
    <div className="flex items-center justify-between p-3" style={{ backgroundColor: bgHeader, borderBottom: `1px solid ${borderColor}` }}>
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium" style={{ color: textColor }}>
          {selectedFiles.length} fichier(s) sélectionné(s)
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={onDownload}
            className="flex items-center px-3 py-1 text-sm rounded hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor, color: bgButtonText }}
          >
            <Download className="w-4 h-4 mr-1" />
            Télécharger
          </button>

          <button
            onClick={onDelete}
            className="flex items-center px-3 py-1 text-sm rounded transition-colors"
            style={{ backgroundColor: 'rgb(239, 68, 68)', color: 'white' }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Supprimer
          </button>
        </div>
      </div>

      <button
        onClick={onDeselect}
        className="transition-colors"
        style={{ color: primaryColor }}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
