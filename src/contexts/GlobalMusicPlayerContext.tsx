import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Playlist, Video, youtubePlaylistStorage } from '../services/youtubePlaylistStorage';

interface GlobalMusicPlayerState {
  // Playback state
  activePlaylist: Playlist | null;
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  playMode: 'sequential' | 'loop' | 'loop-one' | 'shuffle';
  currentTime: number;
  duration: number;
  initialSeekTime?: number;
  displayMode: 'hidden' | 'fullscreen'; // Mode d'affichage du lecteur

  // Actions
  playPlaylist: (playlist: Playlist, startIndex?: number) => Promise<void>;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setPlayMode: (mode: 'sequential' | 'loop' | 'loop-one' | 'shuffle') => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setDisplayMode: (mode: 'hidden' | 'fullscreen') => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleVideoEnd: () => void;
  stopPlayback: () => void;
  handleTimeUpdate: (time: number, dur: number) => void;
}

const GlobalMusicPlayerContext = createContext<GlobalMusicPlayerState | undefined>(undefined);

export function GlobalMusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playMode, setPlayMode] = useState<'sequential' | 'loop' | 'loop-one' | 'shuffle'>('sequential');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [initialSeekTime, setInitialSeekTime] = useState<number | undefined>(undefined);
  const [displayMode, setDisplayMode] = useState<'hidden' | 'fullscreen'>('hidden');
  const hasHandledEndRef = useRef(false);

  const handleNext = () => {
    if (!activePlaylist) return;
    const nextIndex = (currentIndex + 1) % activePlaylist.videos.length;
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!activePlaylist) return;
    const prevIndex = (currentIndex - 1 + activePlaylist.videos.length) % activePlaylist.videos.length;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleVideoEnd = () => {
    if (!activePlaylist) return;

    switch (playMode) {
      case 'loop-one':
        setIsPlaying(true);
        return;
      case 'loop':
        const nextIndex = (currentIndex + 1) % activePlaylist.videos.length;
        setCurrentIndex(nextIndex);
        setIsPlaying(true);
        break;
      case 'shuffle':
        const randomIndex = Math.floor(Math.random() * activePlaylist.videos.length);
        setCurrentIndex(randomIndex);
        setIsPlaying(true);
        break;
      case 'sequential':
        if (currentIndex < activePlaylist.videos.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
        break;
    }
  };

  const handleTimeUpdate = (time: number, dur: number) => {
    setCurrentTime(time);
    setDuration(dur);

    const remaining = dur - time;
    if (dur > 0 && time > 0 && remaining < 1 && !hasHandledEndRef.current) {
      hasHandledEndRef.current = true;
      handleVideoEnd();
    }
  };

  const playPlaylist = async (playlist: Playlist, startIndex?: number) => {
    setActivePlaylist(playlist);

    // Charger l'état de lecture sauvegardé si aucun index n'est spécifié
    if (startIndex === undefined) {
      const savedState = await youtubePlaylistStorage.getPlaybackState(playlist.id);
      if (savedState && savedState.videoIndex < playlist.videos.length) {
        setCurrentIndex(savedState.videoIndex);
        setCurrentTime(savedState.timestamp);
        setInitialSeekTime(savedState.timestamp);
      } else {
        setCurrentIndex(0);
        setCurrentTime(0);
        setInitialSeekTime(undefined);
      }
    } else {
      setCurrentIndex(startIndex);
      setCurrentTime(0);
      setInitialSeekTime(undefined);
    }

    setIsPlaying(true);
  };

  const stopPlayback = () => {
    // Destroy the global YouTube player
    if ((window as any).__globalYouTubePlayer) {
      try {
        (window as any).__globalYouTubePlayer.destroy();
      } catch (e) {
        console.error('Error destroying player:', e);
      }
      delete (window as any).__globalYouTubePlayer;
    }

    setActivePlaylist(null);
    setIsPlaying(false);
    setCurrentIndex(0);
    setCurrentTime(0);
    setDuration(0);
  };

  // Reset hasHandledEndRef when video changes
  useEffect(() => {
    hasHandledEndRef.current = false;
    if (initialSeekTime !== undefined) {
      setTimeout(() => setInitialSeekTime(undefined), 1000);
    }
  }, [activePlaylist?.videos[currentIndex]?.id]);

  // Auto-save playback state every 5 seconds
  useEffect(() => {
    if (!activePlaylist || !isPlaying) return;

    const interval = setInterval(() => {
      youtubePlaylistStorage.savePlaybackState(
        activePlaylist.id,
        currentIndex,
        currentTime
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [activePlaylist, currentIndex, currentTime, isPlaying]);

  const value: GlobalMusicPlayerState = {
    activePlaylist,
    currentIndex,
    isPlaying,
    volume,
    playMode,
    currentTime,
    duration,
    initialSeekTime,
    displayMode,
    playPlaylist,
    setCurrentIndex,
    setIsPlaying,
    setVolume,
    setPlayMode,
    setCurrentTime,
    setDuration,
    setDisplayMode,
    handleNext,
    handlePrevious,
    handleVideoEnd,
    stopPlayback,
    handleTimeUpdate
  };

  return (
    <GlobalMusicPlayerContext.Provider value={value}>
      {children}
    </GlobalMusicPlayerContext.Provider>
  );
}

export function useGlobalMusicPlayer() {
  const context = useContext(GlobalMusicPlayerContext);
  if (context === undefined) {
    throw new Error('useGlobalMusicPlayer must be used within a GlobalMusicPlayerProvider');
  }
  return context;
}
