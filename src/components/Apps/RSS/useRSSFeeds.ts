import { useState, useEffect, useCallback } from 'react';
import { RSSFeed } from './types';
import { fetchRSSFeed } from './utils';

export function useRSSFeeds(initialFeeds: string[] = []) {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);

  const loadFeed = async (url: string) => {
    try {
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
        items: []
      };
    }
  };

  const loadFeeds = useCallback(async (urls: string[]) => {
    const loadedFeeds = await Promise.all(urls.map(loadFeed));
    setFeeds(loadedFeeds);
  }, []);

  useEffect(() => {
    loadFeeds(initialFeeds);
  }, [initialFeeds, loadFeeds]);

  const addFeed = async (url: string) => {
    const newFeed = await loadFeed(url);
    setFeeds(prev => [...prev, newFeed]);
  };

  const removeFeed = (url: string) => {
    setFeeds(prev => prev.filter(feed => feed.url !== url));
  };

  const refreshFeeds = async () => {
    await loadFeeds(feeds.map(f => f.url));
  };

  return {
    feeds,
    addFeed,
    removeFeed,
    refreshFeeds
  };
}