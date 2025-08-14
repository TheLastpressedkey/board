import React from 'react';
import { Folder, File, Image, Video, FileText, Archive, Download, Eye, MoreVertical } from 'lucide-react';
import { FileItem } from './FileManager';

interface FileGridProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string) => void;
  onFilePreview: (file: FileItem) => void;
  onFolderNavigate: (path: string) => void;
  themeColors: {
    primary: string;
    scrollbar: string;
    menuBg: string;
    menuHover: string;
  };
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onFilePreview,
  onFolderNavigate,
  themeColors
}) => {
  
  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="w-12 h-12" style={{ color: themeColors.primary }} />;
    }
    
    const mimeType = file.mimeType || '';
    
    if (mimeType.startsWith('image/')) {
      // Afficher une miniature si possible
      return file.url ? (
        <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback vers l'icône si l'image ne charge pas
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Image className="w-12 h-12 hidden" style={{ color: themeColors.primary }} />
        </div>
      ) : <Image className="w-12 h-12" style={{ color: themeColors.primary }} />;
    }
    
    if (mimeType.startsWith('video/')) return <Video className="w-12 h-12 text-purple-500" />;
    if (mimeType.includes('text') || mimeType.includes('document')) return <FileText className="w-12 h-12 text-green-500" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-12 h-12 text-orange-500" />;
    
    return <File className="w-12 h-12 text-gray-500" />;
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Gérer le clic sur un élément
  const handleItemClick = (file: FileItem, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (event.ctrlKey || event.metaKey) {
      // Selection multiple avec Ctrl/Cmd
      onFileSelect(file.id);
    } else if (file.type === 'folder') {
      // Navigation dans le dossier
      onFolderNavigate(file.path);
    } else {
      // Prévisualisation du fichier
      onFilePreview(file);
    }
  };

  // Gérer le double-clic
  const handleItemDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      onFolderNavigate(file.path);
    } else {
      onFilePreview(file);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <Folder className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">Ce dossier est vide</p>
        <p className="text-sm">Glissez-déposez des fichiers pour commencer</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {files.map(file => (
        <div
          key={file.id}
          className={`
            relative group p-4 rounded-lg border-2 cursor-pointer transition-all
            hover:shadow-md
            ${selectedFiles.includes(file.id)
              ? 'bg-gray-800 dark:bg-gray-800'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }
          `}
          style={{
            borderColor: selectedFiles.includes(file.id) ? themeColors.primary : undefined,
            backgroundColor: selectedFiles.includes(file.id) ? `${themeColors.primary}20` : undefined
          }}
          onClick={(e) => handleItemClick(file, e)}
          onDoubleClick={() => handleItemDoubleClick(file)}
        >
          {/* Checkbox de sélection */}
          <div 
            className={`
              absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity
              ${selectedFiles.includes(file.id) ? 'opacity-100' : ''}
            `}
          >
            <input
              type="checkbox"
              checked={selectedFiles.includes(file.id)}
              onChange={() => onFileSelect(file.id)}
              className="w-4 h-4 rounded focus:ring-2"
              style={{ 
                accentColor: themeColors.primary,
                '--tw-ring-color': themeColors.primary
              } as any}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Menu d'actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-1 rounded bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Ouvrir menu contextuel
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Icône du fichier */}
          <div className="flex justify-center mb-3">
            {getFileIcon(file)}
          </div>

          {/* Nom du fichier */}
          <div className="text-center">
            <p 
              className="text-sm font-medium text-gray-900 dark:text-white truncate"
              title={file.name}
            >
              {file.name}
            </p>
            
            {/* Informations supplémentaires */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {file.type === 'file' && file.size && (
                <div>{formatFileSize(file.size)}</div>
              )}
              <div>{formatDate(file.createdAt)}</div>
            </div>
          </div>

          {/* Actions en overlay pour les fichiers */}
          {file.type === 'file' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFilePreview(file);
                }}
                className="p-2 bg-white text-gray-700 rounded-full hover:opacity-90 transition-opacity"
                style={{ backgroundColor: themeColors.primary }}
                title="Aperçu"
              >
                <Eye className="w-4 h-4 text-white" />
              </button>
              {file.url && (
                <a
                  href={file.url}
                  download={file.name}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-white text-gray-700 rounded-full hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: themeColors.primary }}
                  title="Télécharger"
                >
                  <Download className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
