import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, Video, FileText, Archive } from 'lucide-react';
import { fileManagerService } from '../../../services/fileManager';

interface FileUploadProps {
  currentPath: string;
  onUploadComplete: () => void;
  onClose: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  currentPath,
  onUploadComplete,
  onClose
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gérer le drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFilesSelected(files);
  }, []);

  // Gérer la sélection de fichiers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFilesSelected(files);
  };

  // Traiter les fichiers sélectionnés
  const handleFilesSelected = (files: File[]) => {
    const newUploadingFiles: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
      id: Math.random().toString(36).substring(2)
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Uploader chaque fichier
    newUploadingFiles.forEach(uploadingFile => {
      uploadFile(uploadingFile);
    });
  };

  // Uploader un fichier individuel
  const uploadFile = async (uploadingFile: UploadingFile) => {
    try {
      // Simuler le progrès (Supabase ne fournit pas de callback de progrès)
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      const result = await fileManagerService.uploadFile(uploadingFile.file, currentPath);

      clearInterval(progressInterval);

      if (result) {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, progress: 100, status: 'completed' }
              : f
          )
        );
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => 
        prev.map(f => 
          f.id === uploadingFile.id 
            ? { ...f, status: 'error' }
            : f
        )
      );
    }
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (file: File) => {
    const type = file.type;
    
    if (type.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6 text-purple-500" />;
    if (type.includes('text') || type.includes('document')) return <FileText className="w-6 h-6 text-green-500" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-6 h-6 text-orange-500" />;
    
    return <File className="w-6 h-6 text-gray-500" />;
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Vérifier si tous les uploads sont terminés
  const allUploadsComplete = uploadingFiles.length > 0 && 
    uploadingFiles.every(f => f.status === 'completed' || f.status === 'error');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl m-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload de fichiers
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone de drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Glissez-déposez vos fichiers ici
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            ou cliquez pour sélectionner
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Choisir des fichiers
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Liste des fichiers en cours d'upload */}
        {uploadingFiles.length > 0 && (
          <div className="mt-6 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Fichiers en cours d'upload
            </h4>
            <div className="space-y-3">
              {uploadingFiles.map(uploadingFile => (
                <div key={uploadingFile.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  {getFileIcon(uploadingFile.file)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {uploadingFile.file.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(uploadingFile.file.size)}
                      </span>
                    </div>
                    
                    {/* Barre de progression */}
                    {uploadingFile.status === 'uploading' && (
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadingFile.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Status */}
                    {uploadingFile.status === 'completed' && (
                      <div className="text-green-500 text-xs">✓ Upload terminé</div>
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <div className="text-red-500 text-xs">✗ Erreur d'upload</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Annuler
          </button>
          {allUploadsComplete && (
            <button
              onClick={() => {
                onUploadComplete();
                onClose();
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Terminé
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
