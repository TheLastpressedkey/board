import { useState, useEffect, useCallback, useRef } from 'react';
import { RSSFeed } from './types';
import { fetchRSSFeed } from './utils';
import { rateLimitStorage } from './rateLimitStorage';

export function useRSSFeeds(initialFeeds: string[] = []) {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const hasInitialLoad = useRef(false);

  // Nettoyer les données expirées au démarrage
  useEffect(() => {
    rateLimitStorage.cleanup();
  }, []);

  const canMakeRequest = (): boolean => {
    const canMake = rateLimitStorage.canMakeRequest();
    const status = rateLimitStorage.getStatus();
    setIsRateLimited(status.isRateLimited);
    
    if (!canMake) {
      console.warn(`Rate limit reached: ${status.maxRequests} requests in 30 minutes. Next request available at:`, 
        status.windowEnd);
    }
    
    return canMake;
  };

  const incrementRequestCount = () => {
    rateLimitStorage.incrementRequestCount();
    const status = rateLimitStorage.getStatus();
    console.log(`RSS Request ${status.requestsUsed}/${status.maxRequests} in current window`);
  };

  const loadFeed = async (url: string): Promise<RSSFeed> => {
    if (!canMakeRequest()) {
      const status = rateLimitStorage.getStatus();
      return {
        url,
        title: 'Rate limited - Try again later',
        description: `Too many requests. Please wait ${status.timeUntilReset} minutes.`,
        items: []
      };
    }

    try {
      incrementRequestCount();
      const data = await fetchRSSFeed(url);
      return {
        url,
        title: data.feed.title,
        description: data.feed.description,
        items: data.items
      };
    } catch (error) {
      console.error(`Error loading feed ${url}:`, error);
      return {
        url,
        title: 'Error loading feed',
        description: 'Failed to load RSS feed',
        items: []
      };
    }
  };

  const loadFeeds = useCallback(async (urls: string[]) => {
    if (!canMakeRequest() && urls.length > 0) {
      console.warn('Cannot load feeds: rate limit exceeded');
      return;
    }

    const loadedFeeds = await Promise.all(urls.map(loadFeed));
    setFeeds(loadedFeeds);
  }, []);

  // Chargement initial - une seule fois
  useEffect(() => {
    if (!hasInitialLoad.current && initialFeeds.length > 0) {
      hasInitialLoad.current = true;
      loadFeeds(initialFeeds);
    }
  }, [initialFeeds.join(',')]); // Utiliser join pour éviter les re-renders inutiles

  const addFeed = async (url: string) => {
    const newFeed = await loadFeed(url);
    setFeeds(prev => [...prev, newFeed]);
  };

  const removeFeed = (url: string) => {
    setFeeds(prev => prev.filter(feed => feed.url !== url));
  };

  const refreshFeeds = async () => {
    const currentUrls = feeds.map(f => f.url);
    await loadFeeds(currentUrls);
  };

  // Auto-refresh limité - maximum une fois toutes les 30 minutes
  useEffect(() => {
    if (feeds.length === 0) return;

    const autoRefreshInterval = setInterval(() => {
      if (canMakeRequest()) {
        console.log('Auto-refreshing RSS feeds...');
        refreshFeeds();
      }
    }, 30 * 60 * 1000); // Refresh automatique toutes les 30 minutes

    return () => clearInterval(autoRefreshInterval);
  }, [feeds.length]); // Dépendance simplifiée

  const getRateLimitInfo = () => {
    return rateLimitStorage.getStatus();
  };

  // Fonction utilitaire pour forcer le reset (pour l'administration/debug)
  const forceResetRateLimit = () => {
    rateLimitStorage.forceReset();
    setIsRateLimited(false);
  };

  return {
    feeds,
    addFeed,
    removeFeed,
    refreshFeeds,
    isRateLimited,
    getRateLimitInfo,
    forceResetRateLimit
  };
}