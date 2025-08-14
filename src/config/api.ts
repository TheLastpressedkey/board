// Configuration de l'API backend
export const API_CONFIG = {
  // URL de base de l'API (développement local)
  BASE_URL: 'http://huguesfrantz.com/wbrd/backend/',
  
  // Endpoints de l'API
  ENDPOINTS: {
    UPLOAD: '/api.php/upload',
    LIST: '/api.php/list',
    SEARCH: '/api.php/search',
    DELETE: '/api.php',
    CREATE_FOLDER: '/api.php/create-folder',
    RENAME: '/api.php/rename',
    SEND_EMAIL: '/api.php/send-email',
  },
  
  // Configuration des uploads
  MAX_FILE_SIZE: 52428800, // 50MB
  ALLOWED_EXTENSIONS: [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
    // Texte
    'txt', 'md', 'rtf', 'csv', 'xml', 'json', 'html', 'htm', 'css', 'js', 'ts',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
    // Audio
    'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a',
    // Vidéo
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm',
    // Code
    'php', 'py', 'java', 'cpp', 'c', 'h', 'sql', 'sh', 'bat',
    // Autres
    'log', 'conf', 'ini', 'cfg'
  ],
  
  // Timeout pour les requêtes
  TIMEOUT: 30000, // 30 secondes
};

// Helper pour construire les URLs complètes
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Validation des types de fichiers
export const isFileAllowed = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? API_CONFIG.ALLOWED_EXTENSIONS.includes(extension) : false;
};

// Formatage de la taille des fichiers
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Validation de la taille des fichiers
export const isFileSizeValid = (size: number): boolean => {
  return size <= API_CONFIG.MAX_FILE_SIZE;
};
