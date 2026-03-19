import React, { useState, useEffect } from 'react';
import { Upload, Download, Trash2, File, FileText, FileImage, FileVideo, FileAudio, Grid, List, Search, Cloud, Share2, MoreVertical, Link2, Settings, AlertCircle } from 'lucide-react';
import { AppHeader } from '../../Common/Headers/AppHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { uploadthing } from '../../../services/uploadthing';
import { Toast, ToastType } from '../../Common/Toast';

const STORAGE_KEY = 'driveplus_files';

interface DriveFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  key: string;
}

interface DrivePlusProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

export function DrivePlus({ onClose, onDragStart, onTogglePin, isPinned }: DrivePlusProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({
    show: false,
    message: '',
    type: 'info',
  });

  // Charger la clé API UploadThing de l'utilisateur
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const config = await uploadthing.getConfig();
        if (config && config.secretKey) {
          setApiKey(config.secretKey);
        }
      } catch (error) {
        console.log('No UploadThing API key configured');
      } finally {
        setIsLoadingConfig(false);
      }
    };
    loadApiKey();
  }, []);

  // Charger les fichiers depuis UploadThing
  const loadFilesFromUploadThing = async () => {
    if (!apiKey) return;

    setIsLoadingFiles(true);
    try {
      const response = await fetch('https://api.uploadthing.com/v6/listFiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Uploadthing-Api-Key': apiKey,
        },
        body: JSON.stringify({
          limit: 500, // Récupérer jusqu'à 500 fichiers
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files from UploadThing');
      }

      const data = await response.json();

      // Transformer les données UploadThing en format DriveFile
      const uploadThingFiles: DriveFile[] = (data.files || []).map((file: any) => ({
        id: file.key,
        name: file.name,
        url: `https://utfs.io/f/${file.key}`,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: file.uploadedAt || new Date().toISOString(),
        key: file.key,
      }));

      setFiles(uploadThingFiles);
      // Sauvegarder en cache localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadThingFiles));
    } catch (error) {
      console.error('Error loading files from UploadThing:', error);
      // En cas d'erreur, charger depuis localStorage en fallback
      const savedFiles = localStorage.getItem(STORAGE_KEY);
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Charger les fichiers quand la clé API est disponible
  useEffect(() => {
    if (apiKey) {
      loadFilesFromUploadThing();
    }
  }, [apiKey]);

  // Sauvegarder les fichiers dans localStorage
  const saveFiles = (newFiles: DriveFile[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
    setFiles(newFiles);
  };

  // Upload vers UploadThing
  const uploadFile = async (file: File) => {
    if (!apiKey) {
      setToast({
        show: true,
        message: 'Veuillez configurer votre clé API UploadThing dans les paramètres pour uploader des fichiers.',
        type: 'warning',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Étape 1: Obtenir l'URL présignée
      const presignedResponse = await fetch('https://api.uploadthing.com/v6/uploadFiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Uploadthing-Api-Key': apiKey,
        },
        body: JSON.stringify({
          files: [{
            name: file.name,
            size: file.size,
            type: file.type,
          }],
          metadata: {},
          contentDisposition: 'inline',
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const presignedData = await presignedResponse.json();
      const uploadData = presignedData.data[0];

      // Étape 2: Upload le fichier
      const formData = new FormData();
      Object.entries(uploadData.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      const uploadResponse = await fetch(uploadData.url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      setUploadProgress(100);

      // Ajouter le fichier à la liste
      const newFile: DriveFile = {
        id: uploadData.key,
        name: file.name,
        url: uploadData.fileUrl || `https://utfs.io/f/${uploadData.key}`,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        key: uploadData.key,
      };

      saveFiles([...files, newFile]);
    } catch (error) {
      console.error('Upload error:', error);
      setToast({
        show: true,
        message: 'Une erreur s\'est produite lors de l\'upload du fichier. Veuillez réessayer.',
        type: 'error',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Gérer le drop de fichiers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(uploadFile);
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(uploadFile);
  };

  // Supprimer un fichier
  const deleteFile = async (fileId: string) => {
    if (!apiKey) {
      setAlertDialog({
        open: true,
        title: 'Configuration requise',
        description: 'Veuillez configurer votre clé API UploadThing dans les paramètres pour supprimer des fichiers.',
      });
      return;
    }

    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      // Supprimer de UploadThing
      const response = await fetch(`https://api.uploadthing.com/v6/deleteFiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Uploadthing-Api-Key': apiKey,
        },
        body: JSON.stringify({
          fileKeys: [file.key],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('UploadThing delete error:', errorData);
        throw new Error('Failed to delete from UploadThing');
      }

      // Supprimer de la liste locale
      saveFiles(files.filter(f => f.id !== fileId));
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } catch (error) {
      console.error('Delete error:', error);
      setToast({
        show: true,
        message: 'Une erreur s\'est produite lors de la suppression du fichier. Veuillez réessayer.',
        type: 'error',
      });
    }
  };

  // Télécharger un fichier
  const downloadFile = (file: DriveFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Partager un fichier
  const shareFile = (file: DriveFile) => {
    setShareUrl(file.url);
    setShowShareModal(true);
  };

  // Copier le lien
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowShareModal(false);
    setToast({
      show: true,
      message: 'Le lien de partage a été copié dans le presse-papier.',
      type: 'success',
    });
  };

  // Formater la taille
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Icône selon le type de fichier
  const getFileIcon = (type: string, size: 'small' | 'large' = 'small') => {
    const iconClass = size === 'large' ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-6 h-6 sm:w-8 sm:h-8';
    if (type.startsWith('image/')) return <FileImage className={iconClass} />;
    if (type.startsWith('video/')) return <FileVideo className={iconClass} />;
    if (type.startsWith('audio/')) return <FileAudio className={iconClass} />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className={iconClass} />;
    return <File className={iconClass} />;
  };

  // Filtrer les fichiers
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgCard = isTerminalTheme ? 'rgb(20, 20, 20)' : 'rgb(31, 41, 55)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      <AppHeader
        onClose={onClose}
        onDragStart={onDragStart}
        onTogglePin={onTogglePin}
        isPinned={isPinned}
        title="Drive+"
        backgroundColor={bgMain}
        borderColor={borderColor}
        textColor={textColor}
        customButtons={[
          <Cloud key="icon" className="w-5 h-5 mr-2" style={{ color: themeColors.primary }} />
        ]}
      />

      {/* Loading state */}
      {(isLoadingConfig || isLoadingFiles) && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: themeColors.primary }}></div>
            <p className="text-sm" style={{ color: textMuted }}>
              {isLoadingConfig ? 'Chargement de la configuration...' : 'Chargement des fichiers...'}
            </p>
          </div>
        </div>
      )}

      {/* Message de configuration si pas de clé API */}
      {!isLoadingConfig && !apiKey && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full" style={{ backgroundColor: `${themeColors.primary}20` }}>
                <Settings className="w-12 h-12" style={{ color: themeColors.primary }} />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: textColor }}>
              Configuration requise
            </h3>
            <p className="text-sm mb-6" style={{ color: textMuted }}>
              Pour utiliser Drive+, vous devez configurer votre clé API UploadThing dans les paramètres.
            </p>
            <div className="space-y-3">
              <div className="p-3 rounded-lg text-left" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: themeColors.primary }} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: textColor }}>
                      Étape 1
                    </p>
                    <p className="text-xs" style={{ color: textMuted }}>
                      Allez dans <strong>Paramètres</strong> → <strong>API & Integrations</strong> → <strong>UploadThing</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg text-left" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: themeColors.primary }} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: textColor }}>
                      Étape 2
                    </p>
                    <p className="text-xs" style={{ color: textMuted }}>
                      Entrez votre <strong>Secret Key</strong> UploadThing (commence par sk_live_...)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal - visible seulement si clé API configurée et fichiers chargés */}
      {!isLoadingConfig && !isLoadingFiles && apiKey && (
        <>
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2 flex-1">
          {/* Recherche */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm rounded-lg focus:outline-none"
              style={{
                backgroundColor: bgCard,
                color: textColor,
                border: `1px solid ${borderColor}`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {/* Mode d'affichage */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
            <button
              onClick={() => setViewMode('grid')}
              className="p-1.5 sm:p-2 transition-colors"
              style={{
                backgroundColor: viewMode === 'grid' ? themeColors.primary : 'transparent',
                color: viewMode === 'grid' ? 'white' : textMuted,
              }}
              title="Vue grille"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-1.5 sm:p-2 transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? themeColors.primary : 'transparent',
                color: viewMode === 'list' ? 'white' : textMuted,
              }}
              title="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Bouton Upload */}
          <label
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: themeColors.primary, color: 'white' }}
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Upload</span>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="px-3 sm:px-4 py-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="flex items-center justify-between text-xs sm:text-sm mb-1" style={{ color: textMuted }}>
            <span>Upload en cours...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 rounded-full overflow-hidden" style={{ backgroundColor: bgCard }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
                backgroundColor: themeColors.primary,
              }}
            />
          </div>
        </div>
      )}

      {/* Zone de drop */}
      <div
        className="flex-1 overflow-auto p-3 sm:p-4"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: dragOver ? `2px dashed ${themeColors.primary}` : 'none',
          backgroundColor: dragOver ? `${themeColors.primary}10` : 'transparent',
        }}
      >
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4" style={{ color: textMuted }}>
            <Cloud className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4" style={{ color: themeColors.primary }} />
            <p className="text-base sm:text-lg mb-1 sm:mb-2 text-center">Aucun fichier</p>
            <p className="text-xs sm:text-sm text-center">Glissez-déposez ou cliquez sur Upload</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: isTerminalTheme ? 'transparent' : bgCard,
                  border: `1px solid ${hoveredFile === file.id ? themeColors.primary : borderColor}`
                }}
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
              >
                {/* Image/Icon Container */}
                <div className="relative aspect-square w-full overflow-hidden" style={{ backgroundColor: isTerminalTheme ? 'rgb(10, 10, 10)' : 'rgb(20, 24, 35)' }}>
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: textMuted }}>
                      {getFileIcon(file.type, 'large')}
                    </div>
                  )}

                  {/* Actions overlay - visible au survol */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                      className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); shareFile(file); }}
                      className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all"
                      title="Partager"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                      className="p-2.5 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* File info */}
                <div className="p-3">
                  <p className="text-xs sm:text-sm truncate mb-1" style={{ color: textColor }} title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] sm:text-xs" style={{ color: textMuted }}>
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group flex items-center justify-between p-3 sm:p-4 rounded-lg gap-3 cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: hoveredFile === file.id ? (isTerminalTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)') : 'transparent',
                  borderLeft: `2px solid ${hoveredFile === file.id ? themeColors.primary : 'transparent'}`
                }}
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Icon/Thumbnail */}
                  <div className="flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <img src={file.url} alt={file.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg" style={{ backgroundColor: isTerminalTheme ? 'rgba(255,255,255,0.05)' : bgCard }}>
                        <div style={{ color: textMuted }}>
                          {getFileIcon(file.type)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base truncate font-medium" style={{ color: textColor }} title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs sm:text-sm" style={{ color: textMuted }}>
                      {formatSize(file.size)} <span className="hidden sm:inline">• {new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                {/* Actions - visible au survol */}
                <div className="flex gap-1 sm:gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: textMuted }}
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); shareFile(file); }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: textMuted }}
                    title="Partager"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    style={{ color: 'rgb(239, 68, 68)' }}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Modal de partage */}
      {showShareModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowShareModal(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md rounded-2xl shadow-2xl z-50 p-6"
            style={{ backgroundColor: bgMain, border: `1px solid ${borderColor}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: `${themeColors.primary}20` }}>
                <Share2 className="w-5 h-5" style={{ color: themeColors.primary }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: textColor }}>Partager le fichier</h3>
                <p className="text-sm" style={{ color: textMuted }}>Copiez le lien pour partager</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
              <Link2 className="w-4 h-4 flex-shrink-0" style={{ color: textMuted }} />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: textColor }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg transition-colors"
                style={{ backgroundColor: bgCard, color: textMuted }}
              >
                Annuler
              </button>
              <button
                onClick={copyShareLink}
                className="flex-1 px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: themeColors.primary, color: 'white' }}
              >
                Copier le lien
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
