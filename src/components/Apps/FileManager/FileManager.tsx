import React, { useState, useEffect } from 'react';
import { Upload, Grid, List, GripHorizontal, X, FolderOpen, FolderPlus } from 'lucide-react';
import { fileManagerService } from '../../../services/fileManager';
import { FileUpload } from './FileUpload';
import { FileGrid } from './FileGrid';
import { FileList } from './FileList';
import { FilePreview } from './FilePreview';
import { FolderNavigation } from './FolderNavigation';
import { FileSearch } from './FileSearch';
import { FileActions } from './FileActions';
import { useTheme } from '../../../contexts/ThemeContext';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  url?: string;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  parentPath?: string;
  isShared?: boolean;
  thumbnailUrl?: string;
}

export interface FileManagerProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  className?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({ 
  onClose, 
  onDragStart, 
  className = '' 
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const { themeColors } = useTheme();

  // Charger les fichiers du répertoire courant
  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fileList = await fileManagerService.listFiles(currentPath);
      setFiles(fileList);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des fichiers');
    } finally {
      setIsLoading(false);
    }
  };

  // Rechercher des fichiers
  const searchFiles = async (query: string) => {
    if (!query.trim()) {
      loadFiles();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const results = await fileManagerService.searchFiles(query);
      setFiles(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  // Créer un nouveau dossier
  const handleCreateFolder = async (folderName: string) => {
    try {
      const success = await fileManagerService.createFolder(folderName, currentPath);
      if (success) {
        setShowCreateFolder(false);
        loadFiles(); // Recharger la liste
      } else {
        setError('Erreur lors de la création du dossier');
      }
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création du dossier');
    }
  };

  // Gérer la navigation dans les dossiers
  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
    setSelectedFiles([]);
    setSearchQuery('');
  };

  // Gérer la sélection de fichiers
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // Gérer la suppression de fichiers
  const handleDelete = async (fileIds: string[]) => {
    try {
      await fileManagerService.deleteFiles(fileIds);
      setSelectedFiles([]);
      loadFiles();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Gérer le téléchargement
  const handleDownload = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (file && file.url) {
        await fileManagerService.downloadFile(file.url, file.name);
      } else {
        setError('Fichier non trouvé ou URL non disponible');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
    }
  };

  // Charger les fichiers au montage et lors du changement de répertoire
  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  // Recherche en temps réel
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchFiles(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className={`flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header avec drag handle */}
      <div 
        className="p-4 border-b border-gray-700/50"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5 text-gray-500" />
            <FolderOpen 
              className="w-5 h-5"
              style={{ color: themeColors.primary }}
            />
            <h2 className="text-lg font-semibold text-white">Gestionnaire de fichiers</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex items-center space-x-4">
          {/* Navigation par chemin */}
          <FolderNavigation 
            currentPath={currentPath}
            onNavigate={navigateToFolder}
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Barre de recherche */}
          <FileSearch 
            query={searchQuery}
            onSearch={setSearchQuery}
          />

          {/* Boutons de vue */}
          <div className="flex items-center border border-gray-600 rounded">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'text-white' : 'text-gray-400'}`}
              style={viewMode === 'grid' ? { backgroundColor: themeColors.primary } : {}}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'text-white' : 'text-gray-400'}`}
              style={viewMode === 'list' ? { backgroundColor: themeColors.primary } : {}}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Bouton de création de dossier */}
          <button
            onClick={() => setShowCreateFolder(true)}
            className="text-white px-4 py-2 rounded hover:opacity-90 flex items-center transition-opacity"
            style={{ backgroundColor: themeColors.primary }}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Nouveau dossier
          </button>

          {/* Bouton d'upload */}
          <button
            onClick={() => setShowUpload(true)}
            className="text-white px-4 py-2 rounded hover:opacity-90 flex items-center transition-opacity"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </button>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 mx-4 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actions sur les fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <FileActions
          selectedFiles={selectedFiles}
          onDelete={() => handleDelete(selectedFiles)}
          onDownload={() => selectedFiles.forEach(handleDownload)}
          onDeselect={() => setSelectedFiles([])}
          themeColors={themeColors}
        />
      )}

      {/* Zone principale */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderBottomColor: themeColors.primary }}
            ></div>
          </div>
        ) : (
          <div className="h-full overflow-auto p-4">
            {viewMode === 'grid' ? (
              <FileGrid
                files={files}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onFilePreview={setPreviewFile}
                onFolderNavigate={navigateToFolder}
                themeColors={themeColors}
              />
            ) : (
              <FileList
                files={files}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onFilePreview={setPreviewFile}
                onFolderNavigate={navigateToFolder}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal d'upload */}
      {showUpload && (
        <FileUpload
          currentPath={currentPath}
          onUploadComplete={() => {
            setShowUpload(false);
            loadFiles();
          }}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Modal de création de dossier */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ zIndex: 1000 }}>
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Créer un nouveau dossier</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nom du dossier"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none"
              style={{ borderColor: newFolderName ? themeColors.primary : undefined }}
              onFocus={(e) => e.target.style.borderColor = themeColors.primary}
              onBlur={(e) => e.target.style.borderColor = newFolderName ? themeColors.primary : 'rgb(75, 85, 99)'}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  handleCreateFolder(newFolderName);
                  setNewFolderName('');
                } else if (e.key === 'Escape') {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }
              }}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (newFolderName.trim()) {
                    handleCreateFolder(newFolderName);
                    setNewFolderName('');
                  }
                }}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{ backgroundColor: themeColors.primary }}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={() => handleDownload(previewFile.id)}
        />
      )}
    </div>
  );
};
