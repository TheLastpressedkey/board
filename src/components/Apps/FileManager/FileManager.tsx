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
import { useCardTheme } from '../../../contexts/CardThemeContext';

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
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

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

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;
  const bgButtonText = isTerminalTheme ? 'rgb(0, 0, 0)' : 'white';

  return (
    <div className={`flex flex-col h-full rounded-lg overflow-hidden ${className}`} style={{ backgroundColor: bgMain }}>
      {/* Header avec drag handle */}
      <div
        className="p-4"
        style={{ backgroundColor: bgHeader, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5" style={{ color: textMuted }} />
            <FolderOpen
              className="w-5 h-5"
              style={{ color: primaryColor }}
            />
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>Gestionnaire de fichiers</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ color: textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center space-x-4">
          {/* Navigation par chemin */}
          <FolderNavigation
            currentPath={currentPath}
            onNavigate={navigateToFolder}
            isTerminalTheme={isTerminalTheme}
            textColor={textColor}
            textMuted={textMuted}
            primaryColor={primaryColor}
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Barre de recherche */}
          <FileSearch
            query={searchQuery}
            onSearch={setSearchQuery}
            isTerminalTheme={isTerminalTheme}
            textColor={textColor}
            textMuted={textMuted}
            borderColor={borderColor}
            primaryColor={primaryColor}
          />

          {/* Boutons de vue */}
          <div className="flex items-center rounded" style={{ border: `1px solid ${borderColor}` }}>
            <button
              onClick={() => setViewMode('grid')}
              className="p-2"
              style={{
                backgroundColor: viewMode === 'grid' ? primaryColor : 'transparent',
                color: viewMode === 'grid' ? bgButtonText : textMuted
              }}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2"
              style={{
                backgroundColor: viewMode === 'list' ? primaryColor : 'transparent',
                color: viewMode === 'list' ? bgButtonText : textMuted
              }}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Bouton de création de dossier */}
          <button
            onClick={() => setShowCreateFolder(true)}
            className="px-4 py-2 rounded hover:opacity-90 flex items-center transition-opacity"
            style={{ backgroundColor: primaryColor, color: bgButtonText }}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Nouveau dossier
          </button>

          {/* Bouton d'upload */}
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 rounded hover:opacity-90 flex items-center transition-opacity"
            style={{ backgroundColor: primaryColor, color: bgButtonText }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </button>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="px-4 py-2 mx-4 rounded-md flex items-center justify-between" style={{
          backgroundColor: 'rgba(248, 113, 113, 0.2)',
          border: '1px solid rgb(248, 113, 113)',
          color: 'rgb(252, 165, 165)'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{ color: 'rgb(252, 165, 165)' }}
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
          isTerminalTheme={isTerminalTheme}
          bgHeader={bgHeader}
          textColor={textColor}
          primaryColor={primaryColor}
          bgButtonText={bgButtonText}
          borderColor={borderColor}
        />
      )}

      {/* Zone principale */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderBottomColor: primaryColor }}
            ></div>
          </div>
        ) : (
          <div className="h-full overflow-auto p-4 analytics-scrollbar">
            {viewMode === 'grid' ? (
              <FileGrid
                files={files}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onFilePreview={setPreviewFile}
                onFolderNavigate={navigateToFolder}
                themeColors={themeColors}
                isTerminalTheme={isTerminalTheme}
                primaryColor={primaryColor}
                textColor={textColor}
                textMuted={textMuted}
                borderColor={borderColor}
              />
            ) : (
              <FileList
                files={files}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onFilePreview={setPreviewFile}
                onFolderNavigate={navigateToFolder}
                isTerminalTheme={isTerminalTheme}
                primaryColor={primaryColor}
                textColor={textColor}
                textMuted={textMuted}
                borderColor={borderColor}
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
          <div className="rounded-lg p-6 w-96" style={{ backgroundColor: bgMain, border: `1px solid ${borderColor}` }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>Créer un nouveau dossier</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nom du dossier"
              className="w-full p-3 rounded focus:outline-none"
              style={{
                backgroundColor: isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(55, 65, 81)',
                color: textColor,
                border: `1px solid ${newFolderName ? primaryColor : borderColor}`
              }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = newFolderName ? primaryColor : borderColor}
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
                style={{ color: textMuted }}
                className="px-4 py-2"
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
                className="px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{ backgroundColor: primaryColor, color: bgButtonText }}
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
