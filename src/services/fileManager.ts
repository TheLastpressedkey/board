import { supabase } from '../lib/supabase';
import { FileItem } from '../components/Apps/FileManager/FileManager';
import { API_CONFIG, buildApiUrl, isFileAllowed, isFileSizeValid } from '../config/api';

/**
 * Service de gestion des fichiers avec backend PHP
 */
export const fileManagerService = {

  /**
   * Obtient l'ID utilisateur actuel
   */
  async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  },

  /**
   * Liste les fichiers d'un répertoire
   */
  async listFiles(path: string = '/'): Promise<FileItem[]> {
    try {
      const userId = await this.getCurrentUserId();
      
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.LIST);
      const params = new URLSearchParams({
        userId,
        path: path === '/' ? '' : path
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors du chargement des fichiers');
      }

      return result.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        size: item.size,
        mimeType: item.mimeType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        path: item.path,
        parentPath: path,
        url: item.url // URL déjà complète depuis le backend
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  },

  /**
   * Upload un fichier
   */
  async uploadFile(file: File, path: string = '/'): Promise<FileItem | null> {
    try {
      const userId = await this.getCurrentUserId();

      // Validations côté client
      if (!isFileAllowed(file.name)) {
        throw new Error(`Type de fichier non autorisé. Extensions autorisées: ${API_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`);
      }

      if (!isFileSizeValid(file.size)) {
        throw new Error(`Fichier trop volumineux (max ${Math.round(API_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB)`);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('path', path === '/' ? '' : path);

      const url = buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de l\'upload');
      }

      const fileData = result.data;
      return {
        id: fileData.id,
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        mimeType: fileData.mimeType,
        createdAt: fileData.createdAt,
        updatedAt: fileData.updatedAt,
        path: fileData.path,
        parentPath: path,
        url: fileData.url // URL déjà complète depuis le backend
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Upload multiple fichiers
   */
  async uploadFiles(files: File[], path: string = '/'): Promise<FileItem[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, path).catch(error => {
        console.error(`Erreur upload ${file.name}:`, error);
        return null;
      })
    );
    
    const results = await Promise.all(uploadPromises);
    return results.filter((result): result is FileItem => result !== null);
  },

  /**
   * Supprime un fichier
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.DELETE);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          path: filePath
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la suppression');
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  /**
   * Supprime plusieurs fichiers
   */
  async deleteFiles(filePaths: string[]): Promise<boolean> {
    try {
      const deletePromises = filePaths.map(path => this.deleteFile(path));
      const results = await Promise.all(deletePromises);
      return results.every(result => result === true);
    } catch (error) {
      console.error('Error deleting files:', error);
      return false;
    }
  },

  /**
   * Crée un dossier
   */
  async createFolder(name: string, path: string = '/'): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('path', path === '/' ? '' : path);
      formData.append('folderName', name);

      const url = buildApiUrl(API_CONFIG.ENDPOINTS.CREATE_FOLDER);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la création du dossier');
      }

      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      return false;
    }
  },

  /**
   * Renomme un fichier ou dossier
   */
  async renameFile(oldPath: string, newName: string): Promise<FileItem | null> {
    try {
      const userId = await this.getCurrentUserId();

      const url = buildApiUrl(API_CONFIG.ENDPOINTS.RENAME);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          oldPath,
          newName
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors du renommage');
      }

      const fileData = result.data;
      return {
        id: fileData.id,
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        mimeType: fileData.mimeType,
        createdAt: fileData.createdAt,
        updatedAt: fileData.updatedAt,
        path: fileData.path,
        parentPath: fileData.path ? fileData.path.split('/').slice(0, -1).join('/') : '/',
        url: fileData.url
      };
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  },

  /**
   * Recherche des fichiers
   */
  async searchFiles(query: string): Promise<FileItem[]> {
    try {
      const userId = await this.getCurrentUserId();
      
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.SEARCH);
      const params = new URLSearchParams({
        userId,
        query
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la recherche');
      }

      return result.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        size: item.size,
        mimeType: item.mimeType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        path: item.path,
        url: item.url // URL déjà complète depuis le backend
      }));
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  },

  /**
   * Télécharge un fichier
   */
  async downloadFile(fileUrl: string, fileName?: string): Promise<void> {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  /**
   * Obtient l'URL publique d'un fichier
   */
  getPublicUrl(filePath: string): string {
    const userId = 'current-user'; // Sera remplacé par le vrai userId
    return `${API_CONFIG.BASE_URL}/uploads/${userId}/${filePath}`;
  },

  /**
   * Obtient la taille totale utilisée par l'utilisateur
   */
  async getStorageUsage(): Promise<{ used: number; total: number }> {
    try {
      // Calculer en listant tous les fichiers
      const allFiles = await this.listAllFiles();
      const used = allFiles.reduce((total, file) => total + (file.size || 0), 0);
      
      // Limite par défaut de 1GB (peut être configurée côté serveur)
      const total = 1024 * 1024 * 1024; // 1GB
      
      return { used, total };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { used: 0, total: 1024 * 1024 * 1024 };
    }
  },

  /**
   * Liste tous les fichiers de manière récursive (pour le calcul d'usage)
   */
  async listAllFiles(path: string = '', allFiles: FileItem[] = []): Promise<FileItem[]> {
    const files = await this.listFiles(`/${path}`);
    
    for (const file of files) {
      if (file.type === 'file') {
        allFiles.push(file);
      } else if (file.type === 'folder') {
        await this.listAllFiles(file.path, allFiles);
      }
    }
    
    return allFiles;
  }
};
