import { useState, useEffect, useCallback } from 'react';
import { passwordService } from '../../../services/passwords';
import { PasswordEntry } from './types';

export function usePasswordManager() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPasswords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await passwordService.getAllPasswords();
      setPasswords(data);
    } catch (err) {
      console.error('Error loading passwords:', err);
      setError('Erreur lors du chargement des mots de passe');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  const addPassword = useCallback(async (data: {
    serviceName: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    category?: PasswordEntry['category'];
    isFavorite?: boolean;
  }) => {
    try {
      const newPassword = await passwordService.createPassword(data);
      setPasswords(prev => [newPassword, ...prev]);
      return newPassword;
    } catch (err) {
      console.error('Error adding password:', err);
      setError('Erreur lors de l\'ajout du mot de passe');
      throw err;
    }
  }, []);

  const updatePassword = useCallback(async (id: string, updates: {
    serviceName?: string;
    username?: string;
    password?: string;
    url?: string;
    notes?: string;
    category?: PasswordEntry['category'];
    isFavorite?: boolean;
  }) => {
    try {
      const updated = await passwordService.updatePassword(id, updates);
      setPasswords(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Erreur lors de la mise à jour du mot de passe');
      throw err;
    }
  }, []);

  const deletePassword = useCallback(async (id: string) => {
    try {
      await passwordService.deletePassword(id);
      setPasswords(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting password:', err);
      setError('Erreur lors de la suppression du mot de passe');
      throw err;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    const password = passwords.find(p => p.id === id);
    if (!password) return;

    try {
      await updatePassword(id, { isFavorite: !password.isFavorite });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [passwords, updatePassword]);

  const copyPassword = useCallback(async (id: string) => {
    const password = passwords.find(p => p.id === id);
    if (!password) return;

    try {
      const decrypted = passwordService.decryptPassword(password.encryptedPassword);
      await navigator.clipboard.writeText(decrypted);
      await passwordService.updateLastUsed(id);

      const updated = { ...password, lastUsedAt: new Date() };
      setPasswords(prev => prev.map(p => p.id === id ? updated : p));

      return true;
    } catch (err) {
      console.error('Error copying password:', err);
      setError('Erreur lors de la copie du mot de passe');
      return false;
    }
  }, [passwords]);

  return {
    passwords,
    isLoading,
    error,
    addPassword,
    updatePassword,
    deletePassword,
    toggleFavorite,
    copyPassword,
    reload: loadPasswords
  };
}
