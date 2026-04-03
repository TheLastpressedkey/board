import React, { useState, useEffect } from 'react';
import { AppHeader } from '../../Common/Headers/AppHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { useGlobalMusicPlayer } from '../../../contexts/GlobalMusicPlayerContext';
import { Playlist } from '../../../services/youtubePlaylistStorage';
import { LibraryView } from './views/LibraryView';
import { PlaylistEditorView } from './views/PlaylistEditorView';
import { PlayerView } from './views/PlayerView';
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
  const globalPlayer = useGlobalMusicPlayer();
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [previousTheme, setPreviousTheme] = useState(theme);

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
      // Note: Don't stop playback here - it would stop when changing boards too
      // Playback is stopped via handleClose instead
    };
  }, []);

  const handleClose = () => {
    // Stop playback when explicitly closing the app
    globalPlayer.stopPlayback();
    onClose();
  };

  // Sync display mode with view mode
  useEffect(() => {
    if (viewMode === 'player') {
      globalPlayer.setDisplayMode('fullscreen');
    } else {
      globalPlayer.setDisplayMode('hidden');
    }

    // Cleanup: reset to hidden when component unmounts or view changes
    return () => {
      if (viewMode === 'player') {
        globalPlayer.setDisplayMode('hidden');
      }
    };
  }, [viewMode]);

  const handlePlaylistSelect = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    await globalPlayer.playPlaylist(playlist);
    setViewMode('player');
  };

  const handlePlaylistEdit = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setViewMode('playlist-editor');
  };

  const handleLoadInPlayer = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    await globalPlayer.playPlaylist(playlist, 0);
    setViewMode('player');
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setSelectedPlaylist(null);
    // Don't stop playback - keep playing in background
  };

  const handleExpandPlayer = () => {
    if (globalPlayer.activePlaylist) {
      setSelectedPlaylist(globalPlayer.activePlaylist);
      setViewMode('player');
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white/5 to-transparent text-white/90 overflow-hidden relative">

      {/* Header */}
      {viewMode === 'library' && (
        <AppHeader
          title={getHeaderTitle()}
          subtitle={getHeaderSubtitle()}
          icon={Music2}
          onClose={handleClose}
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
            activePlaylist={globalPlayer.activePlaylist}
            currentIndex={globalPlayer.currentIndex}
            isPlaying={globalPlayer.isPlaying}
            onPlayPause={() => globalPlayer.setIsPlaying(!globalPlayer.isPlaying)}
            onNext={globalPlayer.handleNext}
            onPrevious={globalPlayer.handlePrevious}
            onExpandPlayer={handleExpandPlayer}
            onStopPlayback={globalPlayer.stopPlayback}
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

      {/* Player View - Video container + Controls */}
      {viewMode === 'player' && selectedPlaylist && (
        <div
          className="absolute inset-0 flex flex-col bg-black"
          onDoubleClick={handleBackToLibrary}
        >
          {/* Draggable Header for Player Mode */}
          <div
            onMouseDown={onDragStart}
            className="absolute top-0 left-0 right-0 h-12 z-50 cursor-move"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Video Container - GlobalVideoPlayer will be rendered here via Portal */}
          <div id="youplay-video-container" className="flex-1 relative bg-black" />

          {/* Controls Overlay */}
          <div className="absolute inset-0">
            <PlayerView
              playlist={selectedPlaylist}
              onBack={handleBackToLibrary}
              themeColor={themeColors.primary}
              currentIndex={globalPlayer.currentIndex}
              isPlaying={globalPlayer.isPlaying}
              onCurrentIndexChange={globalPlayer.setCurrentIndex}
              onIsPlayingChange={globalPlayer.setIsPlaying}
              volume={globalPlayer.volume}
              onVolumeChange={globalPlayer.setVolume}
              playMode={globalPlayer.playMode}
              onPlayModeChange={globalPlayer.setPlayMode}
              currentTime={globalPlayer.currentTime}
              duration={globalPlayer.duration}
              onTimeUpdate={globalPlayer.handleTimeUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
