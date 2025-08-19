import React, { useState } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { FileItem } from './FileManager';

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
  onDownload: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose, onDownload }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const isAudio = file.mimeType?.startsWith('audio/');
  const isPDF = file.mimeType === 'application/pdf';
  const isText = file.mimeType?.startsWith('text/') || 
                 file.mimeType?.includes('json') || 
                 file.mimeType?.includes('xml') || 
                 file.mimeType?.includes('javascript') || 
                 file.mimeType?.includes('typescript') ||
                 ['text/plain', 'text/html', 'text/css', 'application/json', 'application/xml'].includes(file.mimeType || '');
  const isCode = ['php', 'js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'sql', 'css', 'html', 'htm'].includes(
    file.name.split('.').pop()?.toLowerCase() || ''
  );
  const isDocument = file.mimeType?.includes('document') || 
                     file.mimeType?.includes('spreadsheet') || 
                     file.mimeType?.includes('presentation') ||
                     ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(file.name.split('.').pop()?.toLowerCase() || '');

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const renderPreview = () => {
    if (!file.url) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Aperçu non disponible</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex items-center justify-center p-4 overflow-auto max-h-[70vh] analytics-scrollbar">
          <img
            src={file.url}
            alt={file.name}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease'
            }}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center p-4">
          <video
            src={file.url}
            controls
            className="max-w-full max-h-[70vh]"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex items-center justify-center p-8">
          <audio src={file.url} controls className="w-full max-w-md">
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="h-[70vh]">
          <iframe
            src={file.url}
            className="w-full h-full border-0"
            title={file.name}
          />
        </div>
      );
    }

    if (isText || isCode) {
      return (
        <div className="p-4 max-h-[70vh] overflow-auto analytics-scrollbar">
          <iframe
            src={file.url}
            className="w-full h-96 border border-gray-300 dark:border-gray-600"
            title={file.name}
          />
        </div>
      );
    }

    if (isDocument) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg mb-2">Document Office</p>
          <p className="text-sm mb-4">Type : {file.mimeType}</p>
          <p className="text-sm mb-4">Ce type de fichier nécessite une application externe pour l'aperçu</p>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Télécharger pour ouvrir
          </button>
        </div>
      );
    }

    // Aperçu générique pour les autres types de fichiers
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg mb-2">Aperçu non disponible</p>
        <p className="text-sm">Type de fichier : {file.mimeType}</p>
        <p className="text-sm">Taille : {file.size ? formatFileSize(file.size) : 'Inconnue'}</p>
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl m-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {file.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {file.mimeType} • {file.size ? formatFileSize(file.size) : 'Taille inconnue'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Contrôles pour les images */}
            {isImage && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  title="Rotation"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </>
            )}
            
            {/* Télécharger */}
            <button
              onClick={onDownload}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              title="Télécharger"
            >
              <Download className="w-5 h-5" />
            </button>
            
            {/* Ouvrir dans un nouvel onglet */}
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            
            {/* Fermer */}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu de l'aperçu */}
        <div className="relative">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};
