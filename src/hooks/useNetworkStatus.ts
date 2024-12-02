import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data } = await supabase.from('boards').select('count');
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    const interval = setInterval(checkConnection, 30000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return {
    isOnline,
    isSyncing,
    setIsSyncing
  };
}