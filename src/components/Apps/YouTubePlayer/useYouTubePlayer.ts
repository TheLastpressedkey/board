import { useState, useCallback, useEffect } from 'react';
import { Video } from './YouTubePlayer';

export function useYouTubePlayer(
  initialPlaylist?: Video[],
  initialIndex?: number,
  initialMode?: 'sequential' | 'loop' | 'loop-one' | 'shuffle',
  initialVolume?: number
) {
  const [playlist, setPlaylist] = useState<Video[]>(initialPlaylist || []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [playMode, setPlayMode] = useState<'sequential' | 'loop' | 'loop-one' | 'shuffle'>(
    initialMode || 'sequential'
  );
  const [volume, setVolume] = useState(initialVolume || 100);

  return {
    playlist,
    currentIndex,
    playMode,
    volume,
    setPlaylist,
    setCurrentIndex,
    setPlayMode,
    setVolume
  };
}
