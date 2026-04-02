import React, { useState, useEffect } from 'react';
import { AppHeader } from '../../Common/Headers/AppHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { Playlist, youtubePlaylistStorage } from '../../../services/youtubePlaylistStorage';
import { LibraryView } from './views/LibraryView';
import { PlaylistEditorView } from './views/PlaylistEditorView';
import { PlayerView } from './views/PlayerView';
import { VideoPlayer } from '../YouTubePlayer/VideoPlayer';
import { Music2 } from 'lucide-react';

interface YouPlayProps {
  onClose: () => void;
  metadata?: any;
  onDataChange?: (data: any) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  cardId?: string;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

type ViewMode = 'library' | 'playlist-editor' | 'player';

export function YouPlay({
  onClose,
  metadata,
  onDataChange,
  onDragStart,
  cardId,
  onTogglePin,
  isPinned
}: YouPlayProps) {
  const { themeColors, theme, setTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [previousTheme, setPreviousTheme] = useState(theme);

  // Global player state for mini-player
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playMode, setPlayMode] = useState<'sequential' | 'loop' | 'loop-one' | 'shuffle'>('sequential');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [initialSeekTime, setInitialSeekTime] = useState<number | undefined>(undefined);

  // Switch to YouPlay theme on mount, restore on unmount
  useEffect(() => {
    setPreviousTheme(theme);
    if (theme !== 'youplay') {
      setTheme('youplay');
    }

    return () => {
      // Restore previous theme when closing the app
      if (theme === 'youplay') {
        setTheme(previousTheme);
      }
    };
  }, []);

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

  const handlePlaylistSelect = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActivePlaylist(playlist);

    // Charger l'état de lecture sauvegardé
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

    setIsPlaying(true);
    setViewMode('player');
  };

  const handlePlaylistEdit = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setViewMode('playlist-editor');
  };

  const handleLoadInPlayer = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActivePlaylist(playlist);
    setCurrentIndex(0);
    setIsPlaying(true);
    setViewMode('player');
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setSelectedPlaylist(null);
    // Don't reset activePlaylist - keep playing in background
  };

  const handleExpandPlayer = () => {
    if (activePlaylist) {
      setSelectedPlaylist(activePlaylist);
      setViewMode('player');
    }
  };

  const handleStopPlayback = () => {
    setActivePlaylist(null);
    setIsPlaying(false);
  };

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

  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'library':
        return 'YouPlay+';
      case 'playlist-editor':
        return selectedPlaylist?.name || 'Edit Playlist';
      case 'player':
        return 'Now Playing';
      default:
        return 'YouPlay+';
    }
  };

  const getHeaderSubtitle = () => {
    switch (viewMode) {
      case 'library':
        return 'Your YouTube Playlists';
      case 'playlist-editor':
        return 'Edit & Manage';
      case 'player':
        return selectedPlaylist?.name || '';
      default:
        return '';
    }
  };

  const currentVideo = activePlaylist?.videos[currentIndex];
  const hasHandledEndRef = React.useRef(false);

  // Detect when video is about to end and trigger next track
  const handleTimeUpdate = (time: number, dur: number) => {
    setCurrentTime(time);
    setDuration(dur);

    const remaining = dur - time;
    // If we're within 1 second of the end and haven't handled it yet
    if (dur > 0 && time > 0 && remaining < 1 && !hasHandledEndRef.current) {
      hasHandledEndRef.current = true;
      handleVideoEnd();
    }
  };

  // Reset the flag when video changes
  React.useEffect(() => {
    hasHandledEndRef.current = false;
    // Clear initialSeekTime after video changes to avoid seeking again
    if (initialSeekTime !== undefined) {
      setTimeout(() => setInitialSeekTime(undefined), 1000);
    }
  }, [currentVideo?.id]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white/5 to-transparent text-white/90 overflow-hidden relative">
      {/* Global Video Player - Always mounted when activePlaylist exists, hidden when not in player view */}
      {activePlaylist && currentVideo && (
        <div
          className={viewMode === 'player' ? 'absolute inset-0 z-10' : 'absolute'}
          style={viewMode === 'player' ? {} : { width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
        >
          <VideoPlayer
            videoId={currentVideo.id}
            isPlaying={isPlaying}
            volume={volume}
            onEnded={handleVideoEnd}
            onPlayStateChange={setIsPlaying}
            playMode={playMode}
            onTimeUpdate={handleTimeUpdate}
            onSeek={(time) => {}}
            initialSeekTime={initialSeekTime}
          />
        </div>
      )}

      {/* Header */}
      {viewMode === 'library' && (
        <AppHeader
          title={getHeaderTitle()}
          subtitle={getHeaderSubtitle()}
          icon={Music2}
          onClose={onClose}
          onDragStart={onDragStart}
          onTogglePin={onTogglePin}
          isPinned={isPinned}
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.7)"
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'library' && (
          <LibraryView
            onPlaylistSelect={handlePlaylistSelect}
            onPlaylistEdit={handlePlaylistEdit}
            themeColor={themeColors.primary}
            activePlaylist={activePlaylist}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onExpandPlayer={handleExpandPlayer}
            onStopPlayback={handleStopPlayback}
          />
        )}

        {viewMode === 'playlist-editor' && selectedPlaylist && (
          <PlaylistEditorView
            playlist={selectedPlaylist}
            onBack={handleBackToLibrary}
            onLoadInPlayer={handleLoadInPlayer}
            themeColor={themeColors.primary}
          />
        )}
      </div>

      {/* Player View Overlay - Always on top */}
      {viewMode === 'player' && selectedPlaylist && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <PlayerView
            playlist={selectedPlaylist}
            onBack={handleBackToLibrary}
            themeColor={themeColors.primary}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            onCurrentIndexChange={setCurrentIndex}
            onIsPlayingChange={setIsPlaying}
            volume={volume}
            onVolumeChange={setVolume}
            playMode={playMode}
            onPlayModeChange={setPlayMode}
            currentTime={currentTime}
            duration={duration}
            onTimeUpdate={(time, dur) => {
              setCurrentTime(time);
              setDuration(dur);
            }}
          />
        </div>
      )}
    </div>
  );
}
