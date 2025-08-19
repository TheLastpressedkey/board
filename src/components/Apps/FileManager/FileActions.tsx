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
}

export const FileActions: React.FC<FileActionsProps> = ({
  selectedFiles,
  onDelete,
  onDownload,
  onDeselect,
  themeColors
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-700" style={{ backgroundColor: themeColors.menuBg }}>
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-white">
          {selectedFiles.length} fichier(s) sélectionné(s)
        </span>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onDownload}
            className="flex items-center px-3 py-1 text-sm text-white rounded hover:opacity-90 transition-opacity"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Download className="w-4 h-4 mr-1" />
            Télécharger
          </button>
          
          <button
            onClick={onDelete}
            className="flex items-center px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Supprimer
          </button>
        </div>
      </div>
      
      <button
        onClick={onDeselect}
        className="text-gray-400 hover:text-white transition-colors"
        style={{ color: themeColors.primary }}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
