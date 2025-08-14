import React from 'react';
import { Folder, File, Image, Video, FileText, Archive, Download, Eye, MoreVertical } from 'lucide-react';
import { FileItem } from './FileManager';

interface FileListProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string) => void;
  onFilePreview: (file: FileItem) => void;
  onFolderNavigate: (path: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onFilePreview,
  onFolderNavigate
}) => {
  
  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }
    
    const mimeType = file.mimeType || '';
    
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (mimeType.includes('text') || mimeType.includes('document')) return <FileText className="w-5 h-5 text-green-500" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-5 h-5 text-orange-500" />;
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="overflow-hidden">
      {/* En-tête du tableau */}
      <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
        <div className="col-span-1">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            checked={files.length > 0 && files.every(f => selectedFiles.includes(f.id))}
            onChange={() => {
              if (files.every(f => selectedFiles.includes(f.id))) {
                // Tout désélectionner
                files.forEach(f => onFileSelect(f.id));
              } else {
                // Tout sélectionner
                files.forEach(f => {
                  if (!selectedFiles.includes(f.id)) {
                    onFileSelect(f.id);
                  }
                });
              }
            }}
          />
        </div>
        <div className="col-span-5">Nom</div>
        <div className="col-span-2">Taille</div>
        <div className="col-span-3">Modifié</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Liste des fichiers */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {files.map(file => (
          <div
            key={file.id}
            className={`
              grid grid-cols-12 gap-4 p-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors
              ${selectedFiles.includes(file.id)
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : ''
              }
            `}
            onClick={(e) => handleItemClick(file, e)}
            onDoubleClick={() => handleItemDoubleClick(file)}
          >
            {/* Checkbox */}
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                onChange={() => onFileSelect(file.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Nom avec icône */}
            <div className="col-span-5 flex items-center space-x-3">
              {getFileIcon(file)}
              <span 
                className="text-sm font-medium text-gray-900 dark:text-white truncate"
                title={file.name}
              >
                {file.name}
              </span>
            </div>

            {/* Taille */}
            <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
              {file.type === 'folder' ? '-' : formatFileSize(file.size)}
            </div>

            {/* Date de modification */}
            <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
              {formatDate(file.updatedAt)}
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center space-x-1">
              {file.type === 'file' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilePreview(file);
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Aperçu"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {file.url && (
                    <a
                      href={file.url}
                      download={file.name}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </>
              )}
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Ouvrir menu contextuel
                }}
                title="Plus d'options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
