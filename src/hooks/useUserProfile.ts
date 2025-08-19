import { useState, useEffect, useCallback } from 'react';
import { userProfile } from '../services/userProfile';
import { ThemeType } from '../contexts/ThemeContext';

export function useUserProfile(defaultUsername: string) {
  const [username, setUsername] = useState(defaultUsername);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsername() {
      try {
        const { username: preferredUsername } = await userProfile.getPreferredUsername();
        if (preferredUsername) {
          setUsername(preferredUsername);
        }
      } catch (error) {
        console.error('Error loading username:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUsername();
  }, [defaultUsername]);

  const updateUsername = useCallback(async (newUsername: string) => {
    try {
      await userProfile.updatePreferredUsername(newUsername);
      setUsername(newUsername);
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  }, []);

  return {
    username,
    updateUsername,
    loading
  };
}